const express = require('express');
const router = express.Router();
const DispensaryOrder = require('../models/DispensaryOrder');
const verifyToken = require('../middleware/auth');

// GET all dispensary orders for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { date } = req.query;
        const filter = { clinicId: req.user.clinicId };
        if (date) filter.date = date;
        const orders = await DispensaryOrder.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a dispensary order
router.post('/', verifyToken, async (req, res) => {
    try {
        const order = new DispensaryOrder({
            id: `DISP${String(Date.now()).slice(-6)}`,
            clinicId: req.user.clinicId,
            ...req.body,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
        });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update order — status or toggle item dispensed
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const updated = await DispensaryOrder.findOneAndUpdate(
            { id: req.params.id, clinicId: req.user.clinicId },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Order not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
