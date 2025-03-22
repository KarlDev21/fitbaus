import {Device} from 'react-native-ble-plx';
import {showToast, ToastType} from '../components/Toast';
import {BleManagerInstance, generateDigest} from '../helpers/BluetoothHelper';
import {getConfigStringValue, RemoteConfigKeys} from './RemoteConfigService';
import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import base64 from 'react-native-base64';

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

export async function scanDevices(): Promise<{ inverters: Device[]; nodes: Device[] }> {
  return new Promise((resolve, reject) => {
    const inverters = new Map<string, Device>();
    const nodes = new Map<string, Device>();

    const BleManagerInstance = new BleManager();



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

    // // Stop scanning after 10 seconds and resolve the devices
    setTimeout(() => {
      BleManagerInstance.stopDeviceScan();
      resolve({
        inverters: Array.from(inverters.values()),
        nodes: Array.from(nodes.values()),
      });
    }, 3000);
  });
}

export async function authNode(nodeId: string): Promise<boolean> {

  try {
    
    //Check if connected first, otherwise connect
   
    const isConnected = await  BleManagerInstance.isDeviceConnected(nodeId);
    console.log("The connection of this device is currently : " + isConnected);
    
    // const devices = await BleManagerInstance.devices([nodeId]);
    // const connectedDevice = isConnected ? devices[0] : 
    // await BleManagerInstance.connectToDevice(nodeId);

    // // await BleManagerInstance.connectToDevice(nodeId);
    // console.log("connectedDevice", connectedDevice);

    // const services = await BleManagerInstance.servicesForDevice(nodeId);
    
    // console.log("THESE ARE ALL THE SERVICES", services);
   

    


    // BleManagerInstance.servicesForDevice(nodeId).then((services) => {
    //   console.log("services", services);
    // });

    // await connectedDevice.discoverAllServicesAndCharacteristics();

    // const digest = generateDigest(nodeId);

    // //operation rejected over here
    // // Write digest to characteristic

    // await BleManagerInstance.writeCharacteristicWithResponseForDevice(
    //   nodeId,
    //   getConfigStringValue(RemoteConfigKeys.NODE_SERVICE_UUID) ?? '',
    //   getConfigStringValue(RemoteConfigKeys.NODE_AUTHENTICATION_CHAR_UUID) ??
    //     '',
    //   digest.toString('base64'),
    // );

    // await connectedDevice.cancelConnection();
    showToast(ToastType.Success, 'Node authentication successful');
    return true;
  } catch (error: any) {
    console.log(error.message);
    showToast(ToastType.Error, `Authentication failed: ${error.message}`);
    return false;
  }
}

