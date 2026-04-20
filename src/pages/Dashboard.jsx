import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Activity,
    ArrowUpRight,
    TrendingUp,
    Plus,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AppointmentCalendar from '../components/AppointmentCalendar';
import RegisterAppointmentModal from '../components/RegisterAppointmentModal';
import usePatients from '../hooks/usePatients';
import useQueue from '../hooks/useAppointments';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';

import '../styles/dashboard.css';

const weekData = [
    { name: 'Mon', patients: 40 },
    { name: 'Tue', patients: 30 },
    { name: 'Wed', patients: 65 },
    { name: 'Thu', patients: 45 },
    { name: 'Fri', patients: 85 },
    { name: 'Sat', patients: 70 },
    { name: 'Sun', patients: 35 },
];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="card stat-card-new">
        <div className="flex justify-between items-start mb-3">
            <div className={`icon-wrapper ${color}`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="stat-content">
            <h4 className="text-faint uppercase font-bold text-xs tracking-wider mb-1">{label}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-main">{value}</span>
                {sub && <span className="text-xs text-faint">{sub}</span>}
            </div>
        </div>
    </div>
);

const RecentPatient = ({ name, condition, time, status }) => (
    <div className="list-item flex justify-between items-center py-4 border-b border-light last:border-0 hover:bg-main/30 px-2 rounded-lg transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="avatar-sm bg-primary-light text-primary font-bold">{name.charAt(0)}</div>
            <div>
                <h5 className="text-sm font-bold text-main">{name}</h5>
                <p className="text-xs text-faint">{condition}</p>
            </div>
        </div>
        <div className="text-right">
            <span className={`badge ${status}`}>{status}</span>
            <p className="text-xs text-faint mt-1">{time}</p>
        </div>
    </div>
);



const Dashboard = () => {
    const { user, isDoctor, isAssistant } = useAuth();
    const { totalPatients, patients } = usePatients();
    const { totalToday, waitingCount, completedCount, queue } = useQueue();
    const { totalCollected } = useBilling();
    const navigate = useNavigate();
    const [isApptModalOpen, setIsApptModalOpen] = useState(false);

    // Build recent patient list from today's queue
    const recentVisits = queue.slice(0, 5);

    const handleNewConsultation = () => {
        setIsApptModalOpen(true);
    };

    return (
        <div className="dashboard-view animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-main tracking-tight">Overview</h1>
                    <p className="text-muted">Welcome back, {user?.name}. Here's your clinic today.</p>
                </div>
                <button className="btn btn-primary" onClick={handleNewConsultation}>
                    <Plus size={18} />
                    <span>New Consultation</span>
                </button>
            </div>

            {/* Top Stat Row */}
            <div className="stats-grid-new mb-8">
                <StatCard
                    icon={Users}
                    label="Total Patients"
                    value={totalPatients || '—'}
                    sub="registered"
                    color="primary"
                />
                <StatCard
                    icon={Calendar}
                    label="Today's Queue"
                    value={totalToday || '—'}
                    sub="appointments"
                    color="secondary"
                />
                <StatCard
                    icon={Clock}
                    label="Waiting"
                    value={waitingCount || 0}
                    sub="in queue"
                    color="success"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Today's Revenue"
                    value={`₹${(totalCollected || 0).toLocaleString()}`}
                    color="warning"
                />
            </div>

            {/* Calendar Section */}
            <div className="calendar-section mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-main tracking-tight">Appointment Schedule</h2>
                        <p className="text-faint font-medium">Manage and track your upcoming patient consultations.</p>
                    </div>
                </div>
                <AppointmentCalendar />
            </div>

            <div className="grid-layout mb-8">

                {/* Patient Flow Chart */}
                <div className="card chart-card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-extrabold text-main tracking-tight">Patient Flow</h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs font-bold text-faint">
                                <span className="dot bg-primary"></span> Last 7 Days
                            </span>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weekData}>
                                <defs>
                                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fill: 'var(--text-faint)', fontSize: 12, fontWeight: 600}}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fill: 'var(--text-faint)', fontSize: 12, fontWeight: 600}}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: 'var(--shadow-lg)',
                                        background: 'var(--surface)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="patients"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPatients)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Today's Queue */}
                <div className="card recent-visits">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-extrabold text-main tracking-tight">Today's Queue</h3>
                        <div className="flex gap-3 text-xs font-bold text-faint">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} style={{color:'var(--emerald)'}} /> {completedCount} done</span>
                            <span className="flex items-center gap-1"><Clock size={12} style={{color:'var(--amber)'}} /> {waitingCount} waiting</span>
                        </div>
                    </div>
                    <div className="visits-list">
                        {recentVisits.length === 0 ? (
                            <p className="text-faint text-sm text-center py-8">No appointments today yet.</p>
                        ) : (
                            recentVisits.map((item) => (
                                <RecentPatient
                                    key={item.token}
                                    name={item.name}
                                    condition={`${item.token} · ${item.type}`}
                                    time={item.time}
                                    status={item.status?.toLowerCase()}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <RegisterAppointmentModal 
                isOpen={isApptModalOpen} 
                onClose={() => setIsApptModalOpen(false)} 
            />
        </div>
    );
};

export default Dashboard;
