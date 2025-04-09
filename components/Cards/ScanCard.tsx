import React from 'react';
import { Card, Text, Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { LoadingIndicator } from '../LoadingIndicator';

interface ScanCardProps {
    isScanning: boolean;
    onScan: () => void;
}

export const ScanCard: React.FC<ScanCardProps> = ({ isScanning, onScan }) => (
    <Card style={styles.card}>
        <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
                Scan for Inverters
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
                Press the button below to start scanning for available inverters in your area.
            </Text>
            <Button
                mode="contained"
                onPress={onScan}
                disabled={isScanning}
                style={styles.button}
                labelStyle={styles.buttonLabel}
            >
                {isScanning ? <LoadingIndicator /> : 'Start Scanning'}
            </Button>
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
    cardDescription: {
        marginBottom: 16,
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