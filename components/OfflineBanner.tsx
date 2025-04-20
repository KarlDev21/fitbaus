import React from 'react';
import { View, Text } from 'react-native';
import { useConnectivity } from '../providers/ConnectivityProvider';

const OfflineBanner: React.FC = () => {
  const { isOnline, continueOffline } = useConnectivity();

  if (isOnline || !continueOffline) return null;

  return (
    <View style={{ backgroundColor: '#FFC107', padding: 8 }}>
      <Text style={{ color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
        You are in offline mode
      </Text>
    </View>
  );
};

export default OfflineBanner;
