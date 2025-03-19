import React from 'react';
import { GestureResponderEvent, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { Colours } from '../styles/properties/colours';

type BaseButtonProps = {
    label: string;
    onPress: (e: GestureResponderEvent) => void;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>
}

export const ButtonPrimary: React.FC<BaseButtonProps> = ({ label, onPress, disabled = false, loading = false, style }) => {
    return (
        <Button
            mode={'contained'}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            style={[styles.primaryButton, style]}
            labelStyle={styles.primaryText}
            accessibilityLabel={label}
            buttonColor={Colours.primary}
        >
            {label}
        </Button>
    )
}

export const ButtonLink: React.FC<BaseButtonProps> = ({ label, onPress, disabled = false, loading = false, style }) => {
    return (
        <TouchableOpacity
            // mode={'text'}
            onPress={onPress}
            disabled={disabled}
            style={[styles.linkButton, style]}
            // labelStyle={styles.linkText}
            // loading={loading}
            accessibilityLabel={label}
        // textColor={Colours.primary}
        >
            <Text style={styles.linkText}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    primaryButton: {
        borderRadius: 8,
        paddingVertical: 5,
    },
    primaryText: {
        fontSize: 16,
        color: 'white',
    },
    linkButton: {
        marginVertical: 12,
    },
    linkText: {
        fontSize: 12,
        textDecorationLine: 'underline',
    },
});
