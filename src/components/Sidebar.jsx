import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Stethoscope,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Heart,
    Wallet,
    Pill
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import '../styles/sidebar.css';

const Sidebar = () => {
    const { logout, user, isDoctor, isAssistant, isAdmin } = useAuth();
    const { isSidebarOpen, toggleSidebar } = useUI();

    const menuItems = isAdmin
        ? [
            { path: '/', icon: LayoutDashboard, label: 'Admin Dashboard' },
            { path: '/settings', icon: Settings, label: 'System Settings' },
        ]
        : isDoctor
            ? [
                { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/appointments', icon: Calendar, label: 'Patient Queue' },
                { path: '/patients', icon: Users, label: 'Patients (EMR)' },
                { path: '/consultations', icon: Stethoscope, label: 'Consultation' },
                { path: '/prescriptions', icon: FileText, label: 'Prescriptions' },
                { path: '/reports', icon: Wallet, label: 'Reports' },
                { path: '/settings', icon: Settings, label: 'Profile / Settings' },
            ]
            : [
                { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/patients', icon: Users, label: 'Patient Registration' },
                { path: '/appointments', icon: Calendar, label: 'Queue Management' },
                { path: '/indoor-dispensary', icon: Pill, label: 'Indoor Dispensary' },
                { path: '/outdoor-dispensary', icon: Pill, label: 'Outdoor Dispensary' },
                { path: '/prescriptions', icon: FileText, label: 'Prescription (Dispense)' },
                { path: '/billing', icon: Wallet, label: 'Billing' },
                { path: '/reports', icon: Wallet, label: 'Reports' },
                { path: '/settings', icon: Settings, label: 'Profile / Settings' },
            ];

    return (
        <aside className={`sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">
                        <Heart size={20} fill="currentColor" />
                    </div>
                    {isSidebarOpen && <span className="logo-text">Medi<span className="text-gradient">Core</span></span>}
                </div>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    {isSidebarOpen && <span className="nav-label">General</span>}
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            {isSidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn">
                    <LogOut size={20} />
                    {isSidebarOpen && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
