import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const PrescriptionsContext = createContext();

export const usePrescriptions = () => useContext(PrescriptionsContext);

export const PrescriptionsProvider = ({ children }) => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // ─── Fetch from MongoDB ────────────────────────────────────────────────
    const fetchPrescriptions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/prescriptions');
            setPrescriptions(res.data);
        } catch (err) {
            console.error('Failed to fetch prescriptions:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    // ─── Add prescription ──────────────────────────────────────────────────
    const addPrescription = useCallback(async (data) => {
        try {
            const res = await api.post('/api/prescriptions', {
                patient:       data.patient || '',
                patientMobile: data.patientMobile || '',
                patientId:     data.patientId || '',
                doctor:        data.doctor || user?.name || 'Doctor',
                clinic:        data.clinic || user?.clinicName || 'SmartClinic',
                diagnosis:     data.diagnosis || '',
                labReferrals:  data.labReferrals || [],
                medicines:     data.medicines || [],
            });
            setPrescriptions(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('Failed to add prescription:', err.message);
            throw err;
        }
    }, [user]);

    // ─── Mark dispensed ────────────────────────────────────────────────────
    const markDispensed = useCallback(async (rxId) => {
        try {
            const res = await api.patch(`/api/prescriptions/${rxId}/status`, { status: 'Dispensed' });
            setPrescriptions(prev => prev.map(rx => rx.id === rxId ? res.data : rx));
        } catch (err) {
            console.error('Failed to mark dispensed:', err.message);
        }
    }, []);

    const pendingCount   = prescriptions.filter(rx => rx.status === 'Pending').length;
    const dispensedCount = prescriptions.filter(rx => rx.status === 'Dispensed').length;

    return (
        <PrescriptionsContext.Provider value={{
            prescriptions,
            loading,
            addPrescription,
            markDispensed,
            pendingCount,
            dispensedCount,
            refresh: fetchPrescriptions,
        }}>
            {children}
        </PrescriptionsContext.Provider>
    );
};
