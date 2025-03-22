import {PermissionsAndroid, Platform} from 'react-native';

export async function requestBluetoothPermissions(): Promise<boolean> {
  //Need to come back and double check this is the case
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

      console.log('Bluetooth permissions denied');
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
