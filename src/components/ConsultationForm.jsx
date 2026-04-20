import { useState, useEffect } from 'react';
import {
    Plus, Trash2, FileText, Share2, Printer, Pill, Stethoscope,
    PenTool, ChevronDown, ChevronUp, Heart, TestTubes, CheckCircle2, Apple, X, ChevronRight, Search, LogOut
} from 'lucide-react';
import StylusPad from './StylusPad';
import usePatients from '../hooks/usePatients';
import useQueue from '../hooks/useAppointments';
import useDispensary from '../hooks/useDispensary';
import usePrescriptions from '../hooks/usePrescriptions';
import useBilling from '../hooks/useBilling';
import { showToast } from './Toast';
import { downloadPrescription, downloadReferralSlip } from '../utils/pdfUtils';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_DIET_TEMPLATES } from '../pages/DietTemplates';
import { Link } from 'react-router-dom';

const LAB_TESTS = [
    'CBC (Complete Blood Count)', 'Blood Sugar (Fasting)', 'Blood Sugar (PP)',
    'HbA1c', 'Lipid Profile', 'Kidney Function Test', 'Liver Function Test',
    'Thyroid Profile (T3/T4/TSH)', 'Urine Routine', 'Uric Acid',
    'Dengue NS1', 'Malaria (MP)', 'Widal Test', 'CRP',
    'Chest X-Ray', 'ECG', 'Ultrasound Abdomen', 'MRI', 'CT Scan',
    'Pulmonary Function Test', 'Vitamin D', 'Vitamin B12', 'Iron Studies'
];

