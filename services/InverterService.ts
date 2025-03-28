import {Buffer} from 'buffer';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import CryptoJS from 'crypto-js';
import {theDevice, theInverter} from './BluetoothLowEnergyService';
import {Alert} from 'react-native';

const AUTHENTICATION_CHAR = '669a0c20-0008-d690-ec11-e214416ccb95';

function packInt64LE(num: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, num & 0xffffffff, true);
  view.setUint32(4, Math.floor(num / 0x100000000), true);
  return new Uint8Array(buffer);
}

// Concatenates multiple Uint8Array objects.
function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// generateDigest takes a device address (e.g. "12:34:56:78:9A:BC") and an expiration time,
// then returns the MD5 digest (as a Uint8Array) of the concatenation of:
//    - the reversed MAC address bytes,
//    - the 8-byte little-endian representation of expireTime, and
//    - the salt "StowerBatteryNode-Inventech"
function generateDigest(address: string, expireTime: number): Uint8Array {
  // Reverse the MAC address parts.
  const parts = address.split(':').reverse();
  const macBytes = new Uint8Array(parts.map(x => parseInt(x, 16)));

  // Convert the salt to a Uint8Array (assuming ASCII encoding).
  const saltStr = 'StowerBatteryNode-Inventech';
  const saltBytes = new Uint8Array([...saltStr].map(ch => ch.charCodeAt(0)));

  // Pack the expireTime into 8 bytes (little-endian).
  const ts = packInt64LE(expireTime);

  // Concatenate the MAC bytes, timestamp bytes, and salt bytes.
  const data = concatBytes(macBytes, ts, saltBytes);
  console.log(
    'Combined data hex:',
    Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' '),
  );

  // Convert Uint8Array to a CryptoJS WordArray.
  const wordArray = CryptoJS.lib.WordArray.create(data as any, data.length);
  // Compute the MD5 hash.
  const md5Hash = CryptoJS.MD5(wordArray);
  const md5Hex = md5Hash.toString(CryptoJS.enc.Hex);
  console.log('MD5 digest hex:', md5Hex);

  // Convert the hex digest to a Uint8Array.
  const digest = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    digest[i] = parseInt(md5Hex.substr(i * 2, 2), 16);
  }
  return digest;
}

// authenticate writes the concatenation of the provided digest and packed extime to the peripheral.
export async function authenticateInverter(): Promise<void> {
  if (!theInverter) {
    console.error('No device connected');
    return;
  }

  try {
    const connectedDevice = await BleManagerInstance.connectToDevice(
      theInverter.id,
    );
    await connectedDevice.discoverAllServicesAndCharacteristics();

    const extime = Date.now();
    const digest = generateDigest(theInverter.id, extime);
    console.log(`Authenticate len digest ${digest.length}`);
    console.log(
      'digest in hex:',
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
    const response =
      await BleManagerInstance.writeCharacteristicWithResponseForDevice(
        theInverter.id,
        theInverter?.serviceUUIDs?.[0] ?? '',
        AUTHENTICATION_CHAR,
        Buffer.from(badigest).toString('base64'),
      );

    console.log('Authentication successful', response);
    //ENROLLING BATTERIES
    await enrollBatteries();

    //READING INVERTER STATE
    const inverterStatus = await getInverterStatus();
    if (inverterStatus) {
      console.log('Inverter Status:', inverterStatus);
    } else {
      console.error('Failed to fetch inverter status.');
    }

    //READING BATTERY CONTROLLER STATE
    const chargeControllerStatus = await getChargeControllerStatus();
    if (chargeControllerStatus) {
      console.log('Charge Controller Status:', chargeControllerStatus);
    } else {
      console.error('Failed to fetch charge controller status.');
    }

    //READING BATTRIES STATE
    const batteryInfo = await retrieveBatteryInfo();
    if (batteryInfo) {
      console.log('Battery Info:', batteryInfo);
    } else {
      console.error('Failed to fetch battery info.');
    }
  } catch (error: any) {
    console.error('Error authenticating:', error);
    Alert.alert('Error', 'Auth failed..', error);
  }
}

//NOTE: ENROLL BATTERIES
//THIS IS USED ONLY TO LOG INFORMATION TO THE CONSOLE
function parseAndPrintSystemBatteries(payload: Uint8Array) {
  if (payload.length !== 98) {
    throw new Error(
      `Invalid payload length: expected 98 bytes, got ${payload.length}`,
    );
  }

  const numberOfBatteries = payload[0];
  const logInterval = payload[1];

  console.log('Container:');
  console.log(`  NumberOfBatteries = ${numberOfBatteries}`);
  console.log(`  LogInterval = ${logInterval}`);
  console.log('  Macs = ListContainer:');

  for (let i = 0; i < 16; i++) {
    const offset = 2 + i * 6;
    const macBytes = payload.slice(offset, offset + 6);
    const macHex = Array.from(macBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':');

    console.log(`    Container`);
    console.log(`      mac = ${macHex} (total 6)`);
  }
}

const BATTERY_CHAR = '669a0c20-0008-d690-ec11-e214426ccb95';
// Helper: Converts a hex string (e.g. "123456789ABC") to a Uint8Array.
function hexStringToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return result;
}

