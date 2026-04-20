import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentsContext';
import api from '../services/api';

const useQueue = () => {
    const { user } = useAuth();
    const { allQueue, loading, fetchQueue, addToQueue, cancelAppointment, fetchAppointmentsRange, today } = useAppointments();

    // ─── Computed state ────────────────────────────────────────────────────
    const queue = useMemo(() => allQueue.filter(q => q.date === today && q.status !== 'Cancelled'), [allQueue, today]);
    const waitingCount    = useMemo(() => queue.filter(q => q.status === 'Waiting').length, [queue]);
    const completedCount  = useMemo(() => queue.filter(q => q.status === 'Completed').length, [queue]);
    const consultingItem  = useMemo(() => queue.find(q => q.status === 'Consulting') || null, [queue]);
    const waitingList     = useMemo(() => queue.filter(q => q.status === 'Waiting'), [queue]);
    const todayRevenue    = useMemo(() => queue.filter(q => q.status === 'Completed').reduce((sum, q) => sum + (q.fee || 0), 0), [queue]);
    const nextTokenNum    = queue.length + 1;
    const nextToken       = `T-${String(nextTokenNum).padStart(3, '0')}`;

    // ─── Call patient (Waiting → Consulting) ───────────────────────────────
    const callPatient = useCallback(async (token, date) => {
        try {
            const res = await api.patch(`/api/appointments/${token}/status`, { 
                status: 'Consulting',
                date: date || today 
            });
            await fetchQueue();
            return res.data;
        } catch (err) {
            console.error('Failed to call patient:', err.message);
        }
    }, [fetchQueue, today]);

    // ─── Mark completed ────────────────────────────────────────────────────
    const markCompleted = useCallback(async (token, date) => {
        try {
            const res = await api.patch(`/api/appointments/${token}/status`, { 
                status: 'Completed',
                date: date || today
            });
            // Since context manages allQueue, we should ideally have a method in context to update small bits,
            // but for now, we can manually trigger a fetch or wait for polling if implemented.
            // A better way: context provides setAllQueue or a dispatch.
            await fetchQueue(); // Refresh for now
        } catch (err) {
            console.error('Failed to mark completed:', err.message);
        }
    }, [fetchQueue, today]);

    // ─── Skip patient ──────────────────────────────────────────────────────
    const skipPatient = useCallback(async (token) => {
        try {
            await api.patch(`/api/appointments/${token}/status`, { status: 'Skipped' });
            await fetchQueue();
        } catch (err) {
            console.error('Failed to skip patient:', err.message);
        }
    }, [fetchQueue]);

    // ─── Update fee ────────────────────────────────────────────────────────
    const updateFee = useCallback(async (token, fee, date) => {
        try {
            await api.patch(`/api/appointments/${token}/fee`, { 
                fee: Number(fee),
                date: date || today
            });
            await fetchQueue();
        } catch (err) {
            console.error('Failed to update fee:', err.message);
        }
    }, [fetchQueue, today]);

    return {
        queue,
        allQueue,
        loading,
        waitingCount,
        completedCount,
        consultingItem,
        waitingList,
        nextToken,
        todayRevenue,
        totalToday: queue.length,
        addToQueue,
        callPatient,
        markCompleted,
        skipPatient,
        updateFee,
        cancelAppointment,
        fetchAppointmentsRange,
        refresh: fetchQueue,
    };
};

export default useQueue;
