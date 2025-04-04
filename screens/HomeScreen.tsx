'use client';

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../nav/CreateStackNavigation';
import { showToast, ToastType } from '../components/Toast';
import { scanDevices } from '../services/BluetoothLowEnergyService';
import { clearConnectedInverter, getConnectedInverter, setDevices } from '../services/storage';
import { connectToInverter } from '../services/InverterService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const savedInverter = getConnectedInverter();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const checkConnection = async ()=> {
      const connection = await savedInverter?.isConnected();
        if(connection){
          setIsConnected(connection);
        }
      };

    checkConnection();
  }, [isConnected,savedInverter]);

  const handleScan = async ()  => {
      // clearConnectedInverter();
      setIsScanning(true);
      const {inverters, nodes} = await scanDevices();
      nodes.forEach((node) => {
        console.log('Node:', node.name, node.id);
      });

      console.log('check scan' + inverters.length + nodes.length);
      const batteriesScanned = nodes.length > 0;
      const invertersScanned = inverters.length > 0;
      var errorMessage = '';

      const getErrorMessage = () => {
        if (!batteriesScanned && !invertersScanned) {
          errorMessage =  'No Batteries or Inverters found. Please try scanning again.';
        } else if (!batteriesScanned) {
          errorMessage = 'No Batteries found. Please try scanning again.';
        } else if (!invertersScanned) {
          errorMessage = 'No Inverters found. Please try scanning again.';
        }

        return errorMessage;
      };

      setIsScanning(false);
      if(getErrorMessage() !== ''){
        showToast(ToastType.Error, errorMessage);
      }
      else{
        console.log('Inverters:', inverters);
        console.log('Nodes:', nodes);
        setDevices(Array.from(nodes.values()), Array.from(inverters.values()));
        navigation.navigate('Inverters');
      }
  };

  const handleConnect = async () => {
    console.log("Checking connection...");
  
    setIsConnecting(true);
  
    if (savedInverter) {
      // Create a timeout that will trigger if connection takes too long
      // const timeoutDuration = 10000; // 10 seconds
      let timeoutReached = false;
  
      // const timeoutPromise = new Promise((resolve) => {
      //   setTimeout(() => {
      //     timeoutReached = true;
      //     showToast(ToastType.Error, 'Connection Timeout: Inverter did not respond');
      //     setIsConnecting(false);
      //     resolve(null); // Ensure the Promise resolves
      //   }, timeoutDuration);
      // });
  
      // Attempt to connect, race it against the timeout
      // const connection = await Promise.race([, timeoutPromise]);
      const connection = await connectToInverter(savedInverter)
      // If timeout happened, exit early
      if (timeoutReached) {
        setIsConnecting(false);
        return;
      }
  
      console.log('Connected to Inverter:', connection);
  
      if (connection) {
        setIsConnected(true);
        showToast(ToastType.Success, 'Connected to Inverter');
      } else {
        showToast(ToastType.Error, 'Connection to Inverter Failed');
      }
  
      setIsConnecting(false);
    }
  };
  

  // const handleConnect = async () => {
  //   console.log("checking stuff")
  //   setIsConnecting(true);
  //   if (savedInverter) {
  //     const connection = await connectToInverter(savedInverter);
  //     console.log('Connected to Inverter:', connection);
  //     if(connection){
  //       setIsConnected(true);
  //       showToast(ToastType.Success, 'Connected to Inverter');
  //     }  else{
  //       showToast(ToastType.Error, 'Connection to Inverter Failed');
  //     }
  //     setIsConnecting(false);
  //   }
  // };

  const handleInverterClick = () => {
    if (savedInverter) {
      navigation.navigate('Dashboard', { inverter: savedInverter })
    }
  };

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
                </>
              ) : (
                'Scan for Inverters'
              )}
            </Button>
          </Card.Content>
        </Card>

        {savedInverter && (
          <Card style={styles.card} onPress={handleInverterClick}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Saved Inverters
              </Text>
              <View style={styles.inverterRow}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + "20" }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.inverterInfo}>
                  <Text variant="bodyLarge" style={styles.inverterName}>
                    {savedInverter.name + " " + savedInverter.id }
                  </Text>
                  <Text variant="bodySmall" style={styles.inverterStatus}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Text>

                  {!isConnected && (
                    <Button
                      mode="contained"
                      onPress={handleConnect}
                      style={styles.button}
                      labelStyle={styles.buttonLabel}
                      >
                      {isConnecting ? (
                      <>
                      <ActivityIndicator size={16} color="#fff" />
                      </>
                      ) : (
                        'Reconnect'
                      )}
                    </Button>
                  )}
                  <View style={{ height: 8 }} />
                
                  {/* <Button
                    mode="contained"
                    onPress={handleConnect}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                  >
                    Connect
                  </Button> */}
                  <View style={{ height: 8 }} />
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

