import { StyleSheet } from 'react-native';
import { Flex, Margin, Padding } from '../properties/dimensions';

export const nodeScreenButtonStyles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Padding.medium,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outlineButton: {
    flex: Flex.xsmall,
    marginRight: Margin.small,
  },
}); 