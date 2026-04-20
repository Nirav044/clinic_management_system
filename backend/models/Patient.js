const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    date: { type: String, required: true },
    doctor: { type: String, required: true },
    symptoms: { type: String, default: '' },
    vitals: {
        bp: String,
        temp: String,
        pulse: String,
        weight: String,
        spo2: String,
    },
    diagnosis: { type: String, default: '' },
    medicines: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
    }],
    labReferrals: [String],
    dietPlan: { type: mongoose.Schema.Types.Mixed, default: null },
    notes: { type: String, default: '' },
}, { _id: false });

const PatientSchema = new mongoose.Schema({
    id: { type: String, required: true },
    clinicId: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    mobile: { type: String, required: true },
    address: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    allergies: { type: String, default: 'None' },
    aadhaarNumber: { type: String, default: '' },
    registeredOn: { type: String, default: () => new Date().toISOString().split('T')[0] },
    visits: { type: [VisitSchema], default: [] },
}, { timestamps: true });

// Compound unique index per clinic
PatientSchema.index({ id: 1, clinicId: 1 }, { unique: true });

module.exports = mongoose.model('Patient', PatientSchema);
