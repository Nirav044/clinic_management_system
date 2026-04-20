import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const BillingContext = createContext();

export const useBilling = () => useContext(BillingContext);

export const BillingProvider = ({ children }) => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading]   = useState(false);

    // ─── Fetch from MongoDB ────────────────────────────────────────────────
    const fetchInvoices = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/invoices');
            setInvoices(res.data);
        } catch (err) {
            console.error('Failed to fetch invoices:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // ─── Add invoice ───────────────────────────────────────────────────────
    const addInvoice = useCallback(async (data) => {
        try {
            const res = await api.post('/api/invoices', data);
            setInvoices(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('Failed to add invoice:', err.message);
            throw err;
        }
    }, []);

    // ─── Mark as paid ──────────────────────────────────────────────────────
    const markAsPaid = useCallback(async (invoiceId, method = 'Cash') => {
        try {
            const res = await api.patch(`/api/invoices/${invoiceId}`, { status: 'Paid', method });
            setInvoices(prev => prev.map(inv => inv.id === invoiceId ? res.data : inv));
        } catch (err) {
            console.error('Failed to mark invoice as paid:', err.message);
        }
    }, []);

    // ─── Update invoice ────────────────────────────────────────────────────
    const updateInvoice = useCallback(async (invoiceId, updates) => {
        try {
            const res = await api.patch(`/api/invoices/${invoiceId}`, updates);
            setInvoices(prev => prev.map(inv => inv.id === invoiceId ? res.data : inv));
        } catch (err) {
            console.error('Failed to update invoice:', err.message);
        }
    }, []);

    const totalCollected = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending   = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <BillingContext.Provider value={{
            invoices,
            loading,
            addInvoice,
            markAsPaid,
            updateInvoice,
            totalCollected,
            totalPending,
            refresh: fetchInvoices,
        }}>
            {children}
        </BillingContext.Provider>
    );
};
