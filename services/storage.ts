import { MMKV } from 'react-native-mmkv';
import {Device} from 'react-native-ble-plx';
import { ChargeControllerState } from '../types/bleTypes';

export const storage = new MMKV();

// Save Device List
export const setDevices = (nodes: Device[], inverters: Device[]) => {
  storage.set('nodes', JSON.stringify(nodes));
  storage.set('inverters', JSON.stringify(inverters));
};

export const getNodes = (): Device[] => {
  const data = storage.getString('nodes');
  return data ? JSON.parse(data) : [];
};

export const getInverters = (): Device[] => {
    const data = storage.getString('inverters');
    return data ? JSON.parse(data) : [];
  };

// Save & Get Selected Inverter
export const setSelectedInverter = (inverter: Device) => {
  storage.set('selectedInverter', JSON.stringify(inverter));
};

export const getSelectedInverter = (): Device | null => {
  const data = storage.getString('selectedInverter');
  return data ? JSON.parse(data) : null;
};

// Save & Get Connected Inverter
export const setConnectedInverter = (inverter: Device) => {
  storage.set('connectedInverter', JSON.stringify(inverter));
};

export const getConnectedInverter = (): Device | null => {
  const data = storage.getString('connectedInverter');
  return data ? JSON.parse(data) : null;
};

// Save & Get Selected Node
export const setSelectedNodes = (node: Device[]) => {
  storage.set('selectedNodes', JSON.stringify(node));
};

export const getSelectedNodes = (): Device[] | null => {
  const data = storage.getString('selectedNodes');
  return data ? JSON.parse(data) : [];
};

export const setConnectedInverterDevice = (inverter : Device) => {
  storage.set('Device ' + inverter.id, JSON.stringify(inverter));
};

export const getConnectedInverterDevice = (inverterId: string): Device | null => {
  const data = storage.getString('Device ' + inverterId);
  return data ? JSON.parse(data) : null;
};


export const clearScannedDevices = () => {
    storage.delete('inverters');
    storage.delete('nodes');
  };

export const clearSelectedInverter = () => {
    storage.delete('selectedInverter');
  };

export const clearSelectedNode = () => {
    storage.delete('selectedNode');
  };
