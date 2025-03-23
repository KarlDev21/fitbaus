import {Device} from 'react-native-ble-plx';
import {showToast, ToastType} from '../components/Toast';
import {BleManagerInstance, generateDigest} from '../helpers/BluetoothHelper';

export interface DashboardData {
  batterySoC: number
  inverterOutput: number
  solarInput: number
  temperature: number
  kWhGenerated: number
  kWhConsumed: number
  co2Savings: number
  leaseProgress: number
  alerts: string[]
}

//used on the HomeScreen and returns all available inverters and nodes.
export async function scanDevices(): Promise<{ inverters: Device[]; nodes: Device[] }> {
  return new Promise((resolve, reject) => {
    const inverters = new Map<string, Device>();
    const nodes = new Map<string, Device>();

    // Start scanning
    BleManagerInstance.startDeviceScan(null, null, (error, device) => {
      if (error) {
        showToast(ToastType.Error, 'Error scanning for devices');
        reject(error);
        return;
      }

      if (device?.name && device.name.includes('Invert')) {
        inverters.set(device.name, device);
      } else if (device?.name && device.name.includes('Node')) {
        nodes.set(device.name, device);
      }
    });

    // // Stop scanning after 3 seconds and resolve the devices
    setTimeout(() => {
      BleManagerInstance.stopDeviceScan();
      resolve({
        inverters: Array.from(inverters.values()),
        nodes: Array.from(nodes.values()),
      });
    }, 3000);
  });
}

//used on the BatteriesScreen to authenticate a battery by writing to it.
export async function authNode(nodeId: string): Promise<boolean> {

    //Check if connected first, otherwise connect
    const nodeConnection = await BleManagerInstance.isDeviceConnected(nodeId);
    console.log('IS NODE CONNECTED' + nodeConnection);

    if(!nodeConnection)
    {
      try{
        await BleManagerInstance.connectToDevice(nodeId);
        showToast(ToastType.Success, 'Connection successful');
        return true;
      } catch (error: any) {
        console.log(error.message);
        showToast(ToastType.Error, `Connection failed, please try again: ${error.message}`);
        return false;
      }
    }

    try{
      const connectedNode = await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(nodeId);

      //Just doube checking to ensure that the connection was completely made
      if(connectedNode.serviceUUIDs)
      {
        const base64Digest = generateDigest(nodeId).toString('base64');
        //Just for logging
        const authService = connectedNode.serviceUUIDs[2];
        const authCharacteristic = connectedNode.characteristicsForService(connectedNode.serviceUUIDs[2]);

        console.log('Node Auth Service uuid : ' + authService);
        console.log('Node Auth Characteristic uuid : ' + authCharacteristic);

        //Then perform auth
        const authResp = await BleManagerInstance.writeCharacteristicWithResponseForDevice(
              nodeId,
              'ffffffff-21b5-ec11-e214-000030452e68',
              '669a0c20-0008-21b5-ec11-e214416c2e68',
              base64Digest,
            );

        //if the authResp == base64Digest (response echos the digest) then the auth is successful
        //need to confirm and handle accordingly

        return (authResp.value === base64Digest);
      }
      else
      {
        console.log('Connection incomplete');
        showToast(ToastType.Error, 'Connection incomplete, please try again');
        return false;
      }
    }catch (error: any) {
      console.log(error.message);
      showToast(ToastType.Error, `Authentication Failed: ${error.message}`);
      return false;
    }
  }

//mocking this for now
export const getData = async (inverterId: string): Promise<DashboardData> => {

  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    batterySoC: 87,
    inverterOutput: 220,
    solarInput: 320,
    temperature: 32,
    kWhGenerated: 350,
    kWhConsumed: 345,
    co2Savings: 0.4985,
    leaseProgress: 45,
    alerts: [],
  };
};
