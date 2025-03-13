import {Device} from 'react-native-ble-plx';
import {showToast, ToastType} from '../components/Toast';
import {BleManagerInstance, generateDigest} from '../helpers/BluetoothHelper';
import {getConfigStringValue, RemoteConfigKeys} from './RemoteConfigService';

export async function scanDevices(
  setDevices: (devices: Device[]) => void,
): Promise<void> {
  // Clear existing devices first
  setDevices([]);

  // Track latest device by name
  const devicesByName = new Map<string, Device>();

  // Start scanning
  BleManagerInstance.startDeviceScan(null, null, (error, device) => {
    if (error) {
      showToast(ToastType.Error, 'Error scanning for devices');
      return;
    }

    if (
      device?.name &&
      (device.name.includes('Invert') || device.name.includes('Node'))
    ) {
      devicesByName.set(device.name, device);
      setDevices(Array.from(devicesByName.values()));
    }
  });

  // Stop scanning after 10 seconds
  //TODO: Rather check if we have scanned a device than timing it out
  setTimeout(() => BleManagerInstance.stopDeviceScan(), 10000);
}

export async function authNode(device: Device | null): Promise<boolean> {
  if (!device) {
    showToast(ToastType.Error, 'No device connected');
    return false;
  }

  try {
    const connectedDevice = await BleManagerInstance.connectToDevice(device.id);
    await connectedDevice.discoverAllServicesAndCharacteristics();

    const digest = generateDigest(device.id);

    // Write digest to characteristic
    await BleManagerInstance.writeCharacteristicWithResponseForDevice(
      device.id,
      getConfigStringValue(RemoteConfigKeys.NODE_SERVICE_UUID) ?? '',
      getConfigStringValue(RemoteConfigKeys.NODE_AUTHENTICATION_CHAR_UUID) ??
        '',
      digest.toString('base64'),
    );

    await connectedDevice.cancelConnection();
    showToast(ToastType.Success, 'Node authentication successful');
    return true;
  } catch (error: any) {
    showToast(ToastType.Error, `Authentication failed: ${error.message}`);
    return false;
  }
}
