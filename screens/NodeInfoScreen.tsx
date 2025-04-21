import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Appbar } from 'react-native-paper';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppStackParamList } from '../nav/AppNavigation';
import { checkAndConnectToInverter, connectAndDiscoverServices, fetchAndLogBatteryData } from '../services/InverterService';
import { getConnectedInverter, getConnectedNodes } from '../services/storage';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { BatteryData } from '../types/BleTypes';
import { AppScreen } from '../components/AppScreen';
import { BatteryDetailsCard } from '../components/Cards/BatteryDetailsCard';
import { BleManagerInstance } from '../helpers/BluetoothHelper';
import { Inverter } from '../types/DeviceType';

type NodeInfoScreenNavigationProp = DrawerNavigationProp<AppStackParamList, 'NodeInfo'>
type NodeInfoScreenRouteProp = RouteProp<AppStackParamList, 'NodeInfo'>

interface NodeInfoScreenProps {
  navigation: NodeInfoScreenNavigationProp
  route: NodeInfoScreenRouteProp
}

export default function NodeInfoScreen({ navigation, route }: NodeInfoScreenProps) {
  const [batteryData, setBatteryData] = useState<BatteryData>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBatteryData = async () => {
      try {
        const inverter = getConnectedInverter();
        if (inverter) {
          const node = getConnectedNodes(inverter);
          if (node) {
            const data = await fetchAndLogBatteryData(route.params.nodeId.toString(), inverter);
            if (data) {
              setBatteryData(data);
            }
          }

        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load battery data', error);
        setIsLoading(false);
      }
    };

    loadBatteryData();
  });

  // Helper function to get battery status color based on RSOC
  const getBatteryStatusColor = (rsoc: number) => {
    if (rsoc >= 80) { return '#4CAF50'; } // Green
    if (rsoc >= 50) { return '#FFC107'; } // Yellow
    if (rsoc >= 20) { return '#FF9800'; } // Orange
    return '#F44336'; // Red
  };

  // Helper function to get battery icon based on RSOC
  const getBatteryIcon = (rsoc: number) => {
    if (rsoc >= 80) { return 'battery-high'; }
    if (rsoc >= 50) { return 'battery-medium'; }
    if (rsoc >= 20) { return 'battery-low'; }
    return 'battery-outline';
  };

  return (
    <AppScreen isLoading={isLoading}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Battery ${route.params.nodeId}`} />
      </Appbar.Header>

      {batteryData ? (
        <ScrollView style={styles.scrollView}>
          <Card style={styles.batteryCard}>
            <Card.Content>
              <View style={styles.batteryHeader}>
                <View
                  style={[styles.iconContainer, { backgroundColor: getBatteryStatusColor(batteryData.RSOC) + '20' }]}
                >
                  <MaterialCommunityIcons
                    name={getBatteryIcon(batteryData.RSOC) as any}
                    size={32}
                    color={getBatteryStatusColor(batteryData.RSOC)}
                  />
                </View>
                <View style={styles.batteryHeaderInfo}>
                  <Text variant="titleLarge" style={styles.batteryTitle}>
                    Battery
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={[styles.batteryStatus, { color: getBatteryStatusColor(batteryData.RSOC) }]}
                  >
                    {batteryData.RSOC}% Charged
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <BatteryDetailsCard batteryData={batteryData} />

          <View style={styles.spacer} />
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load battery data</Text>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  batteryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryHeaderInfo: {
    marginLeft: 16,
  },
  batteryTitle: {
    fontWeight: 'bold',
  },
  batteryStatus: {
    fontWeight: '500',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: 20,
  },
});

