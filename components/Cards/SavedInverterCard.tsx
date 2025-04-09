import React from 'react';
import { Card, Text, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Inverter } from '../../types/DeviceType';
import { LoadingIndicator } from '../LoadingIndicator';
import { Colours } from '../../styles/properties/colours';

interface SavedInverterCardProps {
    inverter: Inverter;
    isConnected: boolean;
    isConnecting: boolean;
    onConnect: () => void;
    handleInverter: () => void;
}

export const SavedInverterCard: React.FC<SavedInverterCardProps> = ({
    inverter,
    isConnected,
    isConnecting,
    onConnect,
    handleInverter
}) => (
    <Card style={styles.card} onPress={handleInverter}>
        <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
                Saved Inverters
            </Text>
            <InverterRow
                name={inverter.name}
                id={inverter.id}
                isConnected={isConnected}
                isConnecting={isConnecting}
                onConnect={onConnect}
            />
        </Card.Content>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
});

//InverterRow component

interface InverterRowProps {
    name: string | null;
    id: string;
    isConnected: boolean;
    isConnecting: boolean;
    onConnect: () => void;
}

export const InverterRow: React.FC<InverterRowProps> = ({
    name,
    id,
    isConnected,
    isConnecting,
    onConnect,
}) => (
    <View style={inverterRowStyles.inverterRow}>
        <View style={[inverterRowStyles.iconContainer, { backgroundColor: Colours.secondary + '20' }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={Colours.secondary} />
        </View>
        <View style={inverterRowStyles.inverterInfo}>
            <Text variant="bodyLarge" style={inverterRowStyles.inverterName}>
                {name} {id}
            </Text>
            <Text variant="bodySmall" style={inverterRowStyles.inverterStatus}>
                {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
            {!isConnected && (
                <Button
                    mode="contained"
                    onPress={onConnect}
                    style={inverterRowStyles.button}
                    labelStyle={inverterRowStyles.buttonLabel}
                >
                    {isConnecting ? <LoadingIndicator /> : 'Reconnect'}
                </Button>
            )}
        </View>
    </View>
);

const inverterRowStyles = StyleSheet.create({
    inverterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 50,
        marginRight: 16,
    },
    inverterInfo: {
        flex: 1,
    },
    inverterName: {
        fontWeight: '500',
    },
    inverterStatus: {
        color: '#666',
    },
    button: {
        marginTop: 8,
        paddingVertical: 6,
    },
    buttonLabel: {
        fontSize: 16,
    },
});