import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useConnectivity } from './ConnectivityProvider';
import { useBluetooth } from './BluetoothProvider';
import NoInternetScreen from '../screens/NoInternetScreen';
import NoBluetoothScreen from '../screens/NoBluetoothScreen';

type Props = {
  children: React.ReactNode;
};

export const BlockingGate: React.FC<Props> = ({ children }) => {
  const { isOnline, continueOffline } = useConnectivity();
  const { isBTLoading, isBluetoothEnabled, permissionGranted } = useBluetooth();

  if(isBTLoading){
     return (
          //replcae this with an actual proper splash screen
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        );
      }

  if(!isOnline && !continueOffline) {
      return <NoInternetScreen/>
  }

  if(!permissionGranted || !isBluetoothEnabled) {
    return <NoBluetoothScreen/>
  }

  return <>{children}</>;
};