/**
 * enrollBatteries builds the payload to enroll battery MAC addresses.
 * @param logInterval - Optional log interval (default is 0).
 */
async function enrollBatteries(logInterval = 0): Promise<void> {
  try {
    const batts = [theDevice.id];
    // Number of batteries
    const num = batts.length;

    // Create header: first byte is num, second is logInterval.
    const header = new Uint8Array([num, logInterval]);

    // Process each MAC address.
    const macBytesArray: Uint8Array[] = batts.map(mac => {
      console.log('MAC:', mac);
      // Remove any colons from the MAC address.
      const cleanMac = mac.replace(/:/g, '');
      console.log('Clean MAC:', cleanMac);
      // Convert the clean hex string into 6 bytes.
      return hexStringToUint8Array(cleanMac);
    });

    // Concatenate all battery MAC addresses.
    const batteryMacs =
      macBytesArray.length > 0
        ? concatBytes(...macBytesArray)
        : new Uint8Array();

    // Calculate the padding length: Total entries must be 16, each 6 bytes.
    const paddingLength = (16 - num) * 6;
    // Create padding zeros.
    const padding = new Uint8Array(paddingLength);

    // Final payload: header + battery MACs + padding.
    const payload = concatBytes(header, batteryMacs, padding);
    console.log('Payload length:', payload.length);

    // (Optional) Print out the payload in hex.
    console.log(
      'Payload (hex):',
      Array.from(payload)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' '),
    );

    console.log('PAYLOAD:: ', parseAndPrintSystemBatteries(payload));

    // Convert the payload into a base64 string for rn-ble-plx.
    const base64Payload = Buffer.from(payload).toString('base64');
    console.log('Payload (base64):', base64Payload);

    // Write the payload to the BLE device using rn-ble-plx.
    const response =
      await BleManagerInstance.writeCharacteristicWithoutResponseForDevice(
        theInverter.id,
        theInverter?.serviceUUIDs?.[0] ?? '',
        BATTERY_CHAR,
        base64Payload,
      );

    console.log('Enroll Batteries Response:', response);
  } catch (error: any) {
    console.error('Error authenticating:', error);
    Alert.alert('Error', 'Auth failed..', error);
  }
}

//THIS IS USED TO TEST IF AUTHENTICATE AND ENROLLMENT WORKED
//THIS IS READING INVERTER STATE
const INVERTER_STATE_CHAR = '669a0c20-0008-d690-ec11-e214406ccb95';

