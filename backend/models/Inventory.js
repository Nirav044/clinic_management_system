const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    id: { type: String, required: true },
    clinicId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Tablet' },
    stock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },       // MRP
    costPrice: { type: Number, default: 0 },   // Purchase price
    manufacturer: { type: String, default: '' },
    expiry: { type: String, default: '' },
    batchNo: { type: String, default: '' },
    minStock: { type: Number, default: 20 },
}, { timestamps: true });

InventorySchema.index({ id: 1, clinicId: 1 }, { unique: true });
InventorySchema.index({ clinicId: 1 });

module.exports = mongoose.model('Inventory', InventorySchema);
