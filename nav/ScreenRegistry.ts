import {ComponentType} from 'react';
import {DrawerNavigationOptions} from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';

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
  Landing: {
    name: 'LandingScreen',
    component: LandingScreen,
    options: {headerShown: false},
  },
};
