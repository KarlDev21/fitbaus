import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { showToast, ToastType } from '../components/Toast';
import { Device } from 'react-native-ble-plx';
import { setConnectedInverter, setConnectedNodes } from '../services/storage';
import { authenticateNode } from '../services/NodeService';
import { Colours } from '../styles/properties/colours';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../helpers/StorageHelper';
import { Battery, Inverter } from '../types/DeviceType';
import { LoadingIndicatorWithText } from '../components/LoadingIndicator';
import { AppScreen } from '../components/AppScreen';
import BatteryCard from '../components/Cards/BatteryCard';
import InverterCard from '../components/Cards/InverterCard';
import { buttonStyles } from '../styles/components/buttonStyles';
import { Flex, GenericSize, Margin, Padding } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';
import { navigationRefAuthenticated } from '../nav/ScreenDefinitions';

export default function NodeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [authenticatedBatteries, setAuthenticatedBatteries] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedInverter, setSelectedInverter] = useState<Inverter | null>(null);
  const [nodes, setNodes] = useState<Battery[]>([]);

  useEffect(() => {
    //Note: This has changed drastically. Need to check if this is correct
    const loadData = async () => {
      try {
        const inverterData = await getFromStorage('selectedInverter') as Inverter | null;
        if (inverterData) setSelectedInverter(inverterData);

        const nodeData = await getFromStorage('nodes') as Battery[];
        if (nodeData) setNodes(nodeData);
      } catch (error) {
        console.error('Failed to load data', error);
        showToast(ToastType.Error, 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleNode = (nodeId: string) => {
    setSelectedBatteries((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  //Note this has changed drastically. Need to check if this is correct
  const handleAuthenticate = async () => {
    if (!selectedInverter) {
      showToast(ToastType.Error, 'No inverter selected.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const results: Record<string, boolean> = {};

      for (const nodeId of selectedBatteries) {
        const isAuthenticated = await authenticateNode(nodeId);
        results[nodeId] = isAuthenticated;
      }

      setAuthenticatedBatteries(results);

      const successCount = Object.values(results).filter(Boolean).length;
      const failureCount = selectedBatteries.length - successCount;

      if (successCount === selectedBatteries.length) {
        showToast(ToastType.Success, 'All Batteries authenticated successfully!');
      } else if (failureCount === selectedBatteries.length) {
        showToast(ToastType.Error, 'No Batteries authenticated successfully!');
      } else {
        showToast(ToastType.Error, 'Some Batteries failed authentication!');
      }
    } catch (error) {
      showToast(ToastType.Error, 'An error occurred during authentication.');
    } finally {
      setIsAuthenticating(false);
      setShowResults(true);
    }
  };

  const handleContinue = async () => {
    const authenticatedNodeIds = Object.entries(authenticatedBatteries)
      .filter(([_, isAuthenticated]) => isAuthenticated)
      .map(([id]) => id);

    // Ensure all selected batteries are authenticated
    if (authenticatedNodeIds.length !== selectedBatteries.length) {
      showToast(ToastType.Error, 'Please authenticate all batteries before continuing!');
      return;
    }

    try {
      // Map authenticated node IDs to their corresponding node objects
      const authenticatedNodes = authenticatedNodeIds
        .map((id) => nodes.find((node) => node.id === id))
        .filter((node): node is Device => node !== undefined);

      saveToStorage(STORAGE_KEYS.SELECTED_NODES, JSON.stringify(authenticatedNodes));

      if (selectedInverter) {
        setConnectedInverter(selectedInverter);
        setConnectedNodes(authenticatedNodes, selectedInverter);
      }

      navigationRefAuthenticated.navigate('Finalizing');
    } catch (error) {
      showToast(ToastType.Error, 'An error occurred while saving authenticated batteries.');
    }
  };

  if (isLoading) {
    return <LoadingIndicatorWithText text={'Loading batteries...'} />;
  }

  return (
    <AppScreen>
      {/* Header with back button and title */}
      <View style={styles.header}>
        {/* <IconButton icon="account-arrow-left-outline" size={24} onPress={() => navigation.goBack()} /> */}
        <Text variant="titleLarge" style={textStyles.title}>
          Select Batteries
        </Text>
      </View>

      {/* Display the selected inverter */}
      {selectedInverter && <InverterCard inverter={selectedInverter} />}

      {/* List of batteries with selection and authentication status */}
      <FlatList
        data={nodes}
        renderItem={({ item }) => (
          <BatteryCard
            battery={item}
            isSelected={selectedBatteries.includes(item.id)}
            isAuthenticated={authenticatedBatteries[item.id]}
            showAuthResult={showResults}
            onToggle={() => handleToggleNode(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Buttons for authentication and continuation */}
      <View style={styles.buttonContainer}>
        {!showResults ? (
          <Button
            mode="contained"
            onPress={handleAuthenticate}
            disabled={selectedBatteries.length === 0 || isAuthenticating}
            style={buttonStyles.primaryButton}
            labelStyle={buttonStyles.buttonLabel}
          >
            {isAuthenticating ? 'Authenticating...' : 'Authenticate Batteries'}
            {isAuthenticating && <ActivityIndicator size={GenericSize.medium} color="#fff" style={{ marginLeft: Margin.small }} />}
          </Button>
        ) : (
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={() => {
                setShowResults(false);
              }}
              style={[buttonStyles.primaryButton, styles.outlineButton]}
              labelStyle={buttonStyles.buttonLabel}

            >
              Change Selection
            </Button>
            <Button
              mode="contained"
              onPress={handleContinue}
              disabled={Object.values(authenticatedBatteries).filter(Boolean).length === 0}
              style={[buttonStyles.primaryButton, styles.outlineButton]}
              labelStyle={buttonStyles.buttonLabel}

            >
              Continue
            </Button>
          </View>
        )}
      </View>
    </AppScreen >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: Flex.xsmall,
    backgroundColor: Colours.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Padding.small,
    paddingVertical: Padding.medium,
  },
  listContent: {
    padding: Padding.medium,
    paddingBottom: Padding.large,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Padding.medium,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',

  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outlineButton: {
    flex: Flex.xsmall,
    marginRight: Margin.small,
  },

});