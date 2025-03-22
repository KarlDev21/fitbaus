import React,{ComponentType} from "react";
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import HomeScreen from "../screens/HomeScreen";
import DevicesScreen from "../screens/DevicesScreen";
import BatteriesScreen from "../screens/BatteriesScreen";
import FinalizingScreen from "../screens/FinalizingScreen";
import DashboardScreen from "../screens/DashboardScreen";

export type RootStackParamList = {
  Home: undefined
  Devices: undefined
  Batteries: undefined
  Finalizing: undefined
  Dashboard: { inverterId: string }
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
      name: 'Devices',
      component: DevicesScreen,
      options: {headerShown: false},
    },
    Batteries: {
      name: 'Batteries',
      component: BatteriesScreen,
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
      options: {headerShown: false}
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
