import React, { useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { showToast, toastConfig, ToastType } from './components/Toast';
import { initBootstrapper } from './bootstrap/bootstrapper';
import { requestBluetoothPermissions } from './helpers/AppHelper';
import { NavigationContainer } from '@react-navigation/native';
import CreateDrawerNavigation from './nav/CreateDrawerNavigation';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { BluetoothProvider } from './services/BluetoothContext';
import useNodeListener from './hooks/useNodeListener';
import { getConnectedInverter, getConnectedNodes, getSingleNode } from './services/storage';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FFC107', // Blue
    secondary: '#2196F3', // Yellow
    secondaryContainer: '#FFF8E1',
    background: '#FFFFFF',
    surface: '#FFFFFF',
  },
};

function App(): React.JSX.Element {
  const bootstrap = useCallback(async () => {
    async function init() {
      const isBluetoothEnabled = await requestBluetoothPermissions();
      if (isBluetoothEnabled) {
        await initBootstrapper();
      }
    }

    init();
  }, []);

  // const inverter = getConnectedInverter();

  
  
  // const { fileData, isListening } = useNodeListener({
  //   node: getConnectedInverter(),
  //   serviceUUID: '1234abcd-0000-1000-8000-00805f9b34fb',
  //   characteristicUUID: 'abcd1234-0000-1000-8000-00805f9b34fb',
  // });

  useEffect(() => {
    bootstrap();
  
  }, [bootstrap]);

  return (
    <PaperProvider theme={theme}>
      <BluetoothProvider>
        <NavigationContainer>
          <CreateDrawerNavigation />
          <Toast config={toastConfig} topOffset={80} />
        </NavigationContainer>
      </BluetoothProvider>
    </PaperProvider>
  );
}
export default App;

