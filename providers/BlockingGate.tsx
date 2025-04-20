import React from 'react';
import { View, Text, Button } from 'react-native';
import { useConnectivity } from './ConnectivityProvider';
import { useBluetooth } from './BluetoothProvider';
import NoInternetScreen from '../screens/NoInternetScreen';
import NoBluetoothScreen from '../screens/NoBluetoothScreen';

type Props = {
  children: React.ReactNode;
};

export const BlockingGate: React.FC<Props> = ({ children }) => {
    const { isOnline, continueOffline } = useConnectivity();
    const { isBluetoothEnabled, permissionGranted } = useBluetooth();

    if (!isOnline && !continueOffline) {
        return <NoInternetScreen/>
  }

  if (!permissionGranted || !isBluetoothEnabled) {
    return <NoBluetoothScreen/>
  }

  return <>{children}</>;
};
