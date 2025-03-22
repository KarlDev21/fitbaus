/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { Image, Text, View } from 'react-native';
import { Logo, ScreenBase } from '../styles';
import { Colours, Padding } from '../styles/properties';
import { Input, PasswordInput } from '../components/Input';
import { ButtonLink, ButtonPrimary } from '../components/Button';
import { ScrollView } from 'react-native-gesture-handler';
import { useForm } from '../validation/useForm';
import { loginAsync } from '../services/UserProfileService';
import { showToast, ToastType } from '../components/Toast';
import { IconButton } from 'react-native-paper';
import { setItemAsync } from '../helpers/SecureStorageHelper';

const LoginScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { formState, handleChange, validateForm } = useForm({
        email: '',
        loginPassword: '',
    });

    const handleLogin = async () => {
        setIsLoading(true);

        if (!validateForm()) {
            console.log('Validation failed:', formState.errors);
            return;
        }

        const response = await loginAsync(formState.values.email, formState.values.loginPassword);
        if (!response.success) {
            showToast(ToastType.Error, response.error!);
            setIsLoading(false);
            return;
        }

        console.log('RESPONSE:: ', response);
        await setItemAsync('UserProfile', response.data);
        setIsLoading(false);
    };

    function navigateToRegister() {
        console.debug('Register button pressed');
    }

    return (
        <AppScreen>
            <ScrollView style={{ flex: 1, width: '100%', height: '100%' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/logo-placeholder.png')} style={Logo.logo_container} />
                    {/* Login Form */}
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'red',
                        marginVertical: 8,
                    }}>Log In Now</Text>
                    <Text style={{
                        fontSize: 12,
                        textAlign: 'center',
                        marginVertical: 4,
                    }}>Please login to continue using our app</Text>
                </View>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Padding.large, width: '100%' }}>
                    {/* Login Input Email & Password */}
                    <IconButton
                        icon="camera"
                        size={24}
                        onPress={() => console.log('Pressed')}
                    />
                    <Input
                        label={'Email'}
                        value={formState.values.email}
                        onChangeText={(value) => handleChange('email', value)}
                        keyboardType={'email-address'}
                        error={!!formState.errors.email}
                        errorText={formState.errors.email}
                    />

                    <PasswordInput
                        label={'Password'}
                        value={formState.values.loginPassword}
                        onChangeText={(value) => handleChange('loginPassword', value)}
                        keyboardType={'default'}
                        error={!!formState.errors.loginPassword}
                        errorText={formState.errors.loginPassword}
                    />

                    {/* Login Button */}
                    <ButtonPrimary label="Login" onPress={handleLogin} loading={isLoading} style={{ width: '100%', marginTop: 16 }} />

                    {/* Dont have an account */}
                    <View style={ScreenBase.landing_screen_no_account_view}>
                        <Text style={{ fontSize: 12, paddingRight: 8 }}>{"Don't have an account?"}</Text>
                        <ButtonLink label={'Register account'} onPress={navigateToRegister} />
                    </View>
                </View>
            </ScrollView>
        </AppScreen>
    );
};

export default LoginScreen;
