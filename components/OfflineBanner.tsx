import React from 'react';
import { View, Text } from 'react-native';
import { useConnectivity } from '../providers/ConnectivityProvider';
import { Colours, Padding } from '../styles/properties';

const OfflineBanner: React.FC = () => {
  const { isOnline, continueOffline } = useConnectivity();

  if (isOnline || !continueOffline) return null;

  return (
    <View style={{ backgroundColor: Colours.primary , padding: Padding.small }}>
      <Text style={{ color: Colours.textPrimary, textAlign: 'center', fontWeight: 'bold' }}>
        You are in offline mode
      </Text>
    </View>
  );
};

export default OfflineBanner;
