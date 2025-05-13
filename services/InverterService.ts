import {
  BleManagerInstance,
  createPaddedPayload,
  convertMacToBytes,
  generateInverterDigest,
  packInt64LE,
  concatBytes,
} from '../helpers/BluetoothHelper';
import {Characteristic, Device} from 'react-native-ble-plx';
import {
  BatteryData,
  ChargeControllerState,
  InverterState,
} from '../types/BleTypes';
import {Battery, Inverter} from '../types/DeviceType';
import {
  parseBatteryData,
  parseChargeControllerState,
  parseInverterState,
} from '../helpers/ParserHelper';
import {Buffer} from 'buffer';
import {createDeedOfRegistrationAsync} from './DeviceUnitService';
import {getItemAsync} from '../helpers/SecureStorageHelper';
import {UserProfileResponse} from '../types/ApiResponse';
import {Device as ApiDevice} from '../types/ApiResponse';
import {showToast, ToastType} from '../components/Toast';
import {BleUuids} from '../types/constants/constants';

/**
 * Authenticates the selected inverter and enrolls the associated batteries.
 *
 * This method performs the following steps:
 * 1. Connects to the inverter and discovers its services and characteristics.
 * 2. Generates an authentication payload based on the inverter's ID.
 * 3. Sends the authentication payload to the inverter.
 * 4. Enrolls the selected batteries with the inverter.
 *
 * @param {Inverter} selectedInverter - The inverter device to authenticate.
 * @param {Battery[]} selectedNodes - The list of batteries to enroll with the inverter.
 *
 * @returns {Promise<void>} - Resolves when the authentication and enrollment process is complete.
 */
export async function authenticateInverter(
  selectedInverter: Inverter,
  selectedNodes: Battery[],
): Promise<void> {
  try {
    await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(
      selectedInverter.id,
    );
    const authPayload = generateAuthPayload(selectedInverter.id);
    await sendAuthPayload(selectedInverter, authPayload);

    let response = await enrollBatteriesToInverter(
      selectedInverter,
      selectedNodes,
      0,
    );

    if (response) {
      const user = await getItemAsync<UserProfileResponse>('UserProfile');
      if (user) {
        const devices = convertBleDevicesToApiDevices([
          selectedInverter,
          ...selectedNodes,
        ]);
        await createDeedOfRegistrationAsync(user.userID, devices);
      }
    }
  } catch (error: any) {
    console.error('Error authenticating:', error);
    showToast(ToastType.Error, 'Authentication Failed');
  }
}

function generateAuthPayload(inverterId: string): Uint8Array {
  const extime = Date.now();
  const digest = generateInverterDigest(inverterId, extime);
  console.log(`Authenticate len digest ${digest.length}`);

  console.log(
    'Digest in hex:',
    Array.from(digest)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' '),
  );

  const etime = packInt64LE(extime);
  const badigest = concatBytes(digest, etime);

  console.log(
    'Badigest in hex:',
    Array.from(badigest)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' '),
  );

  return badigest;
}

async function sendAuthPayload(
  inverter: Device,
  payload: Uint8Array,
): Promise<void> {
  try {
    await BleManagerInstance.writeCharacteristicWithResponseForDevice(
      inverter.id,
      BleUuids.AUTHENTICATION_SERVICE_UUID,
      BleUuids.AUTHENTICATION_CHAR_UUID,
      Buffer.from(payload).toString('base64'),
    );
  } catch (error) {
    console.error('Error authenticating:', error);
    showToast(ToastType.Error, 'Auth Failed');
  }
}

function convertBleDevicesToApiDevices(bleDevices: Device[]): ApiDevice[] {
  return bleDevices.map(bleDevice => ({
    deviceID: bleDevice.id,
    deviceType: bleDevice.name?.includes('Invert') ? 'Inverter' : 'Battery',
  }));
}

/**
 * Attempts to establish a Bluetooth connection to the specified inverter.
 *
 * @param {Inverter} selectedInverter - The inverter device to connect to.
 *
 * @returns {Promise<Boolean>} - Resolves to `true` if the connection is successful,
 * otherwise resolves to `false` if the connection fails.
 */
export async function connectToInverter(
  selectedInverter: Inverter,
): Promise<Boolean> {
  try {
    const response = await BleManagerInstance.connectToDevice(
      selectedInverter.id,
    );

    const isConnected = await response.isConnected();
    return isConnected;
  } catch (error) {
    console.error('Failed to connect to Inverter:', error);
    return false;
  }
}

/**
 * Enrolls batteries by building and sending a payload containing their MAC addresses to the inverter.
 *
 * This function performs the following steps:
 * 1. Extracts the MAC addresses of the provided batteries.
 * 2. Builds a payload containing the number of batteries, an optional log interval, and the MAC addresses.
 * 3. Pads the payload to ensure it meets the required length.
 * 4. Sends the payload to the inverter using the specified characteristic.
 *
 * @param {Inverter} inverter - The inverter device to enroll the batteries with.
 * @param {Battery[]} nodes - The list of batteries to enroll.
 * @param {number} [logInterval=0] - Optional log interval to include in the payload (default is 0).
 *
 * @returns {Promise<Characteristic | null>} - Resolves with the BLE characteristic response if successful, or `null` if an error occurs.
 */
