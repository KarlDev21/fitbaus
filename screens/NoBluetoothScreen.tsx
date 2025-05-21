import React from 'react';
import { StatusScreen } from '../components/StatusScreen';

const NoBluetoothScreen = () => (
  <StatusScreen
    title="BLUETOOTH DISCONNECTED"
    subtitle="Please check your bluetooth connection in order to proceed with using the app"
  />
);

export default NoBluetoothScreen;