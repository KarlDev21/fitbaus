import React, { useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { initBootstrapper } from './bootstrap/bootstrapper';
import { requestBluetoothPermissions } from './helpers/AppHelper';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import RootNavigator from './nav/RootNavigator';

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

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <PaperProvider theme={theme}>
      {/* <NavigationContainer> */}
      <RootNavigator />
        {/* <CreateDrawerNavigation /> */}
        <Toast config={toastConfig} topOffset={80} />
      {/* </NavigationContainer> */}
    </PaperProvider>
  );
}
export default App;

