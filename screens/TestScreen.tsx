import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import RNFS from 'react-native-fs';

const FILE_CMD_UUID = '669a0c20-0008-d690-ec11-e214466ccb95';
const FILE_RESULT_UUID = '669a0c20-0008-d690-ec11-e214476ccb95';
const SERVICE_UUID = '669a0c20-0008-d690-ec11-e2143045cb95'; // Example, replace with correct one if needed

const manager = new BleManager();

const App = () => {
    const [device, setDevice] = useState<Device | null>(null);
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            manager.destroy();
        };
    }, []);

    const connectToInverter = async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const devices = await manager.startDeviceScan(null, null, async (error, scannedDevice) => {
            if (error) {
                console.error('Scan error:', error);
                return;
            }
            if (scannedDevice?.name?.includes('Invert')) {
                manager.stopDeviceScan();
                try {
                    const connected = await scannedDevice.connect();
                    const discovered = await connected.discoverAllServicesAndCharacteristics();
                    setDevice(discovered);
                    console.log('Connected to inverter:', discovered.id);
                } catch (err) {
                    console.error('Connection failed:', err);
                }
            }
        });
    };

    const sendFileCmd = async (cmd: string) => {
        if (!device) return;
        try {
            const encoded = base64.encode(cmd);
            await device.writeCharacteristicWithResponseForService(SERVICE_UUID, FILE_CMD_UUID, encoded);
            console.log('Command sent:', cmd);
        } catch (err) {
            console.error('sendFileCmd error:', err);
        }
    };

    const listenForResults = async (): Promise<string[]> => {
        if (!device) return [];
        const results: string[] = [];

        await device.monitorCharacteristicForService(SERVICE_UUID, FILE_RESULT_UUID, (error, characteristic) => {
            if (error) {
                console.error('Notification error:', error);
                return;
            }
            const decoded = base64.decode(characteristic?.value || '');
            if (decoded) {
                const trimmed = decoded.replace(/\x00+$/, '');
                if (trimmed.length > 0) results.push(trimmed);
                else {
                    setFiles(results);
                }
            }
        });
        return results;
    };

    const getFileList = async () => {
        await sendFileCmd('LS');
        await listenForResults();
    };

    const deleteFiles = async () => {
        for (const file of files) {
            await sendFileCmd(`RM ${file}`);
        }
        Alert.alert('Files deleted');
    };

    const getFiles = async () => {
        for (const file of files) {
            await sendFileCmd(`GET ${file}`);

            let contents = '';
            let totalLength = 0;
            let piece = 0;
            let size = 0;

            await device?.monitorCharacteristicForService(SERVICE_UUID, FILE_RESULT_UUID, (error, characteristic) => {
                if (error) {
                    console.error('Monitoring error:', error);
                    return;
                }
                const value = base64.decode(characteristic?.value || '');
                if (totalLength === 0 && value.length === 4) {
                    size = value.charCodeAt(0) + (value.charCodeAt(1) << 8) + (value.charCodeAt(2) << 16) + (value.charCodeAt(3) << 24);
                } else {
                    contents += value;
                    if (((contents.length / size) * 100) > (piece * 10)) {
                        console.log(`${piece * 10}%..`);
                        piece++;
                    }
                }

                if (contents.length >= size && file.includes('202')) {
                    const path = `${RNFS.DocumentDirectoryPath}/${file}`;
                    RNFS.writeFile(path, contents, 'utf8');
                    console.log(`File saved: ${path}`);
                }
            });
        }
    };

    return (
        <View className="flex-1 items-center justify-center p-4">
            <Text className="text-xl font-bold mb-4">Stower Inverter BLE</Text>
            <Button title="Connect to Inverter" onPress={connectToInverter} />
            <Button title="Get File List" onPress={getFileList} disabled={!device} />
            <Button title="Download Files" onPress={getFiles} disabled={!device || files.length === 0} />
            <Button title="Delete Files" onPress={deleteFiles} disabled={!device || files.length === 0} />
            <FlatList
                data={files}
                keyExtractor={(item) => item}
                renderItem={({ item }) => <Text className="text-base p-1">{item}</Text>}
            />
        </View>
    );
};

export default App;
