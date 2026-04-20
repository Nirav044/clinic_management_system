import { useState } from 'react';
import {
    Clock, CheckCircle2, Play, Plus, User, SkipForward, Users,
    Wallet, Stethoscope, XCircle, Hash, PhoneCall, Timer,
    ArrowRight, AlertCircle, UserCheck
} from 'lucide-react';
import useQueue from '../hooks/useAppointments';
import usePatients from '../hooks/usePatients';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import { sendQueueWhatsAppAlert, canSendWhatsApp } from '../services/whatsapp';

const Queue = () => {
    const { isDoctor, isAssistant } = useAuth();
    const { patients } = usePatients();
    const {
        queue, waitingCount, completedCount, consultingItem,
        nextToken, totalToday, todayRevenue,
        addToQueue, callPatient, markCompleted, skipPatient
    } = useQueue();

    const [isWalkInOpen, setIsWalkInOpen]         = useState(false);
    const [isRegisteredOpen, setIsRegisteredOpen] = useState(false);
    const [walkIn, setWalkIn]   = useState({ name: '', mobile: '', type: 'Walk-in', fee: 300 });
    const [patientSearch, setPatientSearch]       = useState('');

    /* ── Derived lists ── */
    const waitingList   = queue.filter(q => q.status === 'Waiting');
    const completedList = queue.filter(q => q.status === 'Completed');
    const skippedList   = queue.filter(q => q.status === 'Skipped');

    /* ── Status helpers ── */
    const getStatusColor = (status) => ({
        'Waiting':    'status-waiting',
        'Consulting': 'status-active',
        'Completed':  'status-done',
        'Skipped':    'status-skipped',
    }[status] || '');

    const getStatusIcon = (status) => ({
        'Waiting':    <Clock size={13} />,
        'Consulting': <Stethoscope size={13} />,
        'Completed':  <CheckCircle2 size={13} />,
        'Skipped':    <XCircle size={13} />,
    }[status] || null);

    /* ── Handlers ── */
    const handleAddWalkIn = async (e) => {
        e.preventDefault();
        try {
            const item = await addToQueue(walkIn);
            showToast(`${walkIn.name} added as ${item.token}`, 'success');

            if (canSendWhatsApp(item.mobile)) {
                sendQueueWhatsAppAlert({
                    mobile: item.mobile,
                    token: item.token,
                    status: item.status,
                    clinicName: 'SmartClinic',
                    position: waitingList.length,
                });
            }
            setWalkIn({ name: '', mobile: '', type: 'Walk-in', fee: 300 });
            setIsWalkInOpen(false);
        } catch (err) {
            showToast('Failed to add walk-in patient', 'error');
        }
    };

    const handleAddRegistered = async (patient) => {
        try {
            const item = await addToQueue({ 
                patientId: patient.id, 
                name: patient.name, 
                mobile: patient.mobile, 
                type: 'Registered', 
                fee: 300 
            });
            showToast(`${patient.name} added as ${item.token}`, 'success');

            if (canSendWhatsApp(item.mobile)) {
                sendQueueWhatsAppAlert({
                    mobile: item.mobile,
                    token: item.token,
                    status: item.status,
                    clinicName: 'SmartClinic',
                    position: waitingList.length,
                });
            }
            setIsRegisteredOpen(false);
            setPatientSearch('');
        } catch (err) {
            showToast('Failed to add patient to queue', 'error');
        }
    };

    /** Doctor or Assistant — start consultation */
    const handleStartConsultation = async (item) => {
        const { token, name, mobile, date } = item;
        await callPatient(token, date);
        showToast(`🩺 Consultation started with ${name}`, 'success');

        if (canSendWhatsApp(mobile)) {
            const pos = waitingList.findIndex(q => q.token === token);
            await sendQueueWhatsAppAlert({
                mobile,
                token,
                status: 'Consulting',
                clinicName: 'SmartClinic',
                position: pos >= 0 ? pos : 0,
            });
        }
    };

    /** Doctor or Assistant — end consultation */
    const handleEndConsultation = async (token, name, date) => {
        await markCompleted(token, date);
        showToast(`✅ Session ended — ${name} marked as Completed`, 'success');
    };

    const handleSkip = (token, name) => {
        skipPatient(token);
        showToast(`${name} skipped`, 'info');
    };

    const filteredRegistered = patients.filter(p =>
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.mobile.includes(patientSearch)
    );

    /* ── Queue position label ── */
    const queuePositionLabel = (token) => {
        const pos = waitingList.findIndex(q => q.token === token);
        if (pos === -1) return null;
        if (pos === 0 && !consultingItem) return 'You\'re next!';
        if (pos === 0 && consultingItem) return '1 ahead';
        return `${pos + (consultingItem ? 1 : 0)} ahead`;
    };

    return (
        <div className="animate-fade-in">

            {/* ── Header ── */}
            <PageHeader title="Live Patient Queue" subtitle="Manage consultation flow and track today's patients">
                {isAssistant && (
                    <>
                        <button className="secondary-btn" onClick={() => setIsRegisteredOpen(true)}>
                            <User size={15} /> From Records
                        </button>
                        <button className="primary-btn-sm" onClick={() => setIsWalkInOpen(true)}>
                            <Plus size={15} /> Walk-in
                        </button>
                    </>
                )}
            </PageHeader>

            {/* ── Stat Cards ── */}
            <div className="stats-grid">
                <StatCard icon={Clock}        label="Waiting"       value={waitingCount} />
                <StatCard icon={CheckCircle2} label="Completed"     value={completedCount} />
                <StatCard icon={Users}        label="Total Today"   value={totalToday} />
                {isAssistant
                    ? <StatCard icon={User}   label="Next Token"    value={nextToken} variant="luxury" />
                    : <StatCard icon={Wallet} label="Revenue Today" value={`₹${todayRevenue.toLocaleString()}`} variant="luxury" />
                }
            </div>

            {/* ═══════════════════════════════════════════════
                CURRENTLY IN CONSULTATION — full-width banner
            ═══════════════════════════════════════════════ */}
            {consultingItem ? (
                <div className="consulting-banner glass mb-6">
                    {/* Left — patient info */}
                    <div className="flex items-center gap-4">
                        <div className="consulting-avatar">
                            <Stethoscope size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="consulting-token">{consultingItem.token}</span>
                                <span className="status-badge status-active" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 1.2s ease-in-out infinite' }} />
                                    In Consultation
                                </span>
                            </div>
                            <h2 className="font-bold" style={{ fontSize: '1.2rem' }}>{consultingItem.name}</h2>
                            <p className="text-sm text-muted">{consultingItem.type} &nbsp;•&nbsp; Arrived {consultingItem.time} &nbsp;•&nbsp; ₹{consultingItem.fee}</p>
                        </div>
                    </div>

                    {/* Right — action (doctor AND assistant can end session) */}
                    <div className="flex items-center gap-3">
                        <button
                            className="end-session-btn"
                            onClick={() => handleEndConsultation(consultingItem.token, consultingItem.name, consultingItem.date)}
                        >
                            <CheckCircle2 size={18} />
                            End Session
                        </button>
                    </div>
                </div>
            ) : (
                /* No active consultation — nudge doctor */
                waitingList.length > 0 && (
                    <div className="glass mb-6 p-4" style={{ borderLeft: '4px solid var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div>
                            <p className="font-semibold" style={{ fontSize: '0.9rem' }}>No consultation in progress</p>
                            <p className="text-xs text-muted">Click <strong>"Start Consultation"</strong> on any waiting patient below to begin.</p>
                        </div>
                    </div>
                )
            )}

            {/* ═══════════════════════════════════════════════
                QUEUE LIST
            ═══════════════════════════════════════════════ */}
            <div className="queue-container glass">
                <div className="queue-header">
                    <h3 className="font-bold flex items-center gap-2">
                        <Users size={17} /> Token List
                    </h3>
                    <div className="flex gap-2 items-center">
                        {waitingList.length > 0 && (
                            <span className="tag" style={{ background: 'var(--primary)', color: '#fff', fontWeight: 700 }}>
                                {waitingList.length} Waiting
                            </span>
                        )}
                        <span className="tag">Today</span>
                    </div>
                </div>

                {queue.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="Queue is empty"
                        subtitle="Add a walk-in patient or registered patient to start the queue"
                    />
                ) : (
                    <div className="queue-list">
                        {queue.map((item, idx) => {
                            const posLabel   = queuePositionLabel(item.token);
                            const isActive   = item.status === 'Consulting';
                            const isDone     = item.status === 'Completed' || item.status === 'Skipped';

                            return (
                                <div
                                    key={item.token}
                                    className={`queue-item ${isActive ? 'queue-item-active' : ''} ${isDone ? 'queue-item-done' : ''}`}
                                >
                                    {/* Left — token + info */}
                                    <div className="queue-left">
                                        <div className={`token-id ${isActive ? 'token-active' : ''} ${isDone ? 'token-done' : ''}`}>
                                            {item.token}
                                        </div>
                                        <div className="patient-meta">
                                            <h4 className={isDone ? 'text-muted' : ''}>{item.name}</h4>
                                            <p>
                                                {item.mobile && `${item.mobile} • `}
                                                {item.time}{item.type && ` • ${item.type}`}{` • ₹${item.fee || 0}`}
                                            </p>
                                            {/* Queue position for waiting patients */}
                                            {item.status === 'Waiting' && posLabel && (
                                                <span className="queue-pos-label">
                                                    <Hash size={10} />
                                                    {posLabel}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right — status + actions */}
                                    <div className="queue-right">
                                        <span className={`status-badge ${getStatusColor(item.status)}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {getStatusIcon(item.status)} {item.status}
                                        </span>

                                        {/* ── WAITING: Doctor OR Assistant can start consultation ── */}
                                        {item.status === 'Waiting' && (isDoctor || isAssistant) && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="start-consult-btn"
                                                    title="Start Consultation"
                                                    onClick={() => handleStartConsultation(item)}
                                                >
                                                    <Play size={13} fill="currentColor" />
                                                    Start
                                                </button>
                                                {isAssistant && (
                                                    <button className="icon-btn" title="Skip" onClick={() => handleSkip(item.token, item.name)}>
                                                        <SkipForward size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* ── CONSULTING: Doctor OR Assistant can end session ── */}
                                        {item.status === 'Consulting' && (isDoctor || isAssistant) && (
                                                <button
                                                className="end-session-btn-sm"
                                                title="End Consultation"
                                                onClick={() => handleEndConsultation(item.token, item.name, item.date)}
                                            >
                                                <CheckCircle2 size={14} />
                                                Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer summary */}
                {queue.length > 0 && (
                    <div className="queue-footer">
                        <span><Clock size={13} /> {waitingList.length} waiting</span>
                        <span><Stethoscope size={13} /> {consultingItem ? 1 : 0} in session</span>
                        <span><CheckCircle2 size={13} /> {completedList.length} completed</span>
                        {skippedList.length > 0 && <span style={{ color: 'var(--text-faint)' }}><XCircle size={13} /> {skippedList.length} skipped</span>}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════
                WALK-IN MODAL
            ═══════════════════════════════════════════════ */}
            <Modal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} title="Add Walk-in Patient" size="sm">
                <form onSubmit={handleAddWalkIn}>
                    <div className="form-group">
                        <label>Patient Name *</label>
                        <input required type="text" placeholder="Full name"
                            value={walkIn.name} onChange={e => setWalkIn({ ...walkIn, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input type="tel" placeholder="+91 XXXXX XXXXX"
                            value={walkIn.mobile} onChange={e => setWalkIn({ ...walkIn, mobile: e.target.value })} />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Visit Type</label>
                            <select value={walkIn.type} onChange={e => setWalkIn({ ...walkIn, type: e.target.value })}>
                                <option>Walk-in</option>
                                <option>New</option>
                                <option>Follow-up</option>
                                <option>Emergency</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Consultation Fee (₹)</label>
                            <input type="number" min="0" value={walkIn.fee}
                                onChange={e => setWalkIn({ ...walkIn, fee: Number(e.target.value) })} />
                        </div>
                    </div>
                    <button type="submit" className="primary-btn mt-4">
                        <Plus size={16} /> Add to Queue as {nextToken}
                    </button>
                </form>
            </Modal>

            {/* ═══════════════════════════════════════════════
                ADD FROM REGISTERED PATIENTS MODAL
            ═══════════════════════════════════════════════ */}
            <Modal isOpen={isRegisteredOpen} onClose={() => { setIsRegisteredOpen(false); setPatientSearch(''); }} title="Add Patient from Records" size="sm">
                <div className="form-group">
                    <label>Search Patient</label>
                    <input type="text" placeholder="Search by name or mobile..."
                        value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                </div>
                <div className="patient-list-mini">
                    {filteredRegistered.slice(0, 8).map(p => (
                        <div key={p.id} className="patient-item-selectable" onClick={() => handleAddRegistered(p)}>
                            <div className="text-left">
                                <strong>{p.name}</strong>
                                <p>{p.id} • {p.mobile} • {p.age}y {p.gender}</p>
                            </div>
                            <Plus size={18} />
                        </div>
                    ))}
                    {filteredRegistered.length === 0 && (
                        <p className="text-center text-muted py-4 text-sm">No patients found</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Queue;
