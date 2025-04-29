import { Device } from "react-native-ble-plx";
import LandingScreen from "../screens/Auth/LandingScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegistrationScreen from "../screens/Auth/RegistrationScreen";
import { BaseScreen, NavStackScreenDefinitions } from "./StackNavigationContainer";
import DashboardScreen from "../screens/DashboardScreen";
import FinalizingScreen from "../screens/FinalizingScreen";
import HomeScreen from "../screens/HomeScreen";
import InverterScreen from "../screens/InverterScreen";
import NodeScreen from "../screens/NodeScreen";
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRefUnauthenticated = createNavigationContainerRef<UnauthenticatedScreenDefinitions>();
export const navigationRefAuthenticated = createNavigationContainerRef<AuthenticatedScreenDefinitions>();

export type UnauthenticatedScreenDefinitions = BaseScreen & {
    Landing: undefined;
    Login: undefined;
    Registration: undefined
};

export const UnauthenticatedStackScreens: NavStackScreenDefinitions<UnauthenticatedScreenDefinitions> = {
    Landing: {
        name: 'LandingScreen',
        component: LandingScreen,
        options: { headerShown: false },
    },
    Login: {
        name: 'LoginScreen',
        component: LoginScreen,
        options: { headerShown: false },
    },
    Registration: {
        name: 'RegistrationScreen',
        component: RegistrationScreen,
        options: { headerShown: false },
    },
};

export type AuthenticatedScreenDefinitions = BaseScreen & {
    Home: undefined;
    Inverters: undefined;
    Nodes: undefined;
    Finalizing: undefined;
    Dashboard: { inverter: Device };
};

export const AuthenticatedStackScreen: NavStackScreenDefinitions<AuthenticatedScreenDefinitions> = {
    Home: {
        name: 'Home',
        component: HomeScreen,
        options: { headerShown: false },
    },
    Inverters: {
        name: 'Inverters',
        component: InverterScreen,
        options: { headerShown: false },
    },
    Nodes: {
        name: 'Nodes',
        component: NodeScreen,
        options: { headerShown: false },
    },
    Finalizing: {
        name: 'Finalizing',
        component: FinalizingScreen,
        options: { headerShown: false },
    },
    Dashboard: {
        name: 'Dashboard',
        component: DashboardScreen,
        options: { headerShown: false },
    },
};