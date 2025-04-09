import {
  BatteryData,
  ChargeControllerState,
  InverterState,
} from '../types/bleTypes';

export function parseInverterState(data: Uint8Array): InverterState {
  const buffer = Buffer.from(data);

  return {
    LoadInputVoltage: buffer.readUInt16LE(0),
    LoadInputCurrent: buffer.readUInt16LE(2),
    LoadInputPower: buffer.readUInt32LE(4),
    LoadOutputVoltage: buffer.readUInt16LE(8),
    LoadOutputCurrent: buffer.readUInt16LE(10),
    LoadOutputPower: buffer.readUInt32LE(12),
    DeviceTemperature: buffer.readUInt16LE(16),
    HeatsinkTemperature: buffer.readUInt16LE(18),
    LoadStatus: buffer.readUInt16LE(20),
    Version: buffer.readUInt16LE(22),
    InverterOn: buffer.readUInt8(24),
    SolarVoltage: buffer.readUInt16LE(25),
    SolarCurrent: buffer.readUInt16LE(27),
  };
}

export function parseChargeControllerState(
  data: Uint8Array,
): ChargeControllerState {
  const buffer = Buffer.from(data);

  return {
    PV_Voltage: buffer.readUInt16LE(0),
    Batt_Voltage: buffer.readUInt16LE(2),
    PV_Current: buffer.readUInt16LE(4),
    PV_Watt: buffer.readInt32LE(6),
    LoadCurrent: buffer.readInt16LE(10),
    LoadWatt: buffer.readInt32LE(12),
    BatteryStatus: buffer.readUInt16LE(16),
    ChargingStatus: buffer.readUInt16LE(18),
    DischargingStatus: buffer.readUInt16LE(20),
    DeviceTemperature: buffer.readInt16LE(22),
  };
}

// Function to parse the binary data into the `BatteryData` structure
export function parseBatteryData(data: Uint8Array): BatteryData {
  const buffer = Buffer.from(data);

  return {
    // TotalVoltage: buffer.readUInt16BE(0),
    Current: buffer.readInt16BE(2),
    RemainCapacity: buffer.readUInt16BE(4),
    TotalCapacity: buffer.readUInt16BE(6),
    CycleLife: buffer.readUInt16BE(8),
    ProductLife: buffer.readUInt16BE(10),
    BalanceStatusLow: buffer.readUInt16BE(12),
    BalanceStatusHigh: buffer.readUInt16BE(14),
    ProtectionStatus: buffer.readUInt16BE(16),
    Version: buffer.readUInt8(18),
    RSOC: buffer.readUInt8(19),
    FetStatus: buffer.readUInt8(20),
    CellInSeries: buffer.readUInt8(21),
    N_NTC: buffer.readUInt8(22),
  };
}
