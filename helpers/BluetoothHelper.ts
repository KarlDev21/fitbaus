/* eslint-disable no-bitwise */
import {BleManager, Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import CryptoJS from 'crypto-js';
import {getFromStorage, saveToStorage, STORAGE_KEYS} from './StorageHelper';
import {Battery, Inverter} from '../types/DeviceType';
import {Device as ApiDevice} from '../types/ApiResponse';
export const BleManagerInstance = new BleManager();

export const SALT = 'StowerBatteryNode-Inventech';

/**
 * Generates an MD5 digest for a node using its MAC address and a predefined salt.
 *
 * This function performs the following steps:
 * 1. Splits the MAC address into its components and reverses their order.
 * 2. Converts the reversed MAC address components into a `Uint8Array`.
 * 3. Converts the predefined salt string into a `Buffer`.
 * 4. Computes the MD5 hash of the concatenated MAC address bytes and salt.
 * 5. Returns the resulting MD5 digest as a `Buffer`.
 *
 * @param {string} address - The MAC address of the node (e.g., "12:34:56:78:9A:BC").
 *
 * @returns {Buffer} - The MD5 digest as a `Buffer`.
 */
export function generateNodeDigest(address: string): Buffer<ArrayBuffer> {
  const macs = address.split(':');
  macs.reverse();

  const macBytes = macs.map(x => parseInt(x, 16));
  const macBuffer = Buffer.from(macBytes);

  const saltBuffer = Buffer.from(SALT);

  const md5Hasher = CryptoJS.algo.MD5.create();
  md5Hasher.update(CryptoJS.lib.WordArray.create(macBuffer));
  md5Hasher.update(CryptoJS.lib.WordArray.create(saltBuffer));

  const digest = md5Hasher.finalize();
  return Buffer.from(digest.toString(), 'hex');
}

/**
 * Generates an MD5 digest for an inverter using its MAC address and an expiration time.
 *
 * This function performs the following steps:
 * 1. Reverses the MAC address parts and converts them into a `Uint8Array`.
 * 2. Converts the salt string ("StowerBatteryNode-Inventech") into a `Uint8Array`.
 * 3. Packs the expiration time into an 8-byte little-endian format.
 * 4. Concatenates the reversed MAC address bytes, the packed expiration time, and the salt bytes.
 * 5. Computes the MD5 hash of the concatenated data.
 * 6. Converts the resulting MD5 hash (hex string) into a `Uint8Array`.
 */
export function generateInverterDigest(
  address: string,
  expireTime: number,
): Uint8Array {
  const parts = address.split(':').reverse();
  const macBytes = new Uint8Array(parts.map(x => parseInt(x, 16)));

  const saltBytes = new Uint8Array([...SALT].map(ch => ch.charCodeAt(0)));
  const timeStamp = packInt64LE(expireTime);
  const data = concatBytes(macBytes, timeStamp, saltBytes);

  const wordArray = CryptoJS.lib.WordArray.create(data as any, data.length);

  const md5Hash = CryptoJS.MD5(wordArray);
  const md5Hex = md5Hash.toString(CryptoJS.enc.Hex);

  const digest = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    digest[i] = parseInt(md5Hex.substr(i * 2, 2), 16);
  }
  return digest;
}

/**
 * Packs a 64-bit integer (expiration time) into a little-endian `Uint8Array`.
 *
 * This function performs the following steps:
 * 1. Allocates an 8-byte buffer to hold the 64-bit integer.
 * 2. Splits the 64-bit integer into two 32-bit parts:
 *    - The lower 32 bits are stored in the first 4 bytes.
 *    - The upper 32 bits are stored in the next 4 bytes.
 * 3. Writes the parts into the buffer in little-endian format.
 *
 * @param {number} expireTime - The 64-bit integer representing the expiration time (e.g., Unix timestamp).
 *
 * @returns {Uint8Array} - An 8-byte `Uint8Array` containing the packed little-endian representation of the integer.
 */
export function packInt64LE(expireTime: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, expireTime & 0xffffffff, true);
  view.setUint32(4, Math.floor(expireTime / 0x100000000), true);
  return new Uint8Array(buffer);
}

