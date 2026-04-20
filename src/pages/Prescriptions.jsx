import { useState } from 'react';
import { FileText, CheckCircle2, Clock, Eye, ShoppingCart, X, Pill, AlertCircle, Building2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import usePrescriptions from '../hooks/usePrescriptions';

const Prescriptions = () => {
    const { prescriptions, markDispensed, pendingCount, dispensedCount } = usePrescriptions();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [clinicFilter, setClinicFilter] = useState('All');
    const [viewRx, setViewRx] = useState(null);

    const clinics = [...new Set(prescriptions.map(rx => rx.clinic).filter(Boolean))];

    const filtered = prescriptions.filter(rx => {
        const matchesSearch = rx.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rx.doctor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || rx.status === statusFilter;
        const matchesClinic = clinicFilter === 'All' || rx.clinic === clinicFilter;
        return matchesSearch && matchesStatus && matchesClinic;
    });

    const handleDispense = (rxId) => {
        markDispensed(rxId);
        if (viewRx?.id === rxId) {
            setViewRx({ ...viewRx, status: 'Dispensed' });
        }
        showToast('Prescription dispensed successfully!', 'success');
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Prescriptions" subtitle="Incoming prescriptions from linked clinics">
                <div className="flex gap-2">
                    <select className="secondary-btn" value={clinicFilter} onChange={e => setClinicFilter(e.target.value)}>
                        <option value="All">All Clinics</option>
                        {clinics.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="secondary-btn" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Dispensed">Dispensed</option>
                    </select>
                </div>
            </PageHeader>

            <div className="stats-grid">
                <StatCard icon={Clock} label="Pending" value={pendingCount} variant="luxury" />
                <StatCard icon={CheckCircle2} label="Dispensed" value={dispensedCount} />
                <StatCard icon={FileText} label="Total Received" value={prescriptions.length} />
                <StatCard icon={Building2} label="Linked Clinics" value={clinics.length} />
            </div>

            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by patient name, prescription ID, or doctor..."
            />

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Rx ID</th>
                            <th>Patient</th>
                            <th>Doctor / Clinic</th>
                            <th>Items</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="7">
                                    <EmptyState
                                        icon={FileText}
                                        title="No prescriptions found"
                                        subtitle="Prescriptions from linked clinics will appear here"
                                    />
                                </td>
                            </tr>
                        ) : (
                            filtered.map(rx => (
                                <tr key={rx.id} style={rx.status === 'Pending' ? { background: 'rgba(245, 158, 11, 0.04)' } : {}}>
                                    <td className="font-bold" style={{ color: 'var(--primary)' }}>{rx.id}</td>
                                    <td>
                                        <p className="font-semibold">{rx.patient}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{rx.patientMobile}</p>
                                    </td>
                                    <td>
                                        <p className="font-medium">{rx.doctor}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{rx.clinic}</p>
                                    </td>
                                    <td>
                                        <span className="tag">{rx.medicines.length} medicine{rx.medicines.length > 1 ? 's' : ''}</span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {rx.date}<br />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{rx.time}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${rx.status === 'Pending' ? 'status-waiting' : 'status-done'}`}>
                                            {rx.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button className="icon-btn" title="View" onClick={() => setViewRx(rx)} style={{ width: 32, height: 32 }}>
                                                <Eye size={14} />
                                            </button>
                                            {rx.status === 'Pending' && (
                                                <button className="icon-btn success" title="Dispense" onClick={() => handleDispense(rx.id)} style={{ width: 32, height: 32 }}>
                                                    <ShoppingCart size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Prescription Modal */}
            <Modal isOpen={!!viewRx} onClose={() => setViewRx(null)} title={`Prescription ${viewRx?.id || ''}`} size="lg">
                {viewRx && (
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-extrabold text-lg">{viewRx.patient}</p>
                                <p className="text-sm text-muted">{viewRx.patientMobile}</p>
                            </div>
                            <span className={`status-badge ${viewRx.status === 'Pending' ? 'status-waiting' : 'status-done'}`}>
                                {viewRx.status}
                            </span>
                        </div>

                        <div className="grid-cols-2 mb-4">
                            <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted font-semibold">PRESCRIBED BY</p>
                                <p className="font-bold">{viewRx.doctor}</p>
                                <p className="text-xs text-muted">{viewRx.clinic}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted font-semibold">DATE</p>
                                <p className="font-bold">{viewRx.date}</p>
                                <p className="text-xs text-muted">{viewRx.time}</p>
                            </div>
                        </div>

                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <Pill size={14} className="text-primary" /> Prescribed Medicines ({viewRx.medicines.length})
                        </h4>

                        <div className="mb-4">
                            {viewRx.medicines.map((med, i) => (
                                <div key={i} className="med-pill" style={{ marginBottom: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ fontSize: '0.9rem' }}>{med.name} — {med.dosage}</strong>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {med.frequency} • {med.duration} • Qty: <strong>{med.qty}</strong>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {viewRx.status === 'Pending' && (
                            <button className="primary-btn" onClick={() => handleDispense(viewRx.id)}>
                                <ShoppingCart size={16} /> Mark as Dispensed
                            </button>
                        )}

                        {viewRx.status === 'Dispensed' && (
                            <div className="p-3 bg-background rounded-lg text-center">
                                <CheckCircle2 size={24} style={{ color: 'var(--emerald)', margin: '0 auto 0.5rem' }} />
                                <p className="font-bold" style={{ color: 'var(--emerald)' }}>Dispensed Successfully</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Prescriptions;
