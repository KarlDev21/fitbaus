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

  subscribe(): void {
    try {
      this.subscription = this.peripheral.monitorCharacteristicForService(
        BleUuids.FILE_CMD_SERVICE_UUID,
        BleUuids.FILE_RESULT_CHAR_UUID,
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

  async sendFileCmd(cmd: string, filename: string = '') {
    // Use a mutex to ensure commands don't overlap
    return this.fileCmdMutex.runExclusive(async () => {
      if (cmd === 'GET' || cmd === 'RM') {
        cmd = cmd + ' ' + filename;
      }

      try {
        const data = Buffer.from(cmd, 'utf-8');

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

  async getFileResult(): Promise<Buffer> {
    try {
      const characteristic = await this.peripheral.readCharacteristicForService(
        BleUuids.FILE_CMD_SERVICE_UUID,
        BleUuids.FILE_RESULT_CHAR_UUID,
      );

      if (characteristic?.value) {
        console.log('Characteristic value:', characteristic.value);
        return Buffer.from(characteristic.value, 'base64');
      }

      throw new Error('Failed to read characteristic value');
    } catch (error) {
      console.error('Error reading characteristic:', error);
      throw error;
    }
  }
  private async retrieveFileContents(
    filename: string,
  ): Promise<Uint8Array | null> {
    await this.sendFileCmd('GET', filename);

    const {filesize, chunkSize} = this.parseFileSize(
      await this.getFileResult(),
    );
    if (filesize === 0) {
      console.warn(`File ${filename} has filesize 0 – skipping`);
      return null;
    }

    const contents = await this.readChunks(filesize, chunkSize);
    const isValid = this.validateChecksum(contents, await this.getFileResult());

    if (!isValid) {
      console.warn(`File ${filename} checksum FAILED`);
      return null;
    }

    console.log(`File ${filename} checksum passed`);
    return contents;
  }

  private parseFileSize(data: Uint8Array): {
    filesize: number;
    chunkSize: number;
  } {
    const buffer = Buffer.from(data);
    return {
      filesize: buffer.readUInt32LE(0),
      chunkSize: buffer.readUInt8(4),
    };
  }

  private async readChunks(
    filesize: number,
    chunkSize: number,
  ): Promise<Uint8Array> {
    let contents = new Uint8Array(0);
    let piece = 0;

    while (true) {
      const chunk = await this.getFileResult();
      const combined = new Uint8Array(contents.length + chunk.length);
      combined.set(contents);
      combined.set(chunk, contents.length);
      contents = combined;

      const progress = (contents.length / filesize) * 100;
      if (progress > piece * 10) {
        console.log(`${piece * 10}%`);
        piece += 1;
      }

      if (chunk.length < chunkSize) {
        console.log(`100%`);
        break;
      }
    }

    return contents;
  }

  private validateChecksum(
    data: Uint8Array,
    checksumResult: Uint8Array,
  ): boolean {
    const expected = Buffer.from(checksumResult).readUInt32LE(0);
    const actual = data.reduce((sum, byte) => sum + byte, 0) & 0xffff;
    return expected === actual;
  }

  async downloadFiles(fileList: string[]): Promise<void> {
    const dirPath = `${RNFS.DocumentDirectoryPath}/stower_files`;

    try {
      if (!(await RNFS.exists(dirPath))) {
        await RNFS.mkdir(dirPath);
      }

      for (const filename of fileList) {
        const contents = await this.retrieveFileContents(filename);
        if (!contents) continue;

        const filePath = `${dirPath}/${filename}`;
        await RNFS.writeFile(
          filePath,
          Buffer.from(contents).toString('base64'),
          'base64',
        );
        console.log(`Saved ${filename} to ${filePath}`);
      }
    } catch (error) {
      console.error('Error in downloadFiles:', error);
      this.unsubscribe();
      throw error;
    }
  }

  async uploadLogFiles(fileList: string[]): Promise<void> {
    try {
      for (const filename of fileList) {
        const contents = await this.retrieveFileContents(filename);
        if (!contents) continue;

        const base64Data = Buffer.from(contents).toString('base64');
        const filePath = `${RNFS.TemporaryDirectoryPath}/${filename}`;

        await RNFS.writeFile(filePath, base64Data, 'base64');

        const formData = new FormData();
        formData.append('logFile', {
          uri: `file://${filePath}`,
          type: 'application/octet-stream',
          name: filename,
        });

        await this.uploadAndDeleteFile(formData, filename);
        console.log(`Uploaded ${filename} successfully`);
      }
    } catch (error) {
      console.error('Error in uploadLogFiles:', error);
      this.unsubscribe();
      throw error;
    }
  }

  private async deleteFile(file: string): Promise<void> {
    await this.sendFileCmd('RM', file);

    const resultBuffer = await this.waitFileResults();
    const result = resultBuffer.readUInt32LE(0);

    console.log(`Delete ${file} result ${result}`);
  }

  private async uploadAndDeleteFile(formData: FormData, fileName: string) {
    try {
      const inverter: Inverter | null = await getFromStorage(
        STORAGE_KEYS.SELECTED_INVERTER,
      );
      formData.append('inverterID', inverter?.id);
      formData.append('fileName', fileName);

      const response = await uploadFileToServerAsync(formData);

      if (response.success) {
        //TODO: Uncomment this when the inverter issue is fixed
        // this.deleteFile(fileName);

        // removeFileFromStorage(fileName);

        await RNFS.unlink(`${RNFS.TemporaryDirectoryPath}/${fileName}`);
      } else {
        console.error(
          `Failed to upload file ${fileName}. Error: ${response.error}`,
        );
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
