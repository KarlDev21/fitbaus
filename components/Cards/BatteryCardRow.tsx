import React from 'react';
import { View } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Battery } from '../../types/DeviceType';
import { Colours } from '../../styles/properties/colours';
import { batteryCardStyles } from '../../styles/components/batteryCardStyles';

interface BatteryCardRowProps {
  battery: Battery;
  isSelected: boolean;
  statusIcon: React.ReactNode;
  onToggle: () => void;
}

export const BatteryCardRow: React.FC<BatteryCardRowProps> = ({
  battery,
  isSelected,
  statusIcon,
  onToggle,
}) => (
  <View style={batteryCardStyles.row}>
    <View style={[batteryCardStyles.iconContainer, { backgroundColor: Colours.primary + '20' }]}>
      <MaterialCommunityIcons name="battery" size={20} color={Colours.primary} />
    </View>
    <Text style={batteryCardStyles.name}> {battery.name}  {battery.id}</Text>
    {statusIcon}
    <Checkbox
      status={isSelected ? 'checked' : 'unchecked'}
      onPress={onToggle}
      color={Colours.primary}
    />
  </View>
); 