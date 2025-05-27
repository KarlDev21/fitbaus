// components/Logo.tsx
import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { Logo } from '../styles/images';

/**
 * A simple React component that renders a logo image.
 *
 * @return {React.ReactElement} A React element to be rendered.
 */
interface LogoComponentProps {
    containerStyle?: ViewStyle;
}

const LogoComponent: React.FC<LogoComponentProps> = ({ containerStyle }) => (
    <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image source={require('../assets/stower_logo.png')} style={Logo.logo_container} />
    </View>
);


export default LogoComponent;
