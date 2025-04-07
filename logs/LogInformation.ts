/* eslint-disable @typescript-eslint/no-unused-vars */
import {BleManager, Device, Subscription} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import RNFS from 'react-native-fs';
import {AsyncQueue} from './NotificationQueue';

global.Buffer = Buffer; // necessary for decoding base64 on JS environments

export class StowerInverter {
  private static FileCMDChar = '669a0c20-0008-d690-ec11-e214466ccb95';
  private static FileResultChar = '669a0c20-0008-d690-ec11-e214476ccb95';
  private static SERVICE_UUID = '669a0c20-0008-d690-ec11-e2143045cb95';

  private device: Device;
  private queue = new AsyncQueue<Buffer>();

  constructor(device: Device) {
    this.device = device;
  }

  private subscription: Subscription | null = null;

  subscribe(): void {
    try {
      this.subscription = this.device.monitorCharacteristicForService(
        StowerInverter.SERVICE_UUID,
        StowerInverter.FileResultChar,
        (error, characteristic) => {
          if (error) {
            console.error('Subscription error:', error);
            return;
          }

          if (characteristic?.value) {
            const data = Buffer.from(characteristic.value, 'base64');
            this.queue.push(data);
          }
        },
      );
    } catch (error: any) {
      console.error('Error subscribing to characteristic:', error);
    }
  }

  unsubscribe(): void {
    this.subscription?.remove();
    this.subscription = null;
  }

  private async sendFileCmd(cmd: string, filename = ''): Promise<void> {
    let fullCmd = cmd;
    if (cmd === 'GET' || cmd === 'RM') {
      fullCmd += ` ${filename}`;
    }

    const data = Buffer.from(fullCmd, 'utf-8').toString('base64');
    await this.device.writeCharacteristicWithResponseForService(
      StowerInverter.SERVICE_UUID,
      StowerInverter.FileCMDChar,
      data,
    );
  }

  private async waitFileResult(): Promise<Buffer> {
    return await this.queue.pop();
  }

  async format(): Promise<void> {
    await this.sendFileCmd('FMT');
    const result = await this.waitFileResult();
    console.log('[FORMAT]', result.toString());
  }

  async getFiles(): Promise<string[]> {
    await this.sendFileCmd('LS');

    const chunks: string[] = [];

    while (true) {
      try {
        const chunk = await this.waitForChunk(200);
        chunks.push(chunk!.toString('utf-8'));
      } catch {
        break;
      }
    }

    const combined = chunks.join('');

    // Match file names ending in .json or .log
    const fileRegex = /[\w\-]+(?:\.json|\.log)/g;
    const filenames = [...combined.matchAll(fileRegex)].map(m => m[0]);

    return filenames;
  }

  async waitForChunk(timeoutMs: number): Promise<Buffer | null> {
    return new Promise(resolve => {
      const timer = setTimeout(() => resolve(null), timeoutMs);
      this.queue
        .pop()
        .then(data => {
          clearTimeout(timer);
          resolve(data);
        })
        .catch(() => {
          clearTimeout(timer);
          resolve(null);
        });
    });
  }

  async deleteFiles(files: string[]): Promise<void> {
    for (const file of files) {
      await this.sendFileCmd('RM', file);
      const result = await this.waitFileResult();
      console.log(`[DELETE ${file}]`, result.toString());
    }
  }

  async safeWaitForChunk(timeoutMs: number): Promise<Buffer | null> {
    return new Promise(resolve => {
      const timer = setTimeout(() => resolve(null), timeoutMs);

      this.queue
        .pop()
        .then(data => {
          clearTimeout(timer);
          resolve(data);
        })
        .catch(() => {
          clearTimeout(timer);
          resolve(null); // Fail gracefully
        });
    });
  }

  async readFile(filename: string): Promise<string> {
    // Send GET command with filename
    await this.sendFileCmd('GET', filename);
    console.log(`[BLE] GET command sent for ${filename}`);

    // Wait for the file size (first 4 bytes)
    const sizeChunk = await this.waitForChunk(2000); // wait up to 2 seconds
    if (!sizeChunk) {
      console.error('[BLE] No file size received.');
      return '';
    }

    // Parse file size from the first chunk (4-byte little-endian integer)
    const fileSize = sizeChunk.readUInt32LE(0);
    console.log(`[BLE] Expected file size for ${filename}: ${fileSize} bytes`);

    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const chunkTimeout = 3000; // adjust if necessary

    // Loop until we've read enough bytes
    while (totalBytes < fileSize) {
      const chunk = await this.waitForChunk(chunkTimeout);
      if (!chunk) {
        console.error(
          `[BLE] Timeout waiting for file ${filename} chunk. Total received: ${totalBytes} bytes`,
        );
        break;
      }
      chunks.push(chunk);
      totalBytes += chunk.length;
      console.log(
        `[BLE] Received chunk for ${filename}: ${chunk.length} bytes (Total: ${totalBytes}/${fileSize})`,
      );
    }

    // Concatenate all chunks into a single Buffer
    const fileBuffer = Buffer.concat(chunks);
    return fileBuffer.toString('utf-8');
  }

  /**
   * Downloads all files returned by getFiles().
   * Uses the updated readFile() to retrieve the file contents.
   */
  async downloadFiles(): Promise<string[]> {
    const filenames = await this.getFiles();
    const downloadedPaths: string[] = [];

    for (const name of filenames) {
      console.log(`[DOWNLOAD] Starting download for ${name}`);
      const content = await this.readFile(name);
      const localPath = `${RNFS.DocumentDirectoryPath}/${name}`;

      // Write the content to the local file system.
      await RNFS.writeFile(localPath, content, 'utf8');
      console.log(`[DOWNLOAD] Saved ${name} to ${localPath}`);
      downloadedPaths.push(localPath);
    }

    return downloadedPaths;
  }
}
