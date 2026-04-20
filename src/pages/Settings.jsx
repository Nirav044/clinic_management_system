import { useState, useEffect } from 'react';
import { Building2, Clock, Bell, Shield, Palette, Save, Moon, Sun, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { showToast } from '../components/Toast';
import '../styles/settings.css';
const SETTINGS_KEY = 'scms_settings';

const DEFAULT_SETTINGS = {
    clinicName: 'SmartClinic',
    doctorName: 'Dr. Payal Patel',
    specialty: 'General Medicine',
    phone: '+91 98765 43210',
    email: 'doctor@clinic.com',
    address: 'MG Road, Mumbai, Maharashtra',
    morningSlot: '09:00 - 13:00',
    eveningSlot: '17:00 - 21:00',
    consultationFee: 300,
    followUpFee: 200,
    upiId: 'doctor@upi',
    smsNotif: true,
    whatsappNotif: false,
    emailNotif: true,
    soundNotif: true,
    accentColor: 'indigo',
    compactMode: false,
};

const ACCENT_COLORS = {
    indigo:  { hex: '#4f46e5', hover: '#4338ca', light: '#eef2ff', glow: 'rgba(79,70,229,0.15)',  shadow: '0 4px 14px rgba(79,70,229,0.25)' },
    blue:    { hex: '#3b82f6', hover: '#2563eb', light: '#eff6ff', glow: 'rgba(59,130,246,0.15)', shadow: '0 4px 14px rgba(59,130,246,0.25)' },
    emerald: { hex: '#10b981', hover: '#059669', light: '#ecfdf5', glow: 'rgba(16,185,129,0.15)', shadow: '0 4px 14px rgba(16,185,129,0.25)' },
    rose:    { hex: '#f43f5e', hover: '#e11d48', light: '#fff1f2', glow: 'rgba(244,63,94,0.15)',  shadow: '0 4px 14px rgba(244,63,94,0.25)' },
};

export const loadSettings = () => {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const applySettings = (settings) => {
    const root = document.documentElement;

    // Compact Mode
    if (settings.compactMode) {
        root.setAttribute('data-compact', 'true');
    } else {
        root.removeAttribute('data-compact');
    }

    // Accent Color
    const clr = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.indigo;
    root.style.setProperty('--primary', clr.hex);
    root.style.setProperty('--primary-hover', clr.hover);
    root.style.setProperty('--primary-light', clr.light);
    root.style.setProperty('--primary-glow', clr.glow);
    root.style.setProperty('--shadow-primary', clr.shadow);
};

const Settings = () => {
    const { user } = useAuth();

    const [form, setForm] = useState(() => {
        const saved = loadSettings();
        // Pre-fill doctor name from auth if available
        return {
            ...saved,
            doctorName: saved.doctorName || user?.name || 'Dr. Payal Patel',
        };
    });

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSave = () => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(form));
        applySettings(form);
        showToast('Settings saved & applied!', 'success');
    };

    // Live-preview accent colour on every change (but don't persist until Save)
    useEffect(() => {
        const clr = ACCENT_COLORS[form.accentColor] || ACCENT_COLORS.indigo;
        const root = document.documentElement;
        root.style.setProperty('--primary', clr.hex);
        root.style.setProperty('--primary-hover', clr.hover);
        root.style.setProperty('--primary-light', clr.light);
        root.style.setProperty('--primary-glow', clr.glow);
        root.style.setProperty('--shadow-primary', clr.shadow);
    }, [form.accentColor]);

    // Live-preview compact
    useEffect(() => {
        if (form.compactMode) {
            document.documentElement.setAttribute('data-compact', 'true');
        } else {
            document.documentElement.removeAttribute('data-compact');
        }
    }, [form.compactMode]);

    const Toggle = ({ active, onChange }) => (
        <div className={`toggle ${active ? 'active' : ''}`} onClick={onChange}></div>
    );

    return (
        <div className="animate-fade-in">
            <PageHeader title="Settings" subtitle="Manage your clinic and account preferences">
                <button className="primary-btn-sm" onClick={handleSave}>
                    <Save size={15} /> Save Changes
                </button>
            </PageHeader>

            <div className="settings-grid">
                {/* Clinic Profile */}
                <div className="settings-card glass">
                    <h3><Building2 size={18} className="text-primary" /> Clinic Profile</h3>
                    <div className="form-group">
                        <label>Clinic Name</label>
                        <input type="text" value={form.clinicName} onChange={e => set('clinicName', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Doctor Name</label>
                        <input type="text" value={form.doctorName} onChange={e => set('doctorName', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Specialty</label>
                        <select value={form.specialty} onChange={e => set('specialty', e.target.value)}>
                            <option>General Medicine</option>
                            <option>Pediatrics</option>
                            <option>Dermatology</option>
                            <option>Orthopedics</option>
                            <option>ENT</option>
                            <option>Ophthalmology</option>
                            <option>Gynecology</option>
                            <option>Dentistry</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input type="text" value={form.address} onChange={e => set('address', e.target.value)} />
                    </div>
                </div>

                {/* Contact & Timings */}
                <div className="settings-card glass">
                    <h3><Clock size={18} className="text-primary" /> Contact &amp; Timings</h3>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Morning Slot</label>
                            <input type="text" value={form.morningSlot} onChange={e => set('morningSlot', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Evening Slot</label>
                            <input type="text" value={form.eveningSlot} onChange={e => set('eveningSlot', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Consultation Fee (₹)</label>
                            <input type="number" value={form.consultationFee} onChange={e => set('consultationFee', Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label>Follow-up Fee (₹)</label>
                            <input type="number" value={form.followUpFee} onChange={e => set('followUpFee', Number(e.target.value))} />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-card glass">
                    <h3><Bell size={18} className="text-primary" /> Notifications</h3>
                    <div className="setting-row">
                        <span className="setting-label">SMS Notifications</span>
                        <Toggle active={form.smsNotif} onChange={() => set('smsNotif', !form.smsNotif)} />
                    </div>
                    <div className="setting-row">
                        <span className="setting-label">WhatsApp Alerts</span>
                        <Toggle active={form.whatsappNotif} onChange={() => set('whatsappNotif', !form.whatsappNotif)} />
                    </div>
                    <div className="setting-row">
                        <span className="setting-label">Email Notifications</span>
                        <Toggle active={form.emailNotif} onChange={() => set('emailNotif', !form.emailNotif)} />
                    </div>
                    <div className="setting-row">
                        <span className="setting-label">Queue Sound Alert</span>
                        <Toggle active={form.soundNotif} onChange={() => set('soundNotif', !form.soundNotif)} />
                    </div>
                </div>

                {/* Appearance */}
                <div className="settings-card glass">
                    <h3><Palette size={18} className="text-primary" /> Appearance</h3>

                    {/* Compact Mode */}
                    <div className="setting-row mb-4">
                        <div>
                            <span className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Minimize2 size={14} /> Compact Mode
                            </span>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.15rem' }}>
                                Reduces padding &amp; font sizes for denser layout
                            </p>
                        </div>
                        <Toggle active={form.compactMode} onChange={() => set('compactMode', !form.compactMode)} />
                    </div>

                    {/* Accent Color  */}
                    <div className="setting-row">
                        <span className="setting-label">Accent Color</span>
                        <div className="flex gap-2">
                            {Object.entries(ACCENT_COLORS).map(([name, clr]) => (
                                <div
                                    key={name}
                                    title={name.charAt(0).toUpperCase() + name.slice(1)}
                                    onClick={() => set('accentColor', name)}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: clr.hex,
                                        cursor: 'pointer',
                                        border: form.accentColor === name ? '3px solid var(--text-main)' : '3px solid transparent',
                                        outline: form.accentColor === name ? '2px solid var(--surface)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-background rounded-xl">
                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Shield size={14} className="text-primary" /> Account
                        </h4>
                        <p className="text-sm text-muted mb-1">Clinic Code: <strong className="font-mono">{user?.clinicId || 'CLINIC001'}</strong></p>
                        <p className="text-sm text-muted mb-1">Plan: <strong className="text-primary">{user?.subscription || 'Free'}</strong></p>
                        <p className="text-sm text-muted">Role: <strong>{user?.role || 'Doctor'}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
