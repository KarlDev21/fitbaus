import React,{ComponentType} from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import InverterScreen from '../screens/InverterScreen';
import NodeScreen from '../screens/NodeScreen';
import FinalizingScreen from '../screens/FinalizingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NodeInfoScreen from '../screens/NodeInfoScreen';
import { Device } from 'react-native-ble-plx';

export type RootStackParamList = {
  Home: undefined
  Inverters: undefined
  Nodes: undefined
  Finalizing: undefined
  Dashboard: { inverter: Device }
  NodeInfo:undefined
}

type StackNavigationScreen = {
    name: string;
    component: ComponentType<any>;
    options: StackNavigationOptions;
  };

type NavStackScreenRegistry = {
    [key: string]: StackNavigationScreen;
  }

export const StackScreens: NavStackScreenRegistry = {
    Home: {
      name: 'Home',
      component: HomeScreen,
      options: {headerShown: false},
    },
    Devices: {
      name: 'Inverters',
      component: InverterScreen,
      options: {headerShown: false},
    },
    Batteries: {
      name: 'Nodes',
      component: NodeScreen,
      options: {headerShown: false},
    },
    Finalizing: {
      name: 'Finalizing',
      component: FinalizingScreen,
      options: {headerShown: false},
    },
    Dashboard: {
      name: 'Dashboard',
      component: DashboardScreen,
      options: {headerShown: false},
    },
    NodeInfo: {
      name: "NodeInfo",
      component: NodeInfoScreen,
      options: {
        headerShown: false,
      },
    }
  };

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
        {Object.entries(StackScreens).map(([key, screen]) => (
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

export default StackNavigator;
