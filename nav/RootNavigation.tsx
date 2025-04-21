import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigation from './AppNavigation';
import AuthNavigation from './AuthNavigation';
import { getItemAsync } from '../helpers/SecureStorageHelper';
import { useAuth } from '../providers/AuthProvider';
import { ActivityIndicator, View } from 'react-native';
import { useBluetooth } from '../providers/BluetoothProvider';


export default function RootNavigation() {

  const {user, isLoading} = useAuth();

  if (isLoading) {
    return (
      //replcae this with an actual proper splash screen
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );

}
