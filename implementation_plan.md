# 🏥 SCMS — Small Clinic Management System

## Project Overview
A **production-ready** clinic management system designed for a standalone clinic with **1 Doctor + 1 Assistant/Receptionist**. Built as a sponsored project.

## Tech Stack
- **Frontend**: React (Vite) — Mobile-First Responsive Design
- **Styling**: Vanilla CSS (Glassmorphism, Modern Design System)
- **Data**: localStorage (scoped per clinic) — Firebase-ready structure
- **PDF Generation**: jsPDF + jsPDF-autotable
- **Charts**: Recharts
- **Icons**: Lucide React

## User Roles & Features

### 👩‍⚕️ Doctor
- [x] Role-based login & dashboard (patient count, revenue, queue preview)
- [x] View real-time patient queue
- [x] Open patient EMR (Electronic Medical Record) with visit history
- [x] Enter vitals (BP, Temp, Pulse, SpO₂, Weight)
- [x] Enter symptoms, diagnosis, doctor's notes
- [x] Build e-prescription (Medicine, Dosage, Frequency, Duration)
- [x] Select lab/radiology referrals from searchable panel
- [x] Generate prescription PDF
- [x] Generate referral slip PDF
- [x] Save & Complete — writes visit to patient EMR

### 🧑‍💼 Assistant / Receptionist
- [x] Role-based login & dashboard (queue-focused, quick actions)
- [x] Register new patients (Name, Age, Gender, Mobile, Blood Group, Allergies)
- [x] Add patients to daily queue (walk-in or from records)
- [x] Generate token numbers
- [x] Update queue status (Waiting → Consulting → Completed)
- [x] Skip patients
- [x] View patient records and visit history
- [x] Create invoices and manage billing
- [x] Track consultation fees per token

## Directory Structure
```text
/src
  /components     # Modal, Toast, SearchBar, StatCard, StylusPad, etc.
  /context        # AuthContext (role-based), ClinicContext
  /hooks          # usePatients (EMR), useAppointments (Queue), useLocalStorage
  /pages          # Dashboard, Patients, Queue, Consultation, Billing, Reports, Settings
  /services       # Firebase config (future)
  /styles         # index.css — complete design system
  /utils          # pdfUtils (Prescription, Referral, Invoice), dateHelpers
```
