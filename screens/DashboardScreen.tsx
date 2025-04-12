'use client';

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Appbar } from 'react-native-paper';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../nav/CreateStackNavigation';
import { getConnectedInverterDevice, getConnectedNodes } from '../services/storage';
import { connectAndDiscoverServices, fetchAndLogBatteryInfo, fetchAndLogChargeControllerStatus, fetchAndLogInverterStatus } from '../services/InverterService';
import { showToast, ToastType } from '../components/Toast';
import { BatteryInfo, ChargeControllerState, InverterState } from '../types/BleTypes';
import { Colours } from '../styles/properties/colours';
import { AppScreen } from '../components/AppScreen';
import { MetricCard } from '../components/Cards/MetricCard';
import { Battery, Inverter } from '../types/DeviceType';

type DashboardScreenNavigationProp = DrawerNavigationProp<RootStackParamList, 'Dashboard'>
type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setTimeout(async () => {
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
        {connectedNodeIds && (
          connectedNodeIds.map((nodeId) => (
            <BatteryCard key={nodeId} nodeId={nodeId} onPress={handleInfoPress} />
          ))
        )}

        {/* Charge Controller State */}
        {chargeControllerState && (
          <MetricCard
            title="Charge Controller State"
            metrics={[
              { icon: 'chart-bar', label: 'Charge Voltage:', value: chargeControllerState.LoadCurrent, unit: 'A' },
              { icon: 'chart-bar', label: 'Charge Current:', value: chargeControllerState.LoadWatt, unit: 'W' },
              { icon: 'chart-bar', label: 'Battery Voltage:', value: chargeControllerState.Batt_Voltage / 100, unit: 'V' },
              { icon: 'chart-bar', label: 'Battery Current:', value: chargeControllerState.PV_Current, unit: 'A' },
              { icon: 'chart-bar', label: 'Battery Power:', value: chargeControllerState.PV_Watt, unit: 'W' },
              { icon: 'chart-bar', label: 'Load Current:', value: chargeControllerState.LoadCurrent, unit: 'A' },
              { icon: 'chart-bar', label: 'Load Power:', value: chargeControllerState.LoadWatt, unit: 'W' },
              { icon: 'chart-bar', label: 'Battery Status:', value: chargeControllerState.BatteryStatus },
              { icon: 'chart-bar', label: 'Charging Status:', value: chargeControllerState.ChargingStatus },
              { icon: 'chart-bar', label: 'Discharging Status:', value: chargeControllerState.DischargingStatus },
              { icon: 'chart-bar', label: 'Device Temperature:', value: chargeControllerState.DeviceTemperature / 100, unit: '°C' },
              { icon: 'chart-bar', label: 'PV Voltage:', value: chargeControllerState.PV_Voltage / 100, unit: 'V' },
            ]}
          />
        )}

        {/* Inverter State */}
        {inverterState && (
          <MetricCard
            title="Inverter State"
            metrics={[
              { icon: 'flash', label: 'Load Input Current:', value: inverterState.LoadInputCurrent / 100, unit: 'A' },
              { icon: 'flash', label: 'Load Input Power:', value: inverterState.LoadInputPower / 100, unit: 'W' },
              { icon: 'flash', label: 'Load Output Voltage:', value: inverterState.LoadOutputVoltage / 100, unit: 'V' },
              { icon: 'flash', label: 'Load Output Current:', value: inverterState.LoadOutputCurrent / 100, unit: 'A' },
              { icon: 'flash', label: 'Load Output Power:', value: inverterState.LoadOutputPower, unit: 'W' },
              { icon: 'flash', label: 'Device Temperature:', value: inverterState.DeviceTemperature / 100, unit: '°C' },
              { icon: 'flash', label: 'Heatsink Temperature:', value: inverterState.HeatsinkTemperature / 100, unit: '°C' },
              { icon: 'flash', label: 'Load Status:', value: inverterState.LoadStatus },
              { icon: 'flash', label: 'Version:', value: inverterState.Version },
              { icon: 'flash', label: 'Inverter On:', value: inverterState.InverterOn },
              { icon: 'flash', label: 'Solar Voltage:', value: inverterState.SolarVoltage / 1000, unit: 'V' },
              { icon: 'flash', label: 'Solar Current:', value: inverterState.SolarCurrent / 1000, unit: 'A' },
            ]}
          />
        )}
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
});

