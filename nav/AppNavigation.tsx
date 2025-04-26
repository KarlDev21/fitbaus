import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import InverterScreen from '../screens/InverterScreen';
import NodeScreen from '../screens/NodeScreen';
import FinalizingScreen from '../screens/FinalizingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { Device } from 'react-native-ble-plx';
import { NavStackScreenRegistry } from '../types/NavTypes';

export type AppStackParamList = {
  Home: undefined;
  Inverters: undefined;
  Nodes: undefined;
  Finalizing: undefined;
  Dashboard: { inverter: Device };
  CommissionScreen: { screen: string };
};

export const AppStackScreens: NavStackScreenRegistry = {
  Home: {
    name: 'Home',
    component: HomeScreen,
    options: { headerShown: false },
  },
  Devices: {
    name: 'Inverters',
    component: InverterScreen,
    options: { headerShown: false },
  },
  Batteries: {
    name: 'Nodes',
    component: NodeScreen,
    options: { headerShown: false },
  },
  Finalizing: {
    name: 'Finalizing',
    component: FinalizingScreen,
    options: { headerShown: false },
  },
  Dashboard: {
    name: 'Dashboard',
    component: DashboardScreen,
    options: { headerShown: false },
  },
};

const Stack = createStackNavigator();

const AppNavigation  = () => {
  return (
    <Stack.Navigator>
      {Object.entries(AppStackScreens).map(([key, screen]) => (
        <Stack.Screen
          key={key}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  );
};

export default AppNavigation;
