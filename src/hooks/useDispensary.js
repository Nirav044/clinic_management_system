import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const DISPENSARY_CATEGORIES = [
    { key: 'medication',   label: 'Medications / Tablets',  icon: '💊', color: '#4f46e5' },
    { key: 'injection',    label: 'Injections',              icon: '💉', color: '#f43f5e' },
    { key: 'iv_fluid',     label: 'IV Fluids',               icon: '🩸', color: '#0ea5e9' },
    { key: 'nebulization', label: 'Nebulization',            icon: '🌬️', color: '#10b981' },
    { key: 'dressing',     label: 'Dressing / Procedure',    icon: '🩹', color: '#f59e0b' },
    { key: 'other',        label: 'Other',                   icon: '📋', color: '#64748b' },
];

const useDispensary = () => {
    const { user } = useAuth();
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(false);

    // ─── Fetch from MongoDB ────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/dispensary');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch dispensary orders:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // ─── Add order ─────────────────────────────────────────────────────────
    const addOrder = useCallback(async (orderData) => {
        try {
            const res = await api.post('/api/dispensary', orderData);
            setOrders(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            console.error('Failed to add dispensary order:', err.message);
            throw err;
        }
    }, []);

    // ─── Update order status ───────────────────────────────────────────────
    const updateOrderStatus = useCallback(async (orderId, status) => {
        try {
            const res = await api.patch(`/api/dispensary/${orderId}`, { status });
            setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
        } catch (err) {
            console.error('Failed to update order status:', err.message);
        }
    }, []);

    // ─── Toggle individual item dispensed ──────────────────────────────────
    const toggleItemDispensed = useCallback(async (orderId, itemIndex) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const items = order.items.map((item, i) =>
            i === itemIndex ? { ...item, dispensed: !item.dispensed } : item
        );
        const allDone  = items.every(i => i.dispensed);
        const someDone = items.some(i => i.dispensed);
        const newStatus = allDone ? 'dispensed' : someDone ? 'partial' : 'pending';

        try {
            const res = await api.patch(`/api/dispensary/${orderId}`, { items, status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
        } catch (err) {
            console.error('Failed to toggle item:', err.message);
        }
    }, [orders]);

    const indoorOrders    = orders.filter(o => o.type === 'indoor');
    const outdoorOrders   = orders.filter(o => o.type === 'outdoor');
    const pendingOrders   = orders.filter(o => o.status === 'pending' || o.status === 'partial');
    const completedOrders = orders.filter(o => o.status === 'dispensed');

    const getPatientOrders = useCallback((patientId) => {
        return orders.filter(o => o.patientId === patientId);
    }, [orders]);

    return {
        orders,
        loading,
        indoorOrders,
        outdoorOrders,
        pendingOrders,
        completedOrders,
        addOrder,
        updateOrderStatus,
        toggleItemDispensed,
        getPatientOrders,
        refresh: fetchOrders,
    };
};

export default useDispensary;
