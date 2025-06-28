import { createContext, useContext, useState } from 'react';
import toast, { type Toast } from 'react-simple-toasts';
import 'react-simple-toasts/dist/style.css';

interface ToastContextType {
  showToast: (message: string, type?: 'default' | 'success' | 'error' | 'warning') => void;
  hideToast: () => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [myToast, setMyToast] = useState<Toast | null>(null);

  const getStyle = (type: string): string => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white px-4 py-2';
      case 'error':
        return 'bg-red-600 text-white px-4 py-2';
      case 'warning':
        return 'bg-yellow-500 text-black px-4 py-2';
      default:
        return 'bg-gray-800 text-white px-4 py-2';
    }
  };

  const showToast = (message: string, type: 'default' | 'success' | 'error' | 'warning' = 'default') => {
    const newToast = toast(message, {
      className: getStyle(type),
      duration: 3000,
      clickClosable: true,
    });
    setMyToast(newToast);
  };

  const hideToast = () => {
    if (myToast) myToast.close();
  };

  const success = (msg: string) => showToast(msg, 'success');
  const error = (msg: string) => showToast(msg, 'error');
  const warning = (msg: string) => showToast(msg, 'warning');

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, warning }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
