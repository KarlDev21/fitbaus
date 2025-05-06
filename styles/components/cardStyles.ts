import {StyleSheet} from 'react-native';
import {Colours } from '../properties';
import { GenericSize, Padding } from '../properties/dimensions';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export const cardStyles = StyleSheet.create({
    card: {
        marginHorizontal: GenericSize.small,
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
    content:{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Padding.small,
    }
});
