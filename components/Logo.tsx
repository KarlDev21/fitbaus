// components/Logo.tsx
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Flex } from '../styles/properties/dimensions';
import { Logo } from '../styles/images';

/**
 * A simple React component that renders a logo image.
 *
 * @return {React.ReactElement} A React element to be rendered.
 */
const LogoComponent = () => (
    <View style={{ flex: Flex.small, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../assets/logo-placeholder.png')} style={Logo.logo_container} />
    </View>
);


export default LogoComponent;
