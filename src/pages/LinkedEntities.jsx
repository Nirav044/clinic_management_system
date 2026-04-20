import { useState } from 'react';
import { Link2, Building2, Plus, Trash2, Store, MapPin, Phone, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import useLocalStorage from '../hooks/useLocalStorage';

// Demo data: available stores and clinics that can be linked
const AVAILABLE_STORES = [
    { id: 'STORE001', name: 'MedPlus Pharmacy', address: 'MG Road, Mumbai', phone: '+91 22 1234 5678', status: 'active', distance: '200m' },
    { id: 'STORE002', name: 'Apollo Pharmacy', address: 'Andheri West, Mumbai', phone: '+91 22 8765 4321', status: 'active', distance: '1.2km' },
    { id: 'STORE003', name: 'Wellness Forever', address: 'Bandra, Mumbai', phone: '+91 22 5555 1234', status: 'active', distance: '2.5km' },
    { id: 'STORE004', name: 'NetMeds Store', address: 'Dadar, Mumbai', phone: '+91 22 9876 5432', status: 'active', distance: '3.1km' },
];

const AVAILABLE_CLINICS = [
    { id: 'CLINIC001', name: 'SmartClinic', doctor: 'Dr. Payal Patel', specialty: 'General Medicine', address: 'MG Road, Mumbai', phone: '+91 98765 43210', status: 'active' },
    { id: 'CLINIC002', name: 'City Care Clinic', doctor: 'Dr. Patel', specialty: 'Pediatrics', address: 'Bandra, Mumbai', phone: '+91 87654 32109', status: 'active' },
    { id: 'CLINIC003', name: 'Health First', doctor: 'Dr. Gupta', specialty: 'Dermatology', address: 'Juhu, Mumbai', phone: '+91 76543 21098', status: 'active' },
];

const LinkedEntities = () => {
    const { user, isClinic, isStore } = useAuth();
    const storageKey = isClinic ? 'linked_stores' : 'linked_clinics';
    const defaultLinked = isClinic
        ? [AVAILABLE_STORES[0], AVAILABLE_STORES[1]]
        : [AVAILABLE_CLINICS[0], AVAILABLE_CLINICS[1]];

    const [linkedEntities, setLinkedEntities] = useLocalStorage(storageKey, defaultLinked);
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const availableEntities = isClinic ? AVAILABLE_STORES : AVAILABLE_CLINICS;
    const linkedIds = linkedEntities.map(e => e.id);
    const unlinked = availableEntities.filter(e => !linkedIds.includes(e.id));
    const filteredUnlinked = unlinked.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const entityLabel = isClinic ? 'Medical Store' : 'Clinic';
    const entityLabelPlural = isClinic ? 'Medical Stores' : 'Clinics';
    const EntityIcon = isClinic ? Store : Building2;

    const handleLink = (entity) => {
        setLinkedEntities([...linkedEntities, entity]);
        showToast(`${entity.name} linked successfully!`, 'success');
    };

    const handleUnlink = (id, name) => {
        if (window.confirm(`Unlink ${name}? Prescriptions will no longer be shared.`)) {
            setLinkedEntities(linkedEntities.filter(e => e.id !== id));
            showToast(`${name} unlinked`, 'info');
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                title={`Linked ${entityLabelPlural}`}
                subtitle={`Manage connected ${entityLabelPlural.toLowerCase()} for prescription sharing`}
            >
                <button className="primary-btn-sm" onClick={() => setIsLinkOpen(true)}>
                    <Plus size={15} /> Link {entityLabel}
                </button>
            </PageHeader>

            {/* How it works */}
            <div className="glass p-4 rounded-xl mb-6" style={{ borderLeft: '4px solid var(--primary)' }}>
                <p className="font-bold text-sm flex items-center gap-2 mb-1">
                    <Link2 size={16} className="text-primary" />
                    How Clinic ↔ Store Linking Works
                </p>
                <p className="text-sm text-muted">
                    {isClinic
                        ? 'When you generate a prescription, it is automatically sent to all linked medical stores. Patients can pick up medicines from any linked store.'
                        : 'Linked clinics can send prescriptions directly to your store. You can view, prepare, and dispense medicines from the Prescriptions page.'
                    }
                </p>
            </div>

            {/* Linked Entities Grid */}
            {linkedEntities.length === 0 ? (
                <EmptyState
                    icon={EntityIcon}
                    title={`No ${entityLabelPlural.toLowerCase()} linked`}
                    subtitle={`Link your first ${entityLabel.toLowerCase()} to start sharing prescriptions`}
                    action={
                        <button className="primary-btn-sm" onClick={() => setIsLinkOpen(true)}>
                            <Plus size={14} /> Link {entityLabel}
                        </button>
                    }
                />
            ) : (
                <div className="patient-grid stagger-children">
                    {linkedEntities.map(entity => (
                        <div key={entity.id} className="glass p-5 rounded-2xl" style={{ position: 'relative' }}>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="icon-circle" style={{ background: isClinic ? 'var(--emerald-light)' : 'var(--primary-light)' }}>
                                    <EntityIcon size={20} style={{ color: isClinic ? 'var(--emerald)' : 'var(--primary)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 className="font-bold">{entity.name}</h3>
                                    {entity.doctor && <p className="text-sm text-muted">{entity.doctor} • {entity.specialty}</p>}
                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{entity.id}</p>
                                </div>
                                <span className="status-badge status-active">Active</span>
                            </div>

                            <div className="flex flex-col gap-1 mb-4">
                                <p className="text-sm text-muted flex items-center gap-2">
                                    <MapPin size={13} /> {entity.address}
                                </p>
                                <p className="text-sm text-muted flex items-center gap-2">
                                    <Phone size={13} /> {entity.phone}
                                </p>
                                {entity.distance && (
                                    <p className="text-sm font-semibold flex items-center gap-2 mt-1" style={{ color: 'var(--emerald)' }}>
                                        <CheckCircle2 size={13} /> {entity.distance} from clinic
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button className="secondary-btn flex-1" style={{ justifyContent: 'center' }}>
                                    <Phone size={13} /> Contact
                                </button>
                                <button
                                    className="icon-btn danger"
                                    title="Unlink"
                                    onClick={() => handleUnlink(entity.id, entity.name)}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Link New Entity Modal */}
            <Modal
                isOpen={isLinkOpen}
                onClose={() => { setIsLinkOpen(false); setSearchTerm(''); }}
                title={`Link a ${entityLabel}`}
            >
                <p className="text-sm text-muted mb-4">
                    Select a {entityLabel.toLowerCase()} to link with your {isClinic ? 'clinic' : 'medical store'}.
                    Prescriptions will be shared between linked entities.
                </p>

                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={`Search ${entityLabelPlural.toLowerCase()} by name or location...`}
                />

                {filteredUnlinked.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-muted text-sm">
                            {unlinked.length === 0
                                ? `All available ${entityLabelPlural.toLowerCase()} are already linked!`
                                : 'No matching results found.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredUnlinked.map(entity => (
                            <div key={entity.id} className="patient-item-selectable" onClick={() => { handleLink(entity); setIsLinkOpen(false); }}>
                                <div className="flex items-center gap-3">
                                    <div className="icon-circle" style={{ padding: '0.5rem', background: isClinic ? 'var(--emerald-light)' : 'var(--primary-light)' }}>
                                        <EntityIcon size={16} style={{ color: isClinic ? 'var(--emerald)' : 'var(--primary)' }} />
                                    </div>
                                    <div className="text-left">
                                        <strong>{entity.name}</strong>
                                        <p>{entity.address}{entity.distance ? ` • ${entity.distance}` : ''}</p>
                                        {entity.doctor && <p style={{ fontSize: '0.75rem' }}>{entity.doctor} • {entity.specialty}</p>}
                                    </div>
                                </div>
                                <Plus size={18} />
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LinkedEntities;
