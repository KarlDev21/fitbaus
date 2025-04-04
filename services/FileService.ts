import * as FileSystem from 'expo-file-system';

const FILE_PATH = `${FileSystem.documentDirectory}files.json`;

export const writeFiles = async (files: string[]): Promise<void> => {
  const data = JSON.stringify({files});
  await FileSystem.writeAsStringAsync(FILE_PATH, data, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  console.log('Files written to:', FILE_PATH);
};

export const readFiles = async (): Promise<string[]> => {
  try {
    const data = await FileSystem.readAsStringAsync(FILE_PATH, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const parsed = JSON.parse(data);
    return parsed.files || [];
  } catch (error) {
    console.error('Error reading files.json:', error);
    return [];
  }
};

export const saveFile = async (
  filename: string,
  contents: Buffer,
): Promise<void> => {
  const path = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, contents.toString('base64'), {
    encoding: FileSystem.EncodingType.Base64,
  });
  console.log('File saved to:', path);
};
