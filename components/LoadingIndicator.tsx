import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Colours } from '../styles/properties/colours';

export const FullScreenLoadingIndicator = () => {
    return (
        <View style={{ flex: 1, height: '100%', width: '100%' }}>
            <ActivityIndicator animating={true} size={16} color={Colours.primary} />
        </View>
    )
}
export const LoadingIndicator = () => {
    return (
        <ActivityIndicator animating={true} size={16} color="#fff" />
    )
}

type LoadingIndicatorWithTextProps = {
    text: string
}

export const LoadingIndicatorWithText = ({ text }: LoadingIndicatorWithTextProps) => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size={32} color={Colours.secondary} style={styles.loader} />
            <Text variant="bodyMedium" style={styles.loadingText}>
                {text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loader: {
        marginBottom: 16,
    },
    loadingText: {
        color: '#666',
    },
});