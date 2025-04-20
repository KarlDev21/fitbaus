import React from 'react';
import { Card, Checkbox, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Battery } from '../../types/DeviceType';
import { Colours } from '../../styles/properties/colours';

interface BatteryCardProps {
    battery: Battery;
    isSelected: boolean;
    isAuthenticated?: boolean;
    showAuthResult?: boolean;
    onToggle: () => void;
}

//Note: Check if the card colours are correct
const BatteryCard: React.FC<BatteryCardProps> = ({
    battery,
    isSelected,
    isAuthenticated,
    showAuthResult,
    onToggle,
}) => {
    const cardStyle = [styles.card] as any;
    let statusIcon = null;

    if (showAuthResult) {
        if (isAuthenticated) {
            cardStyle.push(styles.authenticatedCard);
            statusIcon = <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />;
        } else {
            cardStyle.push(styles.failedCard);
            statusIcon = <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />;
        }
    }

    return (
        <Card style={cardStyle}>
            <Card.Content style={styles.content}>
                <View style={styles.row}>
                    <MaterialCommunityIcons name="battery" size={20} color={Colours.secondary} />
                    <Text style={styles.name}>{battery.name}</Text>
                    {statusIcon}
                    <Checkbox
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={onToggle}
                        color={Colours.primary}
                    />
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
    },
    authenticatedCard: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    failedCard: {
        borderColor: '#F44336',
        backgroundColor: '#FFEBEE',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        flex: 1,
        marginLeft: 8,
    },
});

export default BatteryCard;