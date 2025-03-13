import React from 'react';
import Toast, { BaseToast, ErrorToast as ErrorToastBase } from 'react-native-toast-message';


const SuccessToast = (props: any) => (
    <BaseToast
        {...props}
        style={{ borderLeftColor: 'green' }}
        text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}
    />
);

const ErrorToast = (props: any) => (
    <ErrorToastBase
        {...props}
        text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}
    />
);

export const toastConfig = {
    success: (props: any) => <SuccessToast {...props} />,
    error: (props: any) => <ErrorToast {...props} />,
};

export enum ToastType {
    Success = 'success',
    Error = 'error',
}

export const showToast = (type: ToastType, message: string) => {
    Toast.show({
        type,
        text1: message,
    });
};
