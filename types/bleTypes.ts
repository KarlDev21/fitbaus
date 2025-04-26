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
    // TotalVoltage: number;
    Current: number;
    RemainCapacity: number;
    TotalCapacity: number;
    CycleLife: number;
    ProductLife: number;
    BalanceStatusLow: number;
    BalanceStatusHigh: number;
    ProtectionStatus: number;
    Version: number;
    RSOC: number;
    FetStatus: number;
    CellInSeries: number;
    N_NTC: number;
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
  LoadInputVoltage: number;
  LoadInputCurrent: number;
  LoadInputPower: number;
  LoadOutputVoltage: number;
  LoadOutputCurrent: number;
  LoadOutputPower: number;
  DeviceTemperature: number;
  HeatsinkTemperature: number;
  LoadStatus: number;
  Version: number;
  InverterOn: number;
  SolarVoltage: number;
  SolarCurrent: number;
}

export interface DashboardData {
  batterySoC: number
  inverterOutput: number
  solarInput: number
  temperature: number
  kWhGenerated: number
  kWhConsumed: number
  co2Savings: number
  leaseProgress: number
  alerts: string[]
}

export type BatteryInfo = {
  nodeId : string, 
  nodeData: BatteryData};




