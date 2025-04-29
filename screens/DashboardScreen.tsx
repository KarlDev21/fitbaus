import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getConnectedInverterDevice, getConnectedNodes } from '../services/storage';
import { fetchAndLogBatteryInfo, fetchAndLogChargeControllerStatus, fetchAndLogInverterStatus } from '../services/InverterService';
import { showToast, ToastType } from '../components/Toast';
import { BatteryData, BatteryInfo, ChargeControllerState, InverterState } from '../types/BleTypes';
import { Colours } from '../styles/properties/colours';
import { AppScreen } from '../components/AppScreen';
import { BatteryDetailsCard } from '../components/Cards/BatteryDetailsCard';
import { Flex } from '../styles/properties/dimensions';
import { uploadInverterAndBatteryDataAsync } from '../services/DeviceUnitService';
import { AuthenticatedScreenDefinitions, navigationRefAuthenticated } from '../nav/ScreenDefinitions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function DashboardScreen(props: NativeStackScreenProps<AuthenticatedScreenDefinitions, 'Dashboard'>) {
  const inverterId = props.route.params.inverter.id;
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
  const [nodeDataList, setNodeDataList] = useState<BatteryInfo[]>([]);

  useEffect(() => {


    const loadData = async () => {
      try {
        console.log("loaded inverter")
        console.log(inverter)

        if (inverter) {
          const chargeControllerInfo = await fetchAndLogChargeControllerStatus(inverter);
          const inverterState = await fetchAndLogInverterStatus(inverter);

          if (chargeControllerInfo && inverterState) {

            setChargeControllerState(chargeControllerInfo);
            setInverterState(inverterState);

            const nodes = getConnectedNodes(inverter);
            if (nodes && nodes.length > 0) {
              setConnectedNodeIds(nodes.map((node) => node.id));

              const batteryInfoList = await Promise.all(
                nodes.map(async (node) => {
                  const batteryInfo = await fetchAndLogBatteryInfo(node, inverter);
                  return batteryInfo; // can be null, will be filtered
                })
              );

              const validBatteryInfo = batteryInfoList.filter(Boolean) as BatteryInfo[];
              setNodeDataList(validBatteryInfo);

              //TODO: Send Request here to post the battery data
              // await uploadInverterAndBatteryDataAsync(inverterState, validBatteryInfo);
            }

            setIsLoading(false);
          }
        }
        else {
          showToast(ToastType.Error, 'No Inverter found.');
          setIsLoading(false);
        }
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

  return (
    <AppScreen isLoading={isLoading}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigationRefAuthenticated.navigate('Home')} />
        <Appbar.Content title="System Dashboard" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} >

        <Card style={styles.batteryCard}>
          <Card.Content>
            <View style={styles.batteryHeader}>
              <View
                style={[styles.iconContainer, { backgroundColor: getBatteryStatusColor(inverterState.HeatsinkTemperature / 100) + '20' }]}
              >
                <MaterialCommunityIcons
                  name={'temperature-celsius'}
                  size={32}
                  color={getBatteryStatusColor(inverterState.HeatsinkTemperature / 100)}
                />
              </View>
              <View style={styles.batteryHeaderInfo}>
                <Text variant="titleLarge" style={styles.batteryTitle}>
                  Inverter Temperature
                </Text>
                <Text
                  variant="bodyLarge"
                  style={[styles.batteryStatus, { color: getBatteryStatusColor(inverterState.HeatsinkTemperature / 100) }]}
                >
                  {inverterState.HeatsinkTemperature / 100}°C
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.batteryCard}>
          <Card.Content>
            <View style={styles.batteryHeader}>
              <View
                style={[styles.iconContainer, { backgroundColor: getBatteryStatusColor(inverterState.HeatsinkTemperature / 100) + '20' }]}
              >
                <MaterialCommunityIcons
                  name={'power-plug'}
                  size={32}
                  color={Colours.primary}
                />
              </View>
              <View style={styles.batteryHeaderInfo}>
                <Text variant="titleLarge" style={styles.batteryTitle}>
                  Inverter Output
                </Text>
                <Text
                  variant="bodyLarge"
                  style={styles.batteryStatus}
                >
                  {inverterState.LoadOutputVoltage / 100}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        {nodeDataList.length === 0 && <Text >No battery data available.</Text>}
        {nodeDataList.map((data, index) => (
          <BatteryDetailsCard key={index} batteryInfo={data} />
        ))}
        <View style={styles.spacer} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: Flex.xsmall,
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
    flex: Flex.xsmall,
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