// Define the structure of `tInverterState`
export interface InverterState {
  LoadInputVoltage: number;
  LoadInputCurrent: number;
  LoadInputPower: number;
  LoadOutputVoltage: number;
  LoadOutputCurrent: number;
  LoadOutputPower: number;
  DeviceTemperature: number;
  HeatsinkTemperature: number;
  LoadStatus: number;
  Version: number;
  InverterOn: number;
  SolarVoltage: number;
  SolarCurrent: number;
}

// Function to parse the binary data into the `InverterState` structure
export function parseInverterState(data: Uint8Array): InverterState {
  const buffer = Buffer.from(data);

  return {
    LoadInputVoltage: buffer.readUInt16LE(0),
    LoadInputCurrent: buffer.readUInt16LE(2),
    LoadInputPower: buffer.readUInt32LE(4),
    LoadOutputVoltage: buffer.readUInt16LE(8),
    LoadOutputCurrent: buffer.readUInt16LE(10),
    LoadOutputPower: buffer.readUInt32LE(12),
    DeviceTemperature: buffer.readUInt16LE(16),
    HeatsinkTemperature: buffer.readUInt16LE(18),
    LoadStatus: buffer.readUInt16LE(20),
    Version: buffer.readUInt16LE(22),
    InverterOn: buffer.readUInt8(24),
    SolarVoltage: buffer.readUInt16LE(25),
    SolarCurrent: buffer.readUInt16LE(27),
  };
}

export async function getInverterStatus(): Promise<InverterState | null> {
  try {
    // Connect to the device
    const connectedDevice = await BleManagerInstance.connectToDevice(
      theInverter.id,
    );
    await connectedDevice.discoverAllServicesAndCharacteristics();

    // Read the inverter state characteristic
    const base64Data = await BleManagerInstance.readCharacteristicForDevice(
      theInverter.id,
      theInverter?.serviceUUIDs?.[0] ?? '', // Replace with the correct service UUID
      INVERTER_STATE_CHAR,
    );

    // Decode the Base64 data into a Uint8Array
    const rawData = Buffer.from(base64Data.value ?? '', 'base64');

    // Parse the data into the `InverterState` structure
    const inverterState = parseInverterState(rawData);

    console.log('Inverter State:', inverterState);
    return inverterState;
  } catch (error) {
    console.error('Error reading inverter status:', error);
    return null;
  }
}

//THIS IS READING BATERRY CONTROLLER STATE
const CHARGE_CONTROLLER_STATE_CHAR = '669a0c20-0008-d690-ec11-e214486ccb95';

// Define the structure of `tChargeControllerState`
export interface ChargeControllerState {
  PV_Voltage: number;
  Batt_Voltage: number;
  PV_Current: number;
  PV_Watt: number;
  LoadCurrent: number;
  LoadWatt: number;
  BatteryStatus: number;
  ChargingStatus: number;
  DischargingStatus: number;
  DeviceTemperature: number;
}

// Function to parse the binary data into the `ChargeControllerState` structure
export function parseChargeControllerState(
  data: Uint8Array,
): ChargeControllerState {
  const buffer = Buffer.from(data);

  return {
    PV_Voltage: buffer.readUInt16LE(0),
    Batt_Voltage: buffer.readUInt16LE(2),
    PV_Current: buffer.readUInt16LE(4),
    PV_Watt: buffer.readInt32LE(6),
    LoadCurrent: buffer.readInt16LE(10),
    LoadWatt: buffer.readInt32LE(12),
    BatteryStatus: buffer.readUInt16LE(16),
    ChargingStatus: buffer.readUInt16LE(18),
    DischargingStatus: buffer.readUInt16LE(20),
    DeviceTemperature: buffer.readInt16LE(22),
  };
}

