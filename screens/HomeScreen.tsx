import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../nav/AppNavigation';
import { showToast, ToastType } from '../components/Toast';
import { getScanErrorMessage, scanDevices } from '../services/BluetoothLowEnergyService';
import { getConnectedInverter } from '../services/storage';
import { AppScreen } from '../components/AppScreen';
import { ScanCard } from '../components/Cards/ScanCard';
import { SavedInverterCard } from '../components/Cards/SavedInverterCard';
import { saveToStorage, STORAGE_KEYS } from '../helpers/StorageHelper';
import { StowerInverter } from '../logs/InverterLogService';
import { Inverter } from '../types/DeviceType';
import { writeFiles, readFiles } from '../helpers/FileHelper';
import { BleManagerInstance } from '../helpers/BluetoothHelper';
import { Flex, Colours } from '../styles/properties';
import { GenericSize } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Home'>

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const savedInverter: Inverter | null = getConnectedInverter();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [newInverter, setNewInverter] = useState<Inverter | null>(null);

  useEffect(() => {
    const checkConnection = async () => {

      if(!savedInverter){
        setIsConnected(false)
        return
      }

      const connectedDevices = await BleManagerInstance.connectedDevices(["669a0c20-0008-d690-ec11-e2143045cb95"]);
      console.log("Connected devices: ", connectedDevices);
      if(connectedDevices.length === 0){
        setIsConnected(false)
        return
      }
      setIsConnected(true)
      const connection = await savedInverter?.isConnected();
      if (connection) {
        setIsConnected(connection);
        // await uploadFiles();
      }
    };

    checkConnection();
  });

  // useEffect(() => {
  //   const init = async () => {
  //     if (isConnected) {
  //       // await uploadFiles();
  //     }
  //   }

  //   init()
  // }, [isConnected, savedInverter])

  const handleScan = async () => {
    setIsScanning(true);

    try {
      const { inverters, nodes } = await scanDevices();

      const errorMessage = getScanErrorMessage(nodes.length, inverters.length);

      if (errorMessage) {
        showToast(ToastType.Error, errorMessage);
      } else {
        saveToStorage(STORAGE_KEYS.NODES, JSON.stringify(nodes));
        saveToStorage(STORAGE_KEYS.INVERTERS, JSON.stringify(inverters));
        navigation.navigate('Inverters');
      }
    } catch (error) {
      showToast(ToastType.Error, 'An error occurred while scanning. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async () => {
    if (!savedInverter) return;

    setIsConnecting(true);

    try {
      const devices = await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(savedInverter.id);
      console.log("discover inverter: ", devices)
      console.log(devices)
   
      setIsConnected(true);
      setIsConnecting(false);
      showToast(ToastType.Success, 'Connected to Inverter');
    } catch (error) {
      showToast(ToastType.Error, 'An error occurred while connecting to the inverter.');
      setIsConnecting(false);
    }
  };

  const handleInverter = () => {
    if (savedInverter) {
      navigation.navigate('Dashboard', { inverter: savedInverter });
    }
  };

  async function uploadFiles() {
    if (savedInverter) {
      const connectedDevice = await BleManagerInstance.connectToDevice(
        savedInverter.id,
      );
      await connectedDevice.discoverAllServicesAndCharacteristics();
      connectedDevice.requestMTU(512);

      const inverter = new StowerInverter(connectedDevice);
      inverter.subscribe();

      console.log("Get list of files");
      await inverter.sendFileCmd("LS");
      const files: string[] = [];

      while (true) {
        const filenameBuffer = await inverter.waitFileResults();
        const filename = filenameBuffer.toString().replace(/\0.*$/, '');
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
      const filteredList = fileslist.filter((file: string) => file !== 'config.json' && file !== '20250107.log');
      console.log("FileList: " + filteredList);
      await inverter.downloadFiles(filteredList);

      // Unsubscribe when done
      inverter.unsubscribe();
      console.log("Done");
    }
  }

  return (
    <AppScreen>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={textStyles.title}>
          Inverter Scanner
        </Text>

        <ScanCard isScanning={isScanning} onScan={handleScan} />

        {savedInverter && (
          <SavedInverterCard
            handleInverter={handleInverter}
            inverter={savedInverter}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={handleConnect}
          />
        )}
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: Flex.xsmall,
    padding: GenericSize.medium,
  }
})

