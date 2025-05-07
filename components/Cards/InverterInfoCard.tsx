import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cardStyles } from '../../styles/components/cardStyles';
import { inverterInfoCardStyles } from '../../styles/components/inverterInfoCardStyles';
import { Colours } from '../../styles/properties';

interface InverterInfoCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  value: string | number;
  valueColor?: string;
  valueUnit?: string;
}

export const InverterInfoCard: React.FC<InverterInfoCardProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  valueColor,
  valueUnit,
}) => (
  <Card style={cardStyles.card}>
    <Card.Content>
      <View style={inverterInfoCardStyles.header}>
        <View style={[inverterInfoCardStyles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={icon as any} size={32} color={iconColor} />
        </View>
        <View style={inverterInfoCardStyles.headerInfo}>
          <Text variant="titleLarge" style={inverterInfoCardStyles.title}>
            {title}
          </Text>
          <Text
            variant="bodyLarge"
            style={[inverterInfoCardStyles.value, valueColor ? { color: valueColor } : {color : Colours.textPrimary}]}
          >
            {value}
            {valueUnit}
          </Text>
        </View>
      </View>
    </Card.Content>
  </Card>
); 