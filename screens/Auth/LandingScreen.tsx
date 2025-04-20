import React from 'react';
import { AppScreen } from '../../components/AppScreen';
import { Image, Text, View } from 'react-native';
import { Logo, ScreenBase } from '../../styles';
import { ButtonLink, ButtonPrimary } from '../../components/Button';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

const LandingScreen = () => {
    const navigation = useNavigation<NavigationProp<any>>();

    function navigateToLogin() {
        navigation.navigate('LoginScreen');
    }

    async function navigateToRegister() {
        navigation.navigate('RegistrationScreen');
    }


    return (
        <AppScreen>
            <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={require('../../assets/logo-placeholder.png')} style={Logo.logo_container} />
            </View>

            <View style={ScreenBase.landing_screen_container}>
                <ButtonPrimary label="Login" onPress={navigateToLogin} />

                <View style={ScreenBase.landing_screen_no_account_view}>
                    <Text style={{ fontSize: 12, paddingRight: 8 }}>{"Don't have an account?"}</Text>
                    <ButtonLink label={'Register account'} onPress={navigateToRegister} />
                </View>
            </View>

            <View style={{ padding: 32 }}>
                <Text style={{ fontSize: 12, textAlign: 'center' }}>{`Version ${DeviceInfo.getVersion()}`}</Text>
            </View>
        </AppScreen >
    )
}

export default LandingScreen;