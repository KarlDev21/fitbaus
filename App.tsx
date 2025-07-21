import React, { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { Provider as PaperProvider } from 'react-native-paper';
import { StackNavigationContainer } from './nav/StackNavigationContainer';
import { useAtomValue } from 'jotai';
import { UnauthenticatedScreenDefinitions, AuthenticatedScreenDefinitions, UnauthenticatedStackScreens, AuthenticatedStackScreen, navigationRefAuthenticated, navigationRefUnauthenticated } from './nav/ScreenDefinitions';
import { userAtom } from './state/atom/userAtom';
import { useNetInfo } from "@react-native-community/netinfo";
import NoInternetScreen from './screens/NoInternetScreen';
import NoBluetoothScreen from './screens/NoBluetoothScreen';
import { useLogFileUploader } from './hooks/useLogFileUploader';
import { requestBluetoothPermissions } from './helpers/AppHelper';
import NoPermissionScreen from './screens/NoPermissionScreen';
import { getItem, SECURE_STORE_KEYS } from './helpers/SecureStorageHelper';
import { useBluetoothConnection } from './hooks/useBluetoothConnection';

export const UnauthenticatedNavigationStack = new StackNavigationContainer<UnauthenticatedScreenDefinitions>(
  UnauthenticatedStackScreens,
  navigationRefUnauthenticated
)

export const AuthenticatedNavigationStack = new StackNavigationContainer<AuthenticatedScreenDefinitions>(
  AuthenticatedStackScreen,
  navigationRefAuthenticated
)

function App(): React.JSX.Element {
  const user = useAtomValue(userAtom);
  const storedUser = getItem(SECURE_STORE_KEYS.USER_PROFILE);
  const { isConnected } = useNetInfo();
  const [isGranted, setIsGranted] = useState(true);
  const { isBluetoothEnabled } = useBluetoothConnection();

  const loadPermission = async () => {
    const isPermissionGranted = await requestBluetoothPermissions()
    setIsGranted(isPermissionGranted)
  }

  useLogFileUploader();

  const getNavigationContainer = useCallback(() => {
    loadPermission()

    if (!isGranted) {
      return <NoPermissionScreen />;
    }

    if (isConnected === false) {
      return <NoInternetScreen />;
    }

    if (isBluetoothEnabled === false) {
      return <NoBluetoothScreen />;
    }

    if (user || storedUser) {
      return AuthenticatedNavigationStack.getContainer();
    } else {
      return UnauthenticatedNavigationStack.getContainer();
    }
  }, [user, isGranted, storedUser, isConnected, isBluetoothEnabled]);


  return (
    <PaperProvider>
      {getNavigationContainer()}
      <Toast config={toastConfig} topOffset={80} />
    </PaperProvider>
  );
}

export default App;