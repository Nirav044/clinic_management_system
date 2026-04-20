const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_clinic_key_123';

// 1. Fetch all registered clinics (For the login screen dropdown)
router.get('/clinics', async (req, res) => {
    try {
        // Fetch all clinics
        const { data: clinics, error: clinicError } = await supabase
            .from('clinics')
            .select('*');
        
        if (clinicError) throw clinicError;

        // Fetch users for each clinic
        const clinicsWithUsers = await Promise.all(clinics.map(async (clinic) => {
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('role, user_id, display_name')
                .eq('clinic_id', clinic.id);
            
            if (userError) throw userError;

            return {
                ...clinic,
                users: users.map(u => ({
                    role: u.role,
                    userId: u.user_id,
                    displayName: u.display_name
                }))
            };
        }));

        res.json(clinicsWithUsers);
    } catch (err) {
        console.error('Error fetching clinics:', err);
        res.status(500).json({ error: 'Failed to fetch clinics' });
    }
});

// 2. Register a New Clinic (and its initial doctor/assistant)
router.post('/register-clinic', async (req, res) => {
    try {
        const { id, name, address, phone, doctorName, specialty, docUserId, docPassword, asstUserId, asstPassword } = req.body;

        // Check if clinic exists
        const { data: existingClinic } = await supabase
            .from('clinics')
            .select('id')
            .eq('id', id)
            .single();

        if (existingClinic) {
            return res.status(400).json({ error: 'Clinic ID already exists' });
        }

        // Create Clinic
        const { error: clinicError } = await supabase
            .from('clinics')
            .insert({
                id,
                name,
                address,
                phone,
                doctor: doctorName,
                specialty
            });

        if (clinicError) throw clinicError;

        // Create Doctor Account
        const hashedDocPassword = await bcrypt.hash(docPassword, 10);
        const { error: docError } = await supabase
            .from('users')
            .insert({
                user_id: docUserId,
                password: hashedDocPassword,
                role: 'doctor',
                display_name: doctorName,
                clinic_id: id
            });

        if (docError) throw docError;

        // Create Assistant Account
        const hashedAsstPassword = await bcrypt.hash(asstPassword, 10);
        const { error: asstError } = await supabase
            .from('users')
            .insert({
                user_id: asstUserId,
                password: hashedAsstPassword,
                role: 'assistant',
                display_name: 'Receptionist',
                clinic_id: id
            });

        if (asstError) throw asstError;

        res.status(201).json({ message: 'Clinic registered successfully!' });
    } catch (err) {
        console.error('Error registering clinic:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Login Users (Doctor/Assistant)
router.post('/login', async (req, res) => {
    try {
        const { userId, password, clinicId } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .eq('clinic_id', clinicId)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Invalid User ID for this Clinic' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Password' });
        }

        const token = jwt.sign(
            { _id: user.id, userId: user.user_id, role: user.role, clinicId: user.clinic_id },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.user_id,
                name: user.display_name,
                role: user.role,
                clinicId: user.clinic_id
            }
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
