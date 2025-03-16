import React, { useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { showToast, toastConfig, ToastType } from './components/Toast';
import { initBootstrapper } from './bootstrap/bootstrapper';
import { requestBluetoothPermissions } from './helpers/AppHelper';
import { NavigationContainer } from '@react-navigation/native';
import CreateDrawerNavigation from './nav/CreateDrawerNavigation';

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
    showToast(ToastType.Error, 'Error scanning for devices');

  }, [bootstrap]);

  return (
    <NavigationContainer>
      <CreateDrawerNavigation />
      <Toast config={toastConfig} topOffset={80} />
    </NavigationContainer>
  );
}
export default App;

