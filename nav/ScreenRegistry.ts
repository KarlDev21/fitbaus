import {ComponentType} from 'react';
import {DrawerNavigationOptions} from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';

type DrawerNavigationScreen = {
  name: string;
  component: ComponentType<any>;
  options: DrawerNavigationOptions;
};

type NavDrawerScreenRegistry = {
  [key: string]: DrawerNavigationScreen;
};

export const DrawerScreens: NavDrawerScreenRegistry = {
  Home: {
    name: 'HomeScreen',
    component: HomeScreen,
    options: {title: 'Home', headerShown: true},
  },
};
