const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const verifyToken = require('../middleware/auth');

// GET all dispensary orders for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { date } = req.query;
        let query = supabase
            .from('dispensary_orders')
            .select('*')
            .eq('clinic_id', req.user.clinicId);

        if (date) {
            query = query.eq('date', date);
        }

        const { data: orders, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Map to expected format
        const formattedOrders = orders.map(order => ({
            id: order.order_id,
            clinicId: order.clinic_id,
            patientId: order.patient_id,
            patientName: order.patient_name,
            date: order.date,
            doctor: order.doctor,
            type: order.type,
            status: order.status,
            items: order.items,
            notes: order.notes,
            createdAt: order.created_at
        }));

        res.json(formattedOrders);
    } catch (err) {
        console.error('Error fetching dispensary orders:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST create a dispensary order
router.post('/', verifyToken, async (req, res) => {
    try {
        const orderId = `DISP${String(Date.now()).slice(-6)}`;

        const { data: order, error } = await supabase
            .from('dispensary_orders')
            .insert({
                order_id: orderId,
                clinic_id: req.user.clinicId,
                patient_id: req.body.patientId || null,
                patient_name: req.body.patientName || '',
                date: new Date().toISOString().split('T')[0],
                doctor: req.body.doctor || '',
                type: req.body.type || 'outdoor',
                status: 'pending',
                items: req.body.items || [],
                notes: req.body.notes || ''
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            id: order.order_id,
            clinicId: order.clinic_id,
            patientId: order.patient_id,
            patientName: order.patient_name,
            date: order.date,
            doctor: order.doctor,
            type: order.type,
            status: order.status,
            items: order.items,
            notes: order.notes,
            createdAt: order.created_at
        });
    } catch (err) {
        console.error('Error creating dispensary order:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH update order — status or toggle item dispensed
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        // Build update object with proper column names
        const updateData = {};
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.items !== undefined) updateData.items = req.body.items;
        if (req.body.notes !== undefined) updateData.notes = req.body.notes;

        const { data: updated, error } = await supabase
            .from('dispensary_orders')
            .update(updateData)
            .eq('order_id', req.params.id)
            .eq('clinic_id', req.user.clinicId)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Order not found' });

        res.json({
            id: updated.order_id,
            clinicId: updated.clinic_id,
            patientId: updated.patient_id,
            patientName: updated.patient_name,
            date: updated.date,
            doctor: updated.doctor,
            type: updated.type,
            status: updated.status,
            items: updated.items,
            notes: updated.notes,
            createdAt: updated.created_at
        });
    } catch (err) {
        console.error('Error updating dispensary order:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
