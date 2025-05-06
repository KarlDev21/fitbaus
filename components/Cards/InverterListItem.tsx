import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Device } from 'react-native-ble-plx';
import { Colours } from '../../styles/properties/colours';
import { GenericSize } from '../../styles/properties/dimensions';
import { inverterListItemStyles } from '../../styles/components/inverterListItemStyles';
import { cardStyles } from '../../styles/components/cardStyles';

interface InverterListItemProps {
  item: Device;
  onPress?: (item: Device) => void;
  selectInverter?:boolean;
}
export const InverterListItem: React.FC<InverterListItemProps> = ({ item, onPress, selectInverter }) => (
  <Card style={cardStyles.card} onPress={() => onPress?.(item)}>
    <Card.Content style={cardStyles.content}>
      <View style={[inverterListItemStyles.iconContainer, { backgroundColor: Colours.backgroundSecondary }]}>
        <MaterialCommunityIcons name="lightning-bolt" size={GenericSize.large} color={Colours.primary} />
      </View>
      <View style={inverterListItemStyles.inverterInfo}>
        <Text variant="bodyLarge" style={inverterListItemStyles.inverterName}>
          {item.name + ' ' + item.id}
        </Text>
        {
          selectInverter ?         
          <Text variant="bodySmall" style={inverterListItemStyles.inverterStatus}>
            Tap to select
          </Text>
        :
          <Text variant="bodySmall" style={inverterListItemStyles.inverterStatus}>
          Selected Inverter
          </Text>
        }


      </View>
    </Card.Content>
  </Card>
); 