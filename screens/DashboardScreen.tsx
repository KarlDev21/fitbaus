"use client"

import React, { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { Card, Text, Appbar, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import type { DrawerNavigationProp } from "@react-navigation/drawer"
import type { RouteProp } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { RootStackParamList } from "../nav/CreateStackNavigation"
import { getConnectedInverterDevice, getSelectedNodes } from "../services/storage"
import { fetchAndLogBatteryInfo, fetchAndLogChargeControllerStatus, fetchAndLogInverterStatus, getChargeControllerStatus, getInverterStatus } from "../services/InverterService"
import { showToast, ToastType } from "../components/Toast"
import { BatteryData, BatteryInfo, ChargeControllerState, InverterState } from "../types/bleTypes"

type DashboardScreenNavigationProp = DrawerNavigationProp<RootStackParamList, "Dashboard">
type DashboardScreenRouteProp = RouteProp<RootStackParamList, "Dashboard">

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp
  route: DashboardScreenRouteProp
}

export default function DashboardScreen({ navigation, route }: DashboardScreenProps) {
  // const [systemData, setSystemData] = useState<DashboardData>({
  //   batterySoC: 0,
  //   inverterOutput: 0,
  //   solarInput: 0,
  //   temperature: 0,
  //   kWhGenerated: 0,
  //   kWhConsumed: 0,
  //   co2Savings: 0,
  //   leaseProgress: 0,
  //   alerts: [],
  // });

  const [chargeControllerState, setChargeControllerState ] = useState<ChargeControllerState>({
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

  const [nodeDataList, setNodeDataList] = useState<BatteryInfo[]>({
    TotalVoltage: 0,
    Current: 0,
    RemainCapacity: 0,
    TotalCapacity: 0,
    CycleLife: 0,
    ProductLife: 0,
    BalanceStatusLow: 0,
    BalanceStatusHigh: 0,
    ProtectionStatus: 0,
    Version: 0,
    RSOC: 0,
    FetStatus: 0,
    CellInSeries: 0,
    N_NTC: 0, 
  });

  const inverterId = route.params.inverter.id;
  const inverter = getConnectedInverterDevice(inverterId);
  const nodes = getSelectedNodes();
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();


  useEffect(() => {
    const loadData = async () => {
      try {

        setTimeout(async ()  =>  {
        if(inverter && nodes)
        {
            const ChargeController = await fetchAndLogChargeControllerStatus( inverter );
            const inverterState = await fetchAndLogInverterStatus(inverter);
            let nodeDataList : BatteryInfo[] = []
            if (ChargeController && inverterState) {
              console.log(ChargeController);
              console.log(inverterState);

              setChargeControllerState(ChargeController);
              setInverterState(inverterState);

              // nodes.forEach(async(node) => {
              //   const batteryData = await fetchAndLogBatteryInfo( node, inverter);
              //   if(batteryData){
              //     nodeDataList.push(batteryData);
              //   }
              // });

              // setNodeDataList(nodeDataList);
              // setSystemData({
              //   batterySoC: ChargeController.BatteryStatus,
              //   inverterOutput: inverterState.LoadOutputPower,
              //   solarInput: inverterState.SolarVoltage,
              //   temperature: ChargeController.DeviceTemperature / 100,
              //   kWhGenerated: inverterState.LoadOutputVoltage,
              //   kWhConsumed: inverterState.LoadInputVoltage,
              //   co2Savings: 0,
              //   leaseProgress: 0,
              //   alerts: inverterState.LoadStatus > 0 ? ['Inverter Error'] : ['No Alerts'],
              // });
            }
            setIsLoading(false);
          }
          else{
            showToast(ToastType.Error, 'Failed to load dashboard data. Please try again.');
          }
      }, 3000);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        setIsLoading(false);
      }
    };

    loadData();
  });

  // Helper function to render a metric row with icon
  const renderMetricRow = (icon: string, iconColor: string, label: string, value: string | number, unit = "") => (
    <View style={styles.metricRow}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text variant="bodyMedium" style={styles.metricLabel}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={styles.metricValue}>
        {value}
        {unit}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate("Home")} />
        <Appbar.Content title="System Dashboard" />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {inverter && (
            <Card style={styles.inverterCard}>
              <Card.Content>
                <View style={styles.inverterHeader}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
                  <Text variant="titleLarge" style={styles.inverterTitle}>
                    {'Inverter ' + inverter.id}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
 
          {/* Charge Controller State */}
          {chargeControllerState && (
            <Card style={styles.overviewCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Charge Controller State
                </Text>

                {/* Add metrics related to charge controller state here */}
                {renderMetricRow("chart-bar", "#03A9F4", "Charge Voltage:", chargeControllerState.LoadCurrent, "A")}
                {renderMetricRow("chart-bar", "#03A9F4", "Charge Current:", chargeControllerState.LoadWatt, "W")}
                {renderMetricRow("chart-bar", "#03A9F4", "Battery Voltage:", chargeControllerState.Batt_Voltage / 100, "V")}
                {renderMetricRow("chart-bar", "#03A9F4", "Battery Current:", chargeControllerState.PV_Current, "A")}
                {renderMetricRow("chart-bar", "#03A9F4", "Battery Power:", chargeControllerState.PV_Watt, "W")}
                {renderMetricRow("chart-bar", "#03A9F4", "Load Current:", chargeControllerState.LoadCurrent, "A")}
                {renderMetricRow("chart-bar", "#03A9F4", "Load Power:", chargeControllerState.LoadWatt, "W")}
                {renderMetricRow("chart-bar", "#03A9F4", "Battery Status:", chargeControllerState.BatteryStatus )}
                {renderMetricRow("chart-bar", "#03A9F4", "Charging Status:", chargeControllerState.ChargingStatus )}
                {renderMetricRow("chart-bar", "#03A9F4", "Discharging Status:", chargeControllerState.DischargingStatus)}
                {renderMetricRow("chart-bar", "#03A9F4", "Device Temperature:", chargeControllerState.DeviceTemperature / 100, "°C")}
                {renderMetricRow("chart-bar", "#03A9F4", "PV Voltage:", chargeControllerState.PV_Voltage / 100, "V")}
              </Card.Content>
            </Card>
          )}

          {/* Inverter State */}
          {inverterState && (
            <Card style={styles.overviewCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Inverter State
                </Text>
                {renderMetricRow("flash", "#FF9800", "Load Input Current:", inverterState.LoadInputCurrent / 100, "A")}
                {renderMetricRow("flash", "#FF9800", "Load Input Power:", inverterState.LoadInputPower / 100, "W")}
                {renderMetricRow("flash", "#FF9800", "Load Output Voltage:", inverterState.LoadOutputVoltage / 100 , "V")}
                {renderMetricRow("flash", "#FF9800", "Load Output Current:", inverterState.LoadOutputCurrent / 100, "A")}
                {renderMetricRow("flash", "#FF9800", "Load Output Power:", inverterState.LoadOutputPower, "W")}
                {renderMetricRow("flash", "#FF9800", "Device Temperature:", inverterState.DeviceTemperature / 100, "°C")}
                {renderMetricRow("flash", "#FF9800", "Heatsink Temperature:", inverterState.HeatsinkTemperature / 100, "°C")}
                {renderMetricRow("flash", "#FF9800", "Load Status:", inverterState.LoadStatus)}
                {renderMetricRow("flash", "#FF9800", "Version:", inverterState.Version )}
                {renderMetricRow("flash", "#FF9800", "Inverter On:", inverterState.InverterOn )}
                {renderMetricRow("flash", "#FF9800", "Solar Voltage:", inverterState.SolarVoltage / 1000, "V")}
                {renderMetricRow("flash", "#FF9800", "Solar Current:", inverterState.SolarCurrent / 1000 , "A")}
              </Card.Content>
            </Card>
          )}

          <View style={styles.spacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  inverterCard: {
    marginBottom: 16,
    elevation: 2,
  },
  inverterHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  inverterTitle: {
    fontWeight: "bold",
    marginLeft: 8,
  },
  overviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metricLabel: {
    flex: 1,
    fontWeight: "500",
  },
  metricValue: {
    fontWeight: "bold",
  },
  spacer: {
    height: 20,
  },
})

