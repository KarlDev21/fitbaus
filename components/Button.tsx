import React from 'react';
import { GestureResponderEvent, StyleProp, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { Colours } from '../styles/properties/colours';
import { buttonStyles } from '../styles/components/buttonStyles';

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
            style={[buttonStyles.primaryButton, style]}
            labelStyle={buttonStyles.primaryText}
            accessibilityLabel={label}
            buttonColor={Colours.primary}
        >
            {label}
        </Button>
    )
}

export const ButtonLink: React.FC<BaseButtonProps> = ({ label, onPress, disabled = false, style }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[buttonStyles.linkButton, style]}
            accessibilityLabel={label}
        >
            <Text style={buttonStyles.linkText}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};



