/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { showToast, ToastType } from '../components/Toast';
import { Device } from 'react-native-ble-plx';
import { connectToInverter } from '../services/InverterService';
import { Inverter } from '../types/DeviceType';
import { AppScreen } from '../components/AppScreen';
import { GenericSize } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';
import { navigationRefAuthenticated } from '../nav/ScreenDefinitions';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../helpers/StorageHelper';
import { InverterListItem } from '../components/Cards/InverterListItem';

export default function InverterScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [inverters, setInverters] = useState<Inverter[]>([]);

  useEffect(() => {
    const loadInverters = async () => {
      try {
        setIsLoading(true);

        const invertersData = getFromStorage<Inverter[]>(STORAGE_KEYS.INVERTERS);
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

      saveToStorage(STORAGE_KEYS.SELECTED_INVERTER, JSON.stringify(inverter));
      showToast(ToastType.Success, 'Inverter selected successfully!');
      await connectToInverter(inverter);
      navigationRefAuthenticated.navigate('Nodes');
    } catch (error) {
      showToast(ToastType.Error, 'Failed to select inverter, please try again');
      console.error('Failed to save selected inverter', error);
    }
  };

  const renderInverterItem = ({ item }: { item: Device }) => (
    <InverterListItem item={item} selectInverter={true} onPress={handleSelectInverter} />
  );

  return (
    <AppScreen>
      <FlatList
        data={inverters}
        renderItem={renderInverterItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: GenericSize.medium }}
      />
    </AppScreen>
  );
}

