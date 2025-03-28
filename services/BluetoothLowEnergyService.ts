import {Device, ScanCallbackType} from 'react-native-ble-plx';
import {showToast, ToastType} from '../components/Toast';
import {BleManagerInstance} from '../helpers/BluetoothHelper';
import {Buffer} from 'buffer';
import CryptoJS from 'crypto-js';
import BleManager from 'react-native-ble-manager';

//THIS IS THE NODE DEVICE
export let theDevice: Device;
export let theInverter: Device;

BleManager.start({showAlert: true});

export async function scanDevices(): Promise<void> {
  // Clear existing devices first
  // setDevices([]);

  // Track latest device by name
  const devicesByName = new Map<string, Device>();

  // Start scanning
  BleManagerInstance.startDeviceScan(
    null,
    {allowDuplicates: false, callbackType: ScanCallbackType.AllMatches},
    (error, device) => {
      if (error) {
        showToast(ToastType.Error, error.message);
        return;
      }

      console.log('Scanned device:', device);

      if (
        device?.name &&
        (device.name.includes('Invert') || device.name.includes('Node'))
      ) {
        devicesByName.set(device.name, device);
      }

      if (device?.localName?.includes('Node')) {
        theDevice = device;
        console.warn('Found NODE:', device);
      }

      if (device?.localName?.includes('Invert')) {
        theInverter = device;
        console.warn('Found INVERTER:', device);
      }

      //NOTE: Parse in the node manufacturer data (Inverter has nothing to parse)
      const rawBytes = decodeManufacturerData(
        'OQABBRf//BbhF3AAACBoAAAAAIAACWEDBAE=',
      );

      console.log('Decoded Bytes:', rawBytes.length);

      const manufacturerData = extractManufacturerData(rawBytes);
      console.log('Manufacturer Data:', manufacturerData);
      if (manufacturerData) {
        const nodeMetaData = parseNodeMetaV2(manufacturerData);
        console.log('Parsed Node Metadata:', nodeMetaData);
      }
    },
  );

  // Stop scanning after 10 seconds
  //TODO: Rather check if we have scanned a device than timing it out
  setTimeout(() => BleManagerInstance.stopDeviceScan(), 1000);
}

// Function to decode Base64 manufacturer data
const decodeManufacturerData = (base64Data: string): Uint8Array => {
  return new Uint8Array(Buffer.from(base64Data, 'base64'));
};

const extractManufacturerData = (rawBytes: Uint8Array) => {
  console.log('Raw Bytes Length:', rawBytes.length);

  // Search for manufacturer ID (0x39 in your case)
  const manufacturerIdIndex = rawBytes.findIndex(b => b === 0x39);

  if (
    manufacturerIdIndex === -1 ||
    manufacturerIdIndex + 2 >= rawBytes.length
  ) {
    console.error('Manufacturer Data Not Found');
    return null;
  }

  // Extract all bytes after the manufacturer ID
  const extractedData = rawBytes.slice(manufacturerIdIndex + 2);
  console.log('Extracted Manufacturer Data Length:', extractedData.length);
  return extractedData;
};

const parseBatteryData = (data: Uint8Array) => {
  if (data.length < 23) {
    console.error('Invalid battery data length:', data.length);
    return null;
  }

  return {
    totalVoltage: (data[0] << 8) | data[1], // Int16ub
    current: (((data[2] << 8) | data[3]) << 16) >> 16, // Int16sb (Signed)
    remainCapacity: (data[4] << 8) | data[5], // Int16ub
    totalCapacity: (data[6] << 8) | data[7], // Int16ub
    cycleLife: (data[8] << 8) | data[9], // Int16ub
    productLife: (data[10] << 8) | data[11], // Int16ub
    balanceStatusLow: (data[12] << 8) | data[13], // Int16ub
    balanceStatusHigh: (data[14] << 8) | data[15], // Int16ub
    protectionStatus: (data[16] << 8) | data[17], // Int16ub
    version: data[18], // Int8ul
    rsoc: data[19], // Int8ul
    fetStatus: data[20], // Int8ul
    cellInSeries: data[21], // Int8ul
    nNTC: data[22], // Int8ul
  };
};

// Parse tNodeMetaV2 (Flag + Battery Data)
const parseNodeMetaV2 = (data: Uint8Array) => {
  if (data.length < 24) {
    console.error('Invalid NodeMetaV2 length:', data.length);
    return null;
  }

  return {
    flags: data[0], // First byte
    status: parseBatteryData(data.slice(1, 24)), // Remaining 23 bytes
  };
};

// AUTHENTICATION STUFF

const AUTHENTICATION_CHAR = '669a0c20-0008-21b5-ec11-e214416c2e68';

export async function authenticate() {
  try {
    const connectedDevice = await BleManagerInstance.connectToDevice(
      theDevice.id,
    );
    await connectedDevice.discoverAllServicesAndCharacteristics();

    await BleManager.connect(theDevice.id);
    console.log('Connected successfully!');

    await BleManager.retrieveServices(theDevice.id);
    console.log('Services retrieved successfully!');

    const digest = generateDigest(theDevice.id);
    // console.log(`Authenticate ${digest}`);
    console.log(`Byte Array ${Array.from(digest)}`);

    const response =
      await BleManagerInstance.writeCharacteristicWithResponseForDevice(
        theDevice.id,
        'ffffffff-21b5-ec11-e214-000030452e68',
        AUTHENTICATION_CHAR,
        Buffer.from(digest).toString('base64'),
      );

    // const response = await BleManager.write(
    //   theDevice.id,
    //   'ffffffff-21b5-ec11-e214-000030452e68',
    //   AUTHENTICATION_CHAR,
    //   Array.from(digest), // Needs to be an array, not Buffer
    // );

    //TODO: Disconnet
    BleManagerInstance.cancelDeviceConnection(theDevice.id);
    console.log('Disconnected successfully!');

    console.log('Authentication Response:', response);
  } catch (error) {
    console.error('Authentication Error:', error);
  }
}

export function generateDigest(address: string) {
  const l = address.split(':');
  l.reverse();
  console.log(l);

  const li = l.map(x => parseInt(x, 16));
  console.log(li);

  const lb = Buffer.from(li);
  const salt = Buffer.from('StowerBatteryNode-Inventech');
  console.log('len of salt %d', salt.length);

  // Create single MD5 instance
  const m5 = CryptoJS.algo.MD5.create();

  // First update with MAC bytes
  m5.update(CryptoJS.lib.WordArray.create(lb));
  const firstHash = m5;
  console.log('hash of mac ', firstHash.toString());

  // Second update with salt (continue same hash)
  m5.update(CryptoJS.lib.WordArray.create(salt));
  const digest = m5.finalize();
  console.log('hash digest ', digest.toString());

  return Buffer.from(digest.toString(), 'hex');
}
