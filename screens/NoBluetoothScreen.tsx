import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useBluetooth } from '../providers/BluetoothProvider';
import { requestBluetoothPermissions } from '../helpers/AppHelper';
import { Flex } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';

const NoBluetoothScreen = () => {

    const { isBluetoothEnabled, permissionGranted, isBTLoading } = useBluetooth();
    const [checking, setChecking] = useState(false);

    const handleRequestPermissions = async () => {

        setChecking(true);
        const granted = await requestBluetoothPermissions();
        setChecking(false);

        if (granted) {

            // Navigate or trigger re-check
        }
    };


    return (
        <View
            style={{
                flex: Flex.xsmall,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
            }}
        >
            {
                isBluetoothEnabled === null &&
                <>
                    <Text
                        style={textStyles.heading}
                    >
                        Checking Bluetooth Connection
                    </Text>
                </>
            }
            {
                !permissionGranted &&
                <>
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
                </>
            }
            {
                permissionGranted && !isBluetoothEnabled &&
                <>
                    <Text
                        style={textStyles.heading}
                    >
                        {isBTLoading ? 'Checking Bluetooth Connection' : 'No Bluetooth Connection'}
                    </Text>
                    <Text
                        style={textStyles.subtitle}
                    >
                        Please enable Bluetooth to Continue.
                    </Text>
                </>
            }


        </View>
    );
};

export default NoBluetoothScreen;