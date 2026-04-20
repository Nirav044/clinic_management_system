import { useState } from 'react';
import {
    Plus, Stethoscope, ArrowLeft, Search, ChevronRight
} from 'lucide-react';
import usePatients from '../hooks/usePatients';
import useQueue from '../hooks/useAppointments';
import PageHeader from '../components/PageHeader';
import ConsultationForm from '../components/ConsultationForm';

const Consultation = () => {
    const { patients } = usePatients();
    const { consultingItem, waitingList } = useQueue();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mobile.includes(searchTerm)
    );

    const resetConsultation = () => {
        setSelectedPatient(null);
        setSearchTerm('');
    };

    const selectFromQueue = () => {
        if (consultingItem?.patientId) {
            const p = patients.find(pt => pt.id === consultingItem.patientId);
            if (p) {
                setSelectedPatient(p);
                return;
            }
        }
        if (consultingItem) {
            setSelectedPatient({
                id: consultingItem.patientId || `WALK-${consultingItem.token}`,
                name: consultingItem.name,
                age: '-',
                gender: '-',
                mobile: consultingItem.mobile,
            });
        }
    };

    return (
        <div className="animate-fade-in consultation-page-container">
            <PageHeader title="Digital Consultation" subtitle="Examine, prescribe, and generate lab referrals" />

            {!selectedPatient ? (
                <div className="selection-screen">
                    <div className="empty-state-icon mb-6">
                        <Stethoscope size={40} className="text-primary" />
                    </div>
                    <h2>Identify Patient</h2>
                    <p className="text-muted text-sm mb-10">Select from the active queue or search the hospital records</p>

                    {consultingItem && (
                        <div className="mb-10">
                            <h4 className="text-[10px] uppercase font-black text-primary tracking-widest text-left mb-3">Currently In Cabin</h4>
                            <div className="consulting-highlight" onClick={selectFromQueue} style={{ cursor: 'pointer' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        {consultingItem.token}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-extrabold text-main text-lg leading-tight">{consultingItem.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight">Active Consultation</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="primary-btn-sm !rounded-xl px-5">Continue <ChevronRight size={16}/></button>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Search size={18} className="text-primary" />
                            <h4 className="text-[10px] uppercase font-black text-faint tracking-widest">Search Hospital Records</h4>
                        </div>
                        <div className="search-bar !mb-0 !bg-white !shadow-sm focus-within:!shadow-md transition-all">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Enter patient name, UID or mobile..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {searchTerm && (
                        <div className="patient-list-mini stagger-children">
                            {filteredPatients.slice(0, 6).map(p => (
                                <div key={p.id} className="patient-item-selectable !bg-white hover:!border-primary" onClick={() => setSelectedPatient(p)}>
                                    <div className="text-left">
                                        <strong className="text-main font-bold">{p.name}</strong>
                                        <p className="font-mono text-[10px] uppercase">{p.id} • {p.mobile} • {p.age}y {p.gender}</p>
                                    </div>
                                    <div className="p-2 bg-primary-light text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Plus size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!searchTerm && waitingList.length > 0 && (
                        <div className="mt-8 border-t border-border-light pt-8">
                            <h4 className="text-[10px] uppercase font-black text-faint tracking-widest text-left mb-4">Waiting in Queue ({waitingList.length})</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {waitingList.slice(0, 4).map(item => {
                                    const registered = patients.find(p => p.id === item.patientId);
                                    return (
                                        <div key={item.token} className="patient-item-selectable !bg-white" onClick={() => {
                                            setSelectedPatient(registered || { id: item.patientId || `WALK-${item.token}`, name: item.name, age: '-', gender: '-', mobile: item.mobile });
                                        }}>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-primary">#{item.token}</span>
                                                    <span className="font-bold text-main">{item.name}</span>
                                                </div>
                                                <p className="text-[10px]">{item.type} • {item.time}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-faint" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="consultation-interface-wrapper">
                    <div className="px-4 mb-4 flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                             <Stethoscope size={18} className="text-primary" />
                             <span className="font-bold text-sm">Patient: {selectedPatient.name}</span>
                        </div>
                        <button className="secondary-btn-sm" onClick={resetConsultation}>
                            <ArrowLeft size={14} /> Change Patient
                        </button>
                    </div>
                    <ConsultationForm patient={selectedPatient} onComplete={resetConsultation} />
                </div>
            )}
        </div>
    );
};

export default Consultation;
