import {StyleSheet} from 'react-native';
import {Colours, Dimensions, FontSize, Margin, Padding} from '../properties';
import { GenericSize } from '../properties/dimensions';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export const cardStyles = StyleSheet.create({
    card: {
        marginBottom: GenericSize.medium,
        elevation: GenericSize.ssmall,
        backgroundColor: Colours.backgroundPrimary,
    },
    cardTitle: {
        marginBottom: GenericSize.small,
        fontWeight: 'bold',
        color: Colours.textPrimary
    },
    cardDescription: {
        marginBottom: GenericSize.medium,
        color: Colors.textPrimary,
    },
});
