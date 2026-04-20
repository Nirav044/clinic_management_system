import { Pill, ShoppingBag, FileText, TrendingUp, Clock, Package, AlertCircle, ArrowUpRight, Users, Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import useLocalStorage from '../hooks/useLocalStorage';

const PharmacyDashboard = () => {
    const [prescriptions] = useLocalStorage('incoming_prescriptions', [
        { id: 'RX-001', patient: 'Rahul Verma', doctor: 'Dr. Payal Patel', clinic: 'SmartClinic', status: 'Pending', items: 3, total: 450, time: '10 mins ago', clinicId: 'CLINIC001' },
        { id: 'RX-002', patient: 'Sita Rani', doctor: 'Dr. Payal Patel', clinic: 'SmartClinic', status: 'Dispensed', items: 2, total: 320, time: '25 mins ago', clinicId: 'CLINIC001' },
        { id: 'RX-003', patient: 'Amit Singh', doctor: 'Dr. Patel', clinic: 'City Care Clinic', status: 'Pending', items: 4, total: 780, time: '1 hour ago', clinicId: 'CLINIC002' },
        { id: 'RX-004', patient: 'Priya Desai', doctor: 'Dr. Payal Patel', clinic: 'SmartClinic', status: 'Dispensed', items: 1, total: 150, time: '2 hours ago', clinicId: 'CLINIC001' },
    ]);

    const [inventory] = useLocalStorage('store_inventory', []);

    const pendingRx = prescriptions.filter(rx => rx.status === 'Pending').length;
    const dispensedToday = prescriptions.filter(rx => rx.status === 'Dispensed').length;
    const todayRevenue = prescriptions.filter(rx => rx.status === 'Dispensed').reduce((sum, rx) => sum + rx.total, 0);
    const lowStockCount = 5; // Demo value

    const recentPrescriptions = prescriptions.slice(0, 4);

    const activities = [
        { title: 'Prescription Dispensed', meta: 'Sita Rani — Paracetamol, Cough Syrup • 25 mins ago', active: true },
        { title: 'New Prescription Received', meta: 'From SmartClinic — Amit Singh • 1 hour ago', active: false },
        { title: 'Stock Updated', meta: 'Azithromycin 500mg — 50 units added • 3 hours ago', active: false },
        { title: 'Low Stock Alert', meta: 'Metformin 500mg — Only 12 units left • 4 hours ago', active: false },
    ];

    return (
        <div className="animate-fade-in">
            <PageHeader title="Pharmacy Dashboard" subtitle="Your store at a glance">
                <div className="date-display">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </PageHeader>

            <div className="stats-grid stagger-children">
                <StatCard icon={FileText} label="Pending Prescriptions" value={pendingRx} variant="luxury" />
                <StatCard icon={ShoppingBag} label="Dispensed Today" value={dispensedToday} />
                <StatCard icon={TrendingUp} label="Revenue Today" value={`₹${todayRevenue.toLocaleString()}`} />
                <StatCard icon={AlertCircle} label="Low Stock Items" value={lowStockCount} />
            </div>

            <div className="dashboard-grid mt-8">
                {/* Incoming Prescriptions Widget */}
                <div className="widget glass">
                    <div className="widget-header">
                        <h3 className="flex items-center gap-2">
                            <FileText size={16} className="text-primary" /> Incoming Prescriptions
                        </h3>
                        <span className="tag">{pendingRx} pending</span>
                    </div>

                    {recentPrescriptions.length === 0 ? (
                        <p className="text-center text-muted py-4 text-sm">No prescriptions yet</p>
                    ) : (
                        recentPrescriptions.map((rx) => (
                            <div key={rx.id} className="mini-queue-item" style={rx.status === 'Pending' ? { background: 'var(--amber-light)' } : {}}>
                                <div className="flex items-center gap-3">
                                    <div className="token-mini" style={rx.status === 'Pending' ? { background: 'var(--amber)', color: 'white', border: 'none' } : {}}>
                                        {rx.items}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{rx.patient}</p>
                                        <p className="text-xs text-muted">{rx.doctor} • {rx.clinic} • {rx.time}</p>
                                    </div>
                                </div>
                                <span className={`status-badge ${rx.status === 'Pending' ? 'status-waiting' : 'status-done'}`}>
                                    {rx.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Store Activity Widget */}
                <div className="widget glass">
                    <div className="widget-header">
                        <h3 className="flex items-center gap-2">
                            <Activity size={16} className="text-primary" /> Store Activity
                        </h3>
                    </div>

                    <div className="activity-timeline">
                        {activities.map((item, i) => (
                            <div key={i} className={`activity-item ${item.active ? 'active' : ''}`}>
                                <p className="activity-title">{item.title}</p>
                                <p className="activity-meta">{item.meta}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid-cols-3 mt-6 stagger-children">
                <div className="glass p-4 rounded-2xl">
                    <p className="text-xs text-muted font-semibold">LINKED CLINICS</p>
                    <p className="font-extrabold text-2xl mt-1 text-primary">2</p>
                    <p className="text-xs text-muted">sending prescriptions</p>
                </div>
                <div className="glass p-4 rounded-2xl">
                    <p className="text-xs text-muted font-semibold">THIS WEEK'S SALES</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="font-extrabold text-2xl">₹18.5K</p>
                        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--emerald)' }}>
                            <ArrowUpRight size={12} /> +6%
                        </span>
                    </div>
                    <p className="text-xs text-muted">from medicines</p>
                </div>
                <div className="glass p-4 rounded-2xl">
                    <p className="text-xs text-muted font-semibold">TOTAL INVENTORY</p>
                    <p className="font-extrabold text-2xl mt-1">342</p>
                    <p className="text-xs text-muted">unique medicines</p>
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
