import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native';
import { LoadingIndicator } from './LoadingIndicator';

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
        // TODO: Fix styling issues
        <SafeAreaView style={{ width: '100%', height: '100%', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {isLoading && <LoadingIndicator />}
            {props.children}
        </SafeAreaView>
    )
}