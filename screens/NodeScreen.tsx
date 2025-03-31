'use client';

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator, IconButton, Checkbox, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../nav/CreateStackNavigation';
import { showToast, ToastType } from '../components/Toast';
import { Device } from 'react-native-ble-plx';
import { getNodes, getSelectedInverter, setSelectedNodes } from '../services/storage';
import { authenticateNode } from '../services/NodeService';

type NodeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Nodes'>

interface NodeScreenProps {
  navigation: NodeScreenNavigationProp,
}

export default function NodeScreen({ navigation }: NodeScreenProps) {

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [authenticatedBatteries, setAuthenticatedBatteries] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedInverter, setSelectedInverter] = useState<Device | null>(null);
  const [nodes, setNodes] = useState<Device[]>([]);
  const theme = useTheme();

  useEffect(() => {
    // Get selected inverter from AsyncStorage
    const loadSelectedInverter = async () => {
      try {

        const inverterData = getSelectedInverter();
        if (inverterData) {
          setSelectedInverter(inverterData);
        }

        // Simulate loading time for batteries
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load selected inverter', error);
        setIsLoading(false);
      }
    };

    const loadNodes = async () => {
      try {

        const NodeData = getNodes();
        if (NodeData) {
          setNodes(NodeData);
        }

        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        showToast(ToastType.Error, 'Failed to load Batteries inverter');
        setIsLoading(false);
      }
    };

    loadSelectedInverter();
    loadNodes();
  }, []);

  const handleToggleNode = (nodeId: string) => {
    setSelectedBatteries((prev) => {
      if (prev.includes(nodeId)) {
        return prev.filter((id) => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  };

  const handleAuthenticate = () => {

    setIsAuthenticating(true);

      const results: Record<string, boolean> = {};

      // Simulate some batteries authenticating successfully and others failing
      selectedBatteries.forEach( async (nodeId) => {
        if (selectedInverter) {

          const response = await authenticateNode(nodeId);
          console.log('Authentication Response:', response);
          if(response){
            results[nodeId] = response;
          }
          console.log(results);
        }
      });

      setTimeout(() => {
        setAuthenticatedBatteries(results);
        console.log('Authenticated Batteries:', results);
        console.log(Object.keys(authenticatedBatteries).length);
        console.log(selectedBatteries.length);

        if(Object.keys(results).length === selectedBatteries.length){
          showToast(ToastType.Success, 'All Batteries authenticated successfully!');
        }
        else if (Object.keys(results).length) {
          showToast(ToastType.Error, 'No Batteries authenticated successfully!');
        }
        else{
          showToast(ToastType.Error, 'Some Batteries failed authentication!');
        }
        setIsAuthenticating(false);
        setShowResults(true);
      }, 3000);


  };

  const handleContinue = async () => {
    // Store authenticated batteries in AsyncStorage
    const authenticatednodeIds = Object.entries(authenticatedBatteries)
      .filter(([_, isAuthenticated]) => isAuthenticated)
      .map(([id]) => id);

      if(authenticatednodeIds.length !== selectedBatteries.length){
        showToast(ToastType.Error, 'Please Authenticate All Batteries before continuing!');
        return;
      }

    try {
      setSelectedNodes(authenticatednodeIds.map((id) => nodes.find((node) => node.id === id)).filter((node): node is Device => node !== undefined));

      if (selectedInverter) {
        setSelectedInverter(selectedInverter);
      }

      // Navigate to final authentication screen for inverter auth and node enrollment
      navigation.navigate('Finalizing');
    } catch (error) {
      console.error('Failed to save authenticated batteries', error);
    }
  };

  const renderBatteryItem = ({ item }: { item: Device }) => {
    console.log('Selected Battery:', item.id);
    const isSelected = selectedBatteries.includes(item.id);
    const isAuthenticated = authenticatedBatteries[item.id];
    const showAuthResult = showResults && isSelected;

    const cardStyle = [styles.batteryCard];
    let statusIcon = null;

    if (showAuthResult) {
      if (isAuthenticated) {
        cardStyle.push( styles.authenticatedCard);
        statusIcon = <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" style={styles.statusIcon} />
      } else {
        cardStyle.push(styles.failedCard);
        statusIcon = <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" style={styles.statusIcon} />
      }
    } else if (isSelected) {
      cardStyle.push({
          borderColor: theme.colors.primary,
          marginBottom: 0,
          borderWidth: 0,
      });
    }

    return (
      <Card style={cardStyle}>
        <Card.Content style={styles.batteryContent}>
          <View style={styles.batteryRow}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <MaterialCommunityIcons name="battery" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.batteryInfo}>
              <Text variant="bodyLarge" style={styles.batteryName}>
                {item.name + ' ' + item.id}
              </Text>
            </View>

            {statusIcon}

            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => handleToggleNode(item.id)}
              color={theme.colors.secondary}
            />
          </View>
        </Card.Content>
      </Card>
    )
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="account-arrow-left-outline" size={24} onPress={() => navigation.goBack()} />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Select Batteries
        </Text>
      </View>

      {selectedInverter && (
        <Card style={styles.inverterCard}>
          <Card.Content style={styles.inverterContent}>
            <View style={[styles.smallIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color={theme.colors.primary} />
            </View>
            <View>
              <Text variant="bodySmall" style={styles.inverterLabel}>
                Selected Inverter
              </Text>
              <Text variant="bodyMedium">{selectedInverter.name + ' '+ selectedInverter.id}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={32} color={theme.colors.primary} style={styles.loader} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading batteries...
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={nodes}
            renderItem={renderBatteryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.buttonContainer}>
            {!showResults ? (
              <Button
                mode="contained"
                onPress={handleAuthenticate}
                disabled={selectedBatteries.length === 0 || isAuthenticating}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                {isAuthenticating ? 'Authenticating...' : 'Authenticate Batteries'}
                {isAuthenticating && <ActivityIndicator size={16} color="#fff" style={{ marginLeft: 8 }} />}
              </Button>
            ) : (
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowResults(false);
                  }}
                  style={[styles.button, styles.outlineButton]}
                >
                  Change Selection
                </Button>
                <Button
                  mode="contained"
                  onPress={handleContinue}
                  disabled={Object.values(authenticatedBatteries).filter(Boolean).length === 0}
                  style={[styles.button, styles.primaryButton]}
                >
                  Continue
                </Button>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inverterCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  inverterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  inverterLabel: {
    color: '#666',
    fontWeight: '500',
  },
  smallIconContainer: {
    padding: 8,
    borderRadius: 50,
    marginRight: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for button at bottom
  },
  batteryCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  authenticatedCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  failedCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  batteryContent: {
    padding: 8,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
    borderRadius: 50,
    marginRight: 12,
  },
  batteryInfo: {
    flex: 1,
  },
  batteryName: {
    fontWeight: '500',
  },
  batteryLevel: {
    color: '#666',
  },
  statusIcon: {
    marginRight: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
});

