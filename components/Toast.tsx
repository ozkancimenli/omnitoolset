'use client';

import { useEffect, useState } from 'react';
import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Global toast state
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastState: Toast[] = [];

const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { id, message, type, duration };
  
  toastState = [...toastState, newToast];
  toastListeners.forEach(listener => listener(toastState));
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
};

const removeToast = (id: string) => {
  toastState = toastState.filter(toast => toast.id !== id);
  toastListeners.forEach(listener => listener(toastState));
};

export const toast = {
  success: (message: string, duration?: number) => showToast(message, 'success', duration),
  error: (message: string, duration?: number) => showToast(message, 'error', duration),
  info: (message: string, duration?: number) => showToast(message, 'info', duration),
  warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    toastListeners.push(listener);
    setToasts(toastState);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-400 text-white';
      case 'error':
        return 'bg-red-500/90 border-red-400 text-white';
      case 'warning':
        return 'bg-yellow-500/90 border-yellow-400 text-white';
      case 'info':
      default:
        return 'bg-indigo-500/90 border-indigo-400 text-white';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getToastStyles(toast.type)}
            border rounded-lg shadow-2xl px-6 py-4 min-w-[300px] max-w-[400px]
            pointer-events-auto cursor-pointer
            transform transition-all duration-300 ease-out
            animate-in slide-in-from-right fade-in
            hover:scale-105
          `}
          onClick={() => removeToast(toast.id)}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl font-bold flex-shrink-0">
              {getIcon(toast.type)}
            </span>
            <p className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Make toast available globally
if (typeof window !== 'undefined') {
  (window as any).toast = toast;
}

