"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { Card, Text, Appbar, useTheme, Divider } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import type { RouteProp } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { RootStackParamList } from '../nav/CreateStackNavigation';
import { BatteryData } from "../types/bleTypes"
import { fetchAndLogBatteryData, fetchAndLogBatteryInfo, fetchAndLogInverterStatus } from "../services/InverterService"
import { getConnectedInverter, getConnectedNodes } from "../services/storage"

type NodeInfoScreenRouteProp = RouteProp<RootStackParamList, "NodeInfo">

interface NodeInfoScreenProps {
  navigation: NodeInfoScreenRouteProp
}

export default function NodeInfoScreen({ navigation }: NodeInfoScreenProps) {
  const [batteryData, setBatteryData] = useState<{
    Current: number;
    RemainCapacity: number;
    TotalCapacity: number;
    CycleLife: number;
    ProductLife: number;
    BalanceStatusLow: number;
    BalanceStatusHigh: number;
    ProtectionStatus: number;
    Version: number;
    RSOC: number;
    FetStatus: number;
    CellInSeries: number;
    N_NTC: number;
  }>()
  const [isLoading, setIsLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    const loadBatteryData = async () => {
      try {
        const inverter = await getConnectedInverter();
        if(inverter){
            const node = await getConnectedNodes(inverter);
            if(node){
                const data = await fetchAndLogBatteryData(node[0], inverter);
                if(data){
                setBatteryData({
                    Current: data.Current,
                    RemainCapacity: data.RemainCapacity,
                    TotalCapacity: data.TotalCapacity,
                    CycleLife: data.CycleLife,
                    ProductLife: data.ProductLife,
                    BalanceStatusLow: data.BalanceStatusLow,
                    BalanceStatusHigh: data.BalanceStatusHigh,
                    ProtectionStatus: data.ProtectionStatus,
                    Version: data.Version,
                    RSOC: data.RSOC,
                    FetStatus: data.FetStatus,
                    CellInSeries: data.CellInSeries,
                    N_NTC: data.N_NTC,
                })
            }
            }

        }

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load battery data", error)
        setIsLoading(false)
      }
    }

    loadBatteryData()
  })

  // Helper function to get battery status color based on RSOC
  const getBatteryStatusColor = (rsoc: number) => {
    if (rsoc >= 80) return "#4CAF50" // Green
    if (rsoc >= 50) return "#FFC107" // Yellow
    if (rsoc >= 20) return "#FF9800" // Orange
    return "#F44336" // Red
  }

  // Helper function to get battery icon based on RSOC
  const getBatteryIcon = (rsoc: number) => {
    if (rsoc >= 80) return "battery-high"
    if (rsoc >= 50) return "battery-medium"
    if (rsoc >= 20) return "battery-low"
    return "battery-outline"
  }

  // Helper function to render a data row
  const renderDataRow = (label: string, value: string | number, unit = "") => (
    <View style={styles.dataRow}>
      <Text variant="bodyMedium" style={styles.dataLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.dataValue}>
        {value}
        {unit}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        {/* <Appbar.BackAction onPress={() => navigation.goBack()} /> */}
        {/* <Appbar.Content title={`Battery ${batteryId}`} /> */}
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading battery data...</Text>
        </View>
      ) : batteryData ? (
        <ScrollView style={styles.scrollView}>
          <Card style={styles.batteryCard}>
            <Card.Content>
              <View style={styles.batteryHeader}>
                <View
                  style={[styles.iconContainer, { backgroundColor: getBatteryStatusColor(batteryData.RSOC) + "20" }]}
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

          <Card style={styles.detailsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Battery Details
              </Text>

              {renderDataRow("Current", batteryData.Current, " A")}
              <Divider style={styles.divider} />

              {renderDataRow("Remaining Capacity", batteryData.RemainCapacity, " Ah")}
              <Divider style={styles.divider} />

              {renderDataRow("Total Capacity", batteryData.TotalCapacity, " Ah")}
              <Divider style={styles.divider} />

              {renderDataRow("Cycle Life", batteryData.CycleLife, " cycles")}
              <Divider style={styles.divider} />

              {renderDataRow("Product Life", batteryData.ProductLife, " cycles")}
              <Divider style={styles.divider} />

              {renderDataRow("Balance Status Low", batteryData.BalanceStatusLow)}
              <Divider style={styles.divider} />

              {renderDataRow("Balance Status High", batteryData.BalanceStatusHigh)}
              <Divider style={styles.divider} />

              {renderDataRow("Protection Status", batteryData.ProtectionStatus)}
              <Divider style={styles.divider} />

              {renderDataRow("Version", batteryData.Version)}
              <Divider style={styles.divider} />

              {renderDataRow("RSOC", batteryData.RSOC, "%")}
              <Divider style={styles.divider} />

              {renderDataRow("FET Status", batteryData.FetStatus)}
              <Divider style={styles.divider} />

              {renderDataRow("Cells in Series", batteryData.CellInSeries)}
              <Divider style={styles.divider} />

              {renderDataRow("Number of NTC", batteryData.N_NTC)}
            </Card.Content>
          </Card>

          <View style={styles.spacer} />
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load battery data</Text>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
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
    flexDirection: "row",
    alignItems: "center",
  },
  batteryHeaderInfo: {
    marginLeft: 16,
  },
  batteryTitle: {
    fontWeight: "bold",
  },
  batteryStatus: {
    fontWeight: "500",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  dataLabel: {
    flex: 1,
    fontWeight: "500",
  },
  dataValue: {
    fontWeight: "bold",
  },
  divider: {
    backgroundColor: "#f0f0f0",
  },
  spacer: {
    height: 20,
  },
})

