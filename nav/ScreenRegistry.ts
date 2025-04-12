import {ComponentType} from 'react';
import {DrawerNavigationOptions} from '@react-navigation/drawer';
import StackNavigator from './CreateStackNavigation';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
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
  CommissionScreen: {
    name: 'CommissionScreen',
    component: StackNavigator,
    options: {title: 'Home', headerShown: true},
  },
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
