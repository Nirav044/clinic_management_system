import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    Heart,
    Lock,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import api from '../services/api';
import '../styles/login.css';

const LoginPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [userId, setUserId]         = useState('doc01');
    const [password, setPassword]     = useState('doc123');
    const [clinicId, setClinicId]     = useState('CLINIC001');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError]           = useState('');
    const [isLoading, setIsLoading]   = useState(false);

    // Registration state
    const [isRegistering, setIsRegistering] = useState(false);
    const [regLoading, setRegLoading]       = useState(false);
    const [regForm, setRegForm] = useState({
        id: '', name: '', address: '', phone: '', doctorName: '', specialty: 'General Medicine',
        docUserId: '', docPassword: '', asstUserId: '', asstPassword: '',
    });

    if (user) return <Navigate to="/" />;

    // ─── Login ──────────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(userId, password, clinicId);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.error || 'Login failed. Check your credentials.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Register Clinic ────────────────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setRegLoading(true);
        try {
            await api.post('/api/auth/register-clinic', regForm);
            showToast('Clinic registered! Please sign in.', 'success');
            setUserId(regForm.docUserId);
            setClinicId(regForm.id);
            setIsRegistering(false);
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed.';
            setError(msg);
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Panel: Visual Branding */}
            <div className="login-visual">
                <div className="clinic-bg-wrapper"></div>
                <div className="visual-gradient-overlay"></div>
                <div className="visual-content px-12">
                    <div className="flex flex-col items-center gap-6">
                        <div className="logo-icon-premium">
                            <Heart size={38} fill="currentColor" />
                        </div>
                        <h1 className="brand-name-left">MediCore</h1>
                        <div className="h-1 w-16 bg-white/40 rounded-full"></div>
                        <p className="brand-tagline-left">Premium Healthcare Platform</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="login-form-container">
                {isRegistering ? (
                    /* ─── Register Clinic Form ──────────────────────────────── */
                    <div className="form-inner animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-main tracking-tight mb-2">Register Clinic</h2>
                            <p className="text-sm text-faint font-medium">Create a new clinic instance on MediCore.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Clinic ID</label>
                                    <input type="text" value={regForm.id}
                                        onChange={e => setRegForm({ ...regForm, id: e.target.value })}
                                        className="login-input-simple" placeholder="e.g. CLINIC005" required />
                                </div>
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Clinic Name</label>
                                    <input type="text" value={regForm.name}
                                        onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                                        className="login-input-simple" placeholder="City Hospital" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Address</label>
                                <input type="text" value={regForm.address}
                                    onChange={e => setRegForm({ ...regForm, address: e.target.value })}
                                    className="login-input-simple" placeholder="Street, City" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Phone</label>
                                    <input type="text" value={regForm.phone}
                                        onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                                        className="login-input-simple" placeholder="+91 XXXXX XXXXX" required />
                                </div>
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Specialty</label>
                                    <input type="text" value={regForm.specialty}
                                        onChange={e => setRegForm({ ...regForm, specialty: e.target.value })}
                                        className="login-input-simple" placeholder="General Medicine" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Doctor Name</label>
                                <input type="text" value={regForm.doctorName}
                                    onChange={e => setRegForm({ ...regForm, doctorName: e.target.value })}
                                    className="login-input-simple" placeholder="Dr. John Doe" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Doctor User ID</label>
                                    <input type="text" value={regForm.docUserId}
                                        onChange={e => setRegForm({ ...regForm, docUserId: e.target.value })}
                                        className="login-input-simple" placeholder="doc_john" required />
                                </div>
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Doctor Password</label>
                                    <input type="password" value={regForm.docPassword}
                                        onChange={e => setRegForm({ ...regForm, docPassword: e.target.value })}
                                        className="login-input-simple" placeholder="••••••••" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Assistant User ID</label>
                                    <input type="text" value={regForm.asstUserId}
                                        onChange={e => setRegForm({ ...regForm, asstUserId: e.target.value })}
                                        className="login-input-simple" placeholder="asst_john" required />
                                </div>
                                <div className="form-group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Assistant Password</label>
                                    <input type="password" value={regForm.asstPassword}
                                        onChange={e => setRegForm({ ...regForm, asstPassword: e.target.value })}
                                        className="login-input-simple" placeholder="••••••••" required />
                                </div>
                            </div>

                            {error && <div className="error-msg text-xs py-2">{error}</div>}

                            <button type="submit" className="login-btn-primary-new !mt-6" disabled={regLoading}>
                                {regLoading ? 'Registering...' : 'Create Clinic'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm font-medium text-faint">
                            Already have an account?{' '}
                            <span className="text-primary cursor-pointer hover:underline" onClick={() => setIsRegistering(false)}>Sign in</span>
                        </p>
                    </div>
                ) : (
                    /* ─── Login Form ────────────────────────────────────────── */
                    <div className="form-inner animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-main tracking-tight mb-2">Sign in</h2>
                            <p className="text-sm text-faint font-medium">Welcome back! Please sign in to continue.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="form-group">
                                <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">Clinic ID</label>
                                <input
                                    type="text"
                                    value={clinicId}
                                    onChange={e => setClinicId(e.target.value)}
                                    className="login-input-simple"
                                    placeholder="e.g. CLINIC001"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="text-xs font-bold uppercase tracking-wider text-faint mb-2 block">User ID</label>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={e => setUserId(e.target.value)}
                                    className="login-input-simple"
                                    placeholder="doc01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-faint block">Password</label>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="login-input-simple pr-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-main"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && <div className="error-msg text-xs py-2">{error}</div>}

                            <button type="submit" className="login-btn-primary-new" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Continue'}
                            </button>
                        </form>

                        <div className="mt-6 p-3 rounded-lg" style={{ background: 'var(--surface-2)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <p className="font-bold mb-1">Demo credentials:</p>
                            <p>Doctor: <strong>doc01</strong> / <strong>doc123</strong></p>
                            <p>Staff: <strong>asst01</strong> / <strong>asst01</strong></p>
                        </div>

                        <p className="mt-6 text-center text-sm font-medium text-faint">
                            New clinic?{' '}
                            <span className="text-primary cursor-pointer hover:underline" onClick={() => setIsRegistering(true)}>Register here</span>
                        </p>

                        <footer className="mt-8 text-center">
                            <p className="text-[10px] text-faint uppercase tracking-widest font-bold">
                                &copy; MediCore &middot; Privacy &middot; Terms
                            </p>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
