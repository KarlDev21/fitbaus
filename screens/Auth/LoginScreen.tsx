/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { AppScreen } from '../../components/AppScreen';
import { Text, View } from 'react-native';
import { ScreenBase } from '../../styles';
import { Padding } from '../../styles/properties';
import { Input, PasswordInput } from '../../components/Input';
import { ButtonLink, ButtonPrimary } from '../../components/Button';
import { useForm } from '../../validation/useForm';
import { loginAsync } from '../../services/UserProfileService';
import { showToast, ToastType } from '../../components/Toast';
import { SECURE_STORE_KEYS, setItemAsync } from '../../helpers/SecureStorageHelper';
import LogoComponent from '../../components/Logo';
import { textStyles } from '../../styles/components/textStyles';
import { Width, GenericSize, Flex } from '../../styles/properties/dimensions';
import { useSetAtom } from 'jotai';
import { navigationRefAuthenticated, navigationRefUnauthenticated } from '../../nav/ScreenDefinitions';
import { userAtom } from '../../state/atom/userAtom';

const LoginScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { formState, handleChange, validateForm } = useForm({
        email: 'Test1@test.com',
        loginPassword: 'Project1234!',
    });
    const setUser = useSetAtom(userAtom);

    const handleLogin = async () => {
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        //Will need to revert back to this on BE integration
        const response = await loginAsync(formState.values.email, formState.values.loginPassword);
        //mocking this for now to get in 
        // const response = {
        //     success: true,
        //     error: "an error occurred",
        //     data: {
        //         email: formState.values.email,
        //         loginPassword: formState.values.loginPassword,
        //         userID: 'mockUserID',
        //         name: 'Mock User',
        //         phone: '1234567890',
        //         token: 'mockToken',
        //         role: 'user',
        //     },
        // };

        if (!response.success) {
            showToast(ToastType.Error, response.error!);
            setIsLoading(false);
            return;
        }

        await setItemAsync(SECURE_STORE_KEYS.USER_PROFILE, response.data);
        setUser(response.data)
        setIsLoading(false);
        showToast(ToastType.Success, 'Login successful!');

        if (navigationRefAuthenticated.isReady()) {
            navigationRefAuthenticated.navigate('Home');
        }
    };

    function navigateToRegister() {
        navigationRefUnauthenticated.navigate('RegistrationScreen');
    }

    return (
        <AppScreen>
            {/* <ScrollView style={{ flex: Flex.xsmall, width: Width.full, height: Height.full }}> */}
            <View style={{ flex: Flex.xsmall, justifyContent: 'center', alignItems: 'center' }}>
            <LogoComponent containerStyle={{flex: Flex.xsmall}}/>
                {/* Login Form */}
                <Text style={textStyles.heading}>{'Log In Now'}</Text>
                <Text style={textStyles.subtitle}>{'Please login to continue using our app'}</Text>
            </View>

            <View style={{ flex: Flex.xsmall, justifyContent: 'center', alignItems: 'center', padding: Padding.large, width: Width.full }}>
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

                <ButtonPrimary label="Login" onPress={handleLogin} loading={isLoading} style={{ width: Width.full, marginTop: GenericSize.medium }} />

                <View style={ScreenBase.landing_screen_no_account_view}>
                    <Text style={[textStyles.subtitle, { paddingRight: Padding.small }]}>{"Don't have an account?"}</Text>
                    <ButtonLink label={'Register account'} onPress={navigateToRegister} />
                </View>
            </View>
            {/* </ScrollView> */}
        </AppScreen>
    );
};

export default LoginScreen;
