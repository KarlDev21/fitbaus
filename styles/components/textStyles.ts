// styles/components/textStyles.ts
import { StyleSheet } from 'react-native';
import { Colours } from '../properties/colours';
import { FontSize } from '../properties/fontSize';
import { Margin, Spacing } from '../properties/dimensions';

export const textStyles = StyleSheet.create({
  heading: {
    fontSize: FontSize.xlarge,
    fontWeight: 'bold',
    color: Colours.primary,
    marginVertical: Spacing.small,
  },
  subtitle: {
    fontSize: FontSize.small,
    textAlign: 'center',
    marginVertical: Spacing.xsmall,
  },
  title: {
    textAlign: "center",
    marginBottom: Margin.large,
    fontWeight: "bold",
    color : Colours.textPrimary
  }
});
