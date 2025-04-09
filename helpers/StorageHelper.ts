import {MMKV} from 'react-native-mmkv';

// Initialize MMKV instance
const storage = new MMKV();

/**
 * Sets a value in MMKV storage.
 *
 * @param {string} key - The key to store the value under.
 * @param {any} value - The value to store. If it's an object or array, it will be stringified.
 */
export const setItem = (key: string, value: string): void => {
  storage.set(key, value);
};

/**
 * Retrieves a value from MMKV storage.
 *
 * @param {string} key - The key of the value to retrieve.
 * @returns {any} - The stored value. If it's a JSON string, it will be parsed into an object or array.
 */
export const getItem = (key: string): any => {
  const data = storage.getString(key);
  return data ? JSON.parse(data) : data;
};

/**
 * Deletes a value from MMKV storage.
 *
 * @param {string} key - The key of the value to delete.
 */
export const deleteItem = (key: string): void => {
  storage.delete(key);
};
