import React, { useEffect, useState } from 'react';
import { showToast, ToastType } from '../components/Toast';
import { getScanErrorMessage, scanDevices } from '../services/BluetoothLowEnergyService';
import { AppScreen } from '../components/AppScreen';
import { ScanCard } from '../components/Cards/ScanCard';
import { SavedInverterCard } from '../components/Cards/SavedInverterCard';
import { saveToStorage, STORAGE_KEYS } from '../helpers/StorageHelper';
import { Inverter } from '../types/DeviceType';
import { BleManagerInstance, getConnectedInverter } from '../helpers/BluetoothHelper';
import { navigationRefAuthenticated } from '../nav/ScreenDefinitions';
import { BleUuids } from '../types/constants/constants';

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const savedInverter: Inverter | null = getConnectedInverter();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Helper function to check connection status
  const checkConnectionStatus = async () => {
    if (!savedInverter) {
      setIsConnected(false);
      return false;
    }

    const connectedDevices = await BleManagerInstance.connectedDevices([BleUuids.AUTHENTICATION_SERVICE_UUID]);
    const isDeviceConnected = connectedDevices.some(device => device.id === savedInverter.id);

    setIsConnected(isDeviceConnected);
    return isDeviceConnected;
  };

  // Helper function to connect to the inverter
  const connectToInverter = async () => {
    try {
      await BleManagerInstance.connectToDevice(savedInverter!.id);
      await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(savedInverter!.id);

      const isDeviceConnected = await checkConnectionStatus();
      if (!isDeviceConnected) {
        throw new Error('Failed to establish a connection with the inverter.');
      }

      showToast(ToastType.Success, 'Connected to the inverter.');
    } catch (error) {
      showToast(ToastType.Error, 'An error occurred while connecting to the inverter.');
      console.error(error);
      return false;
    }
    return true;
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    if (!savedInverter) return;

    const subscription = BleManagerInstance.onDeviceDisconnected(savedInverter.id, () => {
      setIsConnected(false);
    });

    return () => subscription.remove();
  }, [savedInverter]);

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
    if (!savedInverter) {
      showToast(ToastType.Error, 'No inverter is saved. Please scan and select an inverter.');
      return;
    }

    setIsConnecting(true);

    const isDeviceConnected = await checkConnectionStatus();
    if (isDeviceConnected) {
      showToast(ToastType.Success, 'Already connected to the inverter.');
      setIsConnecting(false);
      return;
    }

    await connectToInverter();
    setIsConnecting(false);
  };

  const handleInverter = async () => {
    if (!savedInverter) {
      showToast(ToastType.Error, 'No inverter is saved. Please scan and connect to an inverter.');
      return;
    }

    if (!isConnected) {
      setIsConnecting(true);

      const success = await connectToInverter();
      setIsConnecting(false);

      if (!success) return;
    }

    navigationRefAuthenticated.navigate('Dashboard', { inverter: savedInverter });
  };

  return (
    <AppScreen>
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
    </AppScreen>
  )
}
