import React from 'react';
import Toast, { BaseToast, BaseToastProps, ErrorToast as ErrorToastBase, ToastConfig, ToastShowParams } from 'react-native-toast-message';

const SuccessToast = (props: BaseToastProps) => (
    <BaseToast
        {...props}

        style={{ borderLeftColor: 'green' }}
        text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}
    />
);

const ErrorToast = (props: BaseToastProps) => (
    <ErrorToastBase
        {...props}
        style={{ borderLeftColor: 'red', backgroundColor: '#f8d7da' }}
        text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}
    />
);

export const toastConfig: ToastConfig = {
    success: (props) => <SuccessToast {...props} />,
    error: (props) => <ErrorToast {...props} />,
};


export enum ToastType {
    Success = 'success',
    Error = 'error',
}

export const showToast = (type: ToastType, message: string) => {
    const toastParams: ToastShowParams = {
        type,
        text1: message,
    };

    Toast.show(toastParams);
};
