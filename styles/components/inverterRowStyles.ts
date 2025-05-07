import { StyleSheet } from 'react-native';
import { Colours } from '../properties/colours';
import { Dimensions, Flex, Margin, Padding } from '../properties/dimensions';
import { buttonStyles } from './buttonStyles';
import { FontSize } from '../properties';

export const inverterRowStyles = StyleSheet.create({
  inverterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Margin.small,
  },
  iconContainer: {
    padding: Padding.medium,
    borderRadius: Dimensions.border_radius_icon,
    marginRight: Margin.medium,
  },
  inverterInfo: {
    flex: Flex.xsmall,
  },
  inverterName: {
    color: Colours.textPrimary,
    marginVertical: Margin.small,
    fontWeight: '500',
  },
  inverterStatus: {
    marginBottom: Margin.medium,
    color: Colours.textPrimary
  },
  button: buttonStyles.primaryButton,
  buttonLabel: {
    fontSize: FontSize.medium,
    color: Colours.primaryButtonText
  },
}); 