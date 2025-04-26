import React from 'react';
import { View, Text, Button } from 'react-native';
import { Colours } from '../styles/properties/colours';
import { useConnectivity } from '../providers/ConnectivityProvider';
import { Flex, Padding } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';

const NoInternetScreen = () => {

    const { setContinueOffline } = useConnectivity();

    const handleContinueOffline = () => {
        setContinueOffline(true);
      };

    return (
        <View
            style={{
                flex: Flex.xsmall,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colours.backgroundPrimary,
            }}
        >
            <Text
                style={textStyles.heading}
            >
                No Internet Connection
            </Text>
            <Text
                style={[textStyles.subtitle, {paddingVertical : Padding.medium}]}
            >
            You can continue using the app without an internet connection.
            </Text>
            <Button title="Continue Offline" onPress={handleContinueOffline} color={Colours.primary} />
        </View>
    );
};

export default NoInternetScreen;