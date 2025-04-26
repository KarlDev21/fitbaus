import {StyleSheet} from 'react-native';
import {Colours, Dimensions, FontSize, Margin, Padding} from '../properties';

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colours.primary,
    borderRadius: Dimensions.border_radius_button,
    paddingVertical: Padding.xsmall,
  },
  primaryText: {
    fontSize: FontSize.medium,
    color: Colours.primaryButtonText,
  },
  linkButton: {
    marginVertical: Margin.medium,
  },
  linkText: {
    fontSize: FontSize.small,
    textDecorationLine: 'underline',
  },
  buttonLabel: {
    fontSize: FontSize.medium,
    color: 'white',
  }
});
