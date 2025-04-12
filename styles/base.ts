import {StyleSheet} from 'react-native';
import {Colours} from './properties/colours';
import {Padding} from './properties/dimensions';

export const layout = StyleSheet.create({
  app_screen: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: Colours.white,
  },
  fill_flex: {
    flex: 1,
  },
  landing_screen_container: {
    // flex: 1,
    flexDirection: 'column',
    padding: Padding.large,
    justifyContent: 'flex-start',
  },
  landing_screen_no_account_view: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export const Spacer = StyleSheet.create({
  logo_spacer: {
    paddingBottom: 16,
  },
});
