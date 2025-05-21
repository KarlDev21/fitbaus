import { StyleSheet } from 'react-native';
import { Colours } from '../properties';
import { GenericSize, Margin, Width } from '../properties/dimensions';

export const inverterInfoCardStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: Width.xsmall,
    height: GenericSize.xlarge,
    borderRadius: GenericSize.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Margin.small,
  },
  headerInfo: {
    marginLeft: Margin.medium,
  },
  title: {
    fontWeight: 'bold',
    color: Colours.textPrimary
  },
  value: {
    fontWeight: 'bold',
  },
}); 