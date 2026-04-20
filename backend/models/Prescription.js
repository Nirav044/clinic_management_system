const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    clinicId: { type: String, required: true },
    patientId: { type: String, default: '' },
    patient: { type: String, required: true },
    patientMobile: { type: String, default: '' },
    doctor: { type: String, required: true },
    clinic: { type: String, default: 'SmartClinic' },
    diagnosis: { type: String, default: '' },
    medicines: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        _id: false,
    }],
    labReferrals: [String],
    status: { type: String, enum: ['Pending', 'Dispensed'], default: 'Pending' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    createdAt: { type: String },
}, { timestamps: true });

PrescriptionSchema.index({ clinicId: 1, date: -1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
