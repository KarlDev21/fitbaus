import {useEffect} from 'react';
import {
  BleManagerInstance,
  getConnectedInverter,
} from '../helpers/BluetoothHelper';
import {StowerInverter} from '../logs/InverterLogService';
import {writeFiles, readLogFiles} from '../helpers/FileHelper';

export function useLogFileUploader() {
  useEffect(() => {
    const uploadFiles = async () => {
      try {
        const savedInverter = getConnectedInverter();
        const files: string[] = [];
        const NULL_TERMINATOR_REGEX = /\0.*$/;

        if (savedInverter) {
          const connectedDevice = await BleManagerInstance.connectToDevice(
            savedInverter.id,
          );
          connectedDevice.requestMTU(255);
          await connectedDevice.discoverAllServicesAndCharacteristics();

          const inverter = new StowerInverter(connectedDevice);
          inverter.subscribe();

          await inverter.sendFileCmd('LS');

          while (true) {
            const filenameBuffer = await inverter.waitFileResults();
            const filename = filenameBuffer
              .toString()
              .replace(NULL_TERMINATOR_REGEX, '');

            if (filename.length > 0) {
              files.push(filename);
            } else {
              break;
            }
          }

          writeFiles(files);

          const fileslist = readLogFiles();
          const filteredList = fileslist.filter(
            (file: string) => file !== 'config.json',
          );
          console.log('filteredList', filteredList);
          await inverter.downloadFiles(filteredList);

          inverter.unsubscribe();
        }
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    };

    uploadFiles();
  }, []);
}
