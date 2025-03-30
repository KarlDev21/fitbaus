"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { Card, Text, Appbar, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import type { DrawerNavigationProp } from "@react-navigation/drawer"
import type { RouteProp } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { RootStackParamList } from "../nav/CreateStackNavigation"
import { getDashboardData, type DashboardData } from "../services/BluetoothLowEnergyService"
import { Device } from "react-native-ble-plx"
import { getConnectedInverter, getConnectedInverterDevice, getSelectedInverter } from "../services/storage"
import { ChargeControllerState, InverterState } from "../types/bleTypes"
import { getChargeControllerStatus, getInverterStatus } from "../services/InverterService"
import { showToast, ToastType } from "../components/Toast"

type DashboardScreenNavigationProp = DrawerNavigationProp<RootStackParamList, "Dashboard">
type DashboardScreenRouteProp = RouteProp<RootStackParamList, "Dashboard">

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp
  route: DashboardScreenRouteProp
}

export default function DashboardScreen({ navigation, route }: DashboardScreenProps) {
  const [systemData, setSystemData] = useState<DashboardData>({
    batterySoC: 0,
    inverterOutput: 0,
    solarInput: 0,
    temperature: 0,
    kWhGenerated: 0,
    kWhConsumed: 0,
    co2Savings: 0,
    leaseProgress: 0,
    alerts: [],
  })
  const inverterId = route.params.inverter.id;
  const inverter = getConnectedInverterDevice(inverterId);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();


  useEffect(() => {
    const loadData = async () => {
      try {
        console.log( "inverter STUFF"+inverter);
        setTimeout(async ()  =>  {
        if(inverter)
        {
            const ChargeController = await getChargeControllerStatus( inverter );
            const inverterState = await getInverterStatus(inverter);

            if (ChargeController && inverterState) {
              console.log(ChargeController);
              console.log(inverterState);
              setSystemData({
                batterySoC: ChargeController.BatteryStatus,
                inverterOutput: inverterState.LoadOutputPower,
                solarInput: inverterState.SolarVoltage,
                temperature: ChargeController.DeviceTemperature / 100,
                kWhGenerated: inverterState.LoadOutputVoltage,
                kWhConsumed: inverterState.LoadInputVoltage,
                co2Savings: 0,
                leaseProgress: 0,
                alerts: inverterState.LoadStatus > 0 ? ['Inverter Error'] : ['No Alerts'],
              });

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
                    {inverter.name}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {systemData && (
            <Card style={styles.overviewCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Dashboard
                </Text>

                {/* Battery SoC */}
                {renderMetricRow("battery-high", "#4CAF50", "Battery SoC:", systemData.batterySoC, "%")}

                {/* Inverter Output */}
                {renderMetricRow("flash", "#FF9800", "Inverter Output:", systemData.inverterOutput, "V")}

                {/* Solar Input */}
                {renderMetricRow("white-balance-sunny", "#FFC107", "Solar Input:", systemData.solarInput, "W")}

                {/* Temperature */}
                {renderMetricRow("thermometer", "#F44336", "Temperature:", systemData.temperature, "°C")}

                {/* kWh Generated */}
                {renderMetricRow("chart-line", "#2196F3", "kWh Generated:", systemData.kWhGenerated, "kWh")}

                {/* kWh Consumed */}
                {renderMetricRow("lightbulb-on", "#FFC107", "kWh Consumed:", systemData.kWhConsumed, "kWh")}

                {/* CO2 Savings */}
                {renderMetricRow("leaf", "#4CAF50", "CO2:", systemData.co2Savings, "kg/kWh")}

                {/* Lease Progress */}
                {renderMetricRow("cash-multiple", "#8BC34A", "Lease-to-Own Progress:", systemData.leaseProgress, "%")}

                {/* Alerts */}
                {renderMetricRow(
                  "alert-circle",
                  "#F44336",
                  "Alerts:",
                  systemData.alerts.length > 0 ? `${systemData.alerts.length} active` : "No active errors",
                )}
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

