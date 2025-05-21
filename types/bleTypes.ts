export interface InverterStatus {
  voltage: number;
  current: number;
  power: number;
}

export interface ChargeControllerStatus {
  charging: boolean;
  efficiency: number;
}

export interface BatteryData {
  totalVoltage: number;
  current: number;
  remainCapacity: number;
  totalCapacity: number;
  cycleLife: number;
  productLife: number;
  balanceStatusLow: number;
  balanceStatusHigh: number;
  protectionStatus: number;
  version: number;
  rsoc: number;
  fetStatus: number;
  cellInSeries: number;
  nNtc: number;
  deviceID?: string;
}

export interface ChargeControllerState {
  PV_Voltage: number;
  Batt_Voltage: number;
  PV_Current: number;
  PV_Watt: number;
  LoadCurrent: number;
  LoadWatt: number;
  BatteryStatus: number;
  ChargingStatus: number;
  DischargingStatus: number;
  DeviceTemperature: number;
}

export interface InverterState {
  loadInputVoltage: number;
  loadInputCurrent: number;
  loadInputPower: number;
  loadOutputVoltage: number;
  loadOutputCurrent: number;
  loadOutputPower: number;
  deviceTemperature: number;
  heatsinkTemperature: number;
  loadStatus: number;
  version: number;
  inverterOn: number;
  solarVoltage: number;
  solarCurrent: number;
  deviceID?: string;
}

export type BatteryInfo = {
  nodeId: string;
  nodeData: BatteryData;
};
