import {PermissionsAndroid, Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const scanGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const connectGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const locationGranted =
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (scanGranted && connectGranted && locationGranted) {
        console.log('Bluetooth permissions granted');
        return true;
      }

      console.error('Bluetooth permissions denied');
      return false;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  } else {
    //TODO: Error Toast to user stating that this feature is not available on this platform
    return false;
  }
}

/**
 * Checks if the device is connected to the internet.
 *
 * @returns {Promise<boolean>} - Resolves to `true` if the device is connected, otherwise `false`.
 */
export async function isConnectedAsync(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    return false;
  }
}
