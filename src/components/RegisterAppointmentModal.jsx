import React, { useState } from 'react';
import { 
    X, User, Calendar, Clock, Search, 
    UserPlus, Wallet, Phone, CheckCircle2 
} from 'lucide-react';
import Modal from './Modal';
import useQueue from '../hooks/useAppointments';
import usePatients from '../hooks/usePatients';
import { showToast } from './Toast';

const RegisterAppointmentModal = ({ isOpen, onClose }) => {
    const { addToQueue, nextToken } = useQueue();
    const { filteredPatients, searchTerm, setSearchTerm } = usePatients();
    
    const [mode, setMode] = useState('registered'); // 'registered' or 'walkin'
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [walkInData, setWalkInData] = useState({ name: '', mobile: '' });
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    const [type, setType] = useState('New');
    const [fee, setFee] = useState(300);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (mode === 'registered' && !selectedPatient) {
            showToast('Please select a patient from the list', 'error');
            return;
        }
        if (mode === 'walkin' && !walkInData.name) {
            showToast('Please enter patient name', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                date,
                time,
                type,
                fee,
                ...(mode === 'registered' 
                    ? { patientId: selectedPatient.id, name: selectedPatient.name, mobile: selectedPatient.mobile }
                    : { name: walkInData.name, mobile: walkInData.mobile, type: 'Walk-in' }
                )
            };

            const result = await addToQueue(payload);
            showToast(`Appointment registered for ${payload.name} as ${result.token}`, 'success');
            onClose();
            // Reset
            setSelectedPatient(null);
            setWalkInData({ name: '', mobile: '' });
            setSearchTerm('');
        } catch (err) {
            showToast('Failed to register appointment', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New Appointment" size="md">
            <div className="appointment-register-container">
                <div className="flex gap-4 mb-6 p-1 bg-background rounded-xl border border-border">
                    <button 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'registered' ? 'bg-white shadow-sm text-primary' : 'text-faint hover:text-main'}`}
                        onClick={() => setMode('registered')}
                    >
                        <User size={16} className="inline mr-2" /> From Records
                    </button>
                    <button 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'walkin' ? 'bg-white shadow-sm text-primary' : 'text-faint hover:text-main'}`}
                        onClick={() => setMode('walkin')}
                    >
                        <UserPlus size={16} className="inline mr-2" /> New Walk-in
                    </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    {mode === 'registered' ? (
                        <div className="space-y-4">
                            <div className="form-group">
                                <label>Search Patient</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-faint" size={18} />
                                    <input 
                                        type="text" 
                                        className="pl-10" 
                                        placeholder="Name, Mobile or ID..." 
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setSelectedPatient(null);
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {searchTerm && !selectedPatient && (
                                <div className="max-h-40 overflow-y-auto border border-border rounded-xl bg-background/50">
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map(p => (
                                            <div 
                                                key={p.id} 
                                                className="p-3 hover:bg-white cursor-pointer border-b border-border last:border-0 flex justify-between items-center"
                                                onClick={() => {
                                                    setSelectedPatient(p);
                                                    setSearchTerm(p.name);
                                                }}
                                            >
                                                <div>
                                                    <p className="font-bold text-sm text-main">{p.name}</p>
                                                    <p className="text-[10px] text-faint">{p.id} • {p.mobile}</p>
                                                </div>
                                                <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-4 text-center text-xs text-faint">No records found</p>
                                    )}
                                </div>
                            )}

                            {selectedPatient && (
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-main">{selectedPatient.name}</p>
                                        <p className="text-[10px] text-faint">Selected from hospital records</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedPatient(null)}
                                        className="ml-auto text-faint hover:text-danger"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group col-span-2">
                                <label>Patient Name *</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="Enter full name"
                                    value={walkInData.name}
                                    onChange={e => setWalkInData({...walkInData, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group col-span-2">
                                <label>Mobile Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="+91"
                                    value={walkInData.mobile}
                                    onChange={e => setWalkInData({...walkInData, mobile: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label><Calendar size={14} className="inline mr-1" /> Appointment Date</label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label><Clock size={14} className="inline mr-1" /> Time Slot</label>
                            <input 
                                type="text" 
                                placeholder="e.g. 10:30 AM"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>Appointment Type</label>
                            <select value={type} onChange={e => setType(e.target.value)}>
                                <option>New</option>
                                <option>Follow-up</option>
                                <option>Walk-in</option>
                                <option>Emergency</option>
                                <option>Tele-consult</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Wallet size={14} className="inline mr-1" /> Consultation Fee (₹)</label>
                            <input 
                                type="number" 
                                value={fee}
                                onChange={e => setFee(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border mt-2">
                        <button 
                            type="submit" 
                            className="primary-btn w-full py-3" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registering...' : 'Confirm Appointment'}
                        </button>
                        <p className="text-[10px] text-center text-faint mt-3">
                            Patient will be added to the {date === new Date().toISOString().split('T')[0] ? 'today\'s queue' : 'scheduled list for ' + date}.
                        </p>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default RegisterAppointmentModal;
