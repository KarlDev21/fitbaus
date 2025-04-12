import {
  BleManagerInstance,
  createPaddedPayload,
  convertMacToBytes,
  generateDigest,
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
  try {
    await connectAndDiscoverServices(selectedInverter);
    const digest = generateDigest(selectedInverter.id);

    await BleManagerInstance.writeCharacteristicWithResponseForDevice(
      selectedInverter.id,
      selectedInverter?.serviceUUIDs?.[0] ?? '',
      AUTHENTICATION_CHAR,
      Buffer.from(digest).toString('base64'),
    );

    await enrollBatteriesToInverter(selectedInverter, selectedNodes);
  } catch (error) {
    console.error('Error authenticating:', error);
    throw error;
  }
}

export async function checkAndConnectToInverter(
  selectedInverter: Device,
): Promise<Boolean> {
  //will handle these errors better
  const connection = await selectedInverter.isConnected();
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
  // .then((device: Device) => {
  //   console.log('Connected to Inverter:', device.id);
  // })
  // .catch((error: any) => {
  //   console.error('Failed to connect to Inverter:', error);
  // });
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
    const connectedDevice = await BleManagerInstance.connectToDevice(
      inverter.id,
    );
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
    const connectedDevice = await BleManagerInstance.connectToDevice(
      inverter.id,
    );
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
): Promise<BatteryInfo | null> {
  try {
    const batts = [node.id];
    const batStatus: Record<string, BatteryData> = {};

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
      batStatus[mac] = batteryData;
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
): Promise<BatteryInfo | null> {
  return fetchAndLog(() => getBatteryInfo(node, inverter), 'Battery Info');
}

export async function fetchAndLogBatteryData(
  batteryId: number,
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
  nodeId: number,
  inverter: Device,
): Promise<BatteryData | null> {
  try {
    const batts = [nodeId.toString()];

    const batStatus: Record<string, BatteryData> = {};
    let batteryData: BatteryData = {
      // TotalVoltage: 0,
      Current: 0,
      RemainCapacity: 0,
      TotalCapacity: 0,
      CycleLife: 0,
      ProductLife: 0,
      BalanceStatusLow: 0,
      BalanceStatusHigh: 0,
      ProtectionStatus: 0,
      Version: 0,
      RSOC: 0,
      FetStatus: 0,
      CellInSeries: 0,
      N_NTC: 0,
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

      console.log(`Battery Data for ${mac}:`, batteryData);
    }

    return batteryData;
  } catch (error) {
    console.error('Error retrieving battery info:', error);
    return null;
  }
}
