import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { fetchAndLogBatteryInfo, fetchAndLogChargeControllerStatus, fetchAndLogInverterStatus } from '../services/InverterService';
import { showToast, ToastType } from '../components/Toast';
import { BatteryData, InverterState } from '../types/BleTypes';
import { Colours } from '../styles/properties/colours';
import { AppScreen } from '../components/AppScreen';
import { Flex, Padding } from '../styles/properties/dimensions';
import { uploadInverterAndBatteryDataAsync } from '../services/DeviceUnitService';
import { AuthenticatedScreenDefinitions, navigationRefAuthenticated } from '../nav/ScreenDefinitions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getConnectedInverterDevice, getConnectedNodes } from '../helpers/BluetoothHelper';
import { InverterInfoCard } from '../components/Cards/InverterInfoCard';
import { BatteryDetailsList } from '../components/Cards/BatteryDetailsList';
import { Spacer } from '../components/Spacer';
export default function DashboardScreen(props: NativeStackScreenProps<AuthenticatedScreenDefinitions, 'Dashboard'>) {
  const inverterId = props.route.params.inverter.id;
  const [isLoading, setIsLoading] = useState(true);
  const [connectedNodeIds, setConnectedNodeIds] = useState<string[]>([]);

  const [inverterState, setInverterState] = useState<InverterState>({
    loadInputVoltage: 0,
    loadInputCurrent: 0,
    loadInputPower: 0,
    loadOutputVoltage: 0,
    loadOutputCurrent: 0,
    loadOutputPower: 0,
    deviceTemperature: 0,
    heatsinkTemperature: 0,
    loadStatus: 0,
    version: 0,
    inverterOn: 0,
    solarVoltage: 0,
    solarCurrent: 0,
  });

  const [nodeDataList, setNodeDataList] = useState<BatteryData[]>([]);

  useEffect(() => {
    const inverter = getConnectedInverterDevice(inverterId);

    const loadData = async () => {
      try {
        console.log("loaded inverter")
        console.log(inverter)

        if (inverter) {
          const chargeControllerInfo = await fetchAndLogChargeControllerStatus(inverter);
          const inverterState = await fetchAndLogInverterStatus(inverter);

          if (chargeControllerInfo && inverterState) {

            setInverterState(inverterState);

            const nodes = getConnectedNodes(inverter);
            if (nodes && nodes.length > 0) {
              setConnectedNodeIds(nodes.map((node) => node.id));

              const batteryInfoList = await Promise.all(
                nodes.map(async (node) => {
                  const batteryInfo = await fetchAndLogBatteryInfo(node, inverter);
                  return batteryInfo; // can be null, will be filtered
                })
              );

              const validBatteryInfo = batteryInfoList.filter(Boolean) as BatteryData[];
              setNodeDataList(validBatteryInfo);
            }

            await uploadInverterAndBatteryDataAsync(inverterState, nodeDataList);
            setIsLoading(false);
          }
        }
        else {
          showToast(ToastType.Error, 'No Inverter found.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        setIsLoading(false);
        navigationRefAuthenticated.navigate('Home');
      }
    };

    loadData();
  }, [inverterId]);


  const getInverterTemperatureColor = (rsoc: number) => {
    if (rsoc >= 80) { return Colours.success; }
    if (rsoc >= 50) { return Colours.primary; }
    if (rsoc >= 20) { return Colours.inverterTempOrange; }
    return Colours.error;
  };

  return (
    <AppScreen isLoading={isLoading}>
      <ScrollView style={[{ flex: Flex.xsmall, padding: Padding.medium }]} >

        <InverterInfoCard
          icon="temperature-celsius"
          iconColor={getInverterTemperatureColor(inverterState.heatsinkTemperature / 100)}
          iconBg={getInverterTemperatureColor(inverterState.heatsinkTemperature / 100) + '20'}
          title="Inverter Temperature"
          value={inverterState.heatsinkTemperature / 100}
          valueUnit="°C"
          valueColor={getInverterTemperatureColor(inverterState.heatsinkTemperature / 100)}
        />

        <InverterInfoCard
          icon="power-plug"
          iconColor={Colours.primary}
          iconBg={getInverterTemperatureColor(inverterState.heatsinkTemperature / 100) + '20'}
          title="Inverter Output"
          value={inverterState.loadOutputVoltage / 100}
          valueUnit="V"
        />

        <BatteryDetailsList nodeDataList={nodeDataList} />

        <Spacer />

      </ScrollView>
    </AppScreen>
  );
}
