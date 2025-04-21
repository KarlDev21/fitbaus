'use client';

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Appbar } from 'react-native-paper';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppStackParamList } from '../nav/AppNavigation';
import { getConnectedInverter, getConnectedInverterDevice, getConnectedNodes } from '../services/storage';
import { connectAndDiscoverServices, fetchAndLogBatteryData, fetchAndLogBatteryInfo, fetchAndLogChargeControllerStatus, fetchAndLogInverterStatus } from '../services/InverterService';
import { showToast, ToastType } from '../components/Toast';
import { BatteryData, BatteryInfo, ChargeControllerState, InverterState } from '../types/BleTypes';
import { Colours } from '../styles/properties/colours';
import { AppScreen } from '../components/AppScreen';
import { MetricCard } from '../components/Cards/MetricCard';
import { Battery, Inverter } from '../types/DeviceType';
import {Device} from 'react-native-ble-plx';
import { BatteryDetailsCard } from '../components/Cards/BatteryDetailsCard';

type DashboardScreenNavigationProp = DrawerNavigationProp<AppStackParamList, 'Dashboard'>
type DashboardScreenRouteProp = RouteProp<AppStackParamList, 'Dashboard'>

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp
  route: DashboardScreenRouteProp
}

export default function DashboardScreen({ navigation, route }: DashboardScreenProps) {
  const inverterId = route.params.inverter.id;
  const inverter = getConnectedInverterDevice(inverterId);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedNodeIds, setConnectedNodeIds] = useState<string[]>([]);

  const [chargeControllerState, setChargeControllerState] = useState<ChargeControllerState>({
    PV_Voltage: 0,
    Batt_Voltage: 0,
    PV_Current: 0,
    PV_Watt: 0,
    LoadCurrent: 0,
    LoadWatt: 0,
    BatteryStatus: 0,
    ChargingStatus: 0,
    DischargingStatus: 0,
    DeviceTemperature: 0,
  });

  const [inverterState, setInverterState] = useState<InverterState>({
    LoadInputVoltage: 0,
    LoadInputCurrent: 0,
    LoadInputPower: 0,
    LoadOutputVoltage: 0,
    LoadOutputCurrent: 0,
    LoadOutputPower: 0,
    DeviceTemperature: 0,
    HeatsinkTemperature: 0,
    LoadStatus: 0,
    Version: 0,
    InverterOn: 0,
    SolarVoltage: 0,
    SolarCurrent: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodeDataList, setNodeDataList] = useState<BatteryInfo[]>([]);
  const [batteryData, setBatteryData] = useState<BatteryData[]>([]);

  useEffect(() => {
    const loadBatteryData = async () => {

      let batteryDatalist: BatteryData[] = []
      try {
        const inverter = getConnectedInverter();
        if (inverter) {
          const node = getConnectedNodes(inverter);

          if (node) {
            for(const batId in connectedNodeIds){
              const data = await fetchAndLogBatteryData(batId, inverter);
              if (data) {
                batteryDatalist.push(data)
              }
            }
        
          }

          setBatteryData(batteryDatalist)

        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load battery data', error);
        setIsLoading(false);
      }
    };

    loadBatteryData();
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setTimeout(async () => {
          console.log("loaded inverter")
          console.log(inverter)
          if (inverter) {
            const chargeControllerInfo = await fetchAndLogChargeControllerStatus(inverter);
            const inverterState = await fetchAndLogInverterStatus(inverter);
            let list: BatteryInfo[] = []

            if (chargeControllerInfo && inverterState) {

              setChargeControllerState(chargeControllerInfo);
              setInverterState(inverterState);

              const nodes = getConnectedNodes(inverter);

              if (nodes) {
                nodes.forEach(async (node) => {
                  const batteryData = await fetchAndLogBatteryInfo(node, inverter);
                  if (batteryData) {
                    list.push(batteryData);
                  }
                });

                setConnectedNodeIds(nodes.map(node => node.id));
                setNodeDataList(list);
              }
            }

            setIsLoading(false);
          }
          else {
            showToast(ToastType.Error, 'Failed to load dashboard data. Please try again.');
            setIsLoading(false);
          }
        }, 3000);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [inverter]);

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

  const handleInfoPress = (nodeId: string) => {
    if (nodeId) {
      // eslint-disable-next-line radix
      navigation.navigate('NodeInfo', { nodeId: parseInt(nodeId) });
    }
  };

  return (
    <AppScreen isLoading={isLoading}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title="System Dashboard" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} >

      <Card style={styles.batteryCard}>
            <Card.Content>
              <View style={styles.batteryHeader}>
                <View
                  style={[styles.iconContainer, { backgroundColor: getBatteryStatusColor(inverterState.HeatsinkTemperature/100) + '20' }]}
                >
                  <MaterialCommunityIcons
                    name={'temperature-celsius'}
                    size={32}
                    color={getBatteryStatusColor(inverterState.HeatsinkTemperature/100)}
                  />
                </View>
                <View style={styles.batteryHeaderInfo}>
                  <Text variant="titleLarge" style={styles.batteryTitle}>
                    Inverter Temperature
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={[styles.batteryStatus, { color: getBatteryStatusColor(inverterState.HeatsinkTemperature/100) }]}
                  >
                    {inverterState.HeatsinkTemperature/100}°C
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>


        {connectedNodeIds && (
          connectedNodeIds.map((nodeId) => (
            <BatteryCard key={nodeId} nodeId={nodeId} onPress={handleInfoPress} />
          ))
        )}

          {batteryData.map((data, index) => (
            <BatteryDetailsCard key={index} batteryData={data} />
          ))}


        <View style={styles.spacer} />
      </ScrollView>
    </AppScreen>
  );
}

const BatteryCard = ({ nodeId, onPress }: { nodeId: string; onPress: (nodeId: string) => void }) => (
  <Card style={styles.inverterCard} onPress={() => onPress(nodeId)}>
    <Card.Content>
      <View style={styles.inverterHeader}>
        <MaterialCommunityIcons name="battery" size={24} color={Colours.secondary} />
        <Text variant="titleLarge" style={styles.inverterTitle}>
          Battery {nodeId}
        </Text>
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  inverterCard: {
    marginBottom: 16,
    elevation: 2,
  },
  inverterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inverterTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  overviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricLabel: {
    flex: 1,
    fontWeight: '500',
  },
  metricValue: {
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
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
});

