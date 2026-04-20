const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const verifyToken = require('../middleware/auth');

// GET all prescriptions for a clinic
router.get('/', verifyToken, async (req, res) => {
    try {
        const { data: prescriptions, error } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('clinic_id', req.user.clinicId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to expected format
        const formattedPrescriptions = prescriptions.map(rx => ({
            id: rx.prescription_id,
            clinicId: rx.clinic_id,
            patientId: rx.patient_id,
            patient: rx.patient,
            patientMobile: rx.patient_mobile,
            doctor: rx.doctor,
            clinic: rx.clinic,
            diagnosis: rx.diagnosis,
            medicines: rx.medicines,
            labReferrals: rx.lab_referrals,
            status: rx.status,
            date: rx.date,
            time: rx.time,
            createdAt: rx.created_at
        }));

        res.json(formattedPrescriptions);
    } catch (err) {
        console.error('Error fetching prescriptions:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST create a prescription
router.post('/', verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const prescriptionId = `RX-${Date.now()}`;

        const { data: rx, error } = await supabase
            .from('prescriptions')
            .insert({
                prescription_id: prescriptionId,
                clinic_id: req.user.clinicId,
                patient_id: req.body.patientId || null,
                patient: req.body.patient,
                patient_mobile: req.body.patientMobile || '',
                doctor: req.body.doctor,
                clinic: req.body.clinic || '',
                diagnosis: req.body.diagnosis || '',
                medicines: req.body.medicines || [],
                lab_referrals: req.body.labReferrals || [],
                status: 'Pending',
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            id: rx.prescription_id,
            clinicId: rx.clinic_id,
            patientId: rx.patient_id,
            patient: rx.patient,
            patientMobile: rx.patient_mobile,
            doctor: rx.doctor,
            clinic: rx.clinic,
            diagnosis: rx.diagnosis,
            medicines: rx.medicines,
            labReferrals: rx.lab_referrals,
            status: rx.status,
            date: rx.date,
            time: rx.time,
            createdAt: rx.created_at
        });
    } catch (err) {
        console.error('Error creating prescription:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH update prescription status (Pending → Dispensed)
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { data: updated, error } = await supabase
            .from('prescriptions')
            .update({ status: req.body.status })
            .eq('prescription_id', req.params.id)
            .eq('clinic_id', req.user.clinicId)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Prescription not found' });

        res.json({
            id: updated.prescription_id,
            clinicId: updated.clinic_id,
            patientId: updated.patient_id,
            patient: updated.patient,
            patientMobile: updated.patient_mobile,
            doctor: updated.doctor,
            clinic: updated.clinic,
            diagnosis: updated.diagnosis,
            medicines: updated.medicines,
            labReferrals: updated.lab_referrals,
            status: updated.status,
            date: updated.date,
            time: updated.time,
            createdAt: updated.created_at
        });
    } catch (err) {
        console.error('Error updating prescription status:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
