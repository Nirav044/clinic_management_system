-- SmartClinic Database Schema for Supabase
-- Run this script to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLINICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    doctor TEXT NOT NULL,
    specialty TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USERS TABLE (for clinic staff: doctors, assistants, admins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('doctor', 'assistant', 'patient', 'admin', 'dev')),
    display_name TEXT NOT NULL,
    clinic_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clinic ON users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- ============================================================================
-- PATIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    mobile TEXT NOT NULL,
    address TEXT DEFAULT '',
    blood_group TEXT DEFAULT '',
    allergies TEXT DEFAULT 'None',
    aadhaar_number TEXT DEFAULT '',
    registered_on DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(patient_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_mobile ON patients(mobile);

-- ============================================================================
-- PATIENT VISITS TABLE (EMR records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS patient_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL,
    date DATE NOT NULL,
    doctor TEXT NOT NULL,
    symptoms TEXT DEFAULT '',
    vitals JSONB DEFAULT '{}',
    diagnosis TEXT DEFAULT '',
    medicines JSONB DEFAULT '[]',
    lab_referrals JSONB DEFAULT '[]',
    diet_plan JSONB DEFAULT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (patient_id, clinic_id) REFERENCES patients(patient_id, clinic_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_visits_patient ON patient_visits(patient_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON patient_visits(date);

-- ============================================================================
-- APPOINTMENTS TABLE (Queue management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id TEXT DEFAULT NULL,
    name TEXT NOT NULL,
    mobile TEXT DEFAULT '',
    status TEXT DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Consulting', 'Completed', 'Skipped', 'Cancelled')),
    time TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT DEFAULT 'Walk-in' CHECK (type IN ('New', 'Follow-up', 'Walk-in', 'Registered')),
    fee INTEGER DEFAULT 300,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(token, clinic_id, date)
);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON appointments(clinic_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ============================================================================
-- PRESCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id TEXT NOT NULL UNIQUE,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id TEXT DEFAULT NULL,
    patient TEXT NOT NULL,
    patient_mobile TEXT DEFAULT '',
    doctor TEXT NOT NULL,
    clinic TEXT DEFAULT '',
    diagnosis TEXT DEFAULT '',
    medicines JSONB DEFAULT '[]',
    lab_referrals JSONB DEFAULT '[]',
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispensed')),
    date DATE NOT NULL,
    time TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_clinic ON prescriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id TEXT NOT NULL UNIQUE,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id TEXT DEFAULT '',
    patient TEXT DEFAULT '',
    amount DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
    method TEXT DEFAULT '-',
    items JSONB DEFAULT '[]',
    diagnosis TEXT DEFAULT '',
    date DATE NOT NULL,
    time TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);

-- ============================================================================
-- INVENTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Tablet',
    stock INTEGER DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0,
    cost_price DECIMAL(10, 2) DEFAULT 0,
    manufacturer TEXT DEFAULT '',
    expiry TEXT DEFAULT '',
    batch_no TEXT DEFAULT '',
    min_stock INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_clinic ON inventory(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock);

-- ============================================================================
-- DISPENSARY ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dispensary_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id TEXT DEFAULT NULL,
    patient_name TEXT DEFAULT '',
    date DATE NOT NULL,
    doctor TEXT DEFAULT '',
    type TEXT DEFAULT 'outdoor' CHECK (type IN ('indoor', 'outdoor')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'cancelled')),
    items JSONB DEFAULT '[]',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_dispensary_clinic ON dispensary_orders(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dispensary_date ON dispensary_orders(date);

-- ============================================================================
-- ROW LEVEL SECURITY (disabled for now - using API-level auth)
-- ============================================================================
-- Note: Since we're using a backend API with JWT auth, we'll handle 
-- authorization at the API level. RLS can be enabled later if needed.

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensary_orders ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (service role key will bypass RLS)
-- For production, you'd want more restrictive policies
CREATE POLICY "Allow all for service role" ON clinics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON patient_visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON dispensary_orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispensary_orders_updated_at BEFORE UPDATE ON dispensary_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
