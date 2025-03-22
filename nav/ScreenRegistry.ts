import {ComponentType} from 'react';
import {DrawerNavigationOptions} from '@react-navigation/drawer';
import StackNavigator from './CreateStackNavigation';

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
    component: StackNavigator,
    options: {title: 'Home', headerShown: true},
  
  },
};