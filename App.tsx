import React, { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { Provider as PaperProvider } from 'react-native-paper';
import { BluetoothProvider } from './providers/BluetoothProvider';
import OfflineBanner from './components/OfflineBanner';
import { StackNavigationContainer } from './nav/StackNavigationContainer';
import { useAtomValue } from 'jotai';
import { UnauthenticatedScreenDefinitions, AuthenticatedScreenDefinitions, UnauthenticatedStackScreens, AuthenticatedStackScreen, navigationRefAuthenticated, navigationRefUnauthenticated } from './nav/ScreenDefinitions';
import { userAtom } from './state/atom/userAtom';
import { useNetInfo } from "@react-native-community/netinfo";
import NoInternetScreen from './screens/NoInternetScreen';
import { useGlobalFileUploader } from './hooks/useGlobalFileUploader';

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
  const { isConnected } = useNetInfo();
  const [continueOffline, setContinueOffline] = useState(false);

  useGlobalFileUploader();

  const getNavigationContainer = useCallback(() => {
    if (user) {
      return AuthenticatedNavigationStack.getContainer();
    } else {
      return UnauthenticatedNavigationStack.getContainer();
    }
  }, [user])

  if (isConnected === false && !continueOffline) {
    return (
      <NoInternetScreen
        onContinueOffline={() => setContinueOffline(true)}
      />
    );
  }

  return (
    <PaperProvider>
      <BluetoothProvider>
        <OfflineBanner isConnected={isConnected} continueOffline={continueOffline} />
        {getNavigationContainer()}
        <Toast config={toastConfig} topOffset={80} />
      </BluetoothProvider>
    </PaperProvider>
  );
}
export default App;