import {Buffer} from 'buffer';
import {Device, Subscription} from 'react-native-ble-plx';
import {Mutex} from 'async-mutex';
import RNFS from 'react-native-fs';
import {AsyncQueue} from './AsyncQueue';
import {uploadFileToServerAsync} from '../services/DeviceUnitService';
import {
  getFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '../helpers/StorageHelper';
import {Inverter} from '../types/DeviceType';
import {readLogFiles} from '../helpers/FileHelper';
import {BleUuids} from '../types/constants/constants';

export class StowerInverter {
  private peripheral: Device;
  private queue: AsyncQueue<Buffer> = new AsyncQueue<Buffer>();

  private fileCmdMutex = new Mutex();

  constructor(peripheral: Device) {
    this.peripheral = peripheral;
  }

  private subscription: Subscription | null = null;

  // subscribe(): void {
  //   try {
  //     this.subscription = this.peripheral.monitorCharacteristicForService(
  //       BleUuids.FILE_CMD_SERVICE_UUID,
  //       BleUuids.FILE_RESULT_CHAR_UUID,
  //       (error, characteristic) => {
  //         if (error) {
  //           console.error('Notification error:', error);
  //           return;
  //         }

  //         if (characteristic?.value) {
  //           const data = Buffer.from(characteristic.value, 'base64');
  //           this.fileResultNotify(data);
  //         }
  //       },
  //     );
  //   } catch (error) {
  //     console.error('Error subscribing to notifications:', error);
  //   }
  // }

  // unsubscribe(): void {
  //   try {
  //     // Stop monitoring the characteristic
  //     this.subscription?.remove();
  //   } catch (error) {
  //     console.error('Error unsubscribing from notifications:', error);
  //   }
  // }

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
          BleUuids.FILE_CMD_SERVICE_UUID,
          BleUuids.FILE_CMD_CHAR_UUID,
          Buffer.from(data).toString('base64'),
        );
      } catch (error) {
        console.error('Error writing characteristic:', error);
        throw error;
      }
    });
  }

  //TODO: Double check that I can remove this function now
  async getFileResult(): Promise<Buffer> {
    try {
      const characteristic = await this.peripheral.readCharacteristicForService(
        BleUuids.FILE_CMD_SERVICE_UUID,
        BleUuids.FILE_RESULT_CHAR_UUID,
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
    this.queue.put(data).then(() => {
      //Do nothing
    });
  }

  async waitFileResults(): Promise<Buffer> {
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
  //TODO: Clean up this file once the upload is working
  async downloadFiles(fileList: string[]): Promise<void> {
    const dirPath = `${RNFS.DocumentDirectoryPath}/stower_files`;

    try {
      if (!(await RNFS.exists(dirPath))) {
        await RNFS.mkdir(dirPath);
      }

      for (const filename of fileList) {
        console.log(`Starting download of file: ${filename}`);

        await this.sendFileCmd('GET', filename);

        const headerBuffer = await this.getFileResult();
        const fileSize = headerBuffer.readUInt32LE(0);
        const chunkSize = headerBuffer.readUInt8(4);

        console.log(`File size: ${fileSize}, Chunk size: ${chunkSize}`);

        const buffer = Buffer.alloc(fileSize); // Preallocate full buffer
        let offset = 0;
        let lastLogged = 0;

        while (offset < fileSize) {
          let chunk: Buffer;

          try {
            chunk = await this.getFileResult();
          } catch (e) {
            console.error(`Timeout while receiving chunk for ${filename}`);
            throw e;
          }

          chunk.copy(buffer, offset);
          offset += chunk.length;

          const progress = Math.floor((offset / fileSize) * 100);
          if (progress >= lastLogged + 10) {
            lastLogged = progress;
            console.log(`${progress}%..`);
          }

          if (chunk.length < chunkSize) {
            console.log('Received final chunk (shorter than chunkSize)');
            break;
          }
        }

        console.log(`100% - Downloaded ${offset} bytes`);

        const filePath = `${dirPath}/${filename}`;
        try {
          await RNFS.writeFile(
            filePath,
            buffer.slice(0, offset).toString('base64'),
            'base64',
          );
          console.log(`File saved to: ${filePath}`);
        } catch (e) {
          console.error(`Failed to write file ${filename}:`, e);
          throw e;
        }
      }

      console.log('All files downloaded successfully');
    } catch (error) {
      console.error('Error in downloadFiles:', error);
      // this.unsubscribe(); // Stop BLE notifications
      throw error;
    }
  }
  //TODO: Clean up this file once the upload is working
  async uploadFiles(fileList: string[]): Promise<void> {
    try {
      for (const logFile of fileList) {
        console.log(`Starting download of file: ${logFile}`);

        // Send the GET command to request the file
        await this.sendFileCmd('GET', logFile);

        const headerBuffer = await this.waitFileResults();
        const fileSize = headerBuffer.readUInt32LE(0);
        const chunkSize = headerBuffer.readUInt8(4); // Byte 5

        console.log(`File size: ${fileSize}, Chunk size: ${chunkSize}`);

        let contents = Buffer.alloc(0);
        let piece = 0;
        console.log('0%..');

        // Keep receiving chunks until we have the complete file
        while (true) {
          const chunk = await this.waitFileResultsTimer();
          contents = Buffer.concat([contents, chunk]);

          const percentage = Math.floor((contents.length / fileSize) * 100);
          if (percentage >= (piece + 1) * 10) {
            piece = Math.floor(percentage / 10);
            console.log(`${piece * 10}%..`);
          }

          if (chunk.length < chunkSize) {
            console.log('100%');
            break;
          }
        }

        console.log('100%');
        console.log(`Downloaded ${contents.length} bytes`);

        // Convert the file contents to Base64
        const base64File = contents.toString('base64');

        await this.uploadAndDeleteFile(logFile, base64File);

        console.log(`File ${logFile} uploaded successfully`);
      }

      console.log('All files uploaded successfully');
    } catch (error) {
      console.error('Error in getFiles:', error);
      this.unsubscribe();
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
      const inverter: Inverter | null = await getFromStorage(
        STORAGE_KEYS.SELECTED_INVERTER,
      );

      const response = await uploadFileToServerAsync({
        inverterID: inverter?.id ?? '',
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
  const files: string[] = readLogFiles();

  console.log('Files before deletion: ', files);

  // Remove the deleted file from the list
  const updatedFiles = files.filter(file => file !== fileName);

  console.log('Files after deletion: ', updatedFiles);

  // Save the updated list back to storage
  saveToStorage(STORAGE_KEYS.LOG_FILES, JSON.stringify(updatedFiles));
}
