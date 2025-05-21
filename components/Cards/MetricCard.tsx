import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Colours } from '../../styles/properties/colours';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Flex } from '../../styles/properties/dimensions';

export const MetricCard = ({
    title,
    metrics,
}: {
    title: string;
    metrics: { icon: string; label: string; value: string | number; unit?: string }[];
}) => (
    <Card style={styles.overviewCard}>
        <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
                {title}
            </Text>
            {metrics.map((metric, index) => (
                <View key={index} style={styles.metricRow}>
                    <View style={[styles.iconContainer, { backgroundColor: `${Colours.secondary}20` }]}>
                        <MaterialCommunityIcons name={metric.icon as any} size={20} color={Colours.secondary} />
                    </View>
                    <Text variant="bodyMedium" style={styles.metricLabel}>
                        {metric.label}
                    </Text>
                    <Text variant="bodyLarge" style={styles.metricValue}>
                        {metric.value}
                        {metric.unit}
                    </Text>
                </View>
            ))}
        </Card.Content>
    </Card>
);

const styles = StyleSheet.create({

    overviewCard: {
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    metricLabel: {
        flex: Flex.xsmall,
        fontWeight: '500',
    },
    metricValue: {
        fontWeight: 'bold',
    },
    spacer: {
        height: 20,
    },
});