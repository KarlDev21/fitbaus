import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Colours } from '../styles/properties/colours';
import { Flex, GenericSize, Margin, Padding } from '../styles/properties/dimensions';

export const FullScreenLoadingIndicator = () => {
    return (
        <View style={{
            flex: Flex.xsmall,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f9f9f9',
        }}>
            <ActivityIndicator animating={true} size={GenericSize.medium} color={Colours.primary} />
        </View>
    )
}
export const LoadingIndicator = () => {
    return (
        <ActivityIndicator animating={true} size={GenericSize.medium} color={Colours.backgroundPrimary} />
    )
}

type LoadingIndicatorWithTextProps = {
    text: string
}

export const LoadingIndicatorWithText = ({ text }: LoadingIndicatorWithTextProps) => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size={GenericSize.large} color={Colours.secondary} style={styles.loader} />
            <Text variant="bodyMedium" style={styles.loadingText}>
                {text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({

    loadingContainer: {
        flex: Flex.xsmall,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Padding.medium,
    },
    loader: {
        marginBottom: Margin.medium,
    },
    loadingText: {
        color: Colours.textPrimary,
    },
});