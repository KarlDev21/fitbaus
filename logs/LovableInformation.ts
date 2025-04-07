import {Buffer} from 'buffer';
import {BleManager, Device, Subscription} from 'react-native-ble-plx';
import {Mutex} from 'async-mutex';
import {storage} from '../services/storage';
import RNFS from 'react-native-fs';

// Queue implementation for handling BLE notifications
class AsyncQueue<T> {
  private queue: T[] = [];
  private resolvers: ((value: T) => void)[] = [];

  async put(item: T): Promise<void> {
    if (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift()!;
      resolve(item);
    } else {
      this.queue.push(item);
    }
  }

  async get(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    return new Promise<T>(resolve => {
      this.resolvers.push(resolve);
    });
  }
}

// Stower Inverter class that handles BLE communication
export class StowerInverter {
  private peripheral: Device;
  private queue: AsyncQueue<Buffer> = new AsyncQueue<Buffer>();
  private bleManager: BleManager;
  private fileCmdMutex = new Mutex();

  // Constants for characteristic UUIDs
  private static FileCMDChar(): string {
    return '669a0c20-0008-d690-ec11-e214466ccb95';
  }

  private static FileResultChar(): string {
    return '669a0c20-0008-d690-ec11-e214476ccb95';
  }

  constructor(peripheral: Device, bleManager: BleManager) {
    this.peripheral = peripheral;
    this.bleManager = bleManager;
  }

  private subscription: Subscription | null = null;

  subscribe(): void {
    try {
      this.subscription = this.peripheral.monitorCharacteristicForService(
        '669a0c20-0008-d690-ec11-e2143045cb95', // Using device ID as we don't have a specific service ID
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

  async mainLoop(): Promise<void> {
    const files: string[] = [];

    while (true) {
      const filenameBuffer = await this.waitFileResults();
      const filename = filenameBuffer.toString().replace(/\0+$/, ''); // Remove null terminator
      console.log(filename);

      if (filename.length > 0) {
        files.push(filename);
      } else {
        break;
      }
    }

    console.log(`Files: ${files}`);
    writeFiles(files);

    const fileslist = readFiles();
    const filteredList = fileslist.filter(file => file !== 'config.json');
    console.log('FileList: ' + filteredList);
    // inverter.unsubscribe();
    await getFiles(this, filteredList);
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

      //   this.mainLoop()
      //     .then(() => {
      //       console.log('Main loop finished');
      //     })
      //     .catch(error => {
      //       console.error('Error in main loop:', error);
      //     });
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
    this.queue.put(data);
  }

  async waitFileResults(): Promise<Buffer> {
    // console.log("waitFileResults");
    return this.queue.get();
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
}

// Helper functions for file operations
export function writeFiles(files: string[]): void {
  const deviceFiles = {files};
  console.log(deviceFiles);
  storage.set('files.json', JSON.stringify(deviceFiles));
}

export function readFiles(): string[] {
  try {
    const fileData = storage.getString('files.json');
    console.log('fileData: ', fileData);
    if (fileData) {
      const fileList = JSON.parse(fileData);
      return fileList.files || [];
    }
  } catch (error) {
    console.error('Error reading files:', error);
  }
  return [];
}

export async function getFiles(
  sensor: StowerInverter,
  fileList: string[],
): Promise<void> {
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
      await sensor.sendFileCmd('GET', f);

      // First response is the file size
      const fileSizeBuffer = await sensor.waitFileResults();
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
        const chunk = await sensor.waitFileResultsTimer();

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

export async function deleteFiles(
  sensor: StowerInverter,
  fileList: string[],
): Promise<void> {
  for (const f of fileList) {
    // Send command
    await sensor.sendFileCmd('RM', f);

    const resultBuffer = await sensor.waitFileResults();
    const result = resultBuffer.readUInt32LE(0);

    console.log(`Delete ${f} result ${result}`);
  }
}
