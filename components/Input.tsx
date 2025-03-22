import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput } from 'react-native-paper';

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
        <View style={styles.container}>
            <TextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                mode="outlined"
                error={error}
                style={styles.input}
            />
            {error && errorText ? <Text style={styles.errorText} >{errorText}</Text> : null}
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
    return (
        <View style={styles.container}>
            <TextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                mode="outlined"
                error={error}
                style={styles.input}
                secureTextEntry={showPassword}
                right={<TextInput.Icon icon="account" onPress={() => { setShowPassword(!showPassword) }} />}
            />
            {error && errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8,
    },
    input: {
        backgroundColor: 'white',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
});
