import React, { useState } from 'react';
import { View, Text, Button, Image } from 'react-native';
import { Colours } from '../styles/properties/colours';
import { useConnectivity } from '../providers/ConnectivityProvider';
import { useBluetooth } from '../providers/BluetoothProvider';
import { requestBluetoothPermissions } from '../helpers/AppHelper';

const NoBluetoothScreen = () => {

    const { isBluetoothEnabled, permissionGranted } = useBluetooth();
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
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
            }}
        >

            <Image
                source={require('../assets/logo-placeholder.png')}
                style={{
                    width: 150,
                    height: 150,
                    marginBottom: 24,
                }}
                resizeMode="contain"
            />
            {
                !permissionGranted && 
                <>
                <Text
                style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: 16,
                }}
            >
                Bluetooth Permission not granted 
            </Text>
            <Text
                style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 24,
                    textAlign: 'center',
                    paddingHorizontal: 20,
                }}
            >
            Please grant the required permissions.
            </Text>
            <Button title="Request Bluetooth Permission" onPress={handleRequestPermissions} color={Colours.primary} />
                </>
            }
            {
                permissionGranted && !isBluetoothEnabled &&
                <>
                <Text
                style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: 16,
                }}
            >
                No Bluetooth Connection
            </Text>
            <Text
                style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 24,
                    textAlign: 'center',
                    paddingHorizontal: 20,
                }}
            >
            Please enable Bluetooth to Continue.
            </Text>
                </>
            }

            
        </View>
    );
};

export default NoBluetoothScreen;