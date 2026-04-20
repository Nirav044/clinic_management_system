import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const usePatients = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ─── Fetch patients from MongoDB ───────────────────────────────────────
    const fetchPatients = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/patients');
            setPatients(res.data);
        } catch (err) {
            console.error('Failed to fetch patients:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // ─── Filter ────────────────────────────────────────────────────────────
    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mobile?.includes(searchTerm) ||
        p.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── Add patient ───────────────────────────────────────────────────────
    const addPatient = useCallback(async (patientData) => {
        const id = `PAT${String(patients.length + 1).padStart(3, '0')}`;
        try {
            const res = await api.post('/api/patients', { ...patientData, id });
            setPatients(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('Failed to add patient:', err.message);
            throw err;
        }
    }, [patients.length]);

    // ─── Update patient ────────────────────────────────────────────────────
    const updatePatient = useCallback((id, updates) => {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    // ─── Delete patient ────────────────────────────────────────────────────
    const deletePatient = useCallback(async (id) => {
        try {
            await api.delete(`/api/patients/${id}`);
            setPatients(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to delete patient:', err.message);
            throw err;
        }
    }, []);

    // ─── Get single patient ────────────────────────────────────────────────
    const getPatient = useCallback((id) => {
        return patients.find(p => p.id === id);
    }, [patients]);

    // ─── Add visit/EMR record ──────────────────────────────────────────────
    const addVisit = useCallback(async (patientId, visitData) => {
        try {
            const res = await api.post(`/api/patients/${patientId}/visit`, visitData);
            setPatients(prev => prev.map(p => p.id === patientId ? res.data : p));
            return res.data;
        } catch (err) {
            console.error('Failed to add visit:', err.message);
            throw err;
        }
    }, []);

    // ─── Get last visit ────────────────────────────────────────────────────
    const getLastVisit = useCallback((patientId) => {
        const patient = patients.find(p => p.id === patientId);
        return patient?.visits?.[0] || null;
    }, [patients]);

    return {
        patients,
        filteredPatients,
        searchTerm,
        setSearchTerm,
        loading,
        addPatient,
        updatePatient,
        deletePatient,
        getPatient,
        addVisit,
        getLastVisit,
        refresh: fetchPatients,
        totalPatients: patients.length,
    };
};

export default usePatients;
