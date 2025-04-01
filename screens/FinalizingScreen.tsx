"use client"

import React, { useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { Text, ActivityIndicator, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../nav/CreateStackNavigation"
import { authenticateInverter } from "../services/InverterService"
import { getSelectedInverter, getSelectedNodes, setConnectedInverter, setConnectedInverterDevice } from "../services/storage"

type FinalizingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Finalizing">

interface FinalizingScreenProps {
  navigation: FinalizingScreenNavigationProp
}

export default function FinalizingScreen({ navigation }: FinalizingScreenProps) {
  const theme = useTheme()

  useEffect(() => {
    // Simulate final authentication and setup process
    const timer = setTimeout(() => {
      // Navigate back to home page after completion

      const selectedInverter = getSelectedInverter();
      const selectedNodes = getSelectedNodes();

      if (selectedInverter && selectedNodes) {
        console.log('Inverter Authing');
        authenticateInverter(selectedInverter, selectedNodes);
        setConnectedInverterDevice(selectedInverter);//difference is that this one needs and id when getting
        setConnectedInverter(selectedInverter); // this only saves one inverter currently
      }


      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size={48} color={theme.colors.primary} style={styles.loader} />
        <Text variant="headlineSmall" style={styles.title}>
          Finalizing Connection
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          Please wait while we complete the authentication process and establish the connection...
        </Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loader: {
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    color: "#666",
    maxWidth: 300,
  },
})

