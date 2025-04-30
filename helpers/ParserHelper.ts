import {
  BatteryData,
  ChargeControllerState,
  InverterState,
} from '../types/BleTypes';

export function parseInverterState(data: Uint8Array): InverterState {
  const buffer = Buffer.from(data);

  return {
    loadInputVoltage: buffer.readUInt16LE(0),
    loadInputCurrent: buffer.readUInt16LE(2),
    loadInputPower: buffer.readUInt32LE(4),
    loadOutputVoltage: buffer.readUInt16LE(8),
    loadOutputCurrent: buffer.readUInt16LE(10),
    loadOutputPower: buffer.readUInt32LE(12),
    deviceTemperature: buffer.readUInt16LE(16),
    heatsinkTemperature: buffer.readUInt16LE(18),
    loadStatus: buffer.readUInt16LE(20),
    version: buffer.readUInt16LE(22),
    inverterOn: buffer.readUInt8(24),
    solarVoltage: buffer.readUInt16LE(25),
    solarCurrent: buffer.readUInt16LE(27),
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
    totalVoltage: buffer.readUInt16BE(0),
    current: buffer.readInt16BE(2),
    remainCapacity: buffer.readUInt16BE(4),
    totalCapacity: buffer.readUInt16BE(6),
    cycleLife: buffer.readUInt16BE(8),
    productLife: buffer.readUInt16BE(10),
    balanceStatusLow: buffer.readUInt16BE(12),
    balanceStatusHigh: buffer.readUInt16BE(14),
    protectionStatus: buffer.readUInt16BE(16),
    version: buffer.readUInt8(18),
    rsoc: buffer.readUInt8(19),
    fetStatus: buffer.readUInt8(20),
    cellInSeries: buffer.readUInt8(21),
    nNtc: buffer.readUInt8(22),
  };
}
