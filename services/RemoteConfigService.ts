import config from '@react-native-firebase/remote-config';

export async function initRemoteConfig(): Promise<void> {
  await config().setDefaults(defaults);
  await config().fetchAndActivate();
}

export function getConfigStringValue(key: string): string | undefined {
  return config().getValue(key).asString();
}

const defaults: {[key: string]: string | number | boolean} = {
  NODE_SERVICE_UUID: '00001800-0000-1000-8000-00805f9b34fb',
  NODE_AUTHENTICATION_CHAR_UUID: '00002a00-0000-1000-8000-00805f9b34fb',
};

export const RemoteConfigKeys = {
  NODE_SERVICE_UUID: 'NODE_SERVICE_UUID',
  NODE_AUTHENTICATION_CHAR_UUID: 'NODE_AUTHENTICATION_CHAR_UUID',
  SALT: 'StowerBatteryNode-Inventech',
};
