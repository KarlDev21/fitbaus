import React from 'react';
import { AppScreen } from '../components/AppScreen';
import { Image, Text, View } from 'react-native';
import { Spacer, Logo, ScreenBase } from '../styles';
import { ButtonLink, ButtonPrimary } from '../components/Button';

const LandingScreen = () => {
    async function navigateToLogin() {
        console.debug('Login button pressed');
    }

    async function navigateToRegister() {
        console.debug('Register button pressed');
    }


    return (
        <AppScreen>
            <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={require('../assets/logo-placeholder.png')} style={Logo.logo_container} />
                {/* <View style={Spacer.logo_spacer} /> */}
            </View>

            <View style={ScreenBase.landing_screen_container}>
                <ButtonPrimary label="Login" onPress={navigateToLogin} />

                <View style={ScreenBase.landing_screen_no_account_view}>
                    <Text style={{ fontSize: 12, paddingRight: 8 }}>{"Don't have an account?"}</Text>
                    <ButtonLink label={'Register account'} onPress={navigateToRegister} />
                </View>
            </View>

            <View style={{ padding: 32 }}>
                <Text style={{ fontSize: 12, textAlign: 'center' }}>{"Version 1.0.1"}</Text>
            </View>
        </AppScreen >
    )
}

export default LandingScreen;