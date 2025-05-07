import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { showToast, ToastType } from '../components/Toast';
import { getScanErrorMessage, scanDevices } from '../services/BluetoothLowEnergyService';
import { AppScreen } from '../components/AppScreen';
import { ScanCard } from '../components/Cards/ScanCard';
import { SavedInverterCard } from '../components/Cards/SavedInverterCard';
import { saveToStorage, STORAGE_KEYS } from '../helpers/StorageHelper';
import { Inverter } from '../types/DeviceType';
import { BleManagerInstance, getConnectedInverter } from '../helpers/BluetoothHelper';
import { Flex } from '../styles/properties';
import { GenericSize } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';
import { useKeepAwake } from 'expo-keep-awake';
import { navigationRefAuthenticated } from '../nav/ScreenDefinitions';

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const savedInverter: Inverter | null = getConnectedInverter();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // This hook is used to keep the screen awake for performing log-related operations
  useKeepAwake();

  useEffect(() => {
    const checkConnection = async () => {

      if (!savedInverter) {
        setIsConnected(false)
        return
      }

      const connectedDevices = await BleManagerInstance.connectedDevices(["669a0c20-0008-d690-ec11-e2143045cb95"]);
      console.log("Connected devices: ", connectedDevices);
      if (connectedDevices.length === 0) {
        setIsConnected(false)
        return
      }
      setIsConnected(true)
      const connection = await savedInverter?.isConnected();
      if (connection) {
        setIsConnected(connection);
      }
    };

    checkConnection();
  });

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
        navigationRefAuthenticated.navigate('Inverters');
      }
    } catch (error) {
      console.log(error)
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
      showToast(ToastType.Success, 'Connected to Inverter');
    } catch (error) {
      showToast(ToastType.Error, 'An error occurred while connecting to the inverter.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInverter = () => {
    if (savedInverter) {
      navigationRefAuthenticated.navigate('Dashboard', { inverter: savedInverter });
    }
  };

  return (
    <AppScreen>
      <View style={styles.content}>
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

