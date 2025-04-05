import * as FileSystem from 'expo-file-system';


export const appendFileNameToJson = async (fileName: string, filePath: string) => {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    console.log(filePath);
    let jsonData: { files: string[] } = { files: [] };
    try {
        if (fileInfo.exists) {
            const fileContent = await FileSystem.readAsStringAsync(
                filePath,
            );
            jsonData = JSON.parse(fileContent);
        } else {
            console.log(
                'File does not exist. Creating a new one at:',
                filePath,
            );
            await FileSystem.writeAsStringAsync(
                filePath,
                JSON.stringify(jsonData),
            );
        }
        //checking to make sure we dont add duplicates to the json file
        if (!jsonData.files.includes(fileName)) {
            jsonData.files.push(fileName);
        }

        await FileSystem.writeAsStringAsync(
            filePath,
            JSON.stringify(jsonData),
        );

        console.log('Successfully appended file name to files.json');
    } catch (error) {
        console.error('Error appending file name to files.json:', error);
    }
};


export const unpackFileSize = (binaryData: ArrayBuffer): number => {
    // Create a DataView for the binary data
    const dataView = new DataView(binaryData);
  
    // Read a 4-byte little-endian unsigned integer from the start of the buffer
    const fileSize = dataView.getUint32(0, true); // true indicates little-endian
  
    return fileSize;
  };