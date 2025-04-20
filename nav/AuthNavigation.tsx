import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Device } from 'react-native-ble-plx';
import { NavStackScreenRegistry } from '../types/navigationTypes';
import LoginScreen from '../screens/LoginScreen';

export type AuthStackParamList = {
  Home: undefined
  Inverters: undefined
  Nodes: undefined
  Finalizing: undefined
  Dashboard: { inverter: Device }
  NodeInfo: { nodeId: number }
}

export const AuthStackScreens: NavStackScreenRegistry = {
    Login: {
      name: 'Login',
      component: LoginScreen,
      options: {headerShown: false},
    },
  };

const Stack = createStackNavigator();

const AuthNavigator = () => {
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

export default AuthNavigator;
