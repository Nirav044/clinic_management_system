const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const verifyToken = require('../middleware/auth');

// GET all inventory items for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const items = await Inventory.find({ clinicId: req.user.clinicId }).sort({ name: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add a medicine
router.post('/', verifyToken, async (req, res) => {
    try {
        const count = await Inventory.countDocuments({ clinicId: req.user.clinicId });
        const id = `MED${String(count + 1).padStart(3, '0')}`;
        const med = new Inventory({
            id,
            clinicId: req.user.clinicId,
            ...req.body,
            stock: Number(req.body.stock) || 0,
            price: Number(req.body.price) || 0,
            costPrice: Number(req.body.costPrice) || 0,
            minStock: Number(req.body.minStock) || 20,
        });
        await med.save();
        res.status(201).json(med);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update a medicine (stock, price, etc.)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updated = await Inventory.findOneAndUpdate(
            { id: req.params.id, clinicId: req.user.clinicId },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Medicine not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a medicine
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Inventory.deleteOne({ id: req.params.id, clinicId: req.user.clinicId });
        res.json({ message: 'Medicine deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
