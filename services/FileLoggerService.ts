import {Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import * as FileSystem from 'expo-file-system';
import { AsyncQueue } from './AsyncQueue';
import { appendFileNameToJson } from '../helpers/FileLoggerHelper';
// const FILE_CMD_CHAR_UUID = '669a0c20-0008-d690-ec11-e214466ccb95';
// const FILE_RESULT_CHAR_UUID = '669a0c20-0009-d690-ec11-e214466ccb95'; // Assuming from pattern

const fileQueue = new AsyncQueue<string>();
const filePath = `${FileSystem.documentDirectory}files.json`;


//Start Listener
export const startListener = async (
    device: Device,
    serviceUUID: string,
    cmdCharUUID: string, // same as Python's "write to this"
    notifyCharUUID: string, // same as Python's "subscribe to this"
): Promise<void> => {


    try {
    
    //First we want to check if we are connected to the device
    //If we are not connected, display this and have the connection occur somewhere else
    //We only continue if we are connected to the device
    device.isConnected().then((isConnected) => {
        if (isConnected) {
            console.log('[BLE] Device is connected');
        }
        else {
            console.log('[BLE] Device is not connected');
            return;
        }
    }
    ).catch((error) => {
        console.error('[BLE] Error checking connection:', error.message);
        return;
    });
    //Second we want to discover all services and characteristics
    device.discoverAllServicesAndCharacteristics().then(() => {
        console.log('[BLE] Services and characteristics discovered');
    }
    ).catch((error) => {
        console.error('[BLE] Error discovering services and characteristics:', error.message);
        return;
    });
    //Third we want to subscribe to the notification characteristic
    //We use the callback to add the infomation we pick up to the accumulatedData array/queue
    const subscription = device.monitorCharacteristicForService(
        serviceUUID,
        notifyCharUUID,
        (error, characteristic) => {
          if (error) {
            console.error('[BLE] Notification error:', error.message);
            return;
          }

          if (!characteristic?.value) {
            console.warn('[BLE] Empty characteristic received');
            return;
          }

          const buffer = Buffer.from(characteristic.value, 'base64');
          const chunk = buffer.toString('utf-8').trim();

          console.log('[BLE] Chunk received:', chunk);
          console.log('adding to queue/array');

          //Here we would add stuff to the queue/array
          fileQueue.push(chunk);

    });


} catch (error) {
        console.error('[BLE] Error starting listener:', error);
        
        return;
}}


//have a list command
export const listFiles = async (
    device: Device,
    serviceUUID: string,
    cmdCharUUID: string, // same as Python's "write to this"
): Promise<void> => {
    try {
        console.log('[BLE] Sending "list" command...');
        //Now we Send the "list" command to the device'
        const listCommand = Buffer.from('LS', 'utf-8').toString('base64');
        await device.writeCharacteristicWithResponseForService(
            serviceUUID,
            cmdCharUUID,
            listCommand,
        );
    } catch (error) {
        console.error('[BLE] Error sending list command:', error);
        return;
    }
}

//have a get command to trigger the file transfer
export const getFiles = async (
    device: Device,
    serviceUUID: string,
    cmdCharUUID: string, // same as Python's "write to this"
): Promise<void> => {
    try {
        console.log('[BLE] Sending "get" command...');
        //Now we Send the "get" command to the device'
        //get the file names from the json file
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        console.log('getting files');
        console.log(fileContent);
        const jsonData = JSON.parse(fileContent);
        const fileNames = jsonData.files || [];

        //triger the command to start pushing the file sizes and file content to the queue
        for (const file in fileNames){
            const getCommand = Buffer.from('GET' + file, 'utf-8').toString('base64');
            await device.writeCharacteristicWithResponseForService(
                serviceUUID,
                cmdCharUUID,
                getCommand,
            );
    }

    } catch (error) {
        console.error('[BLE] Error sending get command:', error);
        return;
    }
}


//Here we have a queue processor consumer that will consume the queue and process the data
export const processQueue = async () => {
    console.log('Processing queue...');
    while (true) {
        const data = await fileQueue.pop();
        console.log('Processing data:', data);
        // Process the data here

        if (data.startsWith('2')) {
            console.log('would save this file name:', data);
            appendFileNameToJson(data, filePath);
          } else if (data === ' ') {
            //need to check if this is significant to keep track of or just discard it
            console.log('we got to the end here, empty file :', data);
          } else {
            //we can probably assume this is the file size so now we can get that and have a sub process que to handle the file content which should be next in the queue
            console.log('not a file name, start unpacking file size:', data)
            

          }
        // Here we would process the data and save it to a file

    }
}


