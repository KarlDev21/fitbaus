import React from 'react';
import { View, Text, Button, Image } from 'react-native';
import { Colours } from '../styles/properties/colours';

interface NoInternetScreenProps {
    onRetry: () => void;
}

const NoInternetScreen: React.FC<NoInternetScreenProps> = ({ onRetry }) => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
            }}
        >

            <Image
                source={require('../assets/logo-placeholder.png')}
                style={{
                    width: 150,
                    height: 150,
                    marginBottom: 24,
                }}
                resizeMode="contain"
            />
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: 16,
                }}
            >
                No Internet Connection
            </Text>
            <Text
                style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 24,
                    textAlign: 'center',
                    paddingHorizontal: 20,
                }}
            >
                Please check your internet connection and try again.
            </Text>
            <Button title="Retry" onPress={onRetry} color={Colours.primary} />
        </View>
    );
};

export default NoInternetScreen;