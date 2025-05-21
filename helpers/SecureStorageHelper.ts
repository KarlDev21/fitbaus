import * as SecureStore from 'expo-secure-store';

export async function setItemAsync(key: string, value: any): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(value);
    await SecureStore.setItemAsync(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error setting item in secure storage', error);
    return false;
  }
}

export async function getItemAsync<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await SecureStore.getItemAsync(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting item from secure storage', error);
    return null;
  }
}

export function getItem<T>(key: string): T | null {
  try {
    const jsonValue = SecureStore.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting item from secure storage', error);
    return null;
  }
}

export const SECURE_STORE_KEYS = {
  USER_PROFILE: 'UserProfile',
};
