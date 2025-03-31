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
  NODE_AUTHENTICATION_CHAR_UUID: '669a0c20-0008-21b5-ec11-e214416c2e68',
  NODE_AUTHENTICATION_SERVICE_UUID: 'ffffffff-21b5-ec11-e214-000030452e68',

};

export const RemoteConfigKeys = {
  NODE_SERVICE_UUID: 'NODE_SERVICE_UUID',
  NODE_AUTHENTICATION_SERVICE_UUID: 'NODE_AUTHENTICATION_SERVICE_UUID',
  NODE_AUTHENTICATION_CHAR_UUID: 'NODE_AUTHENTICATION_CHAR_UUID',

  SALT: 'SALT',
};