export async function getChargeControllerStatus(): Promise<ChargeControllerState | null> {
  try {
    // Connect to the device
    const connectedDevice = await BleManagerInstance.connectToDevice(
      theInverter.id,
    );
    await connectedDevice.discoverAllServicesAndCharacteristics();

    // Read the charge controller state characteristic
    const base64Data = await BleManagerInstance.readCharacteristicForDevice(
      theInverter.id,
      theInverter?.serviceUUIDs?.[0] ?? '',
      CHARGE_CONTROLLER_STATE_CHAR,
    );

    // Decode the Base64 data into a Uint8Array
    const rawData = Buffer.from(base64Data.value ?? '', 'base64');

    // Parse the data into the `ChargeControllerState` structure
    const chargeControllerState = parseChargeControllerState(rawData);

    console.log('Charge Controller State:', chargeControllerState);
    return chargeControllerState;
  } catch (error) {
    console.error('Error reading charge controller status:', error);
    return null;
  }
}

//THIS IS READING BATTERIES STATE
const SET_BATT_RETR_CHAR = '669a0c20-0008-d690-ec11-e214436ccb95';
const RETR_BATTERY_CHAR = '669a0c20-0008-d690-ec11-e214446ccb95';

// Define the structure of `tBatteryData`
export interface BatteryData {
  TotalVoltage: number;
  Current: number;
  RemainCapacity: number;
  TotalCapacity: number;
  CycleLife: number;
  ProductLife: number;
  BalanceStatusLow: number;
  BalanceStatusHigh: number;
  ProtectionStatus: number;
  Version: number;
  RSOC: number;
  FetStatus: number;
  CellInSeries: number;
  N_NTC: number;
}

// Function to parse the binary data into the `BatteryData` structure
export function parseBatteryData(data: Uint8Array): BatteryData {
  const buffer = Buffer.from(data);

  return {
    TotalVoltage: buffer.readUInt16BE(0),
    Current: buffer.readInt16BE(2),
    RemainCapacity: buffer.readUInt16BE(4),
    TotalCapacity: buffer.readUInt16BE(6),
    CycleLife: buffer.readUInt16BE(8),
    ProductLife: buffer.readUInt16BE(10),
    BalanceStatusLow: buffer.readUInt16BE(12),
    BalanceStatusHigh: buffer.readUInt16BE(14),
    ProtectionStatus: buffer.readUInt16BE(16),
    Version: buffer.readUInt8(18),
    RSOC: buffer.readUInt8(19),
    FetStatus: buffer.readUInt8(20),
    CellInSeries: buffer.readUInt8(21),
    N_NTC: buffer.readUInt8(22),
  };
}

export async function retrieveBatteryInfo(): Promise<Record<
  string,
  BatteryData
> | null> {
  try {
    const batts = [theDevice.id];
    const connectedDevice = await BleManagerInstance.connectToDevice(
      theInverter.id,
    );
    await connectedDevice.discoverAllServicesAndCharacteristics();

    const batStatus: Record<string, BatteryData> = {};

    for (const mac of batts) {
      // Convert MAC address to bytes
      const macBytes = mac.split(':').map(byte => parseInt(byte, 16));
      const macBuffer = Buffer.from(macBytes);

      // Write the MAC address to the SET_BATT_RETR_CHAR characteristic
      await BleManagerInstance.writeCharacteristicWithResponseForDevice(
        theInverter.id,
        theInverter?.serviceUUIDs?.[0] ?? '',
        SET_BATT_RETR_CHAR,
        macBuffer.toString('base64'),
      );

      // Read the battery data from the RETR_BATTERY_CHAR characteristic
      const base64Data = await BleManagerInstance.readCharacteristicForDevice(
        theInverter.id,
        theInverter?.serviceUUIDs?.[0] ?? '',
        RETR_BATTERY_CHAR,
      );

      // Decode the Base64 data into a Uint8Array
      const rawData = Buffer.from(base64Data.value ?? '', 'base64');

      // Parse the data into the `BatteryData` structure
      const batteryData = parseBatteryData(rawData);

      // Store the parsed data in the batStatus object
      batStatus[mac] = batteryData;

      console.log(`Battery Data for ${mac}:`, batteryData);
    }

    return batStatus;
  } catch (error) {
    console.error('Error retrieving battery info:', error);
    return null;
  }
}
