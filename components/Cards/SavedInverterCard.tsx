import React from 'react';
import { Card, Text, Button } from 'react-native-paper';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Inverter } from '../../types/DeviceType';
import { LoadingIndicator } from '../LoadingIndicator';
import { Colours } from '../../styles/properties/colours';
import { cardStyles } from '../../styles/components/cardStyles';
import { inverterRowStyles } from '../../styles/components/inverterRowStyles';

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
    <Card style={cardStyles.card} onPress={handleInverter}>
        <Card.Content>
            <Text variant="titleMedium" style={cardStyles.cardTitle}>
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
        <View style={[inverterRowStyles.iconContainer, { backgroundColor: Colours.primary + '20' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colours.primary} />
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