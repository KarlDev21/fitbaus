import { StyleSheet } from 'react-native';
import { Colours, Flex } from '../properties';
import { Height, Margin, Padding } from '../properties/dimensions';

export const batteryDetailsCardStyles = StyleSheet.create({
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: Margin.medium,
    color: Colours.textPrimary
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Padding.small,    
  },
  dataLabel: {
    flex: Flex.xsmall,
    fontWeight: '500',
    color: Colours.textPrimary
  },
  dataValue: {
    fontWeight: 'bold',
    color: Colours.textPrimary
  },
  spacer: {
    height: Height.small,
  },
}); 