import {Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import {getConnectedInverter} from './storage';
import * as FileSystem from 'expo-file-system';
// const FILE_CMD_CHAR_UUID = '669a0c20-0008-d690-ec11-e214466ccb95';
// const FILE_RESULT_CHAR_UUID = '669a0c20-0009-d690-ec11-e214466ccb95'; // Assuming from pattern

const filePath = `${FileSystem.documentDirectory}files.json`;

//CHATGPT
// export const listFiles = async (
//   device: Device,
//   serviceUUID: string,
//   cmdCharUUID: string, // same as Python's "write to this"
//   notifyCharUUID: string, // same as Python's "subscribe to this"
// ): Promise<string[]> => {
//   return new Promise(async (resolve, reject) => {
//     let accumulatedData: any[] = [];

//     try {
//       console.log('[BLE] Subscribing to notifications...');

//       //First thing we do is subscribe
//       //We use the callback to add the infomation we pick up to the accumulatedData array
//       //since the response doesnt come back from the commond we send,
//       //we have to wait for the notification to come back to the subscription
//       const subscription = device.monitorCharacteristicForService(
//         serviceUUID,
//         notifyCharUUID,
//         (error, characteristic) => {
//           if (error) {
//             console.error('[BLE] Notification error:', error.message);
//             reject('Notification error: ' + error.message);
//             return;
//           }

//           if (!characteristic?.value) {
//             console.warn('[BLE] Empty characteristic received');
//             return;
//           }

//           const buffer = Buffer.from(characteristic.value, 'base64');
//           const fileName = buffer.toString('utf-8').trim();
//           //Over here we write all the file names we read to a json file in the
//           //expo file system directory.
//           console.log('[BLE] file received:', fileName);

//           const appendFileNameToJson = async (fileName: string) => {
//             const fileInfo = await FileSystem.getInfoAsync(filePath);
//             console.log(filePath);
//             let jsonData: {files: string[]} = {files: []};
//             try {
//               if (fileInfo.exists) {
//                 const fileContent = await FileSystem.readAsStringAsync(
//                   filePath,
//                 );
//                 jsonData = JSON.parse(fileContent);
//               } else {
//                 console.log(
//                   'File does not exist. Creating a new one at:',
//                   filePath,
//                 );
//                 await FileSystem.writeAsStringAsync(
//                   filePath,
//                   JSON.stringify(jsonData),
//                 );
//               }
//               //checking to make sure we dont add duplicates to the json file
//               if (!jsonData.files.includes(fileName)) {
//                 jsonData.files.push(fileName);
//               }

//               await FileSystem.writeAsStringAsync(
//                 filePath,
//                 JSON.stringify(jsonData),
//               );

//               console.log('Successfully appended file name to files.json');
//             } catch (error) {
//               console.error('Error appending file name to files.json:', error);
//             }
//           };

//           if (fileName.startsWith('2')) {
//             // appendFileNameToJson(fileName);
//             console.log('would save this name');
//           } else if (fileName === ' ') {
//             console.log('we got to the end here');
//           } else {
//             //probably means its a file, need to do a better check
//             const bufferTransform = buffer.buffer.slice(
//               buffer.byteOffset,
//               buffer.byteOffset + buffer.byteLength,
//             );
//             const fileSize = unpackFileSize(bufferTransform);

//             console.log('File size:', fileSize); // This is the file size

//             let contents: Uint8Array;

//             // while(len(contents > fileSize)):
//             // // Read the file contents here
//             // contents = contents +
//           }

//           //chance this value can change depending one what the command is
//           //need to have a way to download these files
//         },
//       );

//       console.log('[BLE] Sending "list" command...');
//       //Now we Send the "list" command to the device'
//       const listCommand = Buffer.from('LS', 'utf-8').toString('base64');
//       await device.writeCharacteristicWithResponseForService(
//         serviceUUID,
//         cmdCharUUID,
//         listCommand,
//       );

//       let formatedListNames = [];
//       //At this stage, the accumulateData is ray has been filled, so theoretically we can loop through it until
//       //we reach the end of the list of file names.
//       //and ultimately break the loop
//       while (true) {
//         console.log('start data loop');
//         const data = accumulatedData;
//         const filename = Buffer.from(data);

//         // .replace(/\x00+$/, '');
//         console.log('[BLE] Filename:', filename);

//         if (filename.length > 0) {
//           formatedListNames.push(filename);
//         } else {
//           break;
//         }
//       }
//     } catch (err) {
//       console.error('[BLE] listFiles failed:', err);
//       reject('Failed to list files: ' + (err as Error).message);
//     }
//   });
// };

const unpackFileSize = (binaryData: ArrayBuffer): number => {
  // Create a DataView for the binary data
  const dataView = new DataView(binaryData);

  // Read a 4-byte little-endian unsigned integer from the start of the buffer
  const fileSize = dataView.getUint32(0, true); // true indicates little-endian

  return fileSize;
};

export const getFiles = async (
  device: Device,
  serviceUUID: string,
  cmdCharUUID: string,
) => {
  //he gets the file names
  const fileContent = await FileSystem.readAsStringAsync(filePath);
  console.log('getting files');
  console.log(fileContent);
  const jsonData = JSON.parse(fileContent);
  const fileNames = jsonData.files || [];

  //iterates through them
  for (const fileName of fileNames) {
    //sends a get command specifically for that file name

    const getCommand = Buffer.from('GET' + fileName, 'utf-8').toString(
      'base64',
    );
    console.log('getting file');
    await device.writeCharacteristicWithResponseForService(
      serviceUUID,
      cmdCharUUID,
      getCommand,
    );
  }

  //waits for the results (using the que which we might need to do now)
  //or just add functionality to distinguish between the results of two commands
  //save the file names that come back and get the files that are retrieved
  //gets the file size and iterates through it
  //gets the file data (another fucking que)
  //adds it to a byte array
  //compares the size of the byte array to the file size to see the download percentage
  //then writes the file to a directory
};

//So it seems that with the listener only listening to one characteristic
//if we make two prompts like list and get, we will get different responses back in the same callback
//most likely almost always be after eachother and not at the same time, unless files are being downloaded
//while the list command gets sent
//aside from implementing a que system, we need to implement a que processor to make the prompts and responses
//independant
//this means if either list or get gets called, then the processor will check if it is a file first and then process
// (write it to a file) otherwise it would get the file size
//and then within that, get that the actual file content.
