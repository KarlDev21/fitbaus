import { StackNavigationOptions } from "@react-navigation/stack";
import { ComponentType } from "react";

export type StackNavigationScreen = {
  name: string;
  component: ComponentType<any>;
  options: StackNavigationOptions;
};

export type NavStackScreenRegistry = {
  [key: string]: StackNavigationScreen;
}