import {Device, ScanCallbackType} from 'react-native-ble-plx';
import {showToast, ToastType} from '../components/Toast';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import {clearScannedDevices} from './storage';
import {
  decodeManufacturerData,
  extractManufacturerData,
  parseNodeMetaV2,
} from './NodeService';

//used on the HomeScreen and returns all available inverters and nodes.
export async function scanDevices(): Promise<{
  inverters: Device[];
  nodes: Device[];
}> {
  return new Promise((resolve, reject) => {
    // Clear existing devices first
    clearScannedDevices();

    const inverters = new Map<string, Device>();
    const nodes = new Map<string, Device>();

    // Start scanning
    BleManagerInstance.startDeviceScan(
      null,
      {allowDuplicates: false, callbackType: ScanCallbackType.AllMatches},
      (error, device) => {
        if (error) {
          showToast(ToastType.Error, 'Error scanning for devices');
          reject(error);
          return;
        }

        if (device?.name && device.name.includes('Invert')) {
          inverters.set(device.name, device);
          // console.log('Scanned Inverter:', device);
        } else if (device?.name && device.name.includes('Node')) {
          nodes.set(device.name + device.id, device);
          // console.log('Scanned Node:', device);
        }
      },
    );

    //NOTE: Parse in the node manufacturer data (Inverter has nothing to parse)
    const rawBytes = decodeManufacturerData(
      'OQABBRf//BbhF3AAACBoAAAAAIAACWEDBAE=',
    );
    console.log('Decoded Bytes:', rawBytes.length);
    const manufacturerData = extractManufacturerData(rawBytes);
    console.log('Manufacturer Data:', manufacturerData);
    if (manufacturerData) {
      const nodeMetaData = parseNodeMetaV2(manufacturerData);
      console.log('Parsed Node Metadata:', nodeMetaData);
    }

    console.log('Connected and subscribed.');

    // // Stop scanning after 3 seconds and resolve the devices
    setTimeout(() => {
      BleManagerInstance.stopDeviceScan();
      resolve({
        inverters: Array.from(inverters.values()),
        nodes: Array.from(nodes.values()),
      });
    }, 4000);
  });
}
