import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('scms_user')); }
        catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    /**
     * Real login — calls POST /api/auth/login
     * Returns the user object on success, throws on failure.
     */
    const login = async (userId, password, clinicId = 'CLINIC001') => {
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', { userId, password, clinicId });
            const { token, user: userData } = response.data;

            // Persist token for API calls
            localStorage.setItem('scms_token', token);

            // Build full user object for UI
            const fullUser = {
                id: userData.id,
                name: userData.name,
                role: userData.role,
                clinicId: userData.clinicId,
                clinicName: 'SmartClinic',
                clinicAddress: 'MG Road, Mumbai - 400001',
                clinicPhone: '+91 98765 43210',
                specialty:
                    userData.role === 'doctor' ? 'General Medicine'
                    : userData.role === 'admin' ? 'Administration'
                    : 'Reception',
                loggedInAt: new Date().toISOString(),
            };

            localStorage.setItem('scms_user', JSON.stringify(fullUser));
            setUser(fullUser);
            return fullUser;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('scms_token');
        localStorage.removeItem('scms_user');
        setUser(null);
    };

    const isDoctor    = user?.role === 'doctor';
    const isAssistant = user?.role === 'assistant';
    const isAdmin     = user?.role === 'admin';
    const isDevAdmin  = user?.role === 'dev';

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isDoctor, isAssistant, isAdmin, isDevAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
