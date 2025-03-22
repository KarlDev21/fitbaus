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
import { registerAsync } from '../services/UserProfileService';
import { showToast, ToastType } from '../components/Toast';
import { setItemAsync } from '../helpers/SecureStorageHelper';

const RegistrationScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { formState, handleChange, validateForm } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const handleRegister = async () => {
        setIsLoading(true);

        if (!validateForm()) {
            console.log('Validation failed:', formState.errors);
            setIsLoading(false);
            return;
        }

        const response = await registerAsync(formState.values.name, formState.values.email, formState.values.password, formState.values.phone);
        if (!response.success) {
            showToast(ToastType.Error, response.error!);
            setIsLoading(false);
            return;
        }

        console.log('RESPONSE:: ', response);
        await setItemAsync('UserProfile', response.data);
        setIsLoading(false);
    };

    function navigateToLogin() {
        console.debug('Login button pressed');
    }

    return (
        <AppScreen>
            <ScrollView style={{ flex: 1, width: '100%', height: '100%' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/logo-placeholder.png')} style={Logo.logo_container} />
                    {/* Registration Form */}
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: Colours.primary,
                        marginVertical: 8,
                    }}>Register Now</Text>
                    <Text style={{
                        fontSize: 12,
                        textAlign: 'center',
                        marginVertical: 4,
                    }}>Please register to continue using our app</Text>
                </View>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Padding.large, width: '100%' }}>
                    {/* Registration Input Fields */}
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

                    {/* Register Button */}
                    <ButtonPrimary label="Register" onPress={handleRegister} loading={isLoading} style={{ width: '100%', marginTop: 16 }} />

                    {/* Already have an account */}
                    <View style={ScreenBase.landing_screen_no_account_view}>
                        <Text style={{ fontSize: 12, paddingRight: 8 }}>{"Already have an account?"}</Text>
                        <ButtonLink label={'Login'} onPress={navigateToLogin} />
                    </View>
                </View>
            </ScrollView>
        </AppScreen>
    );
};

export default RegistrationScreen;