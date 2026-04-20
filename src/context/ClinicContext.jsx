import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ClinicContext = createContext();

export const useClinic = () => useContext(ClinicContext);

export const ClinicProvider = ({ children }) => {
    const { user } = useAuth();
    const [clinicData, setClinicData] = useState(null);

    useEffect(() => {
        if (user?.clinicId) {
            // For demo, simulate clinic data.
            // In production, this fetches from Firestore: doc('clinics', user.clinicId)
            setClinicData({
                id: user.clinicId,
                name: 'SmartClinic Demo',
                doctor: user.name,
                specialty: 'General Medicine',
                address: 'MG Road, Mumbai',
                phone: '+91 98765 43210',
                timings: { morning: '09:00 - 13:00', evening: '17:00 - 21:00' },
                subscription: user.subscription || 'free',
                createdAt: new Date().toISOString()
            });
        } else {
            setClinicData(null);
        }
    }, [user]);

    return (
        <ClinicContext.Provider value={{ clinicData, setClinicData }}>
            {children}
        </ClinicContext.Provider>
    );
};
