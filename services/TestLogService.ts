import {Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import {getConnectedInverter} from './storage';

// const FILE_CMD_CHAR_UUID = '669a0c20-0008-d690-ec11-e214466ccb95';
// const FILE_RESULT_CHAR_UUID = '669a0c20-0009-d690-ec11-e214466ccb95'; // Assuming from pattern

const Inverter = getConnectedInverter();
export async function connectAndStartNotifications() {
  try {
    const device = await BleManagerInstance.connectToDevice(Inverter?.id ?? '');

    const response = await device.discoverAllServicesAndCharacteristics();
    console.log('Discovered services and characteristics:', response);

    const getServiceCharacteristics = await device.characteristicsForService(
      '669a0c20-0008-d690-ec11-e2143045cb95',
    );
    console.log('Discovered characteristics:', getServiceCharacteristics);

    startNotificationListener(
      device,
      '669a0c20-0008-d690-ec11-e2143045cb95',
      '669a0c20-0008-d690-ec11-e214476ccb95',
    );
  } catch (error) {
    console.error('Connection or setup failed:', error);
  }
}

const notificationQueue: Buffer[] = [];

function startNotificationListener(
  device: Device,
  serviceUUID: string,
  characteristicUUID: string,
) {
  try {
    device.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        console.log('StartedNOTIFC');
        if (error) {
          console.error('Notification error:', error);
          return;
        }

        if (characteristic?.value) {
          const rawData = Buffer.from(characteristic.value, 'base64');
          notificationQueue.push(rawData);
          console.log('Received data:', rawData);
        }

        console.log('Received notification:', characteristic);
      },
    );

    console.log('Started monitoring notifications for characteristic');
  } catch (error) {
    console.error('Notification error:', error);
    return;
  }
}

// LIST THE FILES LOGIC
async function sendFileCmd(
  device: Device,
  characteristicUUID: string,
  command: string,
  filename = '',
) {
  let cmdToSend = command;
  if (command === 'GET' || command === 'RM') {
    cmdToSend += ` ${filename}`;
  }

  console.log('send Cmd:', cmdToSend);

  const base64Cmd = Buffer.from(cmdToSend, 'utf-8').toString('base64');

  await device.writeCharacteristicWithResponseForService(
    '669a0c20-0008-d690-ec11-e2143045cb95',
    characteristicUUID,
    base64Cmd,
  );
}

// Simulates waitFileResults() using the queue
async function waitFileResults(): Promise<Buffer> {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (notificationQueue.length > 0) {
        clearInterval(interval);
        resolve(notificationQueue.shift()!);
      }
    }, 100); // poll every 100ms
  });
}

// Main logic: Get file list
export async function getListOfFiles(device: Device, writeCharUUID: string) {
  console.log('get list of files');

  await sendFileCmd(device, writeCharUUID, 'LS');

  const files: string[] = [];

  while (true) {
    const data = await waitFileResults();
    const filename = data.toString('utf-8').replace(/\x00+$/, '');
    console.log('Filename:', filename);

    if (filename.length > 0) {
      files.push(filename);
    } else {
      break;
    }
  }

  console.log('files:', files);
  writeFiles(files);
}

// Simulated writeFiles (for demo only — in RN, use AsyncStorage or secure storage)
function writeFiles(files: string[]) {
  const devicefiles = {files};
  console.log('Device Files:', JSON.stringify(devicefiles, null, 2));
}

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
          const chunk = [...buffer];

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
      const listCommand = Buffer.from('LS', 'utf-8').toString('base64');
      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        cmdCharUUID,
        listCommand,
      );
      console.log('[BLE] "list" command sent', accumulatedData);
    } catch (err) {
      console.error('[BLE] listFiles failed:', err);
      reject('Failed to list files: ' + (err as Error).message);
    }
  });
};
