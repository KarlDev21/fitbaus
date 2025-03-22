import React, { useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { initBootstrapper } from './bootstrap/bootstrapper';
import { requestBluetoothPermissions } from './helpers/AppHelper';
import { NavigationContainer } from '@react-navigation/native';
import CreateDrawerNavigation from './nav/CreateDrawerNavigation';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { getItemAsync } from './helpers/SecureStorageHelper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
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

  useEffect(() => {
    bootstrap();

  }, [bootstrap]);

  useEffect(() => {
    async function init() {
      const user = await getItemAsync('UserProfile');
      if (user) {
        console.log('User found');
        //TODO: Navigate to the Home screen
      }
    }

    init();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <CreateDrawerNavigation />
        <Toast config={toastConfig} topOffset={80} />
      </NavigationContainer>
    </PaperProvider>
  );
}
export default App;

