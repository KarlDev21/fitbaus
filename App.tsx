import React, { useCallback, useEffect } from 'react';
import {
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { initBootstrapper } from './bootstrap/bootstrapper';
import { requestBluetoothPermissions } from './helpers/AppHelper';

function App(): React.JSX.Element {
  const bootstrap = useCallback(async () => {
    async function init() {
      const isBluetoothEnabled = await requestBluetoothPermissions();
      if (isBluetoothEnabled) {
        await initBootstrapper()
      }
    }

    init();
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <View>
      <Toast config={toastConfig} />
      <Text>App</Text>
    </View>
  );
}
export default App;

