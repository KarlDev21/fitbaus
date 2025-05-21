import {StyleSheet} from 'react-native';
import {GenericSize, Width} from '../properties/dimensions';
import {textStyles} from './textStyles';
import {Colours, FontSize} from '../properties';

export const inputStyles = StyleSheet.create({
  container: {
    width: Width.full,
    marginVertical: GenericSize.small,
  },
  input: {
    color: Colours.textPrimary,
    backgroundColor: Colours.white,
  },
  errorText: {
    color: Colours.textError,
    fontSize: FontSize.xsmall,
    marginTop: GenericSize.xsmall,
  },
});
