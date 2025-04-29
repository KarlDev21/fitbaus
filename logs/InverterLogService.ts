import {Buffer} from 'buffer';
import {Device, Subscription} from 'react-native-ble-plx';
import {Mutex} from 'async-mutex';
import RNFS from 'react-native-fs';
import {AsyncQueue} from './AsyncQueue';
import {uploadFileToServerAsync} from '../services/DeviceUnitService';
import {getItemAsync, SECURE_STORE_KEYS} from '../helpers/SecureStorageHelper';
import {UserProfileResponse} from '../types/ApiResponse';
import {
  getFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '../helpers/StorageHelper';
import {Inverter} from '../types/DeviceType';
import {UploadFileRequest} from '../types/ApiRequest';

// Stower Inverter class that handles BLE communication
export class StowerInverter {
  private peripheral: Device;
  private queue: AsyncQueue<Buffer> = new AsyncQueue<Buffer>();

  private fileCmdMutex = new Mutex();

  // Constants for characteristic UUIDs
  private static FileCMDChar(): string {
    return '669a0c20-0008-d690-ec11-e214466ccb95';
  }

  private static FileResultChar(): string {
    return '669a0c20-0008-d690-ec11-e214476ccb95';
  }

  constructor(peripheral: Device) {
    this.peripheral = peripheral;
  }

  private subscription: Subscription | null = null;

  subscribe(): void {
    try {
      this.subscription = this.peripheral.monitorCharacteristicForService(
        '669a0c20-0008-d690-ec11-e2143045cb95', // Using service ID as we don't have a specific service ID
        StowerInverter.FileResultChar(),
        (error, characteristic) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }

          if (characteristic?.value) {
            const data = Buffer.from(characteristic.value, 'base64');
            this.fileResultNotify(data);
          }
        },
      );
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  }

  unsubscribe(): void {
    try {
      // Stop monitoring the characteristic
      this.subscription?.remove();
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  }

  async sendFileCmd(cmd: string, filename: string = ''): Promise<void> {
    // Use a mutex to ensure commands don't overlap
    return this.fileCmdMutex.runExclusive(async () => {
      if (cmd === 'GET' || cmd === 'RM') {
        cmd = cmd + ' ' + filename;
      }
      console.log(`send Cmd ${cmd}`);

      const data = Buffer.from(cmd, 'utf-8');

      try {
        await this.peripheral.writeCharacteristicWithResponseForService(
          '669a0c20-0008-d690-ec11-e2143045cb95', // Using device ID as we don't have a specific service ID
          StowerInverter.FileCMDChar(),
          Buffer.from(data).toString('base64'),
        );
      } catch (error) {
        console.error('Error writing characteristic:', error);
        throw error;
      }
    });
  }

  async getFileResult(): Promise<Buffer> {
    try {
      const characteristic = await this.peripheral.readCharacteristicForService(
        '669a0c20-0008-d690-ec11-e2143045cb95', // Using device ID as we don't have a specific service ID
        StowerInverter.FileResultChar(),
      );

      if (characteristic?.value) {
        return Buffer.from(characteristic.value, 'base64');
      }

      throw new Error('Failed to read characteristic value');
    } catch (error) {
      console.error('Error reading characteristic:', error);
      throw error;
    }
  }

  fileResultNotify(data: Buffer): void {
    // console.log(`Notification received: ${data.length} bytes`);
    this.queue.put(data).then(() => {
      //Do nothing
    });
  }

  async waitFileResults(): Promise<Buffer> {
    // console.log("waitFileResults");
    return await this.queue.get();
  }

  async waitFileResultsTimer(timeoutMs = 10000): Promise<Buffer> {
    return Promise.race([
      this.queue.get(),
      new Promise<Buffer>((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout waiting for BLE data')),
          timeoutMs,
        ),
      ),
    ]);
  }

  async downloadFiles(fileList: string[]): Promise<void> {
    const dirPath = `${RNFS.DocumentDirectoryPath}/stower_files`;

    try {
      // Create directory if it doesn't exist
      const dirExists = await RNFS.exists(dirPath);
      if (!dirExists) {
        await RNFS.mkdir(dirPath);
      }

      for (const f of fileList) {
        console.log(`Starting download of file: ${f}`);

        // Send the GET command to request the file
        await this.sendFileCmd('GET', f);

        // First response is the file size
        const fileSizeBuffer = await this.waitFileResults();
        const fileSize = fileSizeBuffer.readUInt32LE(0);
        console.log(`File size: ${fileSize} bytes`);

        // Buffer to accumulate all file parts
        let contents = Buffer.alloc(0);
        let piece = 0;

        // Print initial progress
        console.log('0%..');

        // Keep receiving chunks until we have the complete file
        while (contents.length < fileSize) {
          // Wait for next chunk of data
          const chunk = await this.waitFileResultsTimer();

          // Add chunk to our buffer
          contents = Buffer.concat([contents, chunk]);

          // Calculate progress percentage
          const percentage = Math.floor((contents.length / fileSize) * 100);

          // Print progress at 10% intervals
          if (percentage >= (piece + 1) * 10) {
            piece = Math.floor(percentage / 10);
            console.log(`${piece * 10}%..`);
          }
        }

        console.log('100%');
        console.log(`Downloaded ${contents.length} bytes`);

        // Save the file
        const filePath = `${dirPath}/${f}`;
        await RNFS.writeFile(filePath, contents.toString('base64'), 'base64');
        console.log(`File saved to: ${filePath}`);
      }

      console.log('All files downloaded successfully');
    } catch (error) {
      console.error('Error in getFiles:', error);
      throw error;
    }
  }

  async uploadFiles(fileList: string[]): Promise<void> {
    const dirPath = `${RNFS.DocumentDirectoryPath}/stower_files`;

    try {
      // Create directory if it doesn't exist
      const dirExists = await RNFS.exists(dirPath);
      if (!dirExists) {
        await RNFS.mkdir(dirPath);
      }

      for (const f of fileList) {
        console.log(`Starting download of file: ${f}`);

        // Send the GET command to request the file
        await this.sendFileCmd('GET', f);

        // First response is the file size
        const fileSizeBuffer = await this.waitFileResults();
        const fileSize = fileSizeBuffer.readUInt32LE(0);
        console.log(`File size: ${fileSize} bytes`);

        // Buffer to accumulate all file parts
        let contents = Buffer.alloc(0);
        let piece = 0;

        // Print initial progress
        console.log('0%..');

        // Keep receiving chunks until we have the complete file
        while (contents.length < fileSize) {
          // Wait for next chunk of data
          const chunk = await this.waitFileResultsTimer();

          // Add chunk to our buffer
          contents = Buffer.concat([contents, chunk]);

          // Calculate progress percentage
          const percentage = Math.floor((contents.length / fileSize) * 100);

          // Print progress at 10% intervals
          if (percentage >= (piece + 1) * 10) {
            piece = Math.floor(percentage / 10);
            console.log(`${piece * 10}%..`);
          }
        }

        console.log('100%');
        console.log(`Downloaded ${contents.length} bytes`);

        // Convert the file contents to Base64
        const base64File = contents.toString('base64');

        await this.uploadAndDeleteFile(f, base64File);

        console.log(`File ${f} uploaded successfully`);
      }

      console.log('All files uploaded successfully');
    } catch (error) {
      console.error('Error in getFiles:', error);
      throw error;
    }
  }

  async deleteFile(file: string): Promise<void> {
    await this.sendFileCmd('RM', file);

    const resultBuffer = await this.waitFileResults();
    const result = resultBuffer.readUInt32LE(0);

    console.log(`Delete ${file} result ${result}`);
  }

  private async uploadAndDeleteFile(fileName: string, fileData: string) {
    try {
      const user = await getItemAsync<UserProfileResponse>(
        SECURE_STORE_KEYS.USER_PROFILE,
      );

      const inverter: Inverter = await getFromStorage(
        STORAGE_KEYS.SELECTED_INVERTER,
      );

      const response = await uploadFileToServerAsync({
        inverterID: inverter.id,
        fileName: fileName,
        fileData: fileData,
      });

      if (response.success) {
        //TODO: Uncomment this when the inverter issue is fixed
        // this.deleteFile(fileName);

        removeFileFromStorage(fileName);
      } else {
        console.error(`Failed to upload file ${fileName}.`);
      }
    } catch (err) {
      console.error('Error: Uploading FIle and deleting it');
      throw err;
    }
  }
}

function removeFileFromStorage(fileName: string) {
  const files: string[] = getFromStorage(STORAGE_KEYS.FILE) || [];

  // Remove the deleted file from the list
  const updatedFiles = files.filter(file => file !== fileName);

  // Save the updated list back to storage
  saveToStorage(STORAGE_KEYS.FILE, JSON.stringify(updatedFiles));
}
