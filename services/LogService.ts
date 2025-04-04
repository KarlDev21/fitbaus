import {Alert} from 'react-native';
import {writeFiles, readFiles, saveFile} from './FileService';
import {
  getFileResult,
  sendFileCmd,
  waitFileResults,
} from '../helpers/TestHelper';
import {getConnectedInverter} from './storage';

const device = getConnectedInverter();

export const handleListFiles = async () => {
  if (!device) {
    Alert.alert('No device connected');
    return;
  }

  console.log('Listing files...');
  await sendFileCmd(device, 'LS');
  console.log('sendFileCmd...');
  const files: string[] = [];
  while (true) {
    const result = await waitFileResults(device);
    console.log('waitFileResults...');
    const filename = result?.toString('utf-8').replace(/\0/g, '');
    if (filename?.length === 0) break;
    files.push(filename ?? '');
    console.log('File:', filename);
  }
  console.log('Files:', files);
  await writeFiles(files);
};
