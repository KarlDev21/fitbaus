import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import CryptoJS from 'crypto-js';
import {
  getConfigStringValue,
  RemoteConfigKeys,
} from '../services/RemoteConfigService';

export const BleManagerInstance = new BleManager();

// const SALT = getConfigStringValue(RemoteConfigKeys.SALT) ?? '';

export function generateNodeDigest(address: string) {
  const l = address.split(':');
  l.reverse();
  console.log(l);

  const li = l.map(x => parseInt(x, 16));
  console.log(li);

  const lb = Buffer.from(li);
  const salt = Buffer.from('StowerBatteryNode-Inventech');
  console.log('len of salt %d', salt.length);

  // Create single MD5 instance
  const m5 = CryptoJS.algo.MD5.create();

  // First update with MAC bytes
  m5.update(CryptoJS.lib.WordArray.create(lb));
  const firstHash = m5;
  console.log('hash of mac ', firstHash.toString());

  // Second update with salt (continue same hash)
  m5.update(CryptoJS.lib.WordArray.create(salt));
  const digest = m5.finalize();
  console.log('hash digest ', digest.toString());

  return Buffer.from(digest.toString(), 'hex');
}

// generateInverterDigest takes a device address (e.g. "12:34:56:78:9A:BC") and an expiration time,
// then returns the MD5 digest (as a Uint8Array) of the concatenation of:
//    - the reversed MAC address bytes,
//    - the 8-byte little-endian representation of expireTime, and
//    - the salt "StowerBatteryNode-Inventech"
export function generateInverterDigest(address: string, expireTime: number): Uint8Array {
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

export function packInt64LE(num: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, num & 0xffffffff, true);
  view.setUint32(4, Math.floor(num / 0x100000000), true);
  return new Uint8Array(buffer);
}

// Concatenates multiple Uint8Array objects.
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


// const getMacBuffer = (address: string): Buffer => {
//   const macBytes = address
//     .split(':')
//     .reverse()
//     .map(x => parseInt(x, 16));

//   return Buffer.from(macBytes);
// };

// const computeMD5 = (data: Buffer): CryptoJS.lib.WordArray => {
//   const md5 = CryptoJS.algo.MD5.create();
//   md5.update(CryptoJS.lib.WordArray.create(data));
//   return md5.finalize();
// };
