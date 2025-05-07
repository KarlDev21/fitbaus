import React from 'react';
import { View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';
import { BatteryData } from '../../types/BleTypes';
import { cardStyles } from '../../styles/components/cardStyles';
import { batteryDetailsCardStyles } from '../../styles/components/batteryDetailsCardStyles';

export const BatteryDetailsCard = ({ batteryInfo }: { batteryInfo: BatteryData }) => (
    <Card style={cardStyles.card}>
        <Card.Content>
            <Text variant="titleMedium" style={batteryDetailsCardStyles.sectionTitle}>
                Battery Details {batteryInfo.deviceID}
            </Text>
            <DataRow label="SoH (State of Health)" value={(batteryInfo.cycleLife / 2000) * 100} unit=" %" />
            <Divider />
            <DataRow label="SoC (State of Consumption)" value={batteryInfo.rsoc} unit=" %" />
        </Card.Content>
    </Card>
);

const DataRow = ({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) => (
    <View style={batteryDetailsCardStyles.dataRow}>
        <Text variant="bodyMedium" style={batteryDetailsCardStyles.dataLabel}>
            {label}
        </Text>
        <Text variant="bodyMedium" style={batteryDetailsCardStyles.dataValue}>
            {value}
            {unit}
        </Text>
    </View>
);
