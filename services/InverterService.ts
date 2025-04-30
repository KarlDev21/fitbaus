import {
  BleManagerInstance,
  createPaddedPayload,
  convertMacToBytes,
  generateDigest,
  generateInverterDigest,
  packInt64LE,
  concatBytes,
} from '../helpers/BluetoothHelper';
import {Characteristic, Device} from 'react-native-ble-plx';
import {
  BatteryData,
  BatteryInfo,
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
import {Alert} from 'react-native/Libraries/Alert/Alert';
import {showToast, ToastType} from '../components/Toast';

const AUTHENTICATION_CHAR = '669a0c20-0008-d690-ec11-e214416ccb95';

//THIS IS READING INVERTER STATE
const INVERTER_STATE_CHAR = '669a0c20-0008-d690-ec11-e214406ccb95';
//THIS IS READING BATERRY CONTROLLER STATE
const CHARGE_CONTROLLER_STATE_CHAR = '669a0c20-0008-d690-ec11-e214486ccb95';
//THIS IS READING BATTERIES STATE
const SET_BATT_RETR_CHAR = '669a0c20-0008-d690-ec11-e214436ccb95';
const RETR_BATTERY_CHAR = '669a0c20-0008-d690-ec11-e214446ccb95';
const BATTERY_CHAR = '669a0c20-0008-d690-ec11-e214426ccb95';

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
  console.log('Selected Inverter:', selectedInverter);

  try {
    await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(
      selectedInverter.id,
    );
    const authPayload = generateAuthPayload(selectedInverter.id);

    await sendAuthPayload(selectedInverter, authPayload);

    console.log(selectedNodes.length + ' nodes found');

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
    console.log('maybe missing uuid');
    console.log(inverter?.serviceUUIDs?.[0]);
    console.log(inverter.id);
    // 669a0c20-0008-d690-ec11-e2143045cb95
    // 669a0c20-0008-d690-ec11-e2143045cb95
    const response =
      await BleManagerInstance.writeCharacteristicWithResponseForDevice(
        '48:CA:43:59:BA:D9',
        '669a0c20-0008-d690-ec11-e2143045cb95',
        AUTHENTICATION_CHAR,
        Buffer.from(payload).toString('base64'),
      );
    console.log('Authentication successful', response);
  } catch (error) {
    console.error('Error authenticating:', error);
    showToast(ToastType.Error, 'Auth Failed');
  }
}

function convertBleDevicesToApiDevices(bleDevices: Device[]): ApiDevice[] {
  return bleDevices.map(bleDevice => ({
    deviceID: bleDevice.id,
    deviceType: bleDevice.name?.includes('Invert') ? 'Inverter' : 'Battery', // Assuming all devices are of type BLE
  }));
}

export async function checkAndConnectToInverter(
  selectedInverter: Device,
): Promise<Boolean> {
  try {
    const connection = await selectedInverter.isConnected();
    console.log('current connection ' + connection);
    if (connection) {
      console.log('Inverter already connected:', selectedInverter.id);
      return true;
    }
    console.log('Inverter not connected:', selectedInverter.id);
    const response = await BleManagerInstance.connectToDevice(
      selectedInverter.id,
    );
    const isConnected = await response.isConnected();
    console.log('reconnected');
    console.log(isConnected);
    return isConnected;
  } catch (error) {
    console.log('error with connection to inverter ' + error);
    return false;
  }
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
    console.log('SelectedInveter: ', selectedInverter);
    const response = await BleManagerInstance.connectToDevice(
      selectedInverter.id,
    );

    console.log('Connection Response: ', response.isConnected());
    const isConnected = await response.isConnected();
    return isConnected;
  } catch (error) {
    console.error('Failed to connect to Inverter:', error);
    return false;
  }
}

/**
 * Establishes a Bluetooth connection to the specified inverter and discovers all its services and characteristics.
 *
 * This function performs the following steps:
 * 1. Connects to the inverter using its unique ID.
 * 2. Discovers all available services and characteristics for the connected inverter.
 *
 * @param {Inverter} inverter - The inverter device to connect to and discover services for.
 *
 * @returns {Promise<Inverter>} - Resolves with the connected inverter device after successfully discovering its services and characteristics.
 */
export async function connectAndDiscoverServices(
  inverter: Inverter,
): Promise<Inverter> {
  try {
    // Check if the device is already connected
    const isConnected = await BleManagerInstance.isDeviceConnected(inverter.id);
    if (isConnected) {
      console.log(`Device ${inverter.id} is already connected.`);
      return inverter; // Return the device as it is already connected
    }

    // If not connected, connect to the device
    console.log(`Connecting to device ${inverter.id}...`);
    const connectedDevice = await BleManagerInstance.connectToDevice(
      inverter.id,
    );

    // Discover all services and characteristics
    await connectedDevice.discoverAllServicesAndCharacteristics();
    console.log(
      `Services and characteristics discovered for device ${inverter.id}.`,
    );

    return connectedDevice;
  } catch (error) {
    console.error(
      `Error connecting to or discovering services for device ${inverter.id}:`,
      error,
    );
    throw error;
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
        BATTERY_CHAR,
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
    // const connectedDevice = await BleManagerInstance.connectToDevice(
    //   inverter.id,
    // );
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
      INVERTER_STATE_CHAR,
    );

    const rawData = Buffer.from(base64Data.value ?? '', 'base64');
    const inverterState = parseInverterState(rawData);
    return inverterState;
  } catch (error) {
    console.error('Error reading inverter status:', error);
    return null;
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
      CHARGE_CONTROLLER_STATE_CHAR,
    );

    const rawData = Buffer.from(base64Data.value ?? '', 'base64');
    const chargeControllerState = parseChargeControllerState(rawData);
    return chargeControllerState;
  } catch (error) {
    console.error('Error reading charge controller status:', error);
    throw error;
    // return null;
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
        SET_BATT_RETR_CHAR,
        macBuffer.toString('base64'),
      );

      const base64Data = await BleManagerInstance.readCharacteristicForDevice(
        inverter.id,
        inverter?.serviceUUIDs?.[0] ?? '',
        RETR_BATTERY_CHAR,
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

export async function fetchAndLogBatteryData(
  batteryId: string,
  inverter: Inverter,
): Promise<BatteryData | null> {
  return fetchAndLog(
    () => retrieveBatteryData(batteryId, inverter),
    'Battery Data',
  );
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
      console.log(`${description}:`, data);
      return data;
    } else {
      console.error(`Failed to fetch ${description}.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${description}:`, error);
    return null;
  }
}

//Note: This is the on the Node Screen
export async function retrieveBatteryData(
  nodeId: string,
  inverter: Device,
): Promise<BatteryData | null> {
  try {
    console.log(nodeId);
    const batts = [nodeId];

    const batStatus: Record<string, BatteryData> = {};
    let batteryData: BatteryData = {
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
    };

    for (const mac of batts) {
      // Convert MAC address to bytes
      const macBytes = mac.split(':').map((byte: string) => parseInt(byte, 16));
      const macBuffer = Buffer.from(macBytes);

      // Write the MAC address to the SET_BATT_RETR_CHAR characteristic
      await BleManagerInstance.writeCharacteristicWithResponseForDevice(
        inverter.id,
        inverter?.serviceUUIDs?.[0] ?? '',
        SET_BATT_RETR_CHAR,
        macBuffer.toString('base64'),
      );

      // Read the battery data from the RETR_BATTERY_CHAR characteristic
      const base64Data = await BleManagerInstance.readCharacteristicForDevice(
        inverter.id,
        inverter?.serviceUUIDs?.[0] ?? '',
        RETR_BATTERY_CHAR,
      );

      // Decode the Base64 data into a Uint8Array
      const rawData = Buffer.from(base64Data.value ?? '', 'base64');

      // Parse the data into the `BatteryData` structure
      batteryData = parseBatteryData(rawData);

      // Store the parsed data in the batStatus object
      batStatus[mac] = batteryData;
      -console.log(`Battery Data for ${mac}:`, batteryData);
    }

    return batteryData;
  } catch (error) {
    console.error('Error retrieving battery info:', error);
    return null;
  }
}
