"use client"

import React, { useState, useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { Button, Card, Text, ActivityIndicator, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { RootStackParamList } from "../nav/CreateStackNavigation"
import { showToast, ToastType } from "../components/Toast"
import { scanDevices } from "../services/BluetoothLowEnergyService"

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
}

interface Inverter {
  id: string
  name: string
}

interface BatteryType {
  id: string
  name: string
  level: number
  authenticated?: boolean
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [connectedInverter, setConnectedInverter] = useState<Inverter | null>(null)
  const theme = useTheme()

  useEffect(() => {
    // Check for connected inverter in AsyncStorage on component mount
    const loadConnectedInverter = async () => {
      try {
        const savedInverter = await AsyncStorage.getItem("connectedInverter")
        if (savedInverter) {
          setConnectedInverter(JSON.parse(savedInverter))
        }
      } catch (error) {
        console.error("Failed to load connected inverter", error)
      }
    }
    
    loadConnectedInverter()
  }, [])

  const handleScan = async ()  => {
    setIsScanning(true);
    // const { inverters, nodes } = await scanDevices();
    const {inverters, nodes} = await scanDevices();
    console.log('check' + inverters.length + nodes.length);
    setIsScanning(false);
      const batteriesScanned = nodes.length > 0;
      const invertersScanned = inverters.length > 0;
      var errorMessage = '';

      const getErrorMessage = () => {
        if (!batteriesScanned && !invertersScanned) {
          errorMessage =  "No Batteries or Inverters found. Please try scanning again.";
        } else if (!batteriesScanned) {
          errorMessage = "No Batteries found. Please try scanning again.";
        } else if (!invertersScanned) {
          errorMessage = "No Inverters found. Please try scanning again.";
        }
        return errorMessage;
      };

      if(getErrorMessage() !== ''){
        showToast(ToastType.Error, errorMessage);
      }
      else{

        

        await AsyncStorage.setItem("Inverters", JSON.stringify(inverters));
        await AsyncStorage.setItem("Batteries", JSON.stringify(nodes));
        navigation.navigate("Devices");
      };
  


    //won't need timeout later
    // setTimeout(async () => {
    //   console.log("Checking")

    //   setIsScanning(false)

    //   const batteriesScanned = nodes.size > 0;
    //   const invertersScanned = inverters.size > 0;
    //   var errorMessage = '';

    //   const getErrorMessage = () => {
    //     if (!batteriesScanned && !invertersScanned) {
    //       errorMessage =  "No Batteries or Inverters found. Please try scanning again.";
    //     } else if (!batteriesScanned) {
    //       errorMessage = "No Batteries found. Please try scanning again.";
    //     } else if (!invertersScanned) {
    //       errorMessage = "No Inverters found. Please try scanning again.";
    //     }
    //     return errorMessage;
    //   };

    //   if(getErrorMessage() !== ''){
    //     showToast(ToastType.Error, errorMessage);
    //   }
    //   else{
    //     await AsyncStorage.setItem("Inverters", JSON.stringify(mockInverters));
    //     await AsyncStorage.setItem("Batteries", JSON.stringify(mockBatteries));
    //     navigation.navigate("Devices");
    //   }
    // }, 2500);
  }

  const handleInverterClick = () => {
    if (connectedInverter) {
      navigation.navigate("Dashboard", { inverterId: connectedInverter.id })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Inverter Scanner
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Scan for Inverters
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              Press the button below to start scanning for available inverters in your area.
            </Text>
            <Button
              mode="contained"
              onPress={handleScan}
              disabled={isScanning}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {isScanning ? (
                <>
                  <ActivityIndicator size={16} color="#fff" />
                  {" Scanning..."}
                </>
              ) : (
                "Scan for Inverters"
              )}
            </Button>
          </Card.Content>
        </Card>

        {connectedInverter && (
          <Card style={styles.card} onPress={handleInverterClick}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Connected Inverter
              </Text>
              <View style={styles.inverterRow}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + "20" }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.inverterInfo}>
                  <Text variant="bodyLarge" style={styles.inverterName}>
                    {/* must be a better way to do this, will look into just using this combo as the name */}
                    {connectedInverter.name + ' ' + connectedInverter.id} 
                  </Text>
                  <Text variant="bodySmall" style={styles.inverterStatus}>
                    Connected
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  cardDescription: {
    marginBottom: 16,
    color: "#666",
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
  },
  inverterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 50,
    marginRight: 16,
  },
  inverterInfo: {
    flex: 1,
  },
  inverterName: {
    fontWeight: "500",
  },
  inverterStatus: {
    color: "#666",
  },
  footer: {
    textAlign: "center",
    color: "#666",
    padding: 16,
  },
})

