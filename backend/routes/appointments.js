const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const verifyToken = require('../middleware/auth');

// GET appointments for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { date, startDate, endDate, includeCancelled } = req.query;
        let query = supabase
            .from('appointments')
            .select('*')
            .eq('clinic_id', req.user.clinicId);
        
        if (date) {
            query = query.eq('date', date);
        } else if (startDate && endDate) {
            query = query.gte('date', startDate).lte('date', endDate);
        }
        
        // Don't show cancelled appointments unless requested
        if (!includeCancelled) {
            query = query.neq('status', 'Cancelled');
        }

        const { data: appointments, error } = await query.order('created_at', { ascending: true });

        if (error) throw error;

        // Map to expected format
        const formattedAppointments = appointments.map(apt => ({
            token: apt.token,
            clinicId: apt.clinic_id,
            patientId: apt.patient_id,
            name: apt.name,
            mobile: apt.mobile,
            status: apt.status,
            time: apt.time,
            date: apt.date,
            type: apt.type,
            fee: apt.fee,
            createdAt: apt.created_at
        }));

        res.json(formattedAppointments);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST add patient to queue (or schedule appointment)
router.post('/', verifyToken, async (req, res) => {
    const appointmentDate = req.body.date || new Date().toISOString().split('T')[0];
    const clinicId = req.user.clinicId;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        try {
            // Get current count to suggest a token
            const { count, error: countError } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('clinic_id', clinicId)
                .eq('date', appointmentDate);

            if (countError) throw countError;

            let tokenNum = (count || 0) + 1 + attempts;
            const token = `T-${String(tokenNum).padStart(3, '0')}`;
            
            const now = new Date();
            const timeStr = req.body.time || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

            const { data: appointment, error } = await supabase
                .from('appointments')
                .insert({
                    token,
                    clinic_id: clinicId,
                    patient_id: req.body.patientId || null,
                    name: req.body.name,
                    mobile: req.body.mobile || '',
                    status: 'Waiting',
                    time: timeStr,
                    date: appointmentDate,
                    type: req.body.type || 'Walk-in',
                    fee: req.body.fee || 300
                })
                .select()
                .single();

            if (error) {
                // Unique constraint violation - try again with different token
                if (error.code === '23505') {
                    attempts++;
                    continue;
                }
                throw error;
            }

            return res.status(201).json({
                token: appointment.token,
                clinicId: appointment.clinic_id,
                patientId: appointment.patient_id,
                name: appointment.name,
                mobile: appointment.mobile,
                status: appointment.status,
                time: appointment.time,
                date: appointment.date,
                type: appointment.type,
                fee: appointment.fee,
                createdAt: appointment.created_at
            });
        } catch (err) {
            console.error('Error creating appointment:', err);
            return res.status(500).json({ error: err.message });
        }
    }
    res.status(500).json({ error: 'Failed to generate a unique token after multiple attempts.' });
});

// PATCH update appointment status
router.patch('/:token/status', verifyToken, async (req, res) => {
    try {
        const { status, date } = req.body;

        // If calling a patient to Consulting, auto-complete previous Consulting
        if (status === 'Consulting') {
            let updateQuery = supabase
                .from('appointments')
                .update({ status: 'Completed' })
                .eq('clinic_id', req.user.clinicId)
                .eq('status', 'Consulting');
            
            if (date) {
                updateQuery = updateQuery.eq('date', date);
            }
            
            await updateQuery;
        }

        // Update the target appointment
        let query = supabase
            .from('appointments')
            .update({ status })
            .eq('token', req.params.token)
            .eq('clinic_id', req.user.clinicId);

        if (date) {
            query = query.eq('date', date);
        }

        const { data: updated, error } = await query.select().single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Appointment not found' });

        res.json({
            token: updated.token,
            clinicId: updated.clinic_id,
            patientId: updated.patient_id,
            name: updated.name,
            mobile: updated.mobile,
            status: updated.status,
            time: updated.time,
            date: updated.date,
            type: updated.type,
            fee: updated.fee,
            createdAt: updated.created_at
        });
    } catch (err) {
        console.error('Error updating appointment status:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH update fee
router.patch('/:token/fee', verifyToken, async (req, res) => {
    try {
        const { fee, date } = req.body;
        
        let query = supabase
            .from('appointments')
            .update({ fee: Number(fee) })
            .eq('token', req.params.token)
            .eq('clinic_id', req.user.clinicId);

        if (date) {
            query = query.eq('date', date);
        }

        const { data: updated, error } = await query.select().single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Appointment not found' });

        res.json({
            token: updated.token,
            clinicId: updated.clinic_id,
            patientId: updated.patient_id,
            name: updated.name,
            mobile: updated.mobile,
            status: updated.status,
            time: updated.time,
            date: updated.date,
            type: updated.type,
            fee: updated.fee,
            createdAt: updated.created_at
        });
    } catch (err) {
        console.error('Error updating fee:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH cancel appointment
router.patch('/:token/cancel', verifyToken, async (req, res) => {
    try {
        const { date } = req.body;
        
        const { data: updated, error } = await supabase
            .from('appointments')
            .update({ status: 'Cancelled' })
            .eq('token', req.params.token)
            .eq('clinic_id', req.user.clinicId)
            .eq('date', date)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Appointment not found' });

        res.json({
            token: updated.token,
            clinicId: updated.clinic_id,
            patientId: updated.patient_id,
            name: updated.name,
            mobile: updated.mobile,
            status: updated.status,
            time: updated.time,
            date: updated.date,
            type: updated.type,
            fee: updated.fee,
            createdAt: updated.created_at
        });
    } catch (err) {
        console.error('Error cancelling appointment:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
