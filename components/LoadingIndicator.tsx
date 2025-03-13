import React from 'react';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';

export const LoadingIndicator = () => {
    return (
        <ActivityIndicator animating={true} color={MD2Colors.blue100} />
    )
}
