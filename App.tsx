import React, { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import { Provider as PaperProvider } from 'react-native-paper';
import { BluetoothProvider } from './providers/BluetoothProvider';
import { ConnectivityProvider } from './providers/ConnectivityProvider';
import { BlockingGate } from './providers/BlockingGate';
import OfflineBanner from './components/OfflineBanner';
import { StackNavigationContainer } from './nav/StackNavigationContainer';
import { useAtomValue } from 'jotai';
import { UnauthenticatedScreenDefinitions, AuthenticatedScreenDefinitions, UnauthenticatedStackScreens, AuthenticatedStackScreen, navigationRefAuthenticated, navigationRefUnauthenticated } from './nav/ScreenDefinitions';
import { userAtom } from './state/atom/userAtom';

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

  const getNavigationContainer = useCallback(() => {
    if (user) {
      return AuthenticatedNavigationStack.getContainer();
    } else {
      return UnauthenticatedNavigationStack.getContainer();
    }
  }, [user])

  return (
    <PaperProvider>
      <ConnectivityProvider>
        <BluetoothProvider>
          <OfflineBanner />
          <BlockingGate>
            {user ? AuthenticatedNavigationStack.getContainer() : UnauthenticatedNavigationStack.getContainer()}
            <Toast config={toastConfig} topOffset={80} />
          </BlockingGate>
        </BluetoothProvider>
      </ConnectivityProvider>
    </PaperProvider>
  );
}
export default App;
