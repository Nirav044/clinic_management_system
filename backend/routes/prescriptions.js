const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const verifyToken = require('../middleware/auth');

// GET all prescriptions for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ clinicId: req.user.clinicId }).sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a prescription
router.post('/', verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const rx = new Prescription({
            id: `RX-${Date.now()}`,
            clinicId: req.user.clinicId,
            ...req.body,
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            createdAt: now.toISOString(),
            status: 'Pending',
        });
        await rx.save();
        res.status(201).json(rx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update prescription status (Pending → Dispensed)
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const updated = await Prescription.findOneAndUpdate(
            { id: req.params.id, clinicId: req.user.clinicId },
            { $set: { status: req.body.status } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Prescription not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