const ConsultationForm = ({ patient, onComplete }) => {
    const { user } = useAuth();
    const { addVisit } = usePatients();
    const { consultingItem, markCompleted } = useQueue();
    const { addOrder } = useDispensary();
    const { addPrescription } = usePrescriptions();
    const { addInvoice } = useBilling();

    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [showStylusPad, setShowStylusPad] = useState(false);
    const [prescribedMeds, setPrescribedMeds] = useState([]);
    const [selectedLabs, setSelectedLabs] = useState([]);
    const [labSearch, setLabSearch] = useState('');
    const [showLabPanel, setShowLabPanel] = useState(false);
    const [prescriptionUrl, setPrescriptionUrl] = useState('');
    const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '', spo2: '' });
    const [activeMeds, setActiveMeds] = useState({ name: '', dosage: '', frequency: '1-0-1 (Twice a day)', duration: '5 days', category: 'medication', dispenseType: 'outdoor' });

    // Diet & Homecare state
    const [dietTemplates, setDietTemplates] = useState(() => {
        const saved = localStorage.getItem('diet_templates');
        return saved ? JSON.parse(saved) : DEFAULT_DIET_TEMPLATES;
    });
    const [showDietPanel, setShowDietPanel] = useState(false);
    const [selectedDietTemplate, setSelectedDietTemplate] = useState(null);
    const [customDiet, setCustomDiet] = useState('');

    const filteredLabs = LAB_TESTS.filter(t =>
        t.toLowerCase().includes(labSearch.toLowerCase()) && !selectedLabs.includes(t)
    );

    const addMedicine = () => {
        if (!activeMeds.name) {
            showToast('Please enter medicine name', 'error');
            return;
        }
        setPrescribedMeds([...prescribedMeds, { ...activeMeds, id: Date.now() }]);
        setActiveMeds({ name: '', dosage: '', frequency: '1-0-1 (Twice a day)', duration: '5 days', category: 'medication', dispenseType: 'outdoor' });
        showToast(`${activeMeds.name} added to prescription`, 'success');
    };

    const removeMed = (id) => {
        setPrescribedMeds(prescribedMeds.filter(m => m.id !== id));
    };

    const toggleLab = (labName) => {
        if (selectedLabs.includes(labName)) {
            setSelectedLabs(selectedLabs.filter(l => l !== labName));
        } else {
            setSelectedLabs([...selectedLabs, labName]);
        }
    };

    const handleGeneratePDF = () => {
        if (!patient) return;
        if (prescribedMeds.length === 0) {
            showToast('Add at least one medicine to generate prescription', 'error');
            return;
        }
        downloadPrescription({
            clinic: {
                name: user?.clinicName || 'SmartClinic',
                doctor: user?.name || 'Dr. Payal Patel',
                address: user?.clinicAddress || 'MG Road, Mumbai',
                phone: user?.clinicPhone || '+91 98765 43210'
            },
            patient: patient,
            symptoms,
            diagnosis,
            medicines: prescribedMeds,
            vitals,
            labReferrals: selectedLabs,
        });
        showToast('Prescription PDF generated!', 'success');
    };

    const handleGenerateReferral = () => {
        if (!patient) return;
        if (selectedLabs.length === 0) {
            showToast('Select at least one lab test', 'error');
            return;
        }
        downloadReferralSlip({
            clinic: {
                name: user?.clinicName || 'SmartClinic',
                doctor: user?.name || 'Dr. Payal Patel',
                address: user?.clinicAddress || 'MG Road, Mumbai',
                phone: user?.clinicPhone || '+91 98765 43210'
            },
            patient: patient,
            diagnosis,
            tests: selectedLabs,
        });
        showToast('Referral slip generated!', 'success');
    };

    const handleSaveAndComplete = () => {
        if (!patient) return;

        const doctorName = user?.name || 'Dr. Payal Patel';
        const clinicName = user?.clinicName || 'SmartClinic';
        const clinicId   = user?.clinicId   || '';

        // 1. Save the visit to EMR
        const visitData = {
            date: new Date().toISOString().split('T')[0],
            doctor: doctorName,
            symptoms,
            diagnosis,
            vitals: { ...vitals },
            medicines: prescribedMeds.map(m => ({ name: m.name, dosage: m.dosage, frequency: m.frequency, duration: m.duration })),
            labReferrals: [...selectedLabs],
            notes,
            dietPlan: selectedDietTemplate
                ? { ...selectedDietTemplate }
                : (customDiet ? { ageGroup: 'Custom', recommended: [{ item: customDiet, details: '' }], avoid: [] } : null),
            prescriptionUrl,
        };
        addVisit(patient.id, visitData);
        showToast(`Visit saved to ${patient.name}'s EMR`, 'success');

        // Mark consulting patient as completed in queue
        if (consultingItem && consultingItem.patientId === patient.id) {
            markCompleted(consultingItem.token);
        }

        // 2. Auto-create dispensary orders (Indoor / Outdoor)
        if (prescribedMeds.length > 0) {
            const indoorItems  = prescribedMeds.filter(m => m.dispenseType === 'indoor');
            const outdoorItems = prescribedMeds.filter(m => m.dispenseType === 'outdoor');

            if (indoorItems.length > 0) {
                addOrder({
                    patientId: patient.id,
                    patientName: patient.name,
                    doctor: doctorName,
                    type: 'indoor',
                    items: indoorItems.map(m => ({
                        category: m.category || 'medication',
                        name: `${m.name} ${m.dosage}`,
                        dosage: m.frequency,
                        duration: m.duration,
                        quantity: 1,
                        dispensed: false,
                    })),
                    notes,
                });
                showToast(`${indoorItems.length} item(s) → Indoor Dispensary`, 'info');
            }

            if (outdoorItems.length > 0) {
                addOrder({
                    patientId: patient.id,
                    patientName: patient.name,
                    doctor: doctorName,
                    type: 'outdoor',
                    items: outdoorItems.map(m => ({
                        category: m.category || 'medication',
                        name: `${m.name} ${m.dosage}`,
                        dosage: m.frequency,
                        duration: m.duration,
                        quantity: 1,
                        dispensed: false,
                    })),
                    notes: '',
                });
                showToast(`${outdoorItems.length} item(s) → Outdoor Dispensary`, 'info');
            }
        }

        // 3. Auto-create Prescription record
        if (prescribedMeds.length > 0) {
            addPrescription({
                patient: patient.name,
                patientMobile: patient.mobile || '',
                patientId: patient.id,
                doctor: doctorName,
                clinic: clinicName,
                clinicId,
                diagnosis,
                labReferrals: [...selectedLabs],
                medicines: prescribedMeds.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    qty: 1,
                })),
            });
            showToast('Prescription sent to Rx module', 'success');
        }

        // 4. Auto-create draft Billing invoice
        const billingItems = [
            { description: 'Consultation Fee', amount: 300 },
            ...prescribedMeds.map(m => ({ description: `${m.name} ${m.dosage}`, amount: 0 })),
            ...selectedLabs.map(lab => ({ description: `Lab: ${lab}`, amount: 0 })),
        ];
        addInvoice({
            patient: patient.name,
            patientId: patient.id,
            diagnosis,
            items: billingItems,
        });
        showToast('Draft invoice created in Billing', 'info');

        if (onComplete) onComplete();
    };

    return (
        <div className="flex gap-6 consultation-interface animate-fade-in">
            {/* Left Column — clinical assessment (60% width) */}
            <div className="flex-[1.5] space-y-5">
                
                {/* 1. Vital Tiles */}
                <div className="vitals-deck">
                    <div className="vital-tile">
                        <label>BP (mmHg)</label>
                        <input type="text" placeholder="120/80" value={vitals.bp}
                            onChange={e => setVitals({ ...vitals, bp: e.target.value })} />
                    </div>
                    <div className="vital-tile">
                        <label>Pulse (bpm)</label>
                        <input type="text" placeholder="72" value={vitals.pulse}
                            onChange={e => setVitals({ ...vitals, pulse: e.target.value })} />
                    </div>
                    <div className="vital-tile">
                        <label>SpO₂ (%)</label>
                        <input type="text" placeholder="98" value={vitals.spo2}
                            onChange={e => setVitals({ ...vitals, spo2: e.target.value })} />
                    </div>
                    <div className="vital-tile">
                        <label>Temp (°F)</label>
                        <input type="text" placeholder="98.6" value={vitals.temp}
                            onChange={e => setVitals({ ...vitals, temp: e.target.value })} />
                    </div>
                    <div className="vital-tile">
                        <label>Weight (kg)</label>
                        <input type="text" placeholder="00" value={vitals.weight}
                            onChange={e => setVitals({ ...vitals, weight: e.target.value })} />
                    </div>
                </div>

                {/* 2. Observation Deck */}
                <div className="observation-card">
                    <h4><FileText size={18} className="text-primary" /> Examination & Findings</h4>
                    
                    <div className="space-y-6">
                        <div className="form-group">
                            <label className="!text-[10px] !text-main !font-black !tracking-widest">Chief Complaints</label>
                            <textarea 
                                className="premium-textarea" 
                                rows="2" 
                                placeholder="Patient's reported symptoms and duration..."
                                value={symptoms} 
                                onChange={e => setSymptoms(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="form-group">
                                <label className="!text-[10px] !text-main !font-black !tracking-widest">Clinical Diagnosis</label>
                                <textarea 
                                    className="premium-textarea" 
                                    rows="2" 
                                    placeholder="Enter diagnosis..."
                                    value={diagnosis} 
                                    onChange={e => setDiagnosis(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label className="!text-[10px] !text-main !font-black !tracking-widest">Procedural Notes</label>
                                <textarea 
                                    className="premium-textarea" 
                                    rows="2" 
                                    placeholder="Any private or procedural notes..."
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="stylus-gate !mt-3 !mb-0" onClick={() => setShowStylusPad(!showStylusPad)}>
                        <div className="flex items-center justify-center gap-2">
                             <PenTool size={14} /> 
                             <span>{showStylusPad ? 'Dismiss Drawing Pad' : 'Launch Digital Sketch Pad / Signature'}</span>
                        </div>
                    </div>
                    {showStylusPad && (
                        <div className="mt-4 animate-scale-up">
                            <StylusPad height={220} />
                        </div>
                    )}
                </div>

                {/* Lab Referrals Card */}
                <div className="observation-card">
                    <div className="flex justify-between items-center mb-4 pb-4 border-bottom border-border-light">
                        <h4 className="!mb-0 !border-0"><TestTubes size={18} className="text-secondary" /> Lab Referrals</h4>
                        <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-full font-black uppercase">
                            {selectedLabs.length} Selected
                        </span>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
                             <input 
                                type="text" 
                                placeholder="Find test (e.g. CBC, MRI...)" 
                                className="premium-textarea !py-2.5 !text-sm mb-4"
                                value={labSearch} 
                                onChange={e => setLabSearch(e.target.value)} 
                             />
                             <div className="flex flex-wrap gap-2">
                                {filteredLabs.slice(0, 12).map((lab, i) => (
                                    <button 
                                        key={i} 
                                        type="button"
                                        className="px-2 py-1 bg-background border border-border-light rounded-lg text-[10px] font-bold text-muted hover:border-secondary hover:text-secondary transition-all"
                                        onClick={() => toggleLab(lab)}
                                    >
                                        + {lab}
                                    </button>
                                ))}
                             </div>
                        </div>
                        {selectedLabs.length > 0 && (
                            <div className="w-1/3 bg-background/50 rounded-xl p-4 border border-secondary/10">
                                <p className="text-[10px] uppercase font-black text-secondary mb-3">Order Manifest</p>
                                <div className="space-y-2">
                                    {selectedLabs.map((l, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-border-light text-[11px] font-bold">
                                            <span>{l}</span>
                                            <button onClick={() => toggleLab(l)} className="text-danger p-1"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column — Prescription Builder (40% width) */}
            <div className="flex-1 prescription-deck">
                <div className="observation-card !p-0 overflow-hidden flex flex-col h-full !mb-0">
                    <div className="p-5 border-bottom border-border-light bg-primary/5">
                        <h4 className="!mb-0 !border-0"><Pill size={18} className="text-primary" /> Prescription Deck</h4>
                    </div>
                    
                    <div className="p-5 flex-1 overflow-y-auto space-y-6">
                        {/* Builder */}
                        <div className="rx-builder space-y-4">
                            <div className="rx-builder-row-group">
                                <div className="clinical-input-group">
                                    <label>Drug Name & Strength</label>
                                    <div className="flex gap-2">
                                        <input type="text" className="clinical-input" style={{ flex: 2 }} placeholder="Metformin" value={activeMeds.name}
                                            onChange={e => setActiveMeds({ ...activeMeds, name: e.target.value })} />
                                        <input type="text" className="clinical-input" style={{ flex: 1 }} placeholder="500mg" value={activeMeds.dosage}
                                            onChange={e => setActiveMeds({ ...activeMeds, dosage: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="rx-builder-row-group">
                                <div className="clinical-input-group">
                                    <label>Frequency Routine</label>
                                    <select className="clinical-input !text-sm" value={activeMeds.frequency} onChange={e => setActiveMeds({ ...activeMeds, frequency: e.target.value })}>
                                        <option>1-0-1 (Twice daily)</option>
                                        <option>1-1-1 (Thrice daily)</option>
                                        <option>0-0-1 (At Bedtime)</option>
                                        <option>1-0-0 (Empty Stomach)</option>
                                        <option>SOS / PRN</option>
                                        <option>Stat (Immediate)</option>
                                    </select>
                                </div>
                                <div className="clinical-input-group">
                                    <label>Duration</label>
                                    <input type="text" className="clinical-input" placeholder="5 Days" value={activeMeds.duration}
                                        onChange={e => setActiveMeds({ ...activeMeds, duration: e.target.value })} />
                                </div>
                            </div>

                            <div className="rx-builder-row-group">
                                <div className="clinical-input-group">
                                    <label>Refill / Fulfillment</label>
                                    <select className="clinical-input !text-sm" value={activeMeds.dispenseType} onChange={e => setActiveMeds({ ...activeMeds, dispenseType: e.target.value })}>
                                        <option value="outdoor">Pharmacy (Outdoor)</option>
                                        <option value="indoor">Hospital (Indoor)</option>
                                    </select>
                                </div>
                                <button className="clinical-add-btn" onClick={addMedicine} title="Add medication to list">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {prescribedMeds.length === 0 ? (
                                <div className="py-20 text-center text-faint border border-dashed border-border-light rounded-2xl">
                                    <Pill size={32} className="mx-auto mb-2 opacity-10" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No medications drafted</p>
                                </div>
                            ) : (
                                prescribedMeds.map((med) => (
                                    <div key={med.id} className="med-pill-premium">
                                        <div className="med-info-group">
                                            <span className="med-name-bold">{med.name} — {med.dosage}</span>
                                            <span className="med-meta-light uppercase tracking-tighter">
                                                {med.frequency} • {med.duration} • <span className={med.dispenseType === 'indoor' ? 'text-secondary' : 'text-primary'}>{med.dispenseType}</span>
                                            </span>
                                        </div>
                                        <button onClick={() => removeMed(med.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-5 border-top border-border-light bg-surface sticky bottom-0">
                        <div className="action-stack">
                            <button className="save-complete-btn !bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-200" onClick={handleSaveAndComplete}>
                                <LogOut size={20} /> End Consultation
                            </button>
                            <div className="flex gap-2">
                                <button className="secondary-btn-sm flex-1 !py-3 !text-[12px] !border-none !bg-background" onClick={handleGeneratePDF}>
                                    <Printer size={16} /> Generate Rx PDF
                                </button>
                                <button className="secondary-btn-sm flex-1 !py-3 !text-[12px] !border-none !bg-background" onClick={handleGenerateReferral}>
                                     <Share2 size={16} /> Print Referrals
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationForm;
