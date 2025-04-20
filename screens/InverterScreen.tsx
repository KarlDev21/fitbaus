/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppStackParamList } from '../nav/AppNavigation';
import { showToast, ToastType } from '../components/Toast';
import { getInverters, setSelectedInverter } from '../services/storage';
import { Device } from 'react-native-ble-plx';
import { connectToInverter } from '../services/InverterService';
import { Inverter } from '../types/DeviceType';
import { Colours } from '../styles/properties/colours';
import { AppScreen } from '../components/AppScreen';
import { useNavigation } from '@react-navigation/native';

type InverterScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Devices'>

interface InverterScreenProps {
  navigation: InverterScreenNavigationProp,
}

export default function InverterScreen({ navigation }: InverterScreenProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [inverters, setInverters] = useState<Inverter[]>([]);

  useEffect(() => {
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
    try {
      setSelectedInverter(inverter);
      showToast(ToastType.Success, 'Inverter selected successfully!');
      await connectToInverter(inverter);
      navigation.navigate('Nodes');
    } catch (error) {
      showToast(ToastType.Error, 'Failed to select inverter, please try again');
      console.error('Failed to save selected inverter', error);
    }
  };

  const renderInverterItem = ({ item }: { item: Device }) => (
    <Card style={styles.inverterCard} onPress={() => handleSelectInverter(item)}>
      <Card.Content style={styles.inverterContent}>
        <View style={[styles.iconContainer, { backgroundColor: Colours.secondary + '20' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colours.secondary} />
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
    <AppScreen>

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
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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