export async function getServicesAndCharacteristicsFromInverter(InverterId: string, nodeId: string): Promise<boolean> {

  try {


    const invetrerConnection = await BleManagerInstance.isDeviceConnected(InverterId);
    console.log("IS CONNECTED Inv", invetrerConnection);
    const nodeConnection = await BleManagerInstance.isDeviceConnected(nodeId);
    console.log("IS CONNECTED  Node",nodeConnection);

    if(invetrerConnection && nodeConnection)
    {
        // might need to pass in actual device
    const nodeServices = await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(nodeId);
    
    const inverterServices = await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(InverterId);


    if(nodeServices.serviceUUIDs && inverterServices.serviceUUIDs)
    {

      // console.log("Services and Characteristics Node", nodeServices.serviceUUIDs[2]);
      console.log(nodeId)

      // nodeServices.serviceUUIDs.map( async (service)  =>  {

      //   const nodeCharacteristics = await BleManagerInstance.characteristicsForDevice(nodeId, service);

      //   console.log("service uuid : " + service)

      //   nodeCharacteristics.map( async (char) => {
          

      //   console.log("Characteristic uuid : " + char.uuid + " - Value : " + char.value)
        
      //   })
      // })



      // console.log("SERVICES")
      // console.log(nodeServices)
      // console.log("CHARACTERISTICS")
      // console.log(nodeCharacteristics)
      
      // const inverterChar = await BleManagerInstance.
      // characteristicsForDevice(InverterId, inverterServices.serviceUUIDs[2]);

      // console.log("Characteristics Inverter", stuff3);

      // const read = await BleManagerInstance.readCharacteristicForDevice(nodeId, stuff.serviceUUIDs[0], '00002a01-0000-1000-8000-00805f9b34fb');
      // console.log("Read", read);

      


    }

    const digest = generateDigest(nodeId);

    console.log(digest.toString('base64'))

    // Node Authentication here
    const check = await BleManagerInstance.writeCharacteristicWithResponseForDevice (
          nodeId,
          'ffffffff-21b5-ec11-e214-000030452e68',
          '669a0c20-0008-21b5-ec11-e214416c2e68',
          digest.toString('base64'),
        );

    console.log("Check", check.value);
    console.log(check)

    // nodeServices?.serviceUUIDs?.map( async (service)  =>  {

    //   const nodeCharacteristics = await BleManagerInstance.characteristicsForDevice(nodeId, service);

    //   console.log("service uuid : " + service)

    //   nodeCharacteristics.map( async (char) => {
        

    //   console.log("Characteristic uuid : " + char.uuid + " - Value : " + char.value)
      
    //   })
    // })

    inverterServices?.serviceUUIDs?.map( async (service)  =>  {

      const nodeCharacteristics = await BleManagerInstance.characteristicsForDevice(InverterId, service);

      console.log("service uuid : " + service)

      nodeCharacteristics.map( async (char) => {
        

      console.log("Characteristic uuid : " + char.uuid + " - Value : " + char.value)
      
      })
    })

    if(check.value){
    // Inverter Enrollment?
    const checkInverter = await BleManagerInstance.writeCharacteristicWithResponseForDevice(
      InverterId,
      '669a0c20-0008-d690-ec11-e2143045cb95',
      '669a0c20-0008-d690-ec11-e214416ccb95',
      nodeId,
    );
    console.log("check Inverter");
    console.log(checkInverter);
  }

  inverterServices?.serviceUUIDs?.map( async (service)  =>  {

    const nodeCharacteristics = await BleManagerInstance.characteristicsForDevice(InverterId, service);

    console.log("service uuid : " + service)

    nodeCharacteristics.map( async (char) => {
      

    console.log("Characteristic uuid : " + char.uuid + " - Value : " + char.value)
    
    })
  })

  }else{
      await BleManagerInstance.connectToDevice(InverterId);
      await BleManagerInstance.connectToDevice(nodeId);
    }

    return true;
  } catch (error: any) {
    console.log(error.message);
    showToast(ToastType.Error, `Failed to get services and characteristics: ${error.message}`);
    return false;
  }

}

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
    alerts: []
  };
};

export const connectToInverter = async (inverterId: string): Promise<boolean> => {

  // await BleManagerInstance.cancelDeviceConnection(inverterId);
  // console.log("check")
  try {
    const connectedDevice = await BleManagerInstance.connectToDevice(inverterId);
    await connectedDevice.discoverAllServicesAndCharacteristics();

  console.log("check 2")
    
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // const digest = generateDigest(nodeId);

   
    // await BleManagerInstance.writeCharacteristicWithResponseForDevice(
    //   nodeId,
    //   getConfigStringValue(RemoteConfigKeys.NODE_SERVICE_UUID) ?? '',
    //   getConfigStringValue(RemoteConfigKeys.NODE_AUTHENTICATION_CHAR_UUID) ??
    //     '',
    //   digest.toString('base64'),
    // );

    // await connectedDevice.cancelConnection();
    console.log(connectedDevice.isConnected());
    console.log('connectedDevice', connectedDevice);
    console.log('connectedDevice', connectedDevice.id);
    console.log('connectedDevice', connectedDevice.name);
    console.log('connectedDevice', connectedDevice.characteristicsForService);
    if(await connectedDevice.isConnected()){
      showToast(ToastType.Success, 'Inverter connected');
      return true;
    } else {
      showToast(ToastType.Error, 'Inverter not connected');
      return false;
    }
  } catch (error: any) {
    console.log(error.message);
    showToast(ToastType.Error, `Connection failed: ${error.message}`);
    return false;
  }
};

export async function getDashboardData(inverterId: string): Promise<DashboardData>{

  await connectToInverter(inverterId);
  const dashbaordData = await getData(inverterId);

  return dashbaordData;
};