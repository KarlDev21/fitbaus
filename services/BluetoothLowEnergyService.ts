import {ScanCallbackType} from 'react-native-ble-plx';
import {showToast, ToastType} from '../components/Toast';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import {Battery, Inverter} from '../types/DeviceType';
import {removeFromStorage, STORAGE_KEYS} from '../helpers/StorageHelper';

/**
 * Scans for BLE devices and categorizes them into inverters and nodes.
 * - Filters devices by name to identify inverters and nodes.
 * - Automatically stops scanning after 4 seconds and returns the found devices.
 *
 * @returns Arrays of inverter and node devices.
 */
export async function scanDevices(): Promise<{
  inverters: Inverter[];
  nodes: Battery[];
}> {
  return new Promise((resolve, reject) => {
    clearScannedDevices();

    const inverters = new Map<string, Inverter>();
    const nodes = new Map<string, Battery>();

    BleManagerInstance.startDeviceScan(
      null,
      {allowDuplicates: false, callbackType: ScanCallbackType.AllMatches},
      (error, device) => {
        if (error) {
          showToast(ToastType.Error, 'Error scanning for devices');
          reject(error);
          return;
        }

        console.log('Scanned device:', device?.name, device?.id);

        if (device?.name && device.name.includes('Invert')) {
          device.requestMTU(255);
          inverters.set(device.name, device);
        }

        if (device?.name && device.name.includes('Node')) {
          nodes.set(device.name + device.id, device);
        }
      },
    );

    setTimeout(() => {
      BleManagerInstance.stopDeviceScan();
      resolve({
        inverters: Array.from(inverters.values()),
        nodes: Array.from(nodes.values()),
      });
    }, 4000);
  });
}

function clearScannedDevices() {
  removeFromStorage(STORAGE_KEYS.INVERTERS);
  removeFromStorage(STORAGE_KEYS.SELECTED_NODES);
  removeFromStorage(STORAGE_KEYS.NODES);
}

export const getScanErrorMessage = (
  nodesCount: number,
  invertersCount: number,
): string => {
  if (nodesCount === 0 && invertersCount === 0) {
    return 'No Batteries or Inverters found. Please try scanning again.';
  }
  if (nodesCount === 0) {
    return 'No Batteries found. Please try scanning again.';
  }
  if (invertersCount === 0) {
    return 'No Inverters found. Please try scanning again.';
  }
  return '';
};

export async function checkBluetoothConnection(): Promise<boolean> {
  try {
    const state = await BleManagerInstance.state();
    console.log(
      '-------------------------BLE STATE---------------------------',
    );
    console.log(state);
    return state === 'PoweredOn';
  } catch (error) {
    console.error('Error checking Bluetooth state:', error);
    return false;
  }
}
