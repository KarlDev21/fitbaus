import React from 'react';
import { View, Text } from 'react-native';
import { Colours, Padding } from '../styles/properties';

interface OfflineBannerProps {
  isConnected: boolean | null;
  continueOffline: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ isConnected, continueOffline }) => {
  if (isConnected || !continueOffline) return null;

  return (
    <View style={{ backgroundColor: Colours.primary, padding: Padding.small }}>
      <Text style={{ color: Colours.textPrimary, textAlign: 'center', fontWeight: 'bold' }}>
        You are in offline mode
      </Text>
    </View>
  );
};

export default OfflineBanner;
