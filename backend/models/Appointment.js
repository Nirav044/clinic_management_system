const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    token: { type: String, required: true },
    clinicId: { type: String, required: true },
    patientId: { type: String, default: null },
    name: { type: String, required: true },
    mobile: { type: String, default: '' },
    status: { type: String, enum: ['Waiting', 'Consulting', 'Completed', 'Skipped', 'Cancelled'], default: 'Waiting' },
    time: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, enum: ['New', 'Follow-up', 'Walk-in', 'Registered'], default: 'Walk-in' },
    fee: { type: Number, default: 300 },
}, { timestamps: true });

AppointmentSchema.index({ token: 1, clinicId: 1, date: 1 }, { unique: true });
AppointmentSchema.index({ clinicId: 1, date: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
