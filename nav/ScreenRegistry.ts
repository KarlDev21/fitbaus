import {ComponentType} from 'react';
import HomeScreen from '../screens/HomeScreen';

type DrawerNavigationScreen<T> = {
  name: keyof T;
  component: ComponentType<any>;
  options: any; //Should be imported from R Navigation
};

type NavDrawerScreenRegistry<T> = {
  [key: string]: DrawerNavigationScreen<T>;
};

export const DrawerScreens: NavDrawerScreenRegistry<any> = {
  Home: {
    name: 'HomeScreen',
    component: HomeScreen,
    options: {title: 'Home', headerShown: true},
  },
};
