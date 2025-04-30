import React from 'react';
import { View, Text } from 'react-native';
import { Flex } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';
import LogoComponent from '../components/Logo';

const NoPermissionScreen = () => {

    return (
        <View
            style={{
                flex: Flex.xsmall,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
            }}
        >
            <LogoComponent/>
            
            <Text
                style={textStyles.heading}
            >
                Bluetooth Permission not granted
            </Text>
            <Text
                style={textStyles.subtitle}
            >
                Please grant the required permissions.
            </Text>
        </View>
    );
};

export default NoPermissionScreen;