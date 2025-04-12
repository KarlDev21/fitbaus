import React, { useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { initBootstrapper } from './bootstrap/bootstrapper';
import { requestBluetoothPermissions } from './helpers/AppHelper';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import CreateDrawerNavigation from './nav/CreateDrawerNavigation';
import { Provider as PaperProvider } from 'react-native-paper';
import { getItemAsync } from './helpers/SecureStorageHelper';

const navigationRef = createNavigationContainerRef<any>();

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
        if (navigationRef.isReady()) {
          navigationRef.navigate('HomeScreen');
        }
      }
    }

    init();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <CreateDrawerNavigation />
        <Toast config={toastConfig} topOffset={80} />
      </NavigationContainer>
    </PaperProvider>
  );
}
export default App;

