const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    clinicId: { type: String, required: true },
    patientId: { type: String, default: '' },
    patient: { type: String, required: true },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    method: { type: String, default: '-' },
    items: [{
        description: String,
        amount: Number,
        _id: false,
    }],
    diagnosis: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    createdAt: { type: String },
}, { timestamps: true });

InvoiceSchema.index({ clinicId: 1, date: -1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
