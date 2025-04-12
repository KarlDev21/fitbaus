import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../nav/CreateStackNavigation';
import { showToast, ToastType } from '../components/Toast';
import { getScanErrorMessage, scanDevices } from '../services/BluetoothLowEnergyService';
import { getConnectedInverter } from '../services/storage';
import { connectToInverter } from '../services/InverterService';
import { AppScreen } from '../components/AppScreen';
import { ScanCard } from '../components/Cards/ScanCard';
import { SavedInverterCard } from '../components/Cards/SavedInverterCard';
import { setItem } from '../helpers/StorageHelper';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const savedInverter = getConnectedInverter();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const connection = await savedInverter?.isConnected();
      if (connection) {
        setIsConnected(connection);
      }
    };

    checkConnection();
  }, [isConnected, savedInverter]);

  const handleScan = async () => {
    setIsScanning(true);

    try {
      const { inverters, nodes } = await scanDevices();

      const errorMessage = getScanErrorMessage(nodes.length, inverters.length);

      if (errorMessage) {
        showToast(ToastType.Error, errorMessage);
      } else {
        setItem('nodes', JSON.stringify(nodes));
        setItem('inverters', JSON.stringify(inverters));
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
      const connection = await connectToInverter(savedInverter);

      if (connection) {
        setIsConnected(true);
        showToast(ToastType.Success, 'Connected to Inverter');
      } else {
        break;
      }
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

  return (
    <AppScreen>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
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
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "bold",
  }
})

