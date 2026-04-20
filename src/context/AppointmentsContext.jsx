import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AppointmentsContext = createContext();

export const useAppointments = () => useContext(AppointmentsContext);

export const AppointmentsProvider = ({ children }) => {
    const { user } = useAuth();
    const [allQueue, setAllQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    const fetchQueue = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/appointments', { params: { date: today } });
            setAllQueue(res.data);
        } catch (err) {
            console.error('Failed to fetch queue:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user, today]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const addToQueue = useCallback(async (patientData) => {
        try {
            const res = await api.post('/api/appointments', patientData);
            setAllQueue(prev => [...prev, res.data]);
            return res.data;
        } catch (err) {
            console.error('Failed to register appointment:', err.message);
            throw err;
        }
    }, []);

    const cancelAppointment = useCallback(async (token, date) => {
        try {
            await api.patch(`/api/appointments/${token}/cancel`, { date });
            setAllQueue(prev => prev.filter(a => a.token !== token || a.date !== date));
        } catch (err) {
            console.error('Failed to cancel appointment:', err.message);
            throw err;
        }
    }, []);

    const fetchAppointmentsRange = useCallback(async (startDate, endDate) => {
        try {
            const res = await api.get('/api/appointments', { params: { startDate, endDate } });
            return res.data;
        } catch (err) {
            console.error('Failed to fetch range:', err.message);
            return [];
        }
    }, []);

    const value = {
        allQueue,
        loading,
        fetchQueue,
        addToQueue,
        cancelAppointment,
        fetchAppointmentsRange,
        today
    };

    return (
        <AppointmentsContext.Provider value={value}>
            {children}
        </AppointmentsContext.Provider>
    );
};
