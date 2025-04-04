import {Device, Characteristic} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {BleManagerInstance} from './BluetoothHelper';

const FileCMDChar = '669a0c20-0008-d690-ec11-e214466ccb95';
const FileResultChar = '669a0c20-0008-d690-ec11-e214476ccb95';

/**
 * Sends a file command to the device.
 * @param device The BLE device.r
 * @param cmd The command to send (e.g., "LS", "GET", "FMT", "RM").
 * @param filename Optional filename for commands like "GET" or "RM".
 */
export const sendFileCmd = async (
  device: Device,
  cmd: string,
  filename: string = '',
): Promise<void> => {
  try {
    const connectedDevice = await BleManagerInstance.connectToDevice(device.id);

    const command = cmd === 'GET' || cmd === 'RM' ? `${cmd} ${filename}` : cmd;
    const encodedCommand = Buffer.from(command, 'utf-8');
    const items = await connectedDevice.discoverAllServicesAndCharacteristics();
    console.log('items:', items);
    const response =
      await BleManagerInstance.writeCharacteristicWithResponseForDevice(
        device.id,
        device?.serviceUUIDs?.[0] ?? '',
        FileCMDChar,
        encodedCommand.toString('base64'),
      );
    console.log('response sent:', response);
  } catch (error) {
    console.error('Error sending file command:', error);
  }
};

/**
 * Reads the result of a file operation from the device.
 * @param device The BLE device.
 * @returns A Buffer containing the result.
 */
export const getFileResult = async (device: Device): Promise<Buffer> => {
  const characteristic: Characteristic =
    await device.readCharacteristicForService(FileResultChar, FileResultChar);
  return Buffer.from(characteristic.value || '', 'base64');
};

/**
 * Waits for file results from the device.
 * @param device The BLE device.
 * @returns A Buffer containing the result.
 */
export const waitFileResults = async (
  device: Device,
): Promise<Buffer | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      console.log('Received #0');
      device.monitorCharacteristicForService(
        FileResultChar,
        FileResultChar,
        (error, characteristic) => {
          if (error) {
            console.error('Error monitoring file results:', error);
            reject(error); // Reject the promise if an error occurs
            return;
          }
          console.log('Received');
          if (characteristic?.value) {
            console.log('Received file result:', characteristic.value);
            resolve(Buffer.from(characteristic.value, 'base64'));
          }
        },
      );
    });
  } catch (error) {
    console.error('Unexpected error in waitFileResults:', error);
  }
};
