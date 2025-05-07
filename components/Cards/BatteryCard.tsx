import React from 'react';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Battery } from '../../types/DeviceType';
import { cardStyles } from '../../styles/components/cardStyles';
import { batteryCardStyles } from '../../styles/components/batteryCardStyles';
import { BatteryCardRow } from './BatteryCardRow';

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
    const cardStyle = [cardStyles.card] as any;
    let statusIcon = null;

    if (showAuthResult) {
        if (isAuthenticated) {
            cardStyle.push(batteryCardStyles.authenticatedCard);
            statusIcon = <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />;
        } else {
            cardStyle.push(batteryCardStyles.failedCard);
            statusIcon = <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />;
        }
    }

    return (
        <Card style={[cardStyle, {}]}>
            <Card.Content>
                <BatteryCardRow
                    battery={battery}
                    isSelected={isSelected}
                    statusIcon={statusIcon}
                    onToggle={onToggle}
                />
            </Card.Content>
        </Card>
    );
};

export default BatteryCard;