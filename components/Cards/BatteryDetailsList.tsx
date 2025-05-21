import React from 'react';
import { Text } from 'react-native-paper';
import { BatteryDetailsCard } from './BatteryDetailsCard';
import { BatteryData } from '../../types/BleTypes';

export const BatteryDetailsList: React.FC<{ nodeDataList: BatteryData[] }> = ({ nodeDataList }) => (
  <>
    {nodeDataList.length === 0 && <Text>No battery data available.</Text>}
    {nodeDataList.map((data, index) => (
      <BatteryDetailsCard key={index} batteryInfo={data} />
    ))}
  </>
); 