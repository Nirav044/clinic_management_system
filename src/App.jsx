import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { PrescriptionsProvider } from './context/PrescriptionsContext';
import { BillingProvider } from './context/BillingContext';
import { AppointmentsProvider } from './context/AppointmentsContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import DietTemplates from './pages/DietTemplates';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Consultation from './pages/Consultation';
import Prescriptions from './pages/Prescriptions';
import Reports from './pages/Reports';
import Billing from './pages/Billing';
import IndoorDispensary from './pages/IndoorDispensary';
import OutdoorDispensary from './pages/OutdoorDispensary';

// Protected route wrapper (also restricts by role when provided)
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return <DashboardLayout>{children}</DashboardLayout>;
};

const RoleHome = () => {
    const { user } = useAuth();
    if (user?.role === 'admin') return <AdminDashboard />;
    return <Dashboard />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <RoleHome />
                </ProtectedRoute>
            } />
            
            <Route path="/patients" element={
                <ProtectedRoute allowedRoles={['doctor','assistant']}>
                    <Patients />
                </ProtectedRoute>
            } />

            <Route path="/appointments" element={
                <ProtectedRoute allowedRoles={['doctor','assistant']}>
                    <Appointments />
                </ProtectedRoute>
            } />

            <Route path="/diet-templates" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                    <DietTemplates />
                </ProtectedRoute>
            } />

            <Route path="/consultations" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                    <Consultation />
                </ProtectedRoute>
            } />

            <Route path="/prescriptions" element={
                <ProtectedRoute allowedRoles={['doctor','assistant']}>
                    <Prescriptions />
                </ProtectedRoute>
            } />

            <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['doctor','assistant']}>
                    <Reports />
                </ProtectedRoute>
            } />

            <Route path="/billing" element={
                <ProtectedRoute allowedRoles={['assistant']}>
                    <Billing />
                </ProtectedRoute>
            } />

            <Route path="/indoor-dispensary" element={
                <ProtectedRoute allowedRoles={['assistant']}>
                    <IndoorDispensary />
                </ProtectedRoute>
            } />

            <Route path="/outdoor-dispensary" element={
                <ProtectedRoute allowedRoles={['assistant']}>
                    <OutdoorDispensary />
                </ProtectedRoute>
            } />

            <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['doctor','assistant','admin']}>
                    <Settings />
                </ProtectedRoute>
            } />

            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppointmentsProvider>
                <UIProvider>
                    <PrescriptionsProvider>
                        <BillingProvider>
                            <Router>
                                <AppRoutes />
                            </Router>
                        </BillingProvider>
                    </PrescriptionsProvider>
                </UIProvider>
            </AppointmentsProvider>
        </AuthProvider>
    );
};

export default App;
