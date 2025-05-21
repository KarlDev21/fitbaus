import {StyleSheet} from 'react-native';
import {
  Dimensions,
  Flex,
  GenericSize,
  Margin,
  Padding,
} from '../properties/dimensions';
import {Colours} from '../properties';

export const batteryCardStyles = StyleSheet.create({
  iconContainer: {
    padding: Padding.small,
    borderRadius: Dimensions.border_radius_icon,
    marginRight: Margin.medium,
  },
  authenticatedCard: {
    borderColor: Colours.success,
    backgroundColor: Colours.batteryAuthenticatedBackground,
  },
  failedCard: {
    borderColor: Colours.error,
    backgroundColor: Colours.batteryFailedBackground,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: Flex.xsmall,
    marginLeft: Margin.small,
    color: Colours.textPrimary,
  },
});
