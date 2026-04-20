/**
 * SmartClinic — MongoDB Seed Script
 * Run once: node seed.js (from the backend/ folder)
 * Seeds: Clinic, Users (doctor + assistant), Patients, Appointments, Prescriptions, Invoices, Inventory, Dispensary Orders
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Clinic        = require('./models/Clinic');
const User          = require('./models/User');
const Patient       = require('./models/Patient');
const Appointment   = require('./models/Appointment');
const Prescription  = require('./models/Prescription');
const Invoice       = require('./models/Invoice');
const Inventory     = require('./models/Inventory');
const DispensaryOrder = require('./models/DispensaryOrder');

const CLINIC_ID = 'CLINIC001';
const DOCTOR_NAME = 'Dr. Payal Patel';
const today = new Date().toISOString().split('T')[0];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartclinic');
        console.log('✅ Connected to MongoDB');

        // ─── Clear existing data ───────────────────────────────────────────────
        await Promise.all([
            Clinic.deleteMany({}),
            User.deleteMany({}),
            Patient.deleteMany({ clinicId: CLINIC_ID }),
            Appointment.deleteMany({ clinicId: CLINIC_ID }),
            Prescription.deleteMany({ clinicId: CLINIC_ID }),
            Invoice.deleteMany({ clinicId: CLINIC_ID }),
            Inventory.deleteMany({ clinicId: CLINIC_ID }),
            DispensaryOrder.deleteMany({ clinicId: CLINIC_ID }),
        ]);
        console.log('🗑️  Cleared old data');

        // ─── Clinic ────────────────────────────────────────────────────────────
        await Clinic.create({
            id: CLINIC_ID,
            name: 'SmartClinic',
            address: 'MG Road, Mumbai - 400001',
            phone: '+91 98765 43210',
            doctor: DOCTOR_NAME,
            specialty: 'General Medicine',
        });
        console.log('🏥 Clinic created');

        // ─── Users ─────────────────────────────────────────────────────────────
        await User.create([
            {
                userId: 'doc01',
                password: await bcrypt.hash('doc123', 10),
                role: 'doctor',
                displayName: DOCTOR_NAME,
                clinicId: CLINIC_ID,
            },
            {
                userId: 'asst01',
                password: await bcrypt.hash('asst01', 10),
                role: 'assistant',
                displayName: 'Receptionist',
                clinicId: CLINIC_ID,
            },
            {
                userId: 'admin01',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
                displayName: 'System Admin',
                clinicId: 'ALL_CLINICS',
            },
        ]);
        console.log('👤 Users created (doc01/doc123, asst01/asst01, admin01/admin123)');

        // ─── Patients ──────────────────────────────────────────────────────────
        const patients = await Patient.create([
            {
                id: 'PAT001', clinicId: CLINIC_ID,
                name: 'Rahul Verma', age: 34, gender: 'Male',
                mobile: '9876543210', address: 'Andheri West, Mumbai',
                bloodGroup: 'O+', allergies: 'None',
                registeredOn: '2024-01-10',
                visits: [{
                    date: '2024-02-15', doctor: DOCTOR_NAME,
                    symptoms: 'Fever, Headache, Body ache',
                    vitals: { bp: '120/80', temp: '101.2°F', pulse: '88 bpm', weight: '72 kg', spo2: '97%' },
                    diagnosis: 'Viral Fever',
                    medicines: [
                        { name: 'Paracetamol', dosage: '500mg', frequency: '1-0-1', duration: '3 days' },
                        { name: 'Cetirizine', dosage: '10mg', frequency: '0-0-1', duration: '5 days' },
                    ],
                    labReferrals: ['CBC', 'Dengue NS1'],
                    notes: 'Follow up after 3 days if fever persists',
                }],
            },
            {
                id: 'PAT002', clinicId: CLINIC_ID,
                name: 'Sita Rani', age: 28, gender: 'Female',
                mobile: '8765432109', address: 'Bandra, Mumbai',
                bloodGroup: 'B+', allergies: 'Penicillin',
                registeredOn: '2024-01-15',
                visits: [{
                    date: '2024-02-10', doctor: DOCTOR_NAME,
                    symptoms: 'Sore throat, cough',
                    vitals: { bp: '110/70', temp: '99.5°F', pulse: '76 bpm', weight: '58 kg', spo2: '98%' },
                    diagnosis: 'Upper Respiratory Tract Infection',
                    medicines: [
                        { name: 'Azithromycin', dosage: '500mg', frequency: '1-0-0', duration: '3 days' },
                        { name: 'Cough Syrup (Dextromethorphan)', dosage: '10ml', frequency: '1-1-1', duration: '5 days' },
                    ],
                    labReferrals: [],
                    notes: 'Allergic to Penicillin — use Azithromycin',
                }],
            },
            {
                id: 'PAT003', clinicId: CLINIC_ID,
                name: 'Amit Singh', age: 45, gender: 'Male',
                mobile: '7654321098', address: 'Juhu, Mumbai',
                bloodGroup: 'A+', allergies: 'None',
                registeredOn: '2023-11-20',
                visits: [
                    {
                        date: '2024-02-18', doctor: DOCTOR_NAME,
                        symptoms: 'Routine checkup, dizziness',
                        vitals: { bp: '145/92', temp: '98.6°F', pulse: '82 bpm', weight: '85 kg', spo2: '96%' },
                        diagnosis: 'Hypertension (Stage 1)',
                        medicines: [
                            { name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '30 days' },
                            { name: 'Metformin', dosage: '500mg', frequency: '1-0-1', duration: '30 days' },
                        ],
                        labReferrals: ['Lipid Profile', 'HbA1c', 'Kidney Function Test'],
                        notes: 'Advise dietary modifications, reduce salt intake',
                    },
                    {
                        date: '2024-01-20', doctor: DOCTOR_NAME,
                        symptoms: 'Blood sugar follow-up',
                        vitals: { bp: '140/88', temp: '98.4°F', pulse: '78 bpm', weight: '86 kg', spo2: '97%' },
                        diagnosis: 'Diabetes Type 2 — controlled',
                        medicines: [{ name: 'Metformin', dosage: '500mg', frequency: '1-0-1', duration: '30 days' }],
                        labReferrals: ['Fasting Blood Sugar', 'HbA1c'],
                        notes: "HbA1c improved from 7.8 to 7.1",
                    },
                ],
            },
            {
                id: 'PAT004', clinicId: CLINIC_ID,
                name: 'Priya Desai', age: 52, gender: 'Female',
                mobile: '6543210987', address: 'Powai, Mumbai',
                bloodGroup: 'AB+', allergies: 'Sulfa drugs',
                registeredOn: '2023-12-05',
                visits: [{
                    date: '2024-02-19', doctor: DOCTOR_NAME,
                    symptoms: 'Wheezing, breathlessness on exertion',
                    vitals: { bp: '125/82', temp: '98.4°F', pulse: '92 bpm', weight: '65 kg', spo2: '93%' },
                    diagnosis: 'Bronchial Asthma — Acute Exacerbation',
                    medicines: [
                        { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'SOS', duration: 'As needed' },
                        { name: 'Montelukast', dosage: '10mg', frequency: '0-0-1', duration: '30 days' },
                        { name: 'Budesonide Inhaler', dosage: '200mcg', frequency: '1-0-1', duration: '30 days' },
                    ],
                    labReferrals: ['Chest X-Ray', 'Pulmonary Function Test'],
                    notes: 'Avoid cold air, dust exposure. Allergic to Sulfa drugs.',
                }],
            },
            {
                id: 'PAT005', clinicId: CLINIC_ID,
                name: 'Karan Malhotra', age: 31, gender: 'Male',
                mobile: '5432109876', address: 'Dadar, Mumbai',
                bloodGroup: 'B-', allergies: 'None',
                registeredOn: '2024-02-01',
                visits: [],
            },
            {
                id: 'PAT006', clinicId: CLINIC_ID,
                name: 'Neha Gupta', age: 24, gender: 'Female',
                mobile: '9123456780', address: 'Andheri East, Mumbai',
                bloodGroup: 'A-', allergies: 'None',
                registeredOn: today,
                visits: [],
            },
            {
                id: 'PAT007', clinicId: CLINIC_ID,
                name: 'Ravi Kumar', age: 38, gender: 'Male',
                mobile: '9012345678', address: 'Thane, Mumbai',
                bloodGroup: 'O-', allergies: 'NSAIDs',
                registeredOn: today,
                visits: [],
            },
        ]);
        console.log(`👥 ${patients.length} patients created`);

        // ─── Appointments (today's queue) ──────────────────────────────────────
        await Appointment.create([
            { token: 'T-001', clinicId: CLINIC_ID, patientId: 'PAT001', name: 'Rahul Verma',    mobile: '9876543210', status: 'Completed',  time: '09:15 AM', date: today, type: 'Follow-up', fee: 300 },
            { token: 'T-002', clinicId: CLINIC_ID, patientId: 'PAT002', name: 'Sita Rani',      mobile: '8765432109', status: 'Completed',  time: '09:30 AM', date: today, type: 'New',       fee: 500 },
            { token: 'T-003', clinicId: CLINIC_ID, patientId: 'PAT003', name: 'Amit Singh',     mobile: '7654321098', status: 'Completed',  time: '09:45 AM', date: today, type: 'Follow-up', fee: 300 },
            { token: 'T-004', clinicId: CLINIC_ID, patientId: 'PAT004', name: 'Priya Desai',    mobile: '6543210987', status: 'Consulting', time: '10:00 AM', date: today, type: 'New',       fee: 500 },
            { token: 'T-005', clinicId: CLINIC_ID, patientId: 'PAT005', name: 'Karan Malhotra', mobile: '5432109876', status: 'Waiting',    time: '10:15 AM', date: today, type: 'Walk-in',   fee: 300 },
            { token: 'T-006', clinicId: CLINIC_ID, patientId: 'PAT006', name: 'Neha Gupta',     mobile: '9123456780', status: 'Waiting',    time: '10:30 AM', date: today, type: 'New',       fee: 500 },
            { token: 'T-007', clinicId: CLINIC_ID, patientId: 'PAT007', name: 'Ravi Kumar',     mobile: '9012345678', status: 'Waiting',    time: '10:45 AM', date: today, type: 'New',       fee: 500 },
        ]);
        console.log('📋 Queue (7 appointments) created');

        // ─── Prescriptions ─────────────────────────────────────────────────────
        await Prescription.create([
            {
                id: `RX-${Date.now()}-1`, clinicId: CLINIC_ID,
                patientId: 'PAT001', patient: 'Rahul Verma', patientMobile: '9876543210',
                doctor: DOCTOR_NAME, clinic: 'SmartClinic',
                diagnosis: 'Viral Fever',
                medicines: [
                    { name: 'Paracetamol', dosage: '500mg', frequency: '1-0-1', duration: '3 days' },
                    { name: 'Cetirizine', dosage: '10mg', frequency: '0-0-1', duration: '5 days' },
                ],
                labReferrals: ['CBC', 'Dengue NS1'],
                status: 'Dispensed',
                date: today,
                time: '09:20 AM',
                createdAt: new Date().toISOString(),
            },
            {
                id: `RX-${Date.now()}-2`, clinicId: CLINIC_ID,
                patientId: 'PAT004', patient: 'Priya Desai', patientMobile: '6543210987',
                doctor: DOCTOR_NAME, clinic: 'SmartClinic',
                diagnosis: 'Bronchial Asthma — Acute Exacerbation',
                medicines: [
                    { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'SOS', duration: 'As needed' },
                    { name: 'Montelukast', dosage: '10mg', frequency: '0-0-1', duration: '30 days' },
                ],
                labReferrals: ['Chest X-Ray'],
                status: 'Pending',
                date: today,
                time: '10:05 AM',
                createdAt: new Date().toISOString(),
            },
        ]);
        console.log('💊 Prescriptions created');

        // ─── Invoices ──────────────────────────────────────────────────────────
        await Invoice.create([
            {
                id: `INV-${Date.now()}-1`, clinicId: CLINIC_ID,
                patientId: 'PAT001', patient: 'Rahul Verma',
                amount: 800, status: 'Paid', method: 'Cash',
                items: [{ description: 'Consultation Fee', amount: 500 }, { description: 'Medicines', amount: 300 }],
                diagnosis: 'Viral Fever',
                date: today, time: '09:30 AM', createdAt: new Date().toISOString(),
            },
            {
                id: `INV-${Date.now()}-2`, clinicId: CLINIC_ID,
                patientId: 'PAT002', patient: 'Sita Rani',
                amount: 600, status: 'Paid', method: 'UPI',
                items: [{ description: 'Consultation Fee', amount: 500 }, { description: 'Medicines', amount: 100 }],
                diagnosis: 'URTI',
                date: today, time: '09:45 AM', createdAt: new Date().toISOString(),
            },
            {
                id: `INV-${Date.now()}-3`, clinicId: CLINIC_ID,
                patientId: 'PAT004', patient: 'Priya Desai',
                amount: 1200, status: 'Pending', method: '-',
                items: [{ description: 'Consultation Fee', amount: 500 }, { description: 'Medicines', amount: 700 }],
                diagnosis: 'Bronchial Asthma',
                date: today, time: '10:10 AM', createdAt: new Date().toISOString(),
            },
        ]);
        console.log('🧾 Invoices created');

        // ─── Inventory ─────────────────────────────────────────────────────────
        await Inventory.create([
            { id: 'MED001', clinicId: CLINIC_ID, name: 'Paracetamol 500mg',   category: 'Tablet',   stock: 240, price: 12,  costPrice: 8,  manufacturer: 'Cipla',       expiry: '2025-12', batchNo: 'B2024-001', minStock: 50 },
            { id: 'MED002', clinicId: CLINIC_ID, name: 'Amoxicillin 250mg',   category: 'Capsule',  stock: 180, price: 35,  costPrice: 22, manufacturer: 'Sun Pharma',  expiry: '2025-08', batchNo: 'B2024-002', minStock: 30 },
            { id: 'MED003', clinicId: CLINIC_ID, name: 'Azithromycin 500mg',  category: 'Tablet',   stock: 12,  price: 65,  costPrice: 42, manufacturer: 'Zydus',       expiry: '2025-06', batchNo: 'B2024-003', minStock: 20 },
            { id: 'MED004', clinicId: CLINIC_ID, name: 'Metformin 500mg',     category: 'Tablet',   stock: 8,   price: 18,  costPrice: 10, manufacturer: "Dr. Reddy's", expiry: '2025-10', batchNo: 'B2024-004', minStock: 40 },
            { id: 'MED005', clinicId: CLINIC_ID, name: 'Cetirizine 10mg',     category: 'Tablet',   stock: 300, price: 8,   costPrice: 4,  manufacturer: 'Cipla',       expiry: '2026-03', batchNo: 'B2024-005', minStock: 50 },
            { id: 'MED006', clinicId: CLINIC_ID, name: 'Omeprazole 20mg',     category: 'Capsule',  stock: 150, price: 22,  costPrice: 14, manufacturer: 'Lupin',       expiry: '2025-09', batchNo: 'B2024-006', minStock: 30 },
            { id: 'MED007', clinicId: CLINIC_ID, name: 'Cough Syrup (100ml)', category: 'Syrup',    stock: 45,  price: 85,  costPrice: 55, manufacturer: 'Dabur',       expiry: '2025-07', batchNo: 'B2024-007', minStock: 20 },
            { id: 'MED008', clinicId: CLINIC_ID, name: 'Betadine Ointment',   category: 'Ointment', stock: 60,  price: 45,  costPrice: 28, manufacturer: 'Win Medicare', expiry: '2026-01', batchNo: 'B2024-008', minStock: 15 },
            { id: 'MED009', clinicId: CLINIC_ID, name: 'ORS Sachets',         category: 'Sachet',   stock: 200, price: 5,   costPrice: 2,  manufacturer: 'FDC',         expiry: '2026-06', batchNo: 'B2024-009', minStock: 100 },
            { id: 'MED010', clinicId: CLINIC_ID, name: 'Dolo 650mg',          category: 'Tablet',   stock: 4,   price: 15,  costPrice: 9,  manufacturer: 'Micro Labs',  expiry: '2025-11', batchNo: 'B2024-010', minStock: 50 },
            { id: 'MED011', clinicId: CLINIC_ID, name: 'Amlodipine 5mg',      category: 'Tablet',   stock: 90,  price: 24,  costPrice: 15, manufacturer: 'Torrent',     expiry: '2026-02', batchNo: 'B2024-011', minStock: 30 },
            { id: 'MED012', clinicId: CLINIC_ID, name: 'Montelukast 10mg',    category: 'Tablet',   stock: 60,  price: 55,  costPrice: 35, manufacturer: 'Cipla',       expiry: '2026-04', batchNo: 'B2024-012', minStock: 20 },
            { id: 'MED013', clinicId: CLINIC_ID, name: 'Normal Saline 500ml', category: 'Injection',stock: 25,  price: 90,  costPrice: 60, manufacturer: 'Baxter',      expiry: '2026-08', batchNo: 'B2024-013', minStock: 10 },
            { id: 'MED014', clinicId: CLINIC_ID, name: 'Diclofenac 75mg Inj', category: 'Injection',stock: 50,  price: 40,  costPrice: 25, manufacturer: 'Sun Pharma',  expiry: '2025-12', batchNo: 'B2024-014', minStock: 20 },
            { id: 'MED015', clinicId: CLINIC_ID, name: 'Vitamin C 500mg',     category: 'Tablet',   stock: 120, price: 10,  costPrice: 6,  manufacturer: 'Himalaya',    expiry: '2026-06', batchNo: 'B2024-015', minStock: 50 },
        ]);
        console.log('📦 15 inventory items created');

        // ─── Dispensary Orders ─────────────────────────────────────────────────
        await DispensaryOrder.create([
            {
                id: 'DISP001', clinicId: CLINIC_ID,
                patientId: 'PAT001', patientName: 'Rahul Verma',
                date: today, doctor: DOCTOR_NAME, type: 'outdoor', status: 'dispensed',
                items: [
                    { category: 'medication', name: 'Paracetamol 500mg', dosage: '1-0-1', duration: '3 days', quantity: 6, dispensed: true },
                    { category: 'medication', name: 'Cetirizine 10mg', dosage: '0-0-1', duration: '5 days', quantity: 5, dispensed: true },
                ],
                notes: '',
            },
            {
                id: 'DISP002', clinicId: CLINIC_ID,
                patientId: 'PAT004', patientName: 'Priya Desai',
                date: today, doctor: DOCTOR_NAME, type: 'indoor', status: 'pending',
                items: [
                    { category: 'medication', name: 'Salbutamol Inhaler 100mcg', dosage: 'SOS', duration: 'As needed', quantity: 1, dispensed: false },
                    { category: 'nebulization', name: 'Duolin Nebulization', dosage: '1 session', duration: 'Now', quantity: 1, dispensed: false },
                    { category: 'injection', name: 'Hydrocortisone 100mg IV', dosage: 'Stat', duration: 'Once', quantity: 1, dispensed: false },
                ],
                notes: 'Start nebulization immediately. Monitor SpO2 every 15 mins.',
            },
        ]);
        console.log('💉 Dispensary orders created');

        console.log('\n✅ Seed complete! You can now log in with:');
        console.log('   Doctor:    doc01 / doc123');
        console.log('   Assistant: asst01 / asst01');
        console.log('   Admin:     admin01 / admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seed();
