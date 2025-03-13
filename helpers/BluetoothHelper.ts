import {BleManager} from 'react-native-ble-plx';
import CryptoJS from 'crypto-js';
import {
  getConfigStringValue,
  RemoteConfigKeys,
} from '../services/RemoteConfigService';

export const BleManagerInstance = new BleManager();

const SALT = getConfigStringValue(RemoteConfigKeys.SALT) ?? '';

export const generateDigest = (address: string): Buffer => {
  if (!address) {
    throw new Error('Invalid address');
  }

  const macBuffer = getMacBuffer(address);
  const saltBuffer = Buffer.from(SALT);
  const firstHash = computeMD5(macBuffer);

  const finalHash = computeMD5(
    Buffer.concat([Buffer.from(firstHash.toString(), 'hex'), saltBuffer]),
  );

  return Buffer.from(finalHash.toString(), 'hex');
};

const getMacBuffer = (address: string): Buffer => {
  const macBytes = address
    .split(':')
    .reverse()
    .map(x => parseInt(x, 16));

  return Buffer.from(macBytes);
};

const computeMD5 = (data: Buffer): CryptoJS.lib.WordArray => {
  const md5 = CryptoJS.algo.MD5.create();
  md5.update(CryptoJS.lib.WordArray.create(data));
  return md5.finalize();
};
