const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g. CLINIC001
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    doctor: { type: String, required: true },
    specialty: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Clinic', ClinicSchema);
