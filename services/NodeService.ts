import {
  BleManagerInstance,
  generateNodeDigest,
} from '../helpers/BluetoothHelper';
import {Buffer} from 'buffer';
import {BleUuids} from '../types/constants/constants';

export const parseBatteryData = (data: Uint8Array) => {
  if (data.length < 23) {
    console.error('Invalid battery data length:', data.length);
    return null;
  }

  return {
    totalVoltage: (data[0] << 8) | data[1], // Int16ub
    current: (((data[2] << 8) | data[3]) << 16) >> 16, // Int16sb (Signed)
    remainCapacity: (data[4] << 8) | data[5], // Int16ub
    totalCapacity: (data[6] << 8) | data[7], // Int16ub
    cycleLife: (data[8] << 8) | data[9], // Int16ub
    productLife: (data[10] << 8) | data[11], // Int16ub
    balanceStatusLow: (data[12] << 8) | data[13], // Int16ub
    balanceStatusHigh: (data[14] << 8) | data[15], // Int16ub
    protectionStatus: (data[16] << 8) | data[17], // Int16ub
    version: data[18], // Int8ul
    rsoc: data[19], // Int8ul
    fetStatus: data[20], // Int8ul
    cellInSeries: data[21], // Int8ul
    nNTC: data[22], // Int8ul
  };
};

/**
 * Authenticates a node by connecting to it via Bluetooth, discovering its services and characteristics,
 * and writing a generated digest to a specific characteristic.
 *
 * @param {string} nodeId - The unique identifier of the node to authenticate.
 * @returns {Promise<boolean>} - Resolves to `true` if authentication is successful, otherwise `false`.
 */
export async function authenticateNode(nodeId: string) {
  try {
    const connectedDevice = await BleManagerInstance.connectToDevice(nodeId);
    await connectedDevice.discoverAllServicesAndCharacteristics();

    const digest = generateNodeDigest(nodeId);

    //Note: The UUIDs used here are placeholders. Replace them with the actual UUIDs for the device.
    await BleManagerInstance.writeCharacteristicWithResponseForDevice(
      nodeId,
      BleUuids.NODE_AUTHENTICATION_SERVICE_UUID,
      BleUuids.NODE_AUTHENTICATION_CHAR_UUID,
      Buffer.from(digest).toString('base64'),
    );
    return true;
  } catch (error) {
    return false;
  }
}
