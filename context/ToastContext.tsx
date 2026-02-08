
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const MotionDiv = motion.div as any;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    }, []);

    const success = (msg: string) => showToast(msg, 'success');
    const error = (msg: string) => showToast(msg, 'error');
    const warning = (msg: string) => showToast(msg, 'warning');
    const info = (msg: string) => showToast(msg, 'info');

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <MotionDiv
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
                ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
                ${toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
                ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
              `}
                        >
                            <div className="flex-shrink-0">
                                {toast.type === 'success' && <CheckCircle size={20} className="text-green-600" />}
                                {toast.type === 'error' && <XCircle size={20} className="text-red-600" />}
                                {toast.type === 'warning' && <AlertCircle size={20} className="text-amber-600" />}
                                {toast.type === 'info' && <Info size={20} className="text-blue-600" />}
                            </div>
                            <p className="flex-1 text-sm font-medium">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={16} className="opacity-50 hover:opacity-100" />
                            </button>
                        </MotionDiv>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
