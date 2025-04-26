import {MMKV} from 'react-native-mmkv';
import {Device} from 'react-native-ble-plx';
import {Battery, Inverter} from '../types/DeviceType';
import {STORAGE_KEYS} from '../helpers/StorageHelper';

//WE need to move away from this file
export const DeviceStorage = new MMKV();

export const getNodes = (): Device[] => {
  const data = DeviceStorage.getString('nodes');
  return data ? JSON.parse(data) : [];
};

//TODO: Where this message is used, I need to change cause you cant call the methods on the device object
export const getInverters = (): Inverter[] => {
  const data = DeviceStorage.getString(STORAGE_KEYS.INVERTERS);
  return data ? JSON.parse(data) : [];
};

export const setSelectedInverter = (inverter: Device) => {
  DeviceStorage.set(STORAGE_KEYS.SELECTED_INVERTER, JSON.stringify(inverter));
};

//TODO: Where this message is used, I need to change cause you cant call the methods on the device object
export const getSelectedInverter = (): Device | null => {
  const data = DeviceStorage.getString(STORAGE_KEYS.SELECTED_INVERTER);
  return data ? (JSON.parse(data) as Inverter) : null;
};

export const setConnectedInverter = (inverter: Device) => {
  DeviceStorage.set('connectedInverter', JSON.stringify(inverter));
};

export const getConnectedInverter = (): Device | null => {
  const data = DeviceStorage.getString('connectedInverter');
  return data ? JSON.parse(data) : null;
};

export const clearConnectedInverter = () => {
  DeviceStorage.delete('connectedInverter');
};


export const setSelectedNodes = (node: Device[]) => {
  DeviceStorage.set('selectedNodes', JSON.stringify(node));
};

export const getSelectedNodes = (): Device[] | null => {
  const data = DeviceStorage.getString('selectedNodes');
  return data ? (JSON.parse(data) as Battery[]) : [];
};

export const setConnectedNodes = (nodes: Device[], parentInverter: Device) => {
  DeviceStorage.set(
    parentInverter.id + 'connectedNodes',
    JSON.stringify(nodes),
  );
};

export const getConnectedNodes = (
  parentInverter: Inverter,
): Battery[] | null => {
  const data = DeviceStorage.getString(parentInverter.id + 'connectedNodes');
  return data ? (JSON.parse(data) as Battery[]) : null;
};

export const setConnectedInverterDevice = (inverter: Device) => {
  DeviceStorage.set('Device ' + inverter.id, JSON.stringify(inverter));
};

export const getConnectedInverterDevice = (
  inverterId: string,
): Device | null => {
  const data = DeviceStorage.getString('Device ' + inverterId);
  return data ? JSON.parse(data) : null;
};

export const clearScannedDevices = () => {
  DeviceStorage.delete('inverters');
  DeviceStorage.delete('nodes');
  DeviceStorage.delete('selectedNodes');
};

export const clearSelectedInverter = () => {
  DeviceStorage.delete('selectedInverter');
};

export const clearSelectedNode = () => {
  DeviceStorage.delete('selectedNode');
};
