import {StyleSheet} from 'react-native';
import {Colours} from './properties/colours';
import {Flex, Height, Padding, Width} from './properties/dimensions';

export const layout = StyleSheet.create({
  app_screen: {
    width: Width.full,
    height: Height.full,
    flex: Flex.xsmall,
    backgroundColor: Colours.backgroundPrimary,
  },
  fill_flex: {
    flex: Flex.xsmall,
  },
  landing_screen_container: {
    flexDirection: 'column',
    padding: Padding.large,
    justifyContent: 'flex-start',
  },
  landing_screen_no_account_view: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flex: Flex.xsmall,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Padding.medium,
  },
  container: {
    flex: Flex.xsmall,
    backgroundColor: Colours.backgroundPrimary,
  },
});

export const Spacer = StyleSheet.create({
  logo_spacer: {
    paddingBottom: 16,
  },
});
