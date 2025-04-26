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
        <View style={[styles.iconContainer, { backgroundColor: Colours.primary + '20' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colours.primary} />
            </View>
            <View>
                <Text style={styles.label}>Selected Inverter</Text>
                <Text style={styles.label}>{inverter.name + ' ' + inverter.id}</Text>
            </View>
        </Card.Content>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 1,
        backgroundColor: '#fff',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 60,
        marginRight: 16,
    },
    label: {
        color: 'black',
        fontWeight: '500',
    },
});

export default InverterCard;