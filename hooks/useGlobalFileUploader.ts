import {useEffect} from 'react';
import {
  BleManagerInstance,
  getConnectedInverter,
} from '../helpers/BluetoothHelper';
import {StowerInverter} from '../logs/InverterLogService';
import {writeFiles, readLogFiles} from '../helpers/FileHelper';

//TODO: Clean up this file once the upload is working
export function useGlobalFileUploader() {
  useEffect(() => {
    const uploadFiles = async () => {
      const savedInverter = getConnectedInverter();
      if (savedInverter) {
        console.log('Got Saved Inverter: ', savedInverter);
        try {
          const connectedDevice = await BleManagerInstance.connectToDevice(
            savedInverter.id,
          );
          connectedDevice.requestMTU(255);
          await connectedDevice.discoverAllServicesAndCharacteristics();

          console.log('Connected to device: ', connectedDevice.mtu);

          const inverter = new StowerInverter(connectedDevice);
          inverter.subscribe();

          console.log('Get list of files');
          await inverter.sendFileCmd('LS');
          const files: string[] = [];

          while (true) {
            const filenameBuffer = await inverter.waitFileResults();
            const filename = filenameBuffer.toString().replace(/\0.*$/, '');
            console.log(filename);

            if (filename.length > 0) {
              files.push(filename);
            } else {
              break;
            }
          }

          console.log(`Files: ${files}`);
          writeFiles(files);

          const fileslist = readLogFiles();
          const filteredList = fileslist.filter(
            (file: string) => file !== 'config.json' && file !== '20250107.log',
          );
          console.log('FileList: ' + filteredList);
          await inverter.uploadFiles(filteredList);

          // Unsubscribe when done
          inverter.unsubscribe();
          console.log('Done');
        } catch (error) {
          console.error('Error uploading files:', error);
        }
      }
    };

    uploadFiles();
  }, []);
}
