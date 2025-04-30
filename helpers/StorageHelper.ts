import {MMKV} from 'react-native-mmkv';

// Initialize MMKV instance
const storage = new MMKV();

/**
 * Sets a value in MMKV storage.
 *
 * @param {string} key - The key to store the value under.
 * @param {any} value - The value to store. If it's an object or array, it will be stringified.
 */
export const saveToStorage = (key: string, value: string): void => {
  try {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    storage.set(key, stringValue);
  } catch (error) {
    console.error(`Error saving key "${key}" to storage:`, error);
  }
};

/**
 * Retrieves a value from MMKV storage.
 *
 * @param {string} key - The key of the value to retrieve.
 * @returns {any} - The stored value. If it's a JSON string, it will be parsed into an object or array.
 */
export function getFromStorage<T>(key: string): T | null {
  try {
    const data = storage.getString(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving key "${key}" from storage:`, error);
    return null;
  }
}

/**
 * Retrieves a string value from MMKV storage.
 *
 * @param {string} key - The key of the value to retrieve.
 * @returns {string} - The stored string value, or an empty string if not found.
 */
export const getStringFromStorage = (key: string): string => {
  return storage.getString(key) ?? '';
};

/**
 * Deletes a value from MMKV storage.
 *
 * @param {string} key - The key of the value to delete.
 */
export const removeFromStorage = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error(`Error deleting key "${key}" from storage:`, error);
  }
};

export const STORAGE_KEYS = {
  LOG_FILES: 'files',
  NODES: 'nodes',
  INVERTERS: 'inverters',
  SELECTED_NODES: 'selectedNodes',
  SELECTED_INVERTER: 'selectedInverter',
  CONNECTED_INVERTER: 'connectedInverter',
  CONNECTED_NODES: 'connectedNodes',
};
