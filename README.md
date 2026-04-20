# 🩺 MediCore: The Modern Digital Clinic Ecosystem

MediCore is a premium, high-performance Hospital Management System (HMS) designed to bridge the gap between traditional paper-based clinics and cutting-edge digital healthcare. Built with **React**, **Vite**, and **Glassmorphism**, it offers an elite UI/UX experience targeted at solo practitioners and small to medium-sized clinics.

---

## 🔥 Key Visual Highlights
- **Premium Glassmorphism Design**: High-fidelity UI with real-time backdrop blurs and sophisticated gradients.
- **Unified Doctor Dashboard**: A data-dense command center containing patient trends, appointment queues, and revenue metrics.
- **Intelligent Appointment Flow**: Token-based live tracking for both pre-booked and walk-in patients.
- **Smart Patient Records (EMR)**: Searchable history with deep-dive consultation medical charts.
- **MediCare Analytics**: Advanced data visualization for clinic performance tracking.

---

## 🛠️ Technology Architecture

### **Frontend Implementation**
- **React 18 (Vite Core)**: Leveraging the speed of Vite for a sub-second developer experience.
- **Lucide Icons**: Crisp, professional vector icons for high-resolution displays.
- **Recharts (D3.js Wrapper)**: Smooth, interactive SVG charts for revenue and patient data.
- **Vanilla CSS (Design Tokens)**: A custom design system built with CSS variables for maximum flexibility and performance.
- **React Portals**: For perfectly centered, high-z-index modal management.

### **Backend & Connectivity**
- **Node.js & Express**: Scalable REST API architecture.
- **MongoDB Atlas**: Cloud-native NoSQL database for secure medical record storage.
- **Firebase Auth**: Industry-standard authentication and user management.

---

## 📂 Repository Blueprint

```text
├── backend/            # Express.js Server & MongoDB Models
├── public/             # Static Assets & Global Images
│   └── images/         # Premium Clinic Hero Content
├── src/                # Frontend Source Code
│   ├── components/     # Reusable UI Blocks (Cards, Modals, Stats)
│   ├── context/        # Global Providers (Auth, UI/Theme)
│   ├── layouts/        # Page Shells (Sidebar + Topbar)
│   ├── pages/          # Full-Page Modules (Dashboard, Consultation)
│   └── styles/         # Design System & Page-Specific CSS
└── vite.config.js      # Build & Hot-Reload Configuration
```

---

## 🚀 Deployment & Installation

### **1. Global Setup**
```bash
git clone https://github.com/zemoo03/Clinic-Management-System.git
cd "Hospital Management system"
npm install
```

### **2. Environment Configuration**
Create a `.env` in the root and `/backend` directories:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### **3. Start Development**
```bash
# Start Frontend
npm run dev

# Start Backend (Optional)
cd backend && node server.js
```

---

## 🤝 Contribution Guidelines
We welcome contributions to the MediCore project! Please ensure all UI changes adhere to the **Global Design System** (`src/styles/design-system.css`) to maintain visual consistency.

---
*Developed by **MediCore Technologies** &middot; Elevating Healthcare through Design.*
