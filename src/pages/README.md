# 📄 MediCore Page Modules

The `src/pages` directory contains the complete UI definitions for every system module. Each page is a self-contained React component that leverages the global design system and hooks for state management.

## 📂 Page Layouts & Modules

### **🏥 Dashboard**
- **Purpose**: A quick overview of clinic performance and recent appointments.
- **Components**: `StatsCards`, `AppointmentList`, `RevenueChart`.

### **🩺 Consultation**
- **Purpose**: The core clinical tool for doctor-patient interaction.
- **Features**: Patient lookup, symptom checklist, prescription builder (PDF generation).

### **📜 Patients (EMR)**
- **Purpose**: Comprehensive Electronic Medical Record (EMR) management.
- **Tabs**: `General Info`, `Medical History`, `Billings`, `Prescriptions`.

### **📅 Appointments**
- **Purpose**: Queue and scheduling management.
- **Views**: Calendar, Live Queue, Registration.

### **💳 Billing & Accounts**
- **Purpose**: Invoice creation and ledger management.
- **Workflow**: `Calculate Fees` → `Generate Invoice` → `Record Payment`.

### **⚙️ Settings & Theme**
- **Purpose**: User preferences and hospital branding.
- **Options**: Clinic Name, Doctor Credentials, Role-Based Access Control (RBAC).

## 📂 Design Consistency
Every page follows the **Split Layout with Sidebar** pattern (`src/layouts/Sidebar` + `src/layouts/Topbar`). Page content is dynamically rendered via `<LayoutWrapper />`.

---
*Built for doctors, by MediCore Engineering.*
