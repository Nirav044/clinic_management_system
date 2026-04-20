import { useState } from 'react';
import {
    Search, Plus, User, Phone, Calendar, ArrowRight, X, Edit3, Trash2,
    MapPin, Heart, FileText, Pill, Activity, Droplets, Thermometer, AlertTriangle, Apple
} from 'lucide-react';
import usePatients from '../hooks/usePatients';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import AadhaarScanner from '../components/AadhaarScanner';
import { Camera, Stethoscope } from 'lucide-react';
import useQueue from '../hooks/useAppointments';
import ConsultationForm from '../components/ConsultationForm';

const Patients = () => {
    const { isDoctor, isAssistant } = useAuth();
    const {
        filteredPatients, searchTerm, setSearchTerm,
        addPatient, deletePatient, totalPatients
    } = usePatients();

    const { addToQueue, nextToken } = useQueue();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [emrTab, setEmrTab] = useState('info'); // 'info' | 'visits' | 'consult'
    const [showScanner, setShowScanner] = useState(false);

    const [newPatient, setNewPatient] = useState({
        name: '', age: '', gender: 'Male', mobile: '', address: '',
        bloodGroup: '', allergies: ''
    });

    const handleAddPatient = (e) => {
        e.preventDefault();
        const patient = addPatient(newPatient);

        // Add to queue and generate token
        const queueItem = addToQueue({
            id: patient.id,
            name: patient.name,
            mobile: patient.mobile,
            type: 'New'
        });

        showToast(`Registered successfully! Token: ${queueItem.token}`, 'success');
        setIsModalOpen(false);
        setNewPatient({ name: '', age: '', gender: 'Male', mobile: '', address: '', bloodGroup: '', allergies: '' });
    };

    const handleAadhaarScanned = (extractedData) => {
        setNewPatient(prev => ({
            ...prev,
            name: extractedData.name || prev.name,
            age: extractedData.age || prev.age,
            gender: extractedData.gender || prev.gender,
            mobile: extractedData.mobile || prev.mobile,
            aadhaarNumber: extractedData.aadhaarNumber,
            address: extractedData.address || prev.address,
        }));
        showToast('ID details extracted successfully', 'success');
        setShowScanner(false);
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Remove ${name} from records?`)) {
            deletePatient(id);
            showToast(`${name} removed from records`, 'info');
            if (selectedPatient?.id === id) setSelectedPatient(null);
        }
    };

    const openEMR = (patient) => {
        setSelectedPatient(patient);
        setEmrTab('info');
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Patient Directory" subtitle={`${totalPatients} registered patients`}>
                {isAssistant && (
                    <button className="primary-btn-sm" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} />
                        <span>Register Patient</span>
                    </button>
                )}
            </PageHeader>

            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name, ID or mobile number..."
            />

            {filteredPatients.length === 0 ? (
                <EmptyState
                    icon={User}
                    title="No patients found"
                    subtitle={searchTerm ? "Try a different search term" : "Register your first patient to get started"}
                    action={
                        !searchTerm && isAssistant && (
                            <button className="primary-btn-sm" onClick={() => setIsModalOpen(true)}>
                                <Plus size={16} /> Add First Patient
                            </button>
                        )
                    }
                />
            ) : (
                <div className="patient-grid stagger-children">
                    {filteredPatients.map(patient => (
                        <div
                            key={patient.id}
                            className="patient-card glass"
                            onClick={() => openEMR(patient)}
                        >
                            <div className="patient-avatar">
                                {patient.name.charAt(0)}
                            </div>
                            <div className="patient-info">
                                <h3>{patient.name}</h3>
                                <span className="patient-id">{patient.id}</span>
                                <div className="details">
                                    <span><User size={13} /> {patient.age}y, {patient.gender}</span>
                                    <span><Phone size={13} /> {patient.mobile}</span>
                                    {patient.visits?.length > 0 && (
                                        <span><Calendar size={13} /> Last: {patient.visits[0].date}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {patient.allergies && patient.allergies !== 'None' && (
                                    <span className="tag" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.7rem' }}>
                                        <AlertTriangle size={10} /> Allergy
                                    </span>
                                )}
                                <button className="view-btn" title="View EMR">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Register Patient Modal ─── */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Patient">

                {showScanner && (
                    <AadhaarScanner
                        onScanned={handleAadhaarScanned}
                        onCancel={() => setShowScanner(false)}
                    />
                )}

                {!showScanner && (
                    <div className="flex justify-between items-center mb-4 bg-primary/10 p-3 rounded-lg border border-primary/20">
                        <div>
                            <p className="font-bold text-sm text-primary">Automated Data Entry</p>
                            <p className="text-xs text-muted">Scan Aadhaar card to auto-fill details</p>
                        </div>
                        <button type="button" onClick={() => setShowScanner(true)} className="primary-btn-sm flex items-center gap-2">
                            <Camera size={14} /> Scan ID
                        </button>
                    </div>
                )}

                <form onSubmit={handleAddPatient}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input required type="text" placeholder="Enter patient name"
                                value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number *</label>
                            <input required type="tel" placeholder="+91 XXXXX XXXXX"
                                value={newPatient.mobile} onChange={e => setNewPatient({ ...newPatient, mobile: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Age *</label>
                            <input required type="number" placeholder="Age" min="0" max="120"
                                value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Blood Group</label>
                            <select value={newPatient.bloodGroup} onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}>
                                <option value="">Select</option>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option>
                                <option>O+</option><option>O-</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Known Allergies</label>
                            <input type="text" placeholder="e.g. Penicillin, Sulfa"
                                value={newPatient.allergies} onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input type="text" placeholder="Street, City"
                            value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} />
                    </div>
                    <button type="submit" className="primary-btn mt-4">
                        <Heart size={16} /> Save Patient Record
                    </button>
                </form>
            </Modal>

            {/* ─── Patient EMR Modal ─── */}
            <Modal
                isOpen={!!selectedPatient}
                onClose={() => setSelectedPatient(null)}
                title="Patient Record"
                size="lg"
            >
                {selectedPatient && (
                    <div>
                        {/* Patient Header */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="patient-avatar" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>
                                {selectedPatient.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="font-bold text-lg">{selectedPatient.name}</h3>
                                <span className="text-muted text-sm">{selectedPatient.id} • {selectedPatient.age}y, {selectedPatient.gender}</span>
                            </div>
                            {isAssistant && (
                                <button className="icon-btn danger" onClick={() => handleDelete(selectedPatient.id, selectedPatient.name)} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        {/* Tab Switcher */}
                        <div className="emr-tabs mb-4">
                            <button className={`emr-tab ${emrTab === 'info' ? 'active' : ''}`} onClick={() => setEmrTab('info')}>
                                <User size={14} /> Demographics
                            </button>
                            <button className={`emr-tab ${emrTab === 'visits' ? 'active' : ''}`} onClick={() => setEmrTab('visits')}>
                                <FileText size={14} /> Visit History ({selectedPatient.visits?.length || 0})
                            </button>
                            {isDoctor && (
                                <button className={`emr-tab ${emrTab === 'consult' ? 'active' : ''}`} onClick={() => setEmrTab('consult')}>
                                    <Stethoscope size={14} /> Consultation
                                </button>
                            )}
                        </div>

                        {/* Demographics Tab */}
                        {emrTab === 'info' && (
                            <div>
                                <div className="grid-cols-2 mb-4">
                                    <div className="p-3 bg-background rounded-lg">
                                        <p className="text-xs text-muted font-semibold mb-1">MOBILE</p>
                                        <p className="font-bold flex items-center gap-2"><Phone size={14} /> {selectedPatient.mobile}</p>
                                    </div>
                                    <div className="p-3 bg-background rounded-lg">
                                        <p className="text-xs text-muted font-semibold mb-1">BLOOD GROUP</p>
                                        <p className="font-bold flex items-center gap-2"><Droplets size={14} /> {selectedPatient.bloodGroup || 'N/A'}</p>
                                    </div>
                                </div>
                                {selectedPatient.address && (
                                    <div className="p-3 bg-background rounded-lg mb-4">
                                        <p className="text-xs text-muted font-semibold mb-1">ADDRESS</p>
                                        <p className="font-medium flex items-center gap-2"><MapPin size={14} /> {selectedPatient.address}</p>
                                    </div>
                                )}
                                <div className="p-3 bg-background rounded-lg mb-4">
                                    <p className="text-xs text-muted font-semibold mb-1">ALLERGIES</p>
                                    <p className={`font-medium flex items-center gap-2 ${selectedPatient.allergies && selectedPatient.allergies !== 'None' ? 'text-accent' : ''}`}>
                                        <AlertTriangle size={14} /> {selectedPatient.allergies || 'None reported'}
                                    </p>
                                </div>
                                <div className="p-3 bg-background rounded-lg mb-4">
                                    <p className="text-xs text-muted font-semibold mb-1">REGISTERED ON</p>
                                    <p className="font-bold">{selectedPatient.registeredOn || 'N/A'}</p>
                                </div>
                                {selectedPatient.aadhaarNumber && (
                                    <div className="p-3 bg-background rounded-lg mb-4">
                                        <p className="text-xs text-muted font-semibold mb-1">AADHAAR NUMBER</p>
                                        <p className="font-bold font-mono tracking-widest">{selectedPatient.aadhaarNumber}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Visit History Tab (EMR) */}
                        {emrTab === 'visits' && (
                            <div className="emr-visit-list">
                                {(!selectedPatient.visits || selectedPatient.visits.length === 0) ? (
                                    <EmptyState
                                        icon={FileText}
                                        title="No visit history"
                                        subtitle="This patient hasn't been seen yet"
                                    />
                                ) : (
                                    selectedPatient.visits.map((visit, index) => (
                                        <div key={index} className="emr-visit-card">
                                            <div className="emr-visit-header">
                                                <span className="emr-visit-date">
                                                    <Calendar size={13} /> {visit.date}
                                                </span>
                                                <span className="tag">{visit.doctor}</span>
                                            </div>

                                            {/* Vitals */}
                                            {visit.vitals && (
                                                <div className="emr-vitals-grid">
                                                    {visit.vitals.bp && (
                                                        <div className="emr-vital">
                                                            <span className="emr-vital-label">BP</span>
                                                            <span className="emr-vital-value">{visit.vitals.bp}</span>
                                                        </div>
                                                    )}
                                                    {visit.vitals.temp && (
                                                        <div className="emr-vital">
                                                            <span className="emr-vital-label">Temp</span>
                                                            <span className="emr-vital-value">{visit.vitals.temp}</span>
                                                        </div>
                                                    )}
                                                    {visit.vitals.pulse && (
                                                        <div className="emr-vital">
                                                            <span className="emr-vital-label">Pulse</span>
                                                            <span className="emr-vital-value">{visit.vitals.pulse}</span>
                                                        </div>
                                                    )}
                                                    {visit.vitals.spo2 && (
                                                        <div className="emr-vital">
                                                            <span className="emr-vital-label">SpO₂</span>
                                                            <span className="emr-vital-value">{visit.vitals.spo2}</span>
                                                        </div>
                                                    )}
                                                    {visit.vitals.weight && (
                                                        <div className="emr-vital">
                                                            <span className="emr-vital-label">Weight</span>
                                                            <span className="emr-vital-value">{visit.vitals.weight}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="emr-field">
                                                <span className="emr-field-label">Symptoms</span>
                                                <p>{visit.symptoms}</p>
                                            </div>
                                            <div className="emr-field">
                                                <span className="emr-field-label">Diagnosis</span>
                                                <p className="font-bold">{visit.diagnosis}</p>
                                            </div>

                                            {visit.medicines?.length > 0 && (
                                                <div className="emr-field">
                                                    <span className="emr-field-label"><Pill size={12} /> Medications</span>
                                                    <div className="emr-meds-list">
                                                        {visit.medicines.map((med, mi) => (
                                                            <div key={mi} className="emr-med-item">
                                                                <strong>{med.name} {med.dosage}</strong>
                                                                <span>{med.frequency} • {med.duration}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {visit.labReferrals?.length > 0 && (
                                                <div className="emr-field">
                                                    <span className="emr-field-label"><Activity size={12} /> Lab Referrals</span>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {visit.labReferrals.map((lab, li) => (
                                                            <span key={li} className="tag">{lab}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {visit.dietPlan && (
                                                <div className="emr-field">
                                                    <span className="emr-field-label" style={{ color: 'var(--emerald)', fontWeight: 'bold' }}>
                                                        <Apple size={12} /> Diet & Homecare: {visit.dietPlan.ageGroup}
                                                    </span>
                                                    <div className="p-2 bg-emerald/5 rounded border border-emerald/10 text-xs text-muted">
                                                        <p><strong>Rec:</strong> {visit.dietPlan.recommended.slice(0, 3).map(r => r.item).join(', ')}...</p>
                                                    </div>
                                                </div>
                                            )}

                                            {visit.notes && (
                                                <div className="emr-field">
                                                    <span className="emr-field-label">Doctor's Notes</span>
                                                    <p className="text-sm text-muted" style={{ fontStyle: 'italic' }}>{visit.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Consultation Tab */}
                        {emrTab === 'consult' && isDoctor && (
                            <div className="mt-4">
                                <ConsultationForm 
                                    patient={selectedPatient} 
                                    onComplete={() => {
                                        setEmrTab('visits');
                                        // Refresh the selected patient to show new visit
                                        const updated = filteredPatients.find(p => p.id === selectedPatient.id);
                                        if (updated) setSelectedPatient(updated);
                                    }} 
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Patients;
