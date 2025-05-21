import {StyleSheet} from 'react-native';
import {Colours, Dimensions, FontSize, Margin, Padding} from '../properties';
import {GenericSize} from '../properties/dimensions';

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colours.primary,
    borderRadius: Dimensions.border_radius_button,
    paddingVertical: Padding.xsmall,
  },
  primaryText: {
    fontSize: FontSize.medium,
    color: Colours.white,
  },
  primaryLoadingText: {
    fontSize: FontSize.medium,
    color: Colours.white,
    marginRight: GenericSize.ssmall,
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
  },
});
