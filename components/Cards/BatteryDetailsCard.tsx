import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';
import { BatteryData } from '../../types/bleTypes';

export const BatteryDetailsCard = ({ batteryData }: { batteryData: BatteryData }) => (
    <Card style={styles.detailsCard}>
        <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
                Battery Details
            </Text>

            <DataRow label="Current" value={batteryData.Current} unit=" A" />
            <Divider style={styles.divider} />

            <DataRow label="Remaining Capacity" value={batteryData.RemainCapacity} unit=" Ah" />
            <Divider style={styles.divider} />

            <DataRow label="Total Capacity" value={batteryData.TotalCapacity} unit=" Ah" />
            <Divider style={styles.divider} />

            <DataRow label="Cycle Life" value={batteryData.CycleLife} unit=" cycles" />
            <Divider style={styles.divider} />

            <DataRow label="Product Life" value={batteryData.ProductLife} unit=" cycles" />
            <Divider style={styles.divider} />

            <DataRow label="Balance Status Low" value={batteryData.BalanceStatusLow} />
            <Divider style={styles.divider} />

            <DataRow label="Balance Status High" value={batteryData.BalanceStatusHigh} />
            <Divider style={styles.divider} />

            <DataRow label="Protection Status" value={batteryData.ProtectionStatus} />
            <Divider style={styles.divider} />

            <DataRow label="Version" value={batteryData.Version} />
            <Divider style={styles.divider} />

            <DataRow label="RSOC" value={batteryData.RSOC} unit="%" />
            <Divider style={styles.divider} />

            <DataRow label="FET Status" value={batteryData.FetStatus} />
            <Divider style={styles.divider} />

            <DataRow label="Cells in Series" value={batteryData.CellInSeries} />
            <Divider style={styles.divider} />

            <DataRow label="Number of NTC" value={batteryData.N_NTC} />
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
        flex: 1,
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