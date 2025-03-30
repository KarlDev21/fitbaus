'use client';

import React, {useEffect, useState} from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../nav/CreateStackNavigation';
import { showToast, ToastType } from '../components/Toast';
import { getInverters, setSelectedInverter } from '../services/storage';
import { Device } from 'react-native-ble-plx';

type InverterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Devices'>

interface InverterScreenProps {
  navigation: InverterScreenNavigationProp,
}

export default function InverterScreen({ navigation }: InverterScreenProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [inverters, setInverters] = useState<Device[]>([]);

  useEffect(() => {
    // Get selected inverter from AsyncStorage
    const loadInverters = async () => {
      try {
        setIsLoading(true);

        const invertersData = getInverters();
        if (invertersData) {
          setInverters(invertersData);
        }

      } catch (error) {
        showToast(ToastType.Error, 'Error loading inverters, please try again');
        setIsLoading(false);
      }
    };

    loadInverters();
  }, []);

  const handleSelectInverter = async (inverter: Device) => {
    // Store selected inverter in AsyncStorage for the flow
    try {
      setSelectedInverter(inverter);
      showToast(ToastType.Success, 'Inverter selected successfully!');
      navigation.navigate('Nodes');
    } catch (error) {
      console.error('Failed to save selected inverter', error);
    }
  };

  const renderInverterItem = ({ item }: { item: Device }) => (
    <Card style={styles.inverterCard} onPress={() => handleSelectInverter(item)}>
      <Card.Content style={styles.inverterContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.inverterInfo}>
          <Text variant="bodyLarge" style={styles.inverterName}>
            {item.name + ' ' + item.id}
          </Text>
          <Text variant="bodySmall" style={styles.inverterStatus}>
            Tap to select
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="camera" size={24} onPress={() => navigation.goBack()} />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Available Inverters
        </Text>
      </View>
        <FlatList
          data={inverters}
          renderItem={renderInverterItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
    </SafeAreaView>
  );
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
    marginLeft: 20,
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
  },
  inverterCard: {
    marginBottom: 12,
    elevation: 1,
  },
  inverterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 50,
    marginRight: 16,
  },
  inverterInfo: {
    flex: 1,
  },
  inverterName: {
    fontWeight: '500',
  },
  inverterStatus: {
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
});

