/* eslint-disable @typescript-eslint/no-unused-vars */
import {Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {AsyncQueue} from './NotificationQueue';
import * as FileSystem from 'expo-file-system';

export const fileQueue = new AsyncQueue<string>();

export const startNotificationListener = async (
  device: Device | null,
  serviceUUID: string,
  notifyCharUUID: string,
): Promise<void> => {
  try {
    if (!device) {
      console.warn('[BLE] No device connected. Listener not started.');
      return;
    }

    console.log('[BLE] Subscribing to notifications...');

    device.monitorCharacteristicForService(
      serviceUUID,
      notifyCharUUID,
      (error, characteristic) => {
        if (error) {
          console.error('[BLE] Notification error:', error.message);
          return;
        }

        if (!characteristic?.value) {
          console.warn('[BLE] Empty characteristic received');
          return;
        }

        const buffer = Buffer.from(characteristic.value, 'base64');
        const chunk = buffer.toString('utf-8').trim();

        const processedChunks = new Set<string>();

        if (!processedChunks.has(chunk)) {
          console.log('Adding to queue:', chunk);
          processedChunks.add(chunk);
          fileQueue.push(chunk);
        } else {
          console.log('Duplicate chunk detected. Skipping:', chunk);
        }
      },
    );
  } catch (error) {
    console.error('[BLE] Error starting notification listener:', error);
  }
};

export const listenToFileQueue = async (): Promise<void> => {
  try {
    const filePath = `${FileSystem.documentDirectory}files.json`;
    console.log('[FileQueue] FilePath: ', filePath);

    // Initialize the JSON file if it doesn't exist
    const fileExists = await FileSystem.getInfoAsync(filePath);
    if (!fileExists.exists) {
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify([]));
    }

    console.log('[FileQueue] Listening for new items...');
    while (true) {
      try {
        // Wait for the next item in the queue
        const chunk = await fileQueue.pop();

        if (chunk === 'EOF') {
          console.log(
            '[FileQueue] End of transmission received. Exiting loop.',
          );
          break;
        }

        console.log('[FileQueue] New item received:', chunk);

        // Read the current contents of the file
        const fileContents = await FileSystem.readAsStringAsync(filePath);
        const files = JSON.parse(fileContents);

        if (files.includes(chunk)) {
          console.log('[FileQueue] Duplicate item detected. Skipping:', chunk);
          continue;
        }

        // Add the new chunk to the list
        files.push(chunk);

        // Write the updated list back to the file
        await FileSystem.writeAsStringAsync(
          filePath,
          JSON.stringify(files, null, 2),
        );
        console.log('DONE');
      } catch (error) {
        console.error('[FileQueue] Error processing queue:', error);
      }
    }
  } catch (error) {
    console.error('[FileQueue] Error in listenToFileQueue:', error);
  }
};

export const sendListCommand = async (
  device: Device | null,
  serviceUUID: string,
  cmdCharUUID: string,
): Promise<void> => {
  if (!device) {
    console.warn('[BLE] No device connected. Cannot send list command.');
    return;
  }

  try {
    console.log('[BLE] Sending "list" command...');
    const listCommand = Buffer.from('LS', 'utf-8').toString('base64');
    await device.writeCharacteristicWithResponseForService(
      serviceUUID,
      cmdCharUUID,
      listCommand,
    );
    console.log('[BLE] "list" command sent');
  } catch (err) {
    console.error('[BLE] Failed to send list command:', err);
  }
};

//GET FUNCTIONALITY
export const getFiles = async (
  device: Device,
  serviceUUID: string,
  cmdCharUUID: string,
): Promise<void> => {
  try {
    // Read the file list from files.json
    const filePath = `${FileSystem.documentDirectory}files.json`;
    const fileExists = await FileSystem.getInfoAsync(filePath);

    if (!fileExists.exists) {
      console.warn('[getFiles] No files.json found. Nothing to process.');
      return;
    }

    const fileContents = await FileSystem.readAsStringAsync(filePath);
    const fileList: string[] = JSON.parse(fileContents);

    if (fileList.length === 0) {
      console.log('[getFiles] No files to process.');
      return;
    }

    for (const file of fileList) {
      try {
        console.log(`[getFiles] Processing file: ${file}`);

        // Send the "GET" command for the file
        await sendFileCmd(device, 'GET', file, serviceUUID, cmdCharUUID);

        // Wait for the file contents to be added to the queue
        const fileData = await fileQueue.pop();

        if (!fileData) {
          console.warn(`[getFiles] No data received for file: ${file}`);
          continue;
        }

        // Write the file contents to disk
        const outputFilePath = `${FileSystem.documentDirectory}${file}`;
        console.log(`[getFiles] Writing file to disk: ${outputFilePath}`);

        await FileSystem.writeAsStringAsync(outputFilePath, fileData, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log(`[getFiles] Successfully wrote ${file} to disk.`);
      } catch (error) {
        console.error(`[getFiles] Error processing file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error(
      '[getFiles] Error reading files.json or processing files:',
      error,
    );
  }
};

export const readFiles = async (): Promise<string[]> => {
  const filePath = `${FileSystem.documentDirectory}files.json`;

  try {
    const fileContents = await FileSystem.readAsStringAsync(filePath);
    const fileList = JSON.parse(fileContents);

    return fileList.files || [];
  } catch (error: any) {
    if (error.code === 'E_FILE_NOT_FOUND') {
      console.warn(
        '[readFiles] files.json not found. Returning an empty list.',
      );
      return [];
    }
    console.error('[readFiles] Error reading files.json:', error);
    return [];
  }
};

export const sendFileCmd = async (
  device: Device | null,
  cmd: string,
  filename: string = '',
  serviceUUID: string,
  cmdCharUUID: string,
): Promise<void> => {
  if (!device) {
    console.warn('[BLE] No device connected. Cannot send command.');
    return;
  }

  // Append the filename to the command if required
  if (['GET', 'RM'].includes(cmd)) {
    cmd = `${cmd} ${filename}`;
  }

  console.log(`[BLE] Sending command: ${cmd}`);

  try {
    // Encode the command as a UTF-8 byte array
    const encodedCmd = Buffer.from(cmd, 'utf-8').toString('base64');

    // Write the command to the characteristic
    await device.writeCharacteristicWithResponseForService(
      serviceUUID,
      cmdCharUUID,
      encodedCmd,
    );

    console.log('[BLE] Command sent successfully.');
  } catch (error) {
    console.error('[BLE] Failed to send command:', error);
  }
};
