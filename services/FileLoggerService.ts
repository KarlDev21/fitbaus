import {Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import * as FileSystem from 'expo-file-system';
import { AsyncQueue } from './AsyncQueue';
import { appendFileNameToJson, unpackFileSize } from '../helpers/FileLoggerHelper';
// const FILE_CMD_CHAR_UUID = '669a0c20-0008-d690-ec11-e214466ccb95';
// const FILE_RESULT_CHAR_UUID = '669a0c20-0009-d690-ec11-e214466ccb95'; // Assuming from pattern

const fileQueue = new AsyncQueue<Buffer<ArrayBuffer>>();
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

          //here we want to only push the buffer because we will only need to .toString('utf-8') if its a file name, can do this in the processQueue function

          const buffer = Buffer.from(characteristic.value, 'base64');

          console.log('[BLE] buffer received:', buffer);
          console.log('adding to queue/array');

          //Here we would add stuff to the queue/array
          fileQueue.push(buffer);

          processQueue();

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
        const fileName = data.toString('utf-8').trim();

        console.log('Processing data:', fileName);
        // Process the data here

        if (fileName.startsWith('2')) {
            console.log('would save this file name:', data);
            await appendFileNameToJson(fileName, filePath);
          } else if (fileName === ' ') {
            //need to check if this is significant to keep track of or just discard it
            console.log('we got to the end here, empty file :', fileName);
          } else {
            //we can probably assume this is the file size so now we can get that and have a sub process que to handle the file content which should be next in the queue
            console.log(fileName);
            console.log('not a file name, start unpacking file size:', data);
            const fileSize = unpackFileSize(data);

            const contents : Buffer<ArrayBuffer>[] = []
            let piece: number = 0
            console.log(contents)
            //now that we have the file size we can start a sub process to handle the file content
            console.log('unpacked file size:', fileSize);
            while(contents.length < fileSize) {
                let fileContent = await fileQueue.pop();
                //We get the available piece of information from the queue and add it to the contents array
                console.log('Processing file content:', contents);
                contents.push(fileContent);

                if(((contents.length/fileSize)*100)>(piece*10)){
                    console.log('File content progress:', piece*10, '%');{
                    piece++;
                }
                //We check if the contents array is equal to the file size, if it is we break out of the loop
                //This is a bit of a hacky way to do this but it works for now, we can probably make this better later
            }

            console.log('Finished processing file content:', contents);

          }
        // Here we would process the data and save it to a file

    }
}

}
