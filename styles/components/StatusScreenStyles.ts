import {StyleSheet} from 'react-native';
import {Colours} from '../properties/colours';
import {Margin, Padding} from '../properties/dimensions';
import {FontSize} from '../properties';

export const statusScreenStyles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Padding.large,
    paddingTop: Padding.large,
  },
  title: {
    color: Colours.primary,
    fontSize: FontSize.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Margin.medium,
  },
  subtitle: {
    color: Colours.textPrimary,
    fontSize: FontSize.medium,
    textAlign: 'center',
    marginBottom: Margin.large,
  },
  topHalf: {
    top: 0,
    backgroundColor: Colours.white,
  },
  bottomHalf: {
    bottom: 0,
    backgroundColor: Colours.primary,
  },
});
