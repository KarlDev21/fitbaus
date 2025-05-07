import React from 'react';
import { Card, Checkbox, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Battery } from '../../types/DeviceType';
import { Colours } from '../../styles/properties/colours';
import { Flex } from '../../styles/properties/dimensions';

interface BatteryCardProps {
    battery: Battery;
    isSelected: boolean;
    isAuthenticated?: boolean;
    showAuthResult?: boolean;
    onToggle: () => void;
}

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
                    <View style={[ styles.iconContainer, { backgroundColor: Colours.primary + '20' }]}>
                    <MaterialCommunityIcons name="battery" size={20} color={Colours.primary} />
                    </View>
                    <Text style={styles.name}> {battery.name}  {battery.id}</Text>
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
        iconContainer: {
        padding: 10,
        borderRadius: 60,
        marginRight: 16,
    },
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
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
        flex: Flex.xsmall,
        marginLeft: 8,
        color:'black'
    },
});

export default BatteryCard;