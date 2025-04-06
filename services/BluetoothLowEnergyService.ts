import { Characteristic, Device, ScanCallbackType, Subscription } from 'react-native-ble-plx';
import { showToast, ToastType } from '../components/Toast';
import { BleManagerInstance } from '../helpers/BluetoothHelper';
import { clearScannedDevices, getConnectedInverter } from './storage';
import { decodeManufacturerData, extractManufacturerData, parseNodeMetaV2 } from './NodeService';
import base64 from 'react-native-base64';


//used on the HomeScreen and returns all available inverters and nodes.
export async function scanDevices(): Promise<{ inverters: Device[]; nodes: Device[] }> {
  return new Promise((resolve, reject) => {

    // Clear existing devices first
    clearScannedDevices();

    const inverters = new Map<string, Device>();
    const nodes = new Map<string, Device>();

    // Start scanning
    BleManagerInstance.startDeviceScan(null,
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

    });

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

export async function listenToNode(): Promise<Subscription>{

  // which characteristics are notifyable, listen to inverter and nodes
  console.log("checkiiiing")

  const node = getConnectedInverter();
  console.log("this is the inverter" + node)
  await node?.discoverAllServicesAndCharacteristics();
  console.log("checkiiiiiiiiiiiiiiiing")

  const nodeSubscription = await BleManagerInstance.monitorCharacteristicForDevice(
    node ? node.id : '',
    node?.serviceUUIDs?.[0] ?? '', 
    '669a0c20-0008-d690-ec11-e214446ccb95',
    (error, characteristic) => {
      if(error){
        console.warn("Monitoring Error :", error);
        return;
      }
      console.log('Monitoring characteristic:', characteristic?.uuid);
      const rawValue = characteristic?.value;
      const decodedValue = base64.decode(rawValue || '')

      console.log('Node value has changed:', decodedValue)
    });

    return nodeSubscription;

  // try {
  //     console.log("checkng again")

    
  
  //     // return nodeSubscription;
  // } catch (error) {
  //   console.warn('Error monitoring characteristic:', error);
  //   throw error; 
  // }
  

}