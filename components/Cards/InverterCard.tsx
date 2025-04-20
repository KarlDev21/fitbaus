import React from 'react';
import { Card, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colours } from '../../styles/properties/colours';
import { Inverter } from '../../types/DeviceType';

interface InverterCardProps {
    inverter: Inverter;
}

const InverterCard: React.FC<InverterCardProps> = ({ inverter }) => (
    <Card style={styles.card}>
        <Card.Content style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: Colours.secondary + '20' }]}>
                <MaterialCommunityIcons name="lightning-bolt" size={16} color={Colours.secondary} />
            </View>
            <View>
                <Text style={styles.label}>Selected Inverter</Text>
                <Text>{inverter.name + ' ' + inverter.id}</Text>
            </View>
        </Card.Content>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 50,
        marginRight: 12,
    },
    label: {
        color: '#666',
        fontWeight: '500',
    },
});

export default InverterCard;