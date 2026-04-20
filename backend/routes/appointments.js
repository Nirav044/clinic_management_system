const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const verifyToken = require('../middleware/auth');

// GET appointments for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        const filter = { clinicId: req.user.clinicId };
        
        if (date) {
            filter.date = date;
        } else if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        }
        
        // Don't show cancelled appointments in the default list unless requested
        if (!req.query.includeCancelled) {
            filter.status = { $ne: 'Cancelled' };
        }

        const appointments = await Appointment.find(filter).sort({ createdAt: 1 });
        res.json(appointments);
    } catch (err) {
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
            // Get current count to suggest a token (non-atomic but a good start)
            const count = await Appointment.countDocuments({ clinicId, date: appointmentDate });
            let tokenNum = count + 1 + attempts; // Offset by attempts to reduce collisions on retry
            const token = `T-${String(tokenNum).padStart(3, '0')}`;
            
            const now = new Date();
            const timeStr = req.body.time || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

            const newAppointment = new Appointment({
                token,
                clinicId,
                patientId: req.body.patientId || null,
                name: req.body.name,
                mobile: req.body.mobile || '',
                status: 'Waiting',
                time: timeStr,
                date: appointmentDate,
                type: req.body.type || 'Walk-in',
                fee: req.body.fee || 300,
            });

            await newAppointment.save();
            return res.status(201).json(newAppointment);
        } catch (err) {
            if (err.code === 11000) {
                // Collision! Increment attempts and try again with a different number
                attempts++;
                continue;
            }
            return res.status(500).json({ error: err.message });
        }
    }
    res.status(500).json({ error: 'Failed to generate a unique token after multiple attempts.' });
});

// PATCH update appointment status
router.patch('/:token/status', verifyToken, async (req, res) => {
    try {
        const { status, date } = req.body;
        const filter = { token: req.params.token, clinicId: req.user.clinicId };
        if (date) filter.date = date;

        // If calling a patient to Consulting, auto-complete previous Consulting ON THE SAME DATE
        if (status === 'Consulting') {
            const completionFilter = { clinicId: req.user.clinicId, status: 'Consulting' };
            if (date) completionFilter.date = date;
            
            await Appointment.updateMany(
                completionFilter,
                { $set: { status: 'Completed' } }
            );
        }

        const updated = await Appointment.findOneAndUpdate(
            filter,
            { $set: { status } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Appointment not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update fee
router.patch('/:token/fee', verifyToken, async (req, res) => {
    try {
        const { fee, date } = req.body;
        const filter = { token: req.params.token, clinicId: req.user.clinicId };
        if (date) filter.date = date;

        const updated = await Appointment.findOneAndUpdate(
            filter,
            { $set: { fee: Number(fee) } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Appointment not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH cancel appointment
router.patch('/:token/cancel', verifyToken, async (req, res) => {
    try {
        const { date } = req.body; // Need date because token is unique per clinic per date
        const updated = await Appointment.findOneAndUpdate(
            { token: req.params.token, clinicId: req.user.clinicId, date },
            { $set: { status: 'Cancelled' } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Appointment not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
