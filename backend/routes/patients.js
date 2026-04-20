const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const verifyToken = require('../middleware/auth');

// GET all patients for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const patients = await Patient.find({ clinicId: req.user.clinicId }).sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new patient
router.post('/', verifyToken, async (req, res) => {
    try {
        const { id, name, age, gender, mobile, address, bloodGroup, allergies, aadhaarNumber } = req.body;
        const newPatient = new Patient({
            id,
            clinicId: req.user.clinicId,
            name, age, gender, mobile, address,
            bloodGroup: bloodGroup || '',
            allergies: allergies || 'None',
            aadhaarNumber: aadhaarNumber || '',
            registeredOn: new Date().toISOString().split('T')[0],
            visits: [],
        });
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a patient
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Patient.deleteOne({ id: req.params.id, clinicId: req.user.clinicId });
        res.json({ message: 'Patient deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add a visit (EMR entry) to a patient
router.post('/:id/visit', verifyToken, async (req, res) => {
    try {
        const patient = await Patient.findOne({ id: req.params.id, clinicId: req.user.clinicId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        patient.visits.unshift(req.body); // latest visit first
        await patient.save();
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
