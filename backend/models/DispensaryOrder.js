const mongoose = require('mongoose');

const DispensaryOrderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    clinicId: { type: String, required: true },
    patientId: { type: String, default: '' },
    patientName: { type: String, required: true },
    date: { type: String, required: true },
    doctor: { type: String, default: '' },
    type: { type: String, enum: ['indoor', 'outdoor'], required: true },
    status: { type: String, enum: ['pending', 'partial', 'dispensed'], default: 'pending' },
    items: [{
        category: String,
        name: String,
        dosage: String,
        duration: String,
        quantity: Number,
        dispensed: { type: Boolean, default: false },
        _id: false,
    }],
    notes: { type: String, default: '' },
}, { timestamps: true });

DispensaryOrderSchema.index({ clinicId: 1, date: -1 });

module.exports = mongoose.model('DispensaryOrder', DispensaryOrderSchema);
