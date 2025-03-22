import {StyleSheet} from 'react-native';
import {Colours, Dimensions, FontSize, Margin, Padding} from '../properties';

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    borderRadius: Dimensions.border_radius,
    paddingVertical: Padding.xsmall,
  },
  primaryText: {
    fontSize: FontSize.normal,
    color: Colours.white,
  },
  linkButton: {
    marginVertical: Margin.medium,
  },
  linkText: {
    fontSize: FontSize.small,
    textDecorationLine: 'underline',
  },
});
