import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerScreens } from './ScreenRegistry';

const Drawer = createDrawerNavigator();

export default function CreateDrawerNavigation() {
  return (
    <Drawer.Navigator initialRouteName="LandingScreen">
      {Object.entries(DrawerScreens).map(([key, screen]) => (
        <Drawer.Screen
          key={key}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
};
