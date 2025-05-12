import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { authenticateInverter } from '../services/InverterService';
import { Colours } from '../styles/properties/colours';
import { GenericSize, Margin, Padding } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';
import { navigationRefAuthenticated } from '../nav/ScreenDefinitions';
import { getSelectedInverter, setConnectedInverter, setConnectedInverterDevice } from '../helpers/BluetoothHelper';
import { getFromStorage, STORAGE_KEYS } from '../helpers/StorageHelper';
import { Battery } from '../types/DeviceType';
import { layout } from '../styles/base';
import { AppScreen } from '../components/AppScreen';

export default function FinalizingScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const finalizeConnection = async () => {

      const selectedInverter = getSelectedInverter();
      const selectedNodes = getFromStorage(STORAGE_KEYS.SELECTED_NODES) as Battery[] | null;

      if (selectedInverter && selectedNodes) {
        setConnectedInverterDevice(selectedInverter);
        setConnectedInverter(selectedInverter);
      }

      try {
        const timer = setTimeout(async () => {
          if (selectedInverter && selectedNodes) {
            await authenticateInverter(selectedInverter, selectedNodes);

            setConnectedInverterDevice(selectedInverter);
            setConnectedInverter(selectedInverter);
          }

          setIsLoading(false);
        }, 3000)

        return () => clearTimeout(timer)

      } catch (error) {
        console.error('Error during finalizing connection:', error);
        setIsLoading(false);
      }
    };

    finalizeConnection();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      navigationRefAuthenticated.navigate('Home')
    }
  }, [isLoading, navigationRefAuthenticated]);

  if (isLoading) {
    return (
      <AppScreen>
        <View style={layout.content}>
          <ActivityIndicator size={GenericSize.large} color={Colours.primary} style={{ marginBottom: Margin.large }} />
          <Text variant="headlineSmall" style={textStyles.heading}>
            Finalizing Connection
          </Text>
          <Text variant="bodyMedium" style={textStyles.title}>
            Please wait while we complete the authentication process and establish the connection...
          </Text>
        </View>
      </AppScreen>
    );
  }

  return null; // This will never render because navigation happens when `isLoading` is false
}