async function enrollBatteriesToInverter(
  inverter: Inverter,
  nodes: Battery[],
  logInterval = 0,
): Promise<Characteristic | null> {
  try {
    const macAddresses = nodes.map(node => node.id);
    const macBytesArray = macAddresses.map(convertMacToBytes);

    const payload = createPaddedPayload(macBytesArray, logInterval);
    const base64Payload = Buffer.from(payload).toString('base64');

    const response =
      await BleManagerInstance.writeCharacteristicWithoutResponseForDevice(
        inverter.id,
        inverter?.serviceUUIDs?.[0] ?? '',
        BleUuids.BATTERY_CHAR_UUID,
        base64Payload,
      );

    return response;
  } catch (error) {
    console.error('Error enrolling batteries:', error);
    return null;
  }
}

export async function getInverterStatus(
  inverter: Device,
): Promise<InverterState | null> {
  try {
    const connectedDevices = await BleManagerInstance.connectedDevices([
      inverter.serviceUUIDs?.[0] ?? '',
    ]);
    const connectedDevice = connectedDevices.find(
      device => device.id === inverter.id,
    );

    if (!connectedDevice) {
      throw new Error(`Device with ID ${inverter.id} is not connected.`);
    }

    await connectedDevice.discoverAllServicesAndCharacteristics();

    const base64Data = await BleManagerInstance.readCharacteristicForDevice(
      inverter.id,
      inverter?.serviceUUIDs?.[0] ?? '',
      BleUuids.INVERTER_STATE_CHAR_UUID,
    );

    const rawData = Buffer.from(base64Data.value ?? '', 'base64');
    const inverterState = parseInverterState(rawData);
    return inverterState;
  } catch (error) {
    console.error('Error reading inverter status:', error);
    throw error;
  }
}

export async function getChargeControllerStatus(
  inverter: Device,
): Promise<ChargeControllerState | null> {
  try {
    const connectedDevices = await BleManagerInstance.connectedDevices([
      inverter.serviceUUIDs?.[0] ?? '',
    ]);
    const connectedDevice = connectedDevices.find(
      device => device.id === inverter.id,
    );

    if (!connectedDevice) {
      throw new Error(`Device with ID ${inverter.id} is not connected.`);
    }

    await connectedDevice.discoverAllServicesAndCharacteristics();

    const base64Data = await BleManagerInstance.readCharacteristicForDevice(
      inverter.id,
      inverter?.serviceUUIDs?.[0] ?? '',
      BleUuids.CHARGE_CONTROLLER_STATE_CHAR_UUID,
    );

    const rawData = Buffer.from(base64Data.value ?? '', 'base64');
    const chargeControllerState = parseChargeControllerState(rawData);
    return chargeControllerState;
  } catch (error) {
    console.error('Error reading charge controller status:', error);
    throw error;
  }
}

export async function getBatteryInfo(
  node: Battery,
  inverter: Inverter,
): Promise<BatteryData | null> {
  try {
    const batts = [node.id];
    let batStatus: BatteryData = {
      totalVoltage: 0,
      current: 0,
      remainCapacity: 0,
      totalCapacity: 0,
      cycleLife: 0,
      productLife: 0,
      balanceStatusLow: 0,
      balanceStatusHigh: 0,
      protectionStatus: 0,
      version: 0,
      rsoc: 0,
      fetStatus: 0,
      cellInSeries: 0,
      nNtc: 0,
      deviceID: node.id,
    };

    for (const mac of batts) {
      const macBytes = mac.split(':').map(byte => parseInt(byte, 16));
      const macBuffer = Buffer.from(macBytes);

      await BleManagerInstance.writeCharacteristicWithResponseForDevice(
        inverter.id,
        inverter?.serviceUUIDs?.[0] ?? '',
        BleUuids.SET_BATT_RETR_CHAR_UUID,
        macBuffer.toString('base64'),
      );

      const base64Data = await BleManagerInstance.readCharacteristicForDevice(
        inverter.id,
        inverter?.serviceUUIDs?.[0] ?? '',
        BleUuids.RETR_BATTERY_CHAR_UUID,
      );

      const rawData = Buffer.from(base64Data.value ?? '', 'base64');
      const batteryData = parseBatteryData(rawData);

      batStatus = {deviceID: mac, ...batteryData};
    }

    return batStatus;
  } catch (error) {
    console.error('Error retrieving battery info:', error);
    return null;
  }
}

export async function fetchAndLogInverterStatus(
  inverter: Device,
): Promise<InverterState | null> {
  return fetchAndLog(() => getInverterStatus(inverter), 'Inverter Status');
}

export async function fetchAndLogChargeControllerStatus(
  inverter: Device,
): Promise<ChargeControllerState | null> {
  return fetchAndLog(
    () => getChargeControllerStatus(inverter),
    'Charge Controller Status',
  );
}

export async function fetchAndLogBatteryInfo(
  node: Device,
  inverter: Device,
): Promise<BatteryData | null> {
  return fetchAndLog(() => getBatteryInfo(node, inverter), 'Battery Info');
}

/**
 * Fetches data using the provided retrieval function, logs the result, and handles errors.
 *
 * @param {() => Promise<T | null>} fetchFunction - The function to fetch the data.
 * @param {string} description - A description of the data being fetched (used for logging).
 *
 * @returns {Promise<T | null>} - The fetched data, or `null` if an error occurs.
 */
async function fetchAndLog<T>(
  fetchFunction: () => Promise<T | null>,
  description: string,
): Promise<T | null> {
  try {
    const data = await fetchFunction();
    if (data) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${description}:`, error);
    return null;
  }
}
