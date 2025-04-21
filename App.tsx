import React, { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { initBootstrapper } from './bootstrap/bootstrapper';
import { isConnectedAsync, requestBluetoothPermissions } from './helpers/AppHelper';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { getItemAsync } from './helpers/SecureStorageHelper';
import NoInternetScreen from './screens/NoInternetScreen';
import RootNavigation from './nav/RootNavigation';
import { AuthProvider } from './providers/AuthProvider';
import { BluetoothProvider } from './providers/BluetoothProvider';
import { ConnectivityProvider } from './providers/ConnectivityProvider';
import { BlockingGate } from './providers/BlockingGate';
import OfflineBanner from './components/OfflineBanner';

const navigationRef = createNavigationContainerRef<any>();

function App(): React.JSX.Element {
  // const [hasInternet, setHasInternet] = useState<boolean>(true);

  // const bootstrap = useCallback(async () => {
  //   async function init() {
  //     const isBluetoothEnabled = await requestBluetoothPermissions();
  //     if (isBluetoothEnabled) {
  //       const isConnected = await isConnectedAsync();
  //       if (!isConnected) {
  //         setHasInternet(false);
  //         return;
  //       }
  //       setHasInternet(true);
  //       await initBootstrapper();
  //     }
  //   }

  //   init();
  // }, []);

  // useEffect(() => {
  //   bootstrap();

  // }, [bootstrap]);

  // useEffect(() => {
  //   async function init() {
  //     const user = await getItemAsync('UserProfile');
  //     if (user) {
  //       console.log('User found');
  //       //TODO: Navigate to the Home screen
  //       if (navigationRef.isReady()) {
  //         console.log('User found #1');
  //         navigationRef.navigate('HomeScreen');
  //       }
  //     }
  //   }

  //   init();
  // }, []);

  // const handleRetry = async () => {
  //   const isConnected = await isConnectedAsync();
  //   setHasInternet(isConnected);
  //   await bootstrap();
  // };

  // if (!hasInternet) {
  //   return <NoInternetScreen onRetry={handleRetry} />;
  // }

  return (
    <PaperProvider>
      <AuthProvider>
        <ConnectivityProvider>  
          <BluetoothProvider>
            <OfflineBanner/>
            <BlockingGate>
              <RootNavigation />
              <Toast config={toastConfig} topOffset={80} />
            </BlockingGate>
          </BluetoothProvider>
        </ConnectivityProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
export default App;

