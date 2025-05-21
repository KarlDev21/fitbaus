import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { inputStyles } from '../styles/components/inputStyles';
import { Colours } from '../styles/properties';

interface TextInputProps {
    label: string;
    value: string | undefined;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
    error?: boolean;
    errorText?: string;
}

export const Input: React.FC<TextInputProps> = ({
    label,
    value,
    onChangeText,
    keyboardType = 'default',
    error = false,
    errorText
}) => {
    return (
        <View style={inputStyles.container}>
            <TextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                mode="outlined"
                activeOutlineColor={Colours.primary}
                error={error}
                style={inputStyles.input}
            />
            {error && errorText ? <Text style={inputStyles.errorText} >{errorText}</Text> : null}
        </View>
    );
};

export const PasswordInput: React.FC<TextInputProps> = ({
    label,
    value,
    onChangeText,
    keyboardType = 'default',
    error = false,
    errorText
}) => {
    const [showPassword, setShowPassword] = useState<boolean>(true);

    function showOrHidePassword() {
        setShowPassword(!showPassword);
    }

    return (
        <View style={inputStyles.container}>
            <TextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                mode="outlined"
                activeOutlineColor={Colours.primary}
                error={error}
                style={inputStyles.input}
                secureTextEntry={showPassword}
                right={showPassword ? <TextInput.Icon icon="eye" onPress={showOrHidePassword} /> : <TextInput.Icon icon="eye-off" onPress={showOrHidePassword} />}
            />
            {error && errorText ? <Text style={inputStyles.errorText}>{errorText}</Text> : null}
        </View>
    );
};


