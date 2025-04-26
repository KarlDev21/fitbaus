import React from 'react';
import { Card, Text, Button } from 'react-native-paper';
import { LoadingIndicator } from '../LoadingIndicator';
import { buttonStyles } from '../../styles/components/buttonStyles';
import { cardStyles } from '../../styles/components/cardStyles';

interface ScanCardProps {
    isScanning: boolean;
    onScan: () => void;
}

export const ScanCard: React.FC<ScanCardProps> = ({ isScanning, onScan }) => (
    <Card style={cardStyles.card}>
        <Card.Content>
            <Text variant="titleMedium" style={cardStyles.cardTitle}>
                Scan for Inverters
            </Text>
            <Text variant="bodyMedium" style={cardStyles.cardDescription}>
                Press the button below to start scanning for available inverters in your area.
            </Text>
            <Button
                mode="contained"
                onPress={onScan}
                disabled={isScanning}
                style={buttonStyles.primaryButton}
                labelStyle={buttonStyles.buttonLabel}
            >
                {isScanning ? <LoadingIndicator /> : 'Start Scanning'}
            </Button>
        </Card.Content>
    </Card>
);
