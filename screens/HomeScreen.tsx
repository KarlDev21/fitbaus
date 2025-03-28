import React from 'react';
import { AppScreen } from '../components/AppScreen';
import { Text } from 'react-native';
import { Button } from 'react-native-paper';
import { authenticate, scanDevices } from '../services/BluetoothLowEnergyService';
import { authenticateInverter } from '../services/InverterService';

export default function HomeScreen() {
    return (
        <AppScreen>
            <Text>HomeScreen</Text>
            <Button onPress={async () => { await scanDevices() }}>Press me</Button>
            <Button onPress={async () => { await authenticate() }}>Authenticate</Button>
            <Button onPress={async () => { await authenticateInverter() }}>Authenticate Inverter</Button>
        </AppScreen>
    )
}
