import {storage} from '../services/storage';

/**
 * Writes a list of file names to persistent storage.
 *
 * @param {string[]} files - An array of file names to be saved.
 */
export function writeFiles(files: string[]): void {
  try {
    const deviceFiles = {files};
    console.log('Saving files:', deviceFiles);
    storage.set('files', JSON.stringify(deviceFiles));
  } catch (error) {
    console.error('Error writing files:', error);
  }
}

/**
 * Reads a list of file names from persistent storage.
 *
 * @returns {string[]} - An array of file names, or an empty array if no files are found.
 */
export function readFiles(): string[] {
  try {
    const fileData = storage.getString('files');
    console.log('Retrieved file data:', fileData);

    if (fileData) {
      const fileList = JSON.parse(fileData);
      return fileList.files || [];
    }
  } catch (error) {
    console.error('Error reading files:', error);
  }

  return []; // Return an empty array if no data is found or an error occurs
}
