// src/components/context/toast-context.tsx
'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Toast } from '@/components/ui/toast';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Omit<ToastState, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: { id: string } };

interface ToastContextType {
  toasts: ToastState[];
  addToast: (message: string, type: ToastState['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastReducer = (state: ToastState[], action: ToastAction): ToastState[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, { ...action.payload, id: Date.now().toString() }];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload.id);
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (message: string, type: ToastState['type']) => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: { id } });
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};