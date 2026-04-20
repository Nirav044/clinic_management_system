const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const verifyToken = require('../middleware/auth');

// GET all patients for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { data: patients, error } = await supabase
            .from('patients')
            .select('*')
            .eq('clinic_id', req.user.clinicId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get visits for each patient
        const patientsWithVisits = await Promise.all(patients.map(async (patient) => {
            const { data: visits, error: visitError } = await supabase
                .from('patient_visits')
                .select('*')
                .eq('patient_id', patient.patient_id)
                .eq('clinic_id', req.user.clinicId)
                .order('date', { ascending: false });

            if (visitError) throw visitError;

            return {
                id: patient.patient_id,
                clinicId: patient.clinic_id,
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                mobile: patient.mobile,
                address: patient.address,
                bloodGroup: patient.blood_group,
                allergies: patient.allergies,
                aadhaarNumber: patient.aadhaar_number,
                registeredOn: patient.registered_on,
                createdAt: patient.created_at,
                visits: visits.map(v => ({
                    date: v.date,
                    doctor: v.doctor,
                    symptoms: v.symptoms,
                    vitals: v.vitals,
                    diagnosis: v.diagnosis,
                    medicines: v.medicines,
                    labReferrals: v.lab_referrals,
                    dietPlan: v.diet_plan,
                    notes: v.notes
                }))
            };
        }));

        res.json(patientsWithVisits);
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST create a new patient
router.post('/', verifyToken, async (req, res) => {
    try {
        const { id, name, age, gender, mobile, address, bloodGroup, allergies, aadhaarNumber } = req.body;
        
        const { data: patient, error } = await supabase
            .from('patients')
            .insert({
                patient_id: id,
                clinic_id: req.user.clinicId,
                name,
                age,
                gender,
                mobile,
                address: address || '',
                blood_group: bloodGroup || '',
                allergies: allergies || 'None',
                aadhaar_number: aadhaarNumber || '',
                registered_on: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        if (error) throw error;

        // Return in expected format
        res.status(201).json({
            id: patient.patient_id,
            clinicId: patient.clinic_id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            mobile: patient.mobile,
            address: patient.address,
            bloodGroup: patient.blood_group,
            allergies: patient.allergies,
            aadhaarNumber: patient.aadhaar_number,
            registeredOn: patient.registered_on,
            createdAt: patient.created_at,
            visits: []
        });
    } catch (err) {
        console.error('Error creating patient:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE a patient
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // Delete visits first
        await supabase
            .from('patient_visits')
            .delete()
            .eq('patient_id', req.params.id)
            .eq('clinic_id', req.user.clinicId);

        // Then delete patient
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('patient_id', req.params.id)
            .eq('clinic_id', req.user.clinicId);

        if (error) throw error;

        res.json({ message: 'Patient deleted' });
    } catch (err) {
        console.error('Error deleting patient:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST add a visit (EMR entry) to a patient
router.post('/:id/visit', verifyToken, async (req, res) => {
    try {
        const { date, doctor, symptoms, vitals, diagnosis, medicines, labReferrals, dietPlan, notes } = req.body;

        // Insert the visit
        const { error: visitError } = await supabase
            .from('patient_visits')
            .insert({
                patient_id: req.params.id,
                clinic_id: req.user.clinicId,
                date: date || new Date().toISOString().split('T')[0],
                doctor: doctor || '',
                symptoms: symptoms || '',
                vitals: vitals || {},
                diagnosis: diagnosis || '',
                medicines: medicines || [],
                lab_referrals: labReferrals || [],
                diet_plan: dietPlan || null,
                notes: notes || ''
            });

        if (visitError) throw visitError;

        // Fetch updated patient with all visits
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('patient_id', req.params.id)
            .eq('clinic_id', req.user.clinicId)
            .single();

        if (patientError) throw patientError;

        const { data: visits, error: visitsError } = await supabase
            .from('patient_visits')
            .select('*')
            .eq('patient_id', req.params.id)
            .eq('clinic_id', req.user.clinicId)
            .order('date', { ascending: false });

        if (visitsError) throw visitsError;

        res.json({
            id: patient.patient_id,
            clinicId: patient.clinic_id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            mobile: patient.mobile,
            address: patient.address,
            bloodGroup: patient.blood_group,
            allergies: patient.allergies,
            aadhaarNumber: patient.aadhaar_number,
            registeredOn: patient.registered_on,
            createdAt: patient.created_at,
            visits: visits.map(v => ({
                date: v.date,
                doctor: v.doctor,
                symptoms: v.symptoms,
                vitals: v.vitals,
                diagnosis: v.diagnosis,
                medicines: v.medicines,
                labReferrals: v.lab_referrals,
                dietPlan: v.diet_plan,
                notes: v.notes
            }))
        });
    } catch (err) {
        console.error('Error adding visit:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
