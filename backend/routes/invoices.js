const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const verifyToken = require('../middleware/auth');

// GET all invoices for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('clinic_id', req.user.clinicId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to expected format
        const formattedInvoices = invoices.map(inv => ({
            id: inv.invoice_id,
            clinicId: inv.clinic_id,
            patient: inv.patient,
            patientId: inv.patient_id,
            amount: inv.amount,
            status: inv.status,
            method: inv.method,
            items: inv.items,
            diagnosis: inv.diagnosis,
            date: inv.date,
            time: inv.time,
            createdAt: inv.created_at
        }));

        res.json(formattedInvoices);
    } catch (err) {
        console.error('Error fetching invoices:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST create an invoice
router.post('/', verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const items = req.body.items || [];
        const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const invoiceId = `INV-${Date.now()}`;

        const { data: inv, error } = await supabase
            .from('invoices')
            .insert({
                invoice_id: invoiceId,
                clinic_id: req.user.clinicId,
                patient: req.body.patient || '',
                patient_id: req.body.patientId || '',
                amount: total,
                status: 'Pending',
                method: '-',
                items,
                diagnosis: req.body.diagnosis || '',
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            id: inv.invoice_id,
            clinicId: inv.clinic_id,
            patient: inv.patient,
            patientId: inv.patient_id,
            amount: inv.amount,
            status: inv.status,
            method: inv.method,
            items: inv.items,
            diagnosis: inv.diagnosis,
            date: inv.date,
            time: inv.time,
            createdAt: inv.created_at
        });
    } catch (err) {
        console.error('Error creating invoice:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH update invoice (mark paid, update method, etc)
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        // Build update object with proper column names
        const updateData = {};
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.method !== undefined) updateData.method = req.body.method;
        if (req.body.amount !== undefined) updateData.amount = req.body.amount;
        if (req.body.items !== undefined) updateData.items = req.body.items;

        const { data: updated, error } = await supabase
            .from('invoices')
            .update(updateData)
            .eq('invoice_id', req.params.id)
            .eq('clinic_id', req.user.clinicId)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Invoice not found' });

        res.json({
            id: updated.invoice_id,
            clinicId: updated.clinic_id,
            patient: updated.patient,
            patientId: updated.patient_id,
            amount: updated.amount,
            status: updated.status,
            method: updated.method,
            items: updated.items,
            diagnosis: updated.diagnosis,
            date: updated.date,
            time: updated.time,
            createdAt: updated.created_at
        });
    } catch (err) {
        console.error('Error updating invoice:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
