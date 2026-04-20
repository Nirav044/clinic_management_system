import { useState } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

let toastIdCounter = 0;

// Simple toast notification state management
const toastListeners = [];
let toasts = [];

const notifyListeners = () => {
    toastListeners.forEach(fn => fn([...toasts]));
};

export const showToast = (message, type = 'success', duration = 3000) => {
    const id = ++toastIdCounter;
    const toast = { id, message, type, duration };
    toasts = [...toasts, toast];
    notifyListeners();
    setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        notifyListeners();
    }, duration);
};

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
};

export const ToastContainer = () => {
    const [toastList, setToastList] = useState([]);

    // Subscribe to toast changes
    useState(() => {
        toastListeners.push(setToastList);
        return () => {
            const idx = toastListeners.indexOf(setToastList);
            if (idx > -1) toastListeners.splice(idx, 1);
        };
    });

    if (toastList.length === 0) return null;

    return (
        <div className="toast-container">
            {toastList.map(toast => {
                const Icon = icons[toast.type] || Info;
                return (
                    <div key={toast.id} className={`toast toast-${toast.type} animate-fade-in`}>
                        <Icon size={18} />
                        <span>{toast.message}</span>
                        <button onClick={() => {
                            toasts = toasts.filter(t => t.id !== toast.id);
                            notifyListeners();
                        }}>
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default ToastContainer;
