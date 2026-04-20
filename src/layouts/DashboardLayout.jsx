import React from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = ({ children }) => {
    const { isSidebarOpen } = useUI();

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="flex flex-col w-full h-screen overflow-hidden">
                <Topbar />
                <main className="main-content">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
