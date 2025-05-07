import { StyleSheet } from 'react-native';
import { Colours } from '../properties/colours';
import { Dimensions, GenericSize, Margin, Padding } from '../properties/dimensions';
import { Flex } from '../properties';
import { fontWeight } from '../properties/fontWeight';

export const inverterListItemStyles = StyleSheet.create({
  iconContainer: {
    padding: Padding.medium,
    borderRadius: Dimensions.border_radius_icon,
    marginRight: Margin.medium,
  },
  inverterInfo: {
    flex: Flex.xsmall,
  },
  inverterName: {
    fontWeight: fontWeight.large,
    color: Colours.textPrimary,
  },
  inverterStatus: {
    color: Colours.textPrimary,
  },
}); 