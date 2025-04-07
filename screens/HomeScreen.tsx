import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
// import { StowerInverter } from '../logs/LogInformation';
import { BleManager, Device } from 'react-native-ble-plx';
import { getFiles, readFiles, StowerInverter, writeFiles } from '../logs/LovableInformation';

const manager = new BleManager();

const App = () => {
  const [device, setDevice] = useState<Device | null>(null);

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
          console.log('Connected to inverter:', connected.mtu);
          await connected.requestMTU(512);
          const discovered = await connected.discoverAllServicesAndCharacteristics();
          setDevice(discovered);
          console.log('Connected to inverter:', discovered.id);
        } catch (err) {
          console.error('Connection failed:', err);
        }
      }
    });
  };

  useEffect(() => {
    async function connect() {
      await connectToInverter();
    }

    connect();
  }, [])

  async function logsTest() {

    console.log("0")
    const inverter = new StowerInverter(device!, manager);
    console.log("1")
    console.log("1")
    inverter.subscribe();
    console.log("2")

    console.log("Get list of files");
    await inverter.sendFileCmd("LS");
    const files: string[] = [];

    while (true) {
      const filenameBuffer = await inverter.waitFileResults();
      const filename = filenameBuffer.toString().replace(/\0+$/, ''); // Remove null terminator
      console.log(filename);

      if (filename.length > 0) {
        files.push(filename);
      } else {
        break;
      }
    }

    console.log(`Files: ${files}`);
    writeFiles(files);

    const fileslist = readFiles();
    const filteredList = fileslist.filter(file => file !== 'config.json');
    console.log("FileList: " + filteredList);
    // inverter.unsubscribe();
    await getFiles(inverter, filteredList);



    // Unsubscribe when done
    inverter.unsubscribe();
    console.log("Done");
  }

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-xl font-bold mb-4">Stower Inverter BLE</Text>
      <Button title="Connect & Logs" onPress={logsTest} />
    </View>
  );
};

export default App;
