import React from 'react';
import { AppScreen } from '../../components/AppScreen';
import { Text, View } from 'react-native';
import { ScreenBase } from '../../styles';
import { ButtonLink, ButtonPrimary } from '../../components/Button';
import DeviceInfo from 'react-native-device-info';
import { FontSize, Padding } from '../../styles/properties';
import LogoComponent from '../../components/Logo';
import { navigationRefUnauthenticated } from '../../nav/ScreenDefinitions';

const LandingScreen = () => {

    function navigateToLogin() {
        navigationRefUnauthenticated.navigate('LoginScreen')
    }

    function navigateToRegister() {
        navigationRefUnauthenticated.navigate('RegistrationScreen')
    }


    return (
        <AppScreen>
            <LogoComponent />

            <View style={ScreenBase.landing_screen_container}>
                <ButtonPrimary label="Login" onPress={navigateToLogin} />

                <View style={ScreenBase.landing_screen_no_account_view}>
                    <Text style={{ fontSize: FontSize.small, paddingRight: Padding.small }}>{"Don't have an account?"}</Text>
                    <ButtonLink label={'Register account'} onPress={navigateToRegister} />
                </View>
            </View>

            <View style={{ padding: Padding.large }}>
                <Text style={{ fontSize: FontSize.medium, textAlign: 'center' }}>{`Version ${DeviceInfo.getVersion()}`}</Text>
            </View>
        </AppScreen >
    )
}

export default LandingScreen;