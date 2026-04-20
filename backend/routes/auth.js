const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Clinic = require('../models/Clinic');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_clinic_key_123';

// 1. Fetch all registered clinics (For the login screen dropdown)
router.get('/clinics', async (req, res) => {
    try {
        const clinics = await Clinic.find();
        // Return clinics with their simplified users structure to match frontend expectations
        const clinicsWithUsers = await Promise.all(clinics.map(async (clinic) => {
            const users = await User.find({ clinicId: clinic.id }, 'role userId displayName');
            return {
                ...clinic._doc,
                users
            };
        }));
        res.json(clinicsWithUsers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clinics' });
    }
});

// 2. Register a New Clinic (and its initial doctor/assistant)
router.post('/register-clinic', async (req, res) => {
    try {
        const { id, name, address, phone, doctorName, specialty, docUserId, docPassword, asstUserId, asstPassword } = req.body;

        // Check if clinic exists
        const existingClinic = await Clinic.findOne({ id });
        if (existingClinic) return res.status(400).json({ error: 'Clinic ID already exists' });

        // Create Clinic
        const newClinic = new Clinic({
            id, name, address, phone, doctor: doctorName, specialty
        });
        await newClinic.save();

        // Create Doctor Account
        const hashedDocPassword = await bcrypt.hash(docPassword, 10);
        await User.create({
            userId: docUserId,
            password: hashedDocPassword,
            role: 'doctor',
            displayName: doctorName,
            clinicId: id
        });

        // Create Assistant Account
        const hashedAsstPassword = await bcrypt.hash(asstPassword, 10);
        await User.create({
            userId: asstUserId,
            password: hashedAsstPassword,
            role: 'assistant',
            displayName: 'Receptionist',
            clinicId: id
        });

        res.status(201).json({ message: 'Clinic registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Login Users (Doctor/Assistant)
router.post('/login', async (req, res) => {
    try {
        const { userId, password, clinicId } = req.body;

        const user = await User.findOne({ userId, clinicId });
        if (!user) return res.status(400).json({ error: 'Invalid User ID for this Clinic' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid Password' });

        const token = jwt.sign(
            { _id: user._id, userId: user.userId, role: user.role, clinicId: user.clinicId },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.userId,
                name: user.displayName,
                role: user.role,
                clinicId: user.clinicId
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
