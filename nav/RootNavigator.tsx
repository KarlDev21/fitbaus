import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigation';
import AuthNavigator from './AuthNavigation';

//this will come from AuthContext later, just a place holder for now
const isAuthenticated = true;

const RootNavigator = () => {
  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
