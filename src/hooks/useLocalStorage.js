import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Clinic-scoped localStorage hook.
 * Data is scoped by clinicId so different clinics have isolated data.
 *
 * Bug-fix: re-reads from storage whenever the scopedKey changes
 * (e.g. when auth loads and clinicId goes from undefined → 'CLINIC001').
 * Also: writes synchronously on every set to avoid losing state on rapid
 * updates (like deletes), rather than relying solely on the useEffect flush.
 */
export const useLocalStorage = (key, initialValue) => {
    const { user } = useAuth();
    const scopeId = user?.clinicId || 'default';
    const scopedKey = `scms_${scopeId}_${key}`;

    // Track the previous key so we can detect changes
    const prevKeyRef = useRef(scopedKey);

    const readFromStorage = (k) => {
        try {
            const item = localStorage.getItem(k);
            return item !== null ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState(() => readFromStorage(scopedKey));

    // Re-read from storage when the scoped key changes (auth loads)
    useEffect(() => {
        if (prevKeyRef.current !== scopedKey) {
            prevKeyRef.current = scopedKey;
            setStoredValue(readFromStorage(scopedKey));
        }
    }, [scopedKey]); // eslint-disable-line

    // Custom setter that writes to localStorage synchronously
    const setValue = (valueOrUpdater) => {
        setStoredValue(prev => {
            const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
            try {
                localStorage.setItem(scopedKey, JSON.stringify(next));
            } catch (err) {
                console.error('useLocalStorage: failed to write:', err);
            }
            return next;
        });
    };

    // Persist on change (belt-and-suspenders)
    useEffect(() => {
        try {
            localStorage.setItem(scopedKey, JSON.stringify(storedValue));
        } catch (err) {
            console.error('useLocalStorage: failed to persist:', err);
        }
    }, [scopedKey, storedValue]);

    return [storedValue, setValue];
};

export default useLocalStorage;
