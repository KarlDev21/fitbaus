import {FILE} from 'dns';

export const BleUuids = {
  // UUIDs for inverter authentication
  AUTHENTICATION_SERVICE_UUID: '669a0c20-0008-d690-ec11-e2143045cb95', // Service for inverter authentication
  AUTHENTICATION_CHAR_UUID: '669a0c20-0008-d690-ec11-e214416ccb95', // Characteristic for inverter authentication

  // UUIDs for node authentication
  NODE_AUTHENTICATION_SERVICE_UUID: 'ffffffff-21b5-ec11-e214-000030452e68', // Service for node authentication
  NODE_AUTHENTICATION_CHAR_UUID: '669a0c20-0008-21b5-ec11-e214416c2e68', // Characteristic for node authentication

  // UUIDs for reading inverter state
  INVERTER_STATE_CHAR_UUID: '669a0c20-0008-d690-ec11-e214406ccb95', // Characteristic for reading inverter state

  // UUIDs for reading battery controller state
  CHARGE_CONTROLLER_STATE_CHAR_UUID: '669a0c20-0008-d690-ec11-e214486ccb95', // Characteristic for reading charge controller state

  // UUIDs for reading battery state
  SET_BATT_RETR_CHAR_UUID: '669a0c20-0008-d690-ec11-e214436ccb95', // Characteristic for setting battery retrieval
  RETR_BATTERY_CHAR_UUID: '669a0c20-0008-d690-ec11-e214446ccb95', // Characteristic for retrieving battery data
  BATTERY_CHAR_UUID: '669a0c20-0008-d690-ec11-e214426ccb95', // Characteristic for battery data

  // UUIDs for log file commands
  FILE_CMD_CHAR_UUID: '669a0c20-0008-d690-ec11-e214466ccb95', // Characteristic for file commands
  FILE_RESULT_CHAR_UUID: '669a0c20-0008-d690-ec11-e214476ccb95', // Characteristic for file results
  FILE_CMD_SERVICE_UUID: '669a0c20-0008-d690-ec11-e2143045cb95', // File command for Service
};

export const API_BASE_URL = __DEV__
  ? 'http://192.168.182.121:3000/api/v1'
  : 'http://188.166.168.206:3000/api/v1/';
