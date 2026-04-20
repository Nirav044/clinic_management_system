import React, { useState, useMemo } from 'react';
import { 
    Building2, 
    Users, 
    Activity, 
    Settings, 
    TrendingUp, 
    MoreVertical, 
    Search, 
    Plus, 
    X, 
    UserPlus, 
    ShieldPlus, 
    Trash2,
    CheckCircle2,
    BarChart3,
    Receipt,
    Filter,
    Download,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon,
    Wallet,
    Calendar,
    Globe
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageHeader from '../components/PageHeader';
import { showToast } from '../components/Toast';

const INITIAL_CLINICS = [
    { 
        id: 'CLINIC001', 
        name: 'SmartClinic Main', 
        address: 'MG Road, Mumbai', 
        doctors: [{ name: 'Dr. Payal Patel', specialty: 'General Medicine', userId: 'doc01' }],
        staff: [{ name: 'Rahul Sharma', userId: 'asst01' }],
        patientsToday: 42, 
        revenue: '₹ 12,500', 
        status: 'Active' 
    },
    { 
        id: 'CLINIC002', 
        name: 'City Health Center', 
        address: 'Bandra West, Mumbai', 
        doctors: [{ name: 'Dr. R. Sharma', specialty: 'Pediatrics', userId: 'doc02' }],
        staff: [{ name: 'Priya Verma', userId: 'asst02' }],
        patientsToday: 28, 
        revenue: '₹ 8,400', 
        status: 'Active' 
    },
    { 
        id: 'CLINIC003', 
        name: 'Metro Medical', 
        address: 'Powai, Mumbai', 
        doctors: [{ name: 'Dr. S. Kulkarni', specialty: 'Dermatology', userId: 'doc03' }],
        staff: [{ name: 'Amit G.', userId: 'asst03' }],
        patientsToday: 15, 
        revenue: '₹ 5,200', 
        status: 'Active' 
    },
];

const ANALYTICS_DATA = [
    { month: 'Jan', revenue: 450000, patients: 1200, CLINIC001: 200000, CLINIC002: 150000, CLINIC003: 100000 },
    { month: 'Feb', revenue: 520000, patients: 1350, CLINIC001: 220000, CLINIC002: 180000, CLINIC003: 120000 },
    { month: 'Mar', revenue: 480000, patients: 1280, CLINIC001: 210000, CLINIC002: 160000, CLINIC003: 110000 },
    { month: 'Apr', revenue: 610000, patients: 1500, CLINIC001: 280000, CLINIC002: 210000, CLINIC003: 120000 },
    { month: 'May', revenue: 590000, patients: 1450, CLINIC001: 250000, CLINIC002: 200000, CLINIC003: 140000 },
    { month: 'Jun', revenue: 750000, patients: 1800, CLINIC001: 320000, CLINIC002: 250000, CLINIC003: 180000 },
];

const MOCK_INVOICES = [
    { id: 'INV-1001', clinic: 'CLINIC001', patient: 'Rohan Mehra', date: '2026-04-18', amount: 850, status: 'Paid', method: 'UPI' },
    { id: 'INV-1002', clinic: 'CLINIC002', patient: 'Saira Banu', date: '2026-04-18', amount: 1200, status: 'Paid', method: 'Cash' },
    { id: 'INV-1003', clinic: 'CLINIC001', patient: 'Aman Deep', date: '2026-04-19', amount: 450, status: 'Pending', method: 'Cash' },
    { id: 'INV-1004', clinic: 'CLINIC003', patient: 'Vikram S.', date: '2026-04-19', amount: 2200, status: 'Paid', method: 'Card' },
    { id: 'INV-1005', clinic: 'CLINIC002', patient: 'Neha Kapur', date: '2026-04-19', amount: 950, status: 'Paid', method: 'UPI' },
    { id: 'INV-1006', clinic: 'CLINIC001', patient: 'Karan J.', date: '2026-04-20', amount: 1100, status: 'Pending', method: 'Cash' },
];

const AdminDashboard = () => {
    const [clinics, setClinics] = useState(INITIAL_CLINICS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [activeTab, setActiveTab] = useState('units'); // units, analytics, billing
    const [clinicFilter, setClinicFilter] = useState('all');

    // Form State
    const [form, setForm] = useState({
        id: '',
        name: '',
        address: '',
        doctors: [{ name: '', specialty: 'General Medicine', userId: '', password: '' }],
        staff: [{ name: '', userId: '', password: '' }]
    });

    const addDoctorRow = () => {
        setForm(prev => ({
            ...prev,
            doctors: [...prev.doctors, { name: '', specialty: 'General Medicine', userId: '', password: '' }]
        }));
    };

    const removeDoctorRow = (index) => {
        if (form.doctors.length === 1) return;
        setForm(prev => ({
            ...prev,
            doctors: prev.doctors.filter((_, i) => i !== index)
        }));
    };

    const addStaffRow = () => {
        setForm(prev => ({
            ...prev,
            staff: [...prev.staff, { name: '', userId: '', password: '' }]
        }));
    };

    const removeStaffRow = (index) => {
        if (form.staff.length === 1) return;
        setForm(prev => ({
            ...prev,
            staff: prev.staff.filter((_, i) => i !== index)
        }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const newClinic = {
            ...form,
            patientsToday: 0,
            revenue: '₹ 0',
            status: 'Active'
        };
        setClinics(prev => [newClinic, ...prev]);
        setShowModal(false);
        showToast('Clinic registered successfully!', 'success');
        setForm({
            id: '', name: '', address: '',
            doctors: [{ name: '', specialty: 'General Medicine', userId: '', password: '' }],
            staff: [{ name: '', userId: '', password: '' }]
        });
    };

    const exportGlobalReport = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();
        
        doc.setFontSize(20);
        doc.text('MediCore Network - Global Performance Report', 14, 22);
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${timestamp}`, 14, 30);
        doc.text(`Total Managed Units: ${clinics.length}`, 14, 35);

        // Summary Table
        autoTable(doc, {
            startY: 45,
            head: [['Metric', 'Total Network Value']],
            body: [
                ['Total Annual Revenue', '₹ 33,80,000'],
                ['Total Registered Patients', '8,580'],
                ['Total Active Practitioners', clinics.reduce((a, c) => a + c.doctors.length, 0).toString()],
                ['Average Patient Satisfaction', '4.8/5'],
            ],
            theme: 'striped',
            headStyles: { fillStyle: '#4f46e5' }
        });

        // Units Table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 15,
            head: [['ID', 'Clinic Name', 'Doctors', 'Staff', 'Status']],
            body: clinics.map(c => [c.id, c.name, c.doctors.length, c.staff.length, c.status]),
            theme: 'grid',
            headStyles: { fillStyle: '#4f46e5' }
        });

        doc.save(`MediCore_Global_Report_${Date.now()}.pdf`);
        showToast('Global report downloaded successfully!', 'success');
    };

    const filteredClinics = clinics.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInvoices = MOCK_INVOICES.filter(inv => 
        clinicFilter === 'all' || inv.clinic === clinicFilter
    );

    const analyticsDisplayData = ANALYTICS_DATA.map(d => ({
        month: d.month,
        revenue: clinicFilter === 'all' ? d.revenue : (d[clinicFilter] || 0),
        patients: d.patients
    }));

    return (
        <div className="animate-fade-in dashboard-admin">
            {/* CSS Overrides for Premium Feel */}
            <style>{`
                .admin-tabs {
                    display: flex;
                    gap: 1.5rem;
                    border-bottom: 1px solid var(--border-light);
                    margin-bottom: 2rem;
                    padding-bottom: 0.25rem;
                }
                .admin-tab-btn {
                    padding: 0.75rem 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--text-faint);
                    position: relative;
                    transition: all 0.2s;
                }
                .admin-tab-btn:hover { color: var(--primary); }
                .admin-tab-btn.active { color: var(--primary); }
                .admin-tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: var(--primary);
                    border-radius: 10px;
                }

                .filter-select {
                    background: var(--surface-subtle);
                    border: 1px solid var(--border-light);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: var(--text-main);
                    outline: none;
                }

                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .dashboard-admin .stat-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .dashboard-admin .stat-card:hover { border-color: var(--primary); transform: translateY(-4px) scale(1.02); }
                
                .admin-search-container {
                    background: var(--surface-subtle);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                    max-width: 380px;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.2s;
                }
                .admin-search-container:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px var(--primary-glow);
                    background: var(--surface);
                }
                .admin-search-container input {
                    border: none;
                    background: transparent;
                    width: 100%;
                    font-size: 0.9rem;
                    color: var(--text-main);
                }

                .clinic-table th {
                    padding: 1.25rem 1.5rem !important;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                }
                .clinic-table td { padding: 1.25rem 1.5rem !important; }
                
                .modal-premium {
                    background: var(--surface) !important;
                    color: var(--text-main) !important;
                    border: 1px solid var(--border-light) !important;
                }
                
                .row-action-btn {
                    padding: 0.4rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: all 0.2s;
                }
                .btn-doc { color: var(--primary); background: var(--primary-light); }
                .btn-doc:hover { background: var(--primary); color: white; }
                .btn-staff { color: #059669; background: #ecfdf5; }
                .btn-staff:hover { background: #059669; color: white; }

                .form-section-label {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: var(--text-main);
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border-light);
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }

                .user-entry-row {
                    background: var(--surface-subtle);
                    padding: 1rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-light);
                    transition: border-color 0.2s;
                }
                .user-entry-row:hover { border-color: var(--primary-glow); }
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: var(--surface-subtle);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-light);
                    margin-bottom: 0.5rem;
                }
            `}</style>

            <PageHeader title="Admin Command Center" subtitle="Network-wide analytics, financial reporting, and infrastructure control">
                <div className="flex gap-3">
                    <button className="secondary-btn border-none bg-surface-subtle shadow-sm flex items-center gap-2" onClick={exportGlobalReport}>
                        <Download size={16} /> Global Report
                    </button>
                    <button className="primary-btn-sm" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Register New Clinic
                    </button>
                </div>
            </PageHeader>

            {/* Tab Navigation */}
            <div className="admin-tabs">
                <button 
                    className={`admin-tab-btn ${activeTab === 'units' ? 'active' : ''}`}
                    onClick={() => setActiveTab('units')}
                >
                    <div className="flex items-center gap-2"><Building2 size={16}/> Unit Management</div>
                </button>
                <button 
                    className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <div className="flex items-center gap-2"><BarChart3 size={16}/> Global Analytics</div>
                </button>
                <button 
                    className={`admin-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billing')}
                >
                    <div className="flex items-center gap-2"><Wallet size={16}/> Global Billing</div>
                </button>
            </div>

            {/* Global Filters (Sticky Row for Analytics/Billing) */}
            {(activeTab === 'analytics' || activeTab === 'billing') && (
                <div className="flex justify-between items-center mb-6 p-4 glass rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg"><Filter size={18}/></div>
                        <div>
                            <p className="text-xs font-bold text-faint uppercase tracking-widest">Network Scope</p>
                            <h4 className="text-sm font-bold text-main">Filter aggregated data across the system</h4>
                        </div>
                    </div>
                    <select 
                        className="filter-select"
                        value={clinicFilter}
                        onChange={(e) => setClinicFilter(e.target.value)}
                    >
                        <option value="all">Entire Network (Aggregated)</option>
                        {clinics.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* --- VIEW: UNIT MANAGEMENT --- */}
            {activeTab === 'units' && (
                <>
                    {/* Top Level Stats */}
                    <div className="stats-grid mb-8">
                        <div className="stat-card glass luxury">
                            <div className="icon-circle"><Building2 size={24} /></div>
                            <div className="stat-info">
                                <span className="label">Managed Clinics</span>
                                <span className="value">{clinics.length}</span>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <div className="icon-circle"><Users size={24} /></div>
                            <div className="stat-info">
                                <span className="label">Total Practitioners</span>
                                <span className="value">{clinics.reduce((acc, c) => acc + c.doctors.length, 0)}</span>
                            </div>
                        </div>
                        <div className="stat-card glass luxury">
                            <div className="icon-circle text-emerald-500 bg-emerald-500/10"><Activity size={24} /></div>
                            <div className="stat-info">
                                <span className="label">Active Sessions</span>
                                <span className="value">{clinics.reduce((acc, c) => acc + c.patientsToday, 0)}</span>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <div className="icon-circle text-indigo-500 bg-indigo-500/10"><Globe size={24} /></div>
                            <div className="stat-info">
                                <span className="label">Network Uptime</span>
                                <span className="value">99.9%</span>
                            </div>
                        </div>
                    </div>

                    {/* Clinics Directory Section */}
                    <div className="settings-card glass !p-0 overflow-hidden">
                        <div className="p-6 border-bottom border-border-light flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-main">Clinics Directory</h2>
                                <p className="text-sm text-faint">Centralized view of all registered healthcare units.</p>
                            </div>
                            <div className="admin-search-container">
                                <Search size={18} className="text-faint" />
                                <input 
                                    type="text" 
                                    placeholder="Find clinic by name or code..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm clinic-table">
                                <thead className="bg-primary-light/30 text-xs uppercase text-primary">
                                    <tr>
                                        <th>Clinic Details</th>
                                        <th>Lead Physician</th>
                                        <th>Resource Count</th>
                                        <th>Deployment Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {filteredClinics.length > 0 ? filteredClinics.map(clinic => (
                                        <tr key={clinic.id} className="hover:bg-primary-light/10 transition-all group cursor-pointer" onClick={() => setSelectedClinic(clinic)}>
                                            <td>
                                                <div className="font-bold text-main text-base">{clinic.name}</div>
                                                <div className="text-xs mt-1 px-2 py-0.5 bg-surface rounded inline-block font-mono text-faint">{clinic.id}</div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Users size={14}/></div>
                                                    <span className="font-semibold text-main">{clinic.doctors[0]?.name}</span>
                                                    {clinic.doctors.length > 1 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">+{clinic.doctors.length - 1}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-faint">Doctors</span>
                                                        <span className="font-bold text-main">{clinic.doctors.length}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-faint">Staff</span>
                                                        <span className="font-bold text-main">{clinic.staff.length}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                                    clinic.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${clinic.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                    {clinic.status}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <button className="p-2 text-faint hover:text-primary transition-colors"><MoreVertical size={18} /></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center text-faint">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Search size={40} className="opacity-20" />
                                                    <p>No clinics found matching "{searchTerm}"</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* --- VIEW: GLOBAL ANALYTICS --- */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Analytics Summary Stats */}
                    <div className="stats-grid">
                        <div className="stat-card glass luxury">
                            <div className="icon-circle"><TrendingUp size={22} /></div>
                            <div className="stat-info">
                                <span className="label">Network Growth</span>
                                <span className="value flex items-center gap-1 text-emerald-500">
                                    +12.5% <ArrowUpRight size={16}/>
                                </span>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <div className="icon-circle text-primary bg-primary/10"><Users size={22} /></div>
                            <div className="stat-info">
                                <span className="label">Patient Registrations</span>
                                <span className="value">8,580</span>
                            </div>
                        </div>
                        <div className="stat-card glass luxury">
                            <div className="icon-circle text-indigo-500 bg-indigo-500/10"><Calendar size={22} /></div>
                            <div className="stat-info">
                                <span className="label">MoM Retention</span>
                                <span className="value">84%</span>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <div className="icon-circle text-emerald-500 bg-emerald-500/10"><CheckCircle2 size={22} /></div>
                            <div className="stat-info">
                                <span className="label">SLA Compliance</span>
                                <span className="value">98.2%</span>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Charts */}
                    <div className="analytics-grid">
                        <div className="settings-card glass p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-main">Revenue Trend (MoM)</h3>
                                    <p className="text-xs text-faint">Comparison of monthly billing across network</p>
                                </div>
                                <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">High Performance</div>
                            </div>
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsDisplayData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                            formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} 
                                        />
                                        <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="settings-card glass p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-main">Patient Acquisition</h3>
                                    <p className="text-xs text-faint">New patient registrations per month</p>
                                </div>
                                <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Stable Growth</div>
                            </div>
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analyticsDisplayData}>
                                        <defs>
                                            <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="patients" 
                                            stroke="#0ea5e9" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorPatients)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VIEW: GLOBAL BILLING --- */}
            {activeTab === 'billing' && (
                <div className="space-y-6">
                    <div className="stats-grid">
                        <div className="stat-card glass luxury">
                            <div className="icon-circle text-emerald-500 bg-emerald-500/10"><Wallet size={22} /></div>
                            <div className="stat-info">
                                <span className="label">Network Revenue (YTD)</span>
                                <span className="value">₹ 33.8L</span>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <div className="icon-circle text-primary bg-primary/10"><Receipt size={22} /></div>
                            <div className="stat-info">
                                <span className="label">Total Invoices</span>
                                <span className="value">1,400+</span>
                            </div>
                        </div>
                        <div className="stat-card glass luxury">
                            <div className="icon-circle text-amber-500 bg-amber-500/10"><Activity size={22} /></div>
                            <div className="stat-info">
                                <span className="label">A/R Pending</span>
                                <span className="value">₹ 1.2L</span>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <div className="icon-circle text-indigo-500 bg-indigo-500/10"><TrendingUp size={22} /></div>
                            <div className="stat-info">
                                <span className="label">Avg Transaction</span>
                                <span className="value">₹ 680</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-card glass !p-0 overflow-hidden">
                        <div className="p-6 border-bottom border-border-light flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-main">Unified Invoices Manifest</h3>
                                <p className="text-xs text-faint">Aggregated billing history from all active units</p>
                            </div>
                            <button className="row-action-btn border border-border-light text-faint hover:text-main">
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm clinic-table">
                                <thead className="bg-primary-light/30 text-xs uppercase text-primary">
                                    <tr>
                                        <th>Invoice ID</th>
                                        <th>Source Clinic</th>
                                        <th>Patient Detail</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {filteredInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-primary-light/10 transition-all">
                                            <td className="font-mono font-bold text-primary">{inv.id}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={12} className="text-faint"/>
                                                    <span className="font-semibold text-main">{clinics.find(c => c.id === inv.clinic)?.name || inv.clinic}</span>
                                                </div>
                                            </td>
                                            <td className="font-semibold text-main">{inv.patient}</td>
                                            <td className="text-faint">{inv.date}</td>
                                            <td className="font-bold text-main">₹{inv.amount.toLocaleString()}</td>
                                            <td>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* REGISTRATION MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-lg animate-scale-up modal-premium !p-0 overflow-hidden">
                        <div className="p-6 border-bottom border-border-light flex justify-between items-center bg-surface">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-main">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary"><Building2 size={20}/></span>
                                Register New Clinic
                            </h2>
                            <button onClick={() => setShowModal(false)} className="modal-close-btn p-2 hover:bg-danger/10 rounded-lg hover:text-danger"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleRegister} className="modal-body !p-0 max-h-[75vh] overflow-y-auto">
                            <div className="p-6 space-y-8">
                                {/* Section: Clinic Info */}
                                <div>
                                    <h4 className="form-section-label"><Building2 size={16}/> Clinic Profile</h4>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="form-group">
                                            <label className="!text-[11px] !font-bold">Clinic Display Name</label>
                                            <input required type="text" className="!bg-surface-subtle" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. LifeCare Central" />
                                        </div>
                                        <div className="form-group">
                                            <label className="!text-[11px] !font-bold">System Code (ID)</label>
                                            <input required type="text" className="!bg-surface-subtle font-mono" value={form.id} onChange={e => setForm({...form, id: e.target.value})} placeholder="CLINIC_00X" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="!text-[11px] !font-bold">Address / Location</label>
                                        <input required type="text" className="!bg-surface-subtle" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, City, State..." />
                                    </div>
                                </div>

                                {/* Section: Doctors */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="form-section-label !mb-0 !border-none"><UserPlus size={16}/> Medical Practitioners</h4>
                                        <button type="button" onClick={addDoctorRow} className="row-action-btn btn-doc"><Plus size={14}/> Add Professional</button>
                                    </div>
                                    <div className="space-y-4">
                                        {form.doctors.map((doc, idx) => (
                                            <div key={idx} className="user-entry-row relative group">
                                                <div className="grid grid-cols-12 gap-4">
                                                    <div className="col-span-5 form-group !mb-0">
                                                        <label className="!text-[10px]">Full Name</label>
                                                        <input required type="text" value={doc.name} onChange={e => {
                                                            const newDocs = [...form.doctors]; newDocs[idx].name = e.target.value; setForm({...form, doctors: newDocs});
                                                        }} placeholder="Dr. Name" />
                                                    </div>
                                                    <div className="col-span-3 form-group !mb-0">
                                                        <label className="!text-[10px]">User ID</label>
                                                        <input required type="text" className="font-mono text-xs" value={doc.userId} onChange={e => {
                                                            const newDocs = [...form.doctors]; newDocs[idx].userId = e.target.value; setForm({...form, doctors: newDocs});
                                                        }} placeholder="login_id" />
                                                    </div>
                                                    <div className="col-span-3 form-group !mb-0">
                                                        <label className="!text-[10px]">Access Key</label>
                                                        <input required type="password" value={doc.password} onChange={e => {
                                                            const newDocs = [...form.doctors]; newDocs[idx].password = e.target.value; setForm({...form, doctors: newDocs});
                                                        }} placeholder="••••" />
                                                    </div>
                                                    <div className="col-span-1 flex items-end justify-center pb-2">
                                                        {form.doctors.length > 1 && (
                                                            <button type="button" onClick={() => removeDoctorRow(idx)} className="p-2 text-faint hover:text-danger hover:bg-danger/10 rounded-lg transition-all">
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Staff */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="form-section-label !mb-0 !border-none"><ShieldPlus size={16}/> Support Staff</h4>
                                        <button type="button" onClick={addStaffRow} className="row-action-btn btn-staff"><Plus size={14}/> Add Staff</button>
                                    </div>
                                    <div className="space-y-4">
                                        {form.staff.map((st, idx) => (
                                            <div key={idx} className="user-entry-row relative group !border-emerald-500/10">
                                                <div className="grid grid-cols-12 gap-4">
                                                    <div className="col-span-5 form-group !mb-0">
                                                        <label className="!text-[10px]">Member Name</label>
                                                        <input required type="text" value={st.name} onChange={e => {
                                                            const newStaff = [...form.staff]; newStaff[idx].name = e.target.value; setForm({...form, staff: newStaff});
                                                        }} placeholder="Staff Name" />
                                                    </div>
                                                    <div className="col-span-3 form-group !mb-0">
                                                        <label className="!text-[10px]">User ID</label>
                                                        <input required type="text" className="font-mono text-xs" value={st.userId} onChange={e => {
                                                            const newStaff = [...form.staff]; newStaff[idx].userId = e.target.value; setForm({...form, staff: newStaff});
                                                        }} placeholder="staff_id" />
                                                    </div>
                                                    <div className="col-span-3 form-group !mb-0">
                                                        <label className="!text-[10px]">Access Key</label>
                                                        <input required type="password" value={st.password} onChange={e => {
                                                            const newStaff = [...form.staff]; newStaff[idx].password = e.target.value; setForm({...form, staff: newStaff});
                                                        }} placeholder="••••" />
                                                    </div>
                                                    <div className="col-span-1 flex items-end justify-center pb-2">
                                                        {form.staff.length > 1 && (
                                                            <button type="button" onClick={() => removeStaffRow(idx)} className="p-2 text-faint hover:text-danger hover:bg-danger/10 rounded-lg transition-all">
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-surface-subtle border-top border-border-light flex justify-end gap-3 sticky bottom-0">
                                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn !py-2.5 !px-6">Dismiss</button>
                                <button type="submit" className="primary-btn !w-auto !py-2.5 !px-10">Register Clinic Infrastructure</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedClinic && (
                <div className="modal-overlay">
                    <div className="modal-content modal-premium animate-scale-up !max-w-[450px]">
                        <div className="modal-header">
                            <h2 className="text-main font-bold flex items-center gap-3">
                                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Users size={18}/></span>
                                Infrastructure Manifest
                            </h2>
                            <button onClick={() => setSelectedClinic(null)} className="modal-close-btn"><X size={20}/></button>
                        </div>
                        <div className="modal-body space-y-6">
                            <div className="p-4 bg-primary-light/20 rounded-xl border border-primary-light">
                                <div className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Primary Unit</div>
                                <div className="text-lg font-bold text-main">{selectedClinic.name}</div>
                                <div className="text-xs text-faint mt-1">{selectedClinic.address}</div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-primary tracking-tighter mb-2 block">Assigned Doctors ({selectedClinic.doctors.length})</label>
                                    <div className="space-y-2">
                                        {selectedClinic.doctors.map((d, i) => (
                                            <div key={i} className="manifest-item">
                                                <div>
                                                    <div className="font-bold text-sm text-main">{d.name}</div>
                                                    <div className="text-[10px] text-faint uppercase font-bold">{d.specialty}</div>
                                                </div>
                                                <div className="font-mono text-[11px] px-2 py-1 bg-surface rounded text-primary border border-primary/10">{d.userId}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter mb-2 block">Support Staff ({selectedClinic.staff.length})</label>
                                    <div className="space-y-2">
                                        {selectedClinic.staff.map((s, i) => (
                                            <div key={i} className="manifest-item !border-emerald-500/10">
                                                <div className="font-bold text-sm text-main">{s.name}</div>
                                                <div className="font-mono text-[11px] px-2 py-1 bg-surface rounded text-emerald-600 border border-emerald-500/10">{s.userId}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-top border-border-light text-center">
                            <button onClick={() => setSelectedClinic(null)} className="primary-btn !w-full !bg-surface-subtle !text-main !border !border-border-light hover:!bg-border-light">Close Manifest</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
