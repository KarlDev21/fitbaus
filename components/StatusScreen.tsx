import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { statusScreenStyles } from '../styles/components/StatusScreenStyles';
import LogoComponent from './Logo';
import { AppScreen } from './AppScreen';

const { height } = Dimensions.get('window');

interface StatusScreenProps {
  title: string;
  subtitle: string;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({
  title,
  subtitle,
}) => (
  <AppScreen>
    {/* Background layers */}
    <View style={[styles.halfBg, statusScreenStyles.topHalf]} />
    <View style={[styles.halfBg, statusScreenStyles.bottomHalf]} />

    <View style={statusScreenStyles.content}>
      <LogoComponent />
      <Text style={statusScreenStyles.title}>{title}</Text>
      <Text style={statusScreenStyles.subtitle}>{subtitle}</Text>
    </View>
    </AppScreen>
);

const styles = StyleSheet.create({
  halfBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height / 1.9,
    zIndex: -1,
  }
});