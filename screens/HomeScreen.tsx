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

  useEffect(() => {
    const checkConnection = async () => {
      if (!savedInverter) {
        setIsConnected(false)
        return
      }

      const connectedDevices = await BleManagerInstance.connectedDevices([BleUuids.AUTHENTICATION_SERVICE_UUID]);
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
  }, []);

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
      await BleManagerInstance.discoverAllServicesAndCharacteristicsForDevice(savedInverter.id);

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
