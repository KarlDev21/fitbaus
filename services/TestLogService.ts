import {Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import {getConnectedInverter} from './storage';

// const FILE_CMD_CHAR_UUID = '669a0c20-0008-d690-ec11-e214466ccb95';
// const FILE_RESULT_CHAR_UUID = '669a0c20-0009-d690-ec11-e214466ccb95'; // Assuming from pattern

//CHATGPT
export const listFiles = async (
  device: Device,
  serviceUUID: string,
  cmdCharUUID: string, // same as Python's "write to this"
  notifyCharUUID: string, // same as Python's "subscribe to this"
): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    let accumulatedData: any[] = [];

    try {
      console.log('[BLE] Subscribing to notifications...');

      //First thing we do is subscribe
      //We use the callback to add the infomation we pick up to the accumulatedData array
      //since the response doesnt come back from the commond we send,
      //we have to wait for the notification to come back to the subscription
      const subscription = device.monitorCharacteristicForService(
        serviceUUID,
        notifyCharUUID,
        (error, characteristic) => {
          if (error) {
            console.error('[BLE] Notification error:', error.message);
            reject('Notification error: ' + error.message);
            return;
          }

          if (!characteristic?.value) {
            console.warn('[BLE] Empty characteristic received');
            return;
          }

          const buffer = Buffer.from(characteristic.value, 'base64');
          const chunk = buffer.toString('utf-8').trim().split('\n');

          console.log('[BLE] Chunk received:', chunk);

          //   if (chunk.length === 0) {
          //     console.log('[BLE] EOF reached. Processing data...');

          //     const fullBuffer = Buffer.from(accumulatedData);
          //     const fileList = fullBuffer
          //       .toString('utf-8')
          //       .trim()
          //       .split('\n')
          //       .filter(f => f.length > 0);

          //     resolve(fileList);
          //   } else {
          accumulatedData.push(...chunk);
          //   }
        },
      );

      console.log('[BLE] Sending "list" command...');
      //Now we Send the "list" command to the device'
      const listCommand = Buffer.from('LS', 'utf-8').toString('base64');
      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        cmdCharUUID,
        listCommand,
      );

      let formatedListNames = [];
      //At this stage, the accumulateData is ray has been filled, so theoretically we can loop through it until
      //we reach the end of the list of file names.
      //and ultimately break the loop
      while (true) {
        console.log('start data loop');
        const data = accumulatedData;
        const filename = Buffer.from(data);

        // .replace(/\x00+$/, '');
        console.log('[BLE] Filename:', filename);

        if (filename.length > 0) {
          formatedListNames.push(filename);
        } else {
          break;
        }
      }
    } catch (err) {
      console.error('[BLE] listFiles failed:', err);
      reject('Failed to list files: ' + (err as Error).message);
    }
  });
};
