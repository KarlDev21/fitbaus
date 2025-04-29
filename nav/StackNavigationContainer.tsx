import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { NavigationContainer, NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { ComponentType } from "react";

export type BaseScreen = Record<string, object | undefined>

export type StackNavigationScreen<T> = {
    name: keyof T;
    component: ComponentType<any>
    options: NativeStackNavigationOptions;
}

export type NavStackScreenDefinitions<T> = {
    [key in keyof T]: StackNavigationScreen<T>
}

export class StackNavigationContainer<T extends BaseScreen> {
    stack: ReturnType<typeof createNativeStackNavigator<T>>;
    screenDefinitions: NavStackScreenDefinitions<T>;
    navigationRef: NavigationContainerRefWithCurrent<Record<string, any>>;

    constructor(definitions: NavStackScreenDefinitions<T>, navigationRef: NavigationContainerRefWithCurrent<Record<string, any>>) {
        this.navigationRef = navigationRef;
        this.screenDefinitions = definitions;
        this.stack = createNativeStackNavigator<T>()
    }

    getContainer() {
        return (
            <NavigationContainer
                ref={this.navigationRef}
            >
                <this.stack.Navigator>
                    {Object.keys(this.screenDefinitions).map((screen, index) => (
                        <this.stack.Screen
                            key={index}
                            name={this.screenDefinitions[screen].name}
                            options={this.screenDefinitions[screen].options}
                            component={this.screenDefinitions[screen].component}
                        />
                    ))}
                </this.stack.Navigator>
            </NavigationContainer>
        )
    }
}