import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';
import { BatteryInfo } from '../../types/BleTypes';
import { Flex } from '../../styles/properties';

export const BatteryDetailsCard = ({ batteryInfo }: { batteryInfo: BatteryInfo }) => (
    <Card style={styles.detailsCard}>
        <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
                Battery Details {batteryInfo.nodeId}
            </Text>
            <DataRow label="SoH (State of Health)" value={(batteryInfo.nodeData.CycleLife / 2000) * 100} unit=" %" />
            <Divider style={styles.divider} />
            <DataRow label="SoC (State of Consumption)" value={batteryInfo.nodeData.RSOC} unit=" %" />
        </Card.Content>
    </Card>
);

const DataRow = ({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) => (
    <View style={styles.dataRow}>
        <Text variant="bodyMedium" style={styles.dataLabel}>
            {label}
        </Text>
        <Text variant="bodyMedium" style={styles.dataValue}>
            {value}
            {unit}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    detailsCard: {
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    dataLabel: {
        flex: Flex.xsmall,
        fontWeight: '500',
    },
    dataValue: {
        fontWeight: 'bold',
    },
    divider: {
        backgroundColor: '#f0f0f0',
    },
    spacer: {
        height: 20,
    },
});