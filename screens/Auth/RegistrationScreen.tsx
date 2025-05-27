/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { AppScreen } from '../../components/AppScreen';
import { Image, ScrollView, Text, View } from 'react-native';
import { Logo, ScreenBase } from '../../styles';
import { Flex, Padding } from '../../styles/properties';
import { Input, PasswordInput } from '../../components/Input';
import { ButtonLink, ButtonPrimary } from '../../components/Button';
import { useForm } from '../../validation/useForm';
import { registerAsync } from '../../services/UserProfileService';
import { showToast, ToastType } from '../../components/Toast';
import { SECURE_STORE_KEYS, setItemAsync } from '../../helpers/SecureStorageHelper';
import { Height, GenericSize, Width } from '../../styles/properties/dimensions';
import { textStyles } from '../../styles/components/textStyles';
import { useSetAtom } from 'jotai';
import { userAtom } from '../../state/atom/userAtom';
import { navigationRefAuthenticated, navigationRefUnauthenticated } from '../../nav/ScreenDefinitions';

const RegistrationScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const setUser = useSetAtom(userAtom);
    const { formState, handleChange, validateForm } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const handleRegister = async () => {
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        const response = await registerAsync(formState.values.name, formState.values.email, formState.values.password, formState.values.phone);
        if (!response.success) {
            showToast(ToastType.Error, response.error!);
            setIsLoading(false);
            return;
        }

        //mocking this for now to get in 
        // const response = {
        //     success: true,
        //     error: "an error occurred",
        //     data: {
        //         name: formState.values.name,
        //         email: formState.values.email,
        //         phone: formState.values.phone,
        //     },
        // };

        console.log("register working")
        await setItemAsync(SECURE_STORE_KEYS.USER_PROFILE, response.data);
        setUser(response.data)
        showToast(ToastType.Success, 'Registration successful!');
        setIsLoading(false);

        if (navigationRefAuthenticated.isReady()) {
            navigationRefAuthenticated.navigate('Home');
        }
    };

    function navigateToLogin() {
        navigationRefUnauthenticated.navigate('LoginScreen');
    }

    return (
        <AppScreen>
            <ScrollView style={{ flex: Flex.xsmall, width: Width.full, height: Height.full }}>
                <View style={{ flex: Flex.xsmall, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../assets/stower_logo.png')} style={Logo.logo_container} />
                    <Text style={textStyles.heading}>{'Register Now'}</Text>
                    <Text style={textStyles.subtitle}>{'Please register to continue using our app'}</Text>
                </View>

                <View style={{ flex: Flex.xsmall, justifyContent: 'center', alignItems: 'center', padding: Padding.large, width: Width.full }}>
                    <Input
                        label={'Name'}
                        value={formState.values.name}
                        onChangeText={(value) => handleChange('name', value)}
                        keyboardType={'default'}
                        error={!!formState.errors.name}
                        errorText={formState.errors.name}
                    />
                    <Input
                        label={'Email'}
                        value={formState.values.email}
                        onChangeText={(value) => handleChange('email', value)}
                        keyboardType={'email-address'}
                        error={!!formState.errors.email}
                        errorText={formState.errors.email}
                    />
                    <Input
                        label={'Phone Number'}
                        value={formState.values.phone}
                        onChangeText={(value) => handleChange('phone', value)}
                        keyboardType={'phone-pad'}
                        error={!!formState.errors.phone}
                        errorText={formState.errors.phone}
                    />
                    <PasswordInput
                        label={'Password'}
                        value={formState.values.password}
                        onChangeText={(value) => handleChange('password', value)}
                        keyboardType={'default'}
                        error={!!formState.errors.password}
                        errorText={formState.errors.password}
                    />

                    <ButtonPrimary label="Register" onPress={handleRegister} loading={isLoading} style={{ width: Width.full, marginTop: GenericSize.medium }} />

                    <View style={ScreenBase.landing_screen_no_account_view}>
                        <Text style={[textStyles.subtitle, { paddingRight: Padding.small }]}>{'Already have an account?'}</Text>
                        <ButtonLink label={'Login'} onPress={navigateToLogin} />
                    </View>
                </View>
            </ScrollView>
        </AppScreen>
    );
};

export default RegistrationScreen;