/**
 * Concatenates multiple `Uint8Array` instances into a single `Uint8Array`.
 *
 * This function performs the following steps:
 * 1. Calculates the total length of all input arrays.
 * 2. Allocates a new `Uint8Array` with the total length.
 * 3. Copies each input array into the allocated array at the correct offset.
 *
 * @param {...Uint8Array[]} arrays - The `Uint8Array` instances to concatenate.
 *
 * @returns {Uint8Array} - A new `Uint8Array` containing the concatenated data from all input arrays.
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Converts a MAC address string into a `Uint8Array`.
 *
 * This function removes any colons (`:`) from the MAC address and converts the resulting hexadecimal string
 * into a `Uint8Array` representation.
 *
 * @param {string} mac - The MAC address to convert (e.g., "12:34:56:78:9A:BC").
 *
 * @returns {Uint8Array} - A `Uint8Array` containing the byte representation of the MAC address.
 */
export function convertMacToBytes(mac: string): Uint8Array {
  const cleanMac = mac.replace(/:/g, '');
  return hexStringToUint8Array(cleanMac);
}

/**
 * Creates a padded payload for enrolling batteries with an inverter.
 *
 * This function performs the following steps:
 * 1. Creates a header containing the number of batteries and the log interval.
 * 2. Concatenates the MAC addresses of the batteries into a single `Uint8Array`.
 * 3. Adds padding to ensure the payload meets the required length (16 entries, each 6 bytes).
 *
 * @param {Uint8Array[]} macBytesArray - An array of `Uint8Array` instances representing the MAC addresses of the batteries.
 * @param {number} logInterval - The log interval to include in the payload.
 *
 * @returns {Uint8Array} - A `Uint8Array` containing the padded payload.
 */
export function createPaddedPayload(
  macBytesArray: Uint8Array[],
  logInterval: number,
): Uint8Array {
  const numBatteries = macBytesArray.length;
  const header = new Uint8Array([numBatteries, logInterval]);

  const batteryMacs =
    macBytesArray.length > 0 ? concatBytes(...macBytesArray) : new Uint8Array();

  const paddingLength = (16 - numBatteries) * 6;
  const padding = new Uint8Array(paddingLength);

  return concatBytes(header, batteryMacs, padding);
}

/**
 * Converts a hexadecimal string into a `Uint8Array`.
 *
 * This function performs the following steps:
 * 1. Validates that the input hex string has an even length (required for byte conversion).
 * 2. Allocates a `Uint8Array` with a length equal to half the hex string length.
 * 3. Iterates through the hex string in 2-character chunks, converting each chunk into a byte.
 * 4. Populates the `Uint8Array` with the converted bytes.
 *
 * @param {string} hex - The hexadecimal string to convert (e.g., "123456789ABC").
 *
 * @returns {Uint8Array} - A `Uint8Array` containing the byte representation of the hex string.
 */
export function hexStringToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return result;
}

export function getSelectedInverter(): Inverter | null {
  return getFromStorage<Inverter>(STORAGE_KEYS.SELECTED_INVERTER) ?? null;
}

export function setConnectedInverter(inverter: Inverter) {
  saveToStorage(STORAGE_KEYS.CONNECTED_INVERTER, JSON.stringify(inverter));
}

export function getConnectedInverter(): Inverter | null {
  return getFromStorage<Inverter>(STORAGE_KEYS.CONNECTED_INVERTER) ?? null;
}

export const setConnectedNodes = async (
  nodes: Battery[],
  parentInverter: Inverter,
) => {
  const key = `${parentInverter.id} ${STORAGE_KEYS.CONNECTED_NODES}`;
  saveToStorage(key, JSON.stringify(nodes));
};

export const getConnectedNodes = (parentInverter: Inverter) => {
  const key = `${parentInverter.id} ${STORAGE_KEYS.CONNECTED_NODES}`;
  return getFromStorage<Battery[]>(key) as Battery[];
};

export const setConnectedInverterDevice = (inverter: Inverter) => {
  const key = `Device ${inverter.id}`;
  saveToStorage(key, JSON.stringify(inverter));
};

export const getConnectedInverterDevice = (inverterId: string) => {
  const key = `Device ${inverterId}`;
  return getFromStorage<Inverter>(key) ?? null;
};

export function convertBleDevicesToApiDevices(
  bleDevices: Device[],
): ApiDevice[] {
  return bleDevices.map(bleDevice => ({
    deviceID: bleDevice.id,
    deviceType: bleDevice.name?.includes('Invert') ? 'Inverter' : 'Battery',
  }));
}
