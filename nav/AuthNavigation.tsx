import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Device } from 'react-native-ble-plx';
import { NavStackScreenRegistry } from '../types/NavTypes';
import LandingScreen from '../screens/Auth/LandingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';

export type AuthStackParamList = {
  Home: undefined;
  Inverters: undefined;
  Nodes: undefined;
  Finalizing: undefined;
  Dashboard: { inverter: Device };
  NodeInfo: { nodeId: number };
  CommissionScreen: { screen: string };
};

export const AuthStackScreens: NavStackScreenRegistry = {
  Landing: {
    name: 'LandingScreen',
    component: LandingScreen,
    options: {headerShown: false},
  },
  Login: {
    name: 'LoginScreen',
    component: LoginScreen,
    options: {headerShown: false},
  },
  Registration: {
    name: 'RegistrationScreen',
    component: RegistrationScreen,
    options: {headerShown: false},
  },
};

const Stack = createStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator>
      {Object.entries(AuthStackScreens).map(([key, screen]) => (
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

export default AuthNavigation;
