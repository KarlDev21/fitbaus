import React from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigation from './nav/RootNavigation';
import { AuthProvider } from './providers/AuthProvider';
import { BluetoothProvider } from './providers/BluetoothProvider';
import { ConnectivityProvider } from './providers/ConnectivityProvider';
import { BlockingGate } from './providers/BlockingGate';
import OfflineBanner from './components/OfflineBanner';

function App(): React.JSX.Element {

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
