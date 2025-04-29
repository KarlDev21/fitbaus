/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showToast, ToastType } from '../components/Toast';
import { getInverters, setSelectedInverter } from '../services/storage';
import { Device } from 'react-native-ble-plx';
import { connectToInverter } from '../services/InverterService';
import { Inverter } from '../types/DeviceType';
import { Colours } from '../styles/properties/colours';
import { AppScreen } from '../components/AppScreen';
import { useNavigation } from '@react-navigation/native';
import { Flex } from '../styles/properties';
import { Dimensions, GenericSize, Margin, Padding } from '../styles/properties/dimensions';
import { fontWeight } from '../styles/properties/fontWeight';
import { textStyles } from '../styles/components/textStyles';
import { navigationRefAuthenticated } from '../nav/ScreenDefinitions';

export default function InverterScreen() {
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
      navigationRefAuthenticated.navigate('Nodes');
    } catch (error) {
      showToast(ToastType.Error, 'Failed to select inverter, please try again');
      console.error('Failed to save selected inverter', error);
    }
  };

  const renderInverterItem = ({ item }: { item: Device }) => (
    <Card style={styles.inverterCard} onPress={() => handleSelectInverter(item)}>
      <Card.Content style={styles.inverterContent}>
        <View style={[styles.iconContainer, { backgroundColor: Colours.backgroundSecondary }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={GenericSize.large} color={Colours.primary} />
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
        <IconButton icon="camera" size={GenericSize.large} onPress={() => navigationRefAuthenticated.goBack()} />
        <Text variant="titleLarge" style={textStyles.title}>
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
    paddingHorizontal: Padding.small,
    paddingVertical: Padding.small,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: Margin.medium,
    color: Colours.textPrimary,
  },
  loadingContainer: {
    flex: Flex.xsmall,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Padding.medium,
  },
  loader: {
    marginBottom: Margin.medium,
  },
  loadingText: {
    color: Colours.textPrimary,
  },
  listContent: {
    padding: GenericSize.medium,
  },
  inverterCard: {
    marginBottom: Margin.medium,
    elevation: GenericSize.ssmall,
    backgroundColor: Colours.backgroundPrimary,
  },
  inverterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Padding.small,
  },
  iconContainer: {
    padding: Padding.medium,
    borderRadius: Dimensions.border_radius_icon,
    marginRight: Margin.medium,

  },
  inverterInfo: {
    flex: Flex.xsmall,
  },
  inverterName: {
    fontWeight: fontWeight.large,
    color: Colours.textPrimary,
  },
  inverterStatus: {
    color: Colours.textPrimary,
  },
  emptyContainer: {
    flex: Flex.xsmall,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Padding.medium,
  },
  emptyText: {
    color: Colours.textPrimary,
    textAlign: 'center',
    marginBottom: Margin.medium,
  },
});

