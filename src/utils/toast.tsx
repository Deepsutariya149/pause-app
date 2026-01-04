import React, { useState, useCallback } from 'react';
import { Toast } from '../components/Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

let toastState: ToastState = {
  message: '',
  type: 'info',
  visible: false,
};

let setToastState: ((state: ToastState) => void) | null = null;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  setToastState = setToast;

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </>
  );
};

export const toast = {
  success: (message: string, title?: string) => {
    const fullMessage = title ? `${title}: ${message}` : message;
    if (setToastState) {
      setToastState({
        message: fullMessage,
        type: 'success',
        visible: true,
      });
    }
  },
  error: (message: string, title?: string) => {
    const fullMessage = title ? `${title}: ${message}` : message;
    if (setToastState) {
      setToastState({
        message: fullMessage,
        type: 'error',
        visible: true,
      });
    }
  },
  info: (message: string, title?: string) => {
    const fullMessage = title ? `${title}: ${message}` : message;
    if (setToastState) {
      setToastState({
        message: fullMessage,
        type: 'info',
        visible: true,
      });
    }
  },
};




