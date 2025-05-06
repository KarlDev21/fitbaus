import React from 'react';
import { StatusScreen } from '../components/StatusScreen';

const NoPermissionScreen = () => (
  <StatusScreen
    title="REQUIRED PERMISSIONS NOT GRANTED"
    subtitle="Please Go to your device’s Settings > Apps > Stower > Permissions, and then enable all permissions. After that close and open the app again"
  />
);

export default NoPermissionScreen;