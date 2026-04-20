const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const verifyToken = require('../middleware/auth');

// GET all invoices for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const invoices = await Invoice.find({ clinicId: req.user.clinicId }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create an invoice
router.post('/', verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const items = req.body.items || [];
        const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const inv = new Invoice({
            id: `INV-${Date.now()}`,
            clinicId: req.user.clinicId,
            patient: req.body.patient || '',
            patientId: req.body.patientId || '',
            amount: total,
            status: 'Pending',
            method: '-',
            items,
            diagnosis: req.body.diagnosis || '',
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            createdAt: now.toISOString(),
        });
        await inv.save();
        res.status(201).json(inv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update invoice (mark paid, update method, etc)
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const updated = await Invoice.findOneAndUpdate(
            { id: req.params.id, clinicId: req.user.clinicId },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Invoice not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
