import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native';
import { FullScreenLoadingIndicator } from './LoadingIndicator';
import { Width, Height, Flex, Margin } from '../styles/properties/dimensions';

type ScreenComponentProps = {
    children: React.ReactNode;
    isLoading?: boolean;
}

export function AppScreen(props: ScreenComponentProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(props.isLoading ?? false);
    }, [props.isLoading]);

    return (
        <SafeAreaView style={{ width: Width.full, height: Height.full, flex: Flex.xsmall, marginTop: Margin.large }}>
            {isLoading && <FullScreenLoadingIndicator />}
            {!isLoading && props.children}
        </SafeAreaView>
    )
}