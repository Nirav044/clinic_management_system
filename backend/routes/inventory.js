const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const verifyToken = require('../middleware/auth');

// GET all inventory items for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { data: items, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('clinic_id', req.user.clinicId)
            .order('name', { ascending: true });

        if (error) throw error;

        // Map to expected format
        const formattedItems = items.map(item => ({
            id: item.item_id,
            clinicId: item.clinic_id,
            name: item.name,
            category: item.category,
            stock: item.stock,
            price: item.price,
            costPrice: item.cost_price,
            manufacturer: item.manufacturer,
            expiry: item.expiry,
            batchNo: item.batch_no,
            minStock: item.min_stock,
            createdAt: item.created_at
        }));

        res.json(formattedItems);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST add a medicine
router.post('/', verifyToken, async (req, res) => {
    try {
        // Get count to generate ID
        const { count, error: countError } = await supabase
            .from('inventory')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', req.user.clinicId);

        if (countError) throw countError;

        const itemId = `MED${String((count || 0) + 1).padStart(3, '0')}`;

        const { data: med, error } = await supabase
            .from('inventory')
            .insert({
                item_id: itemId,
                clinic_id: req.user.clinicId,
                name: req.body.name,
                category: req.body.category || 'Tablet',
                stock: Number(req.body.stock) || 0,
                price: Number(req.body.price) || 0,
                cost_price: Number(req.body.costPrice) || 0,
                manufacturer: req.body.manufacturer || '',
                expiry: req.body.expiry || '',
                batch_no: req.body.batchNo || '',
                min_stock: Number(req.body.minStock) || 20
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            id: med.item_id,
            clinicId: med.clinic_id,
            name: med.name,
            category: med.category,
            stock: med.stock,
            price: med.price,
            costPrice: med.cost_price,
            manufacturer: med.manufacturer,
            expiry: med.expiry,
            batchNo: med.batch_no,
            minStock: med.min_stock,
            createdAt: med.created_at
        });
    } catch (err) {
        console.error('Error adding medicine:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update a medicine (stock, price, etc.)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        // Build update object with proper column names
        const updateData = {};
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.category !== undefined) updateData.category = req.body.category;
        if (req.body.stock !== undefined) updateData.stock = Number(req.body.stock);
        if (req.body.price !== undefined) updateData.price = Number(req.body.price);
        if (req.body.costPrice !== undefined) updateData.cost_price = Number(req.body.costPrice);
        if (req.body.manufacturer !== undefined) updateData.manufacturer = req.body.manufacturer;
        if (req.body.expiry !== undefined) updateData.expiry = req.body.expiry;
        if (req.body.batchNo !== undefined) updateData.batch_no = req.body.batchNo;
        if (req.body.minStock !== undefined) updateData.min_stock = Number(req.body.minStock);

        const { data: updated, error } = await supabase
            .from('inventory')
            .update(updateData)
            .eq('item_id', req.params.id)
            .eq('clinic_id', req.user.clinicId)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Medicine not found' });

        res.json({
            id: updated.item_id,
            clinicId: updated.clinic_id,
            name: updated.name,
            category: updated.category,
            stock: updated.stock,
            price: updated.price,
            costPrice: updated.cost_price,
            manufacturer: updated.manufacturer,
            expiry: updated.expiry,
            batchNo: updated.batch_no,
            minStock: updated.min_stock,
            createdAt: updated.created_at
        });
    } catch (err) {
        console.error('Error updating medicine:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE a medicine
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('item_id', req.params.id)
            .eq('clinic_id', req.user.clinicId);

        if (error) throw error;

        res.json({ message: 'Medicine deleted' });
    } catch (err) {
        console.error('Error deleting medicine:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
