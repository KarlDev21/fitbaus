import React from 'react';
import { StatusScreen } from '../components/StatusScreen';

const NoInternetScreen = () => (
  <StatusScreen
    title="NO INTERNET CONNECTION"
    subtitle="It looks like you're offline. Please check your Wi-Fi or mobile data."
  />
);

export default NoInternetScreen;