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
        <SafeAreaView>
            {isLoading && <LoadingIndicator />}
            {props.children}
        </SafeAreaView>
    )
}