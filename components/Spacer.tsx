import React from 'react';
import { View } from 'react-native';
import { GenericSize } from '../styles/properties/dimensions';

export const Spacer: React.FC<{ size?: number }> = () => (
  <View style={{ height: GenericSize.medium }} />
); 