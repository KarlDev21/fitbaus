import React from 'react';
import { View, Text } from 'react-native';
import { Colours } from '../styles/properties/colours';
import { Flex, Padding } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';
import LogoComponent from '../components/Logo';

const NoInternetScreen = () => {
    return (
        <View
            style={{
                flex: Flex.xsmall,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colours.backgroundPrimary,
            }}
        >
            <LogoComponent containerStyle={{ flex: 0 }}/>

            <Text
                style={textStyles.heading}
            >
                No Internet Connection
            </Text>
            <Text
                style={[textStyles.subtitle, { paddingVertical: Padding.medium }]}
            >
                You can not continue using the app without an internet connection.
            </Text>
        </View>
    );
};

export default NoInternetScreen;