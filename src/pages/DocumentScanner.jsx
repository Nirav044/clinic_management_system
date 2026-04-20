import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Camera, Upload, FileText, X, Trash2,
    FolderOpen, Calendar, User, Download,
    Plus, ScanLine, File, Video, VideoOff, ZapOff
} from 'lucide-react';
import usePatients from '../hooks/usePatients';
import useLocalStorage from '../hooks/useLocalStorage';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';

const DOC_TYPES = [
    { key: 'lab_report',   label: 'Lab Report',           icon: '🧪', color: '#4f46e5' },
    { key: 'prescription', label: 'Old Prescription',     icon: '📝', color: '#0ea5e9' },
    { key: 'xray',         label: 'X-Ray / Scan',         icon: '🩻', color: '#f59e0b' },
    { key: 'discharge',    label: 'Discharge Summary',    icon: '🏥', color: '#10b981' },
    { key: 'insurance',    label: 'Insurance Document',   icon: '🛡️', color: '#8b5cf6' },
    { key: 'other',        label: 'Other Document',       icon: '📄', color: '#64748b' },
];

const DEMO_DOCUMENTS = [
    { id: 'DOC001', patientId: 'PAT001', patientName: 'Rahul Verma',   type: 'lab_report',   title: 'CBC Report - Feb 2024',                  date: '2024-02-15', notes: 'All values within normal range. Slight elevation in WBC.',      thumbnail: null, fileName: 'CBC_Report_Feb2024.pdf' },
    { id: 'DOC002', patientId: 'PAT003', patientName: 'Amit Singh',    type: 'xray',         title: 'Chest X-Ray - Jan 2024',                 date: '2024-01-20', notes: 'No significant findings.',                                      thumbnail: null, fileName: 'ChestXRay_Jan2024.jpg' },
    { id: 'DOC003', patientId: 'PAT002', patientName: 'Sita Rani',     type: 'prescription', title: 'Old Prescription from Apollo Hospital',  date: '2024-01-10', notes: 'Previous doctor had prescribed Augmentin — patient allergic.', thumbnail: null, fileName: 'OldPrescription_Apollo.jpg' },
    { id: 'DOC004', patientId: 'PAT004', patientName: 'Priya Desai',   type: 'lab_report',   title: 'Pulmonary Function Test',                date: '2024-02-19', notes: 'FEV1 reduced. Consistent with asthma diagnosis.',              thumbnail: null, fileName: 'PFT_Report.pdf' },
];

/* ──────────────────────────────────────────────────
   Live Camera Component (getUserMedia)
────────────────────────────────────────────────── */
const LiveCamera = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);
    const [facingMode, setFacingMode] = useState('environment'); // rear cam first
    const [devices, setDevices] = useState([]);

    const startCamera = useCallback(async (mode = facingMode) => {
        // Stop any running stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setReady(false);
        setError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setReady(true);
            }
        } catch (err) {
            const msg =
                err.name === 'NotAllowedError'  ? 'Camera permission denied. Please allow camera access in your browser settings and try again.' :
                err.name === 'NotFoundError'    ? 'No camera found. Please connect a webcam and try again.' :
                err.name === 'NotReadableError' ? 'Camera is in use by another application. Close other apps using the camera.' :
                `Camera error: ${err.message}`;
            setError(msg);
        }
    }, [facingMode]);

    // Enumerate cameras to know if we can flip
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devs => {
            setDevices(devs.filter(d => d.kind === 'videoinput'));
        }).catch(() => {});
        startCamera(facingMode);
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, []); // eslint-disable-line

    const flipCamera = () => {
        const next = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(next);
        startCamera(next);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video || !ready) return;
        const canvas = document.createElement('canvas');
        canvas.width  = video.videoWidth  || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        // Stop camera
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        onCapture(dataUrl);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Viewfinder */}
            <div style={{
                position: 'relative', background: '#000', borderRadius: '12px',
                overflow: 'hidden', aspectRatio: '16/9', width: '100%',
            }}>
                <video
                    ref={videoRef}
                    autoPlay playsInline muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: ready ? 'block' : 'none' }}
                />
                {!ready && !error && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Initialising camera…</p>
                    </div>
                )}
                {error && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
                        <ZapOff size={36} style={{ opacity: 0.7 }} />
                        <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5 }}>{error}</p>
                        <button className="secondary-btn" onClick={() => startCamera(facingMode)} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
                            Retry
                        </button>
                    </div>
                )}
                {/* Scanner overlay lines */}
                {ready && (
                    <div style={{ position: 'absolute', inset: '10%', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '4px 0 0 0' }} />
                        <div style={{ position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 4px 0 0' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '0 0 0 4px' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 0 4px 0' }} />
                        {/* Scanning line animation */}
                        <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #4f46e5, transparent)', animation: 'scanLine 2s ease-in-out infinite' }} />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {devices.length > 1 && (
                    <button type="button" className="secondary-btn" onClick={flipCamera} style={{ flexShrink: 0 }}>
                        <Video size={15} /> Flip Camera
                    </button>
                )}
                <button
                    type="button"
                    className="primary-btn"
                    onClick={capturePhoto}
                    disabled={!ready}
                    style={{ flex: 1, opacity: ready ? 1 : 0.5 }}
                >
                    <Camera size={18} /> {ready ? 'Capture Photo' : 'Waiting for camera…'}
                </button>
                <button type="button" className="secondary-btn" onClick={onClose} style={{ flexShrink: 0 }}>
                    <X size={15} /> Cancel
                </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'center' }}>
                Position the document within the frame, then click Capture Photo
            </p>
        </div>
    );
};

/* ──────────────────────────────────────────────────
   Main Page
────────────────────────────────────────────────── */
const DocumentScanner = () => {
    const { patients } = usePatients();
    const [documents, setDocuments] = useLocalStorage('scanned_docs', DEMO_DOCUMENTS);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterPatient, setFilterPatient] = useState('all');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [viewDoc, setViewDoc] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id of doc pending delete confirm

    // 'idle' | 'camera' | 'upload'  — which capture mode is active in the modal
    const [captureMode, setCaptureMode] = useState('idle');

    const fileInputRef = useRef(null);

    const [uploadForm, setUploadForm] = useState({
        patientId: '', type: 'lab_report', title: '', notes: '',
        file: null, fileName: '', filePreview: null,
    });

    const filtered = documents.filter(doc => {
        const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.patientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' || doc.type === filterType;
        const matchPatient = filterPatient === 'all' || doc.patientId === filterPatient;
        return matchSearch && matchType && matchPatient;
    });

    const getDocTypeInfo = (type) => DOC_TYPES.find(d => d.key === type) || DOC_TYPES[5];

    /* File input handler */
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            showToast('File too large. Maximum size is 10 MB.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadForm(prev => ({
                ...prev,
                file: ev.target.result,
                fileName: file.name,
                filePreview: file.type.startsWith('image/') ? ev.target.result : null,
            }));
            setCaptureMode('idle');
        };
        reader.readAsDataURL(file);
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    /* Camera capture handler — receives base64 dataUrl from LiveCamera */
    const handleCameraCapture = (dataUrl) => {
        const fileName = `Scan_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.jpg`;
        setUploadForm(prev => ({
            ...prev,
            file: dataUrl,
            fileName,
            filePreview: dataUrl,
        }));
        setCaptureMode('idle');
        showToast('Photo captured! Fill in the details and click File Document.', 'success');
    };

    /* Form submit */
    const handleUpload = (e) => {
        e.preventDefault();
        const patient = patients.find(p => p.id === uploadForm.patientId);
        if (!patient) { showToast('Please select a patient', 'error'); return; }

        const newDoc = {
            id: `DOC${String(Date.now()).slice(-6)}`,
            patientId: uploadForm.patientId,
            patientName: patient.name,
            type: uploadForm.type,
            title: uploadForm.title || `${getDocTypeInfo(uploadForm.type).label} — ${new Date().toLocaleDateString('en-IN')}`,
            date: new Date().toISOString().split('T')[0],
            notes: uploadForm.notes,
            thumbnail: uploadForm.filePreview,
            fileName: uploadForm.fileName || 'document',
            fileData: uploadForm.file,
        };

        setDocuments(prev => [newDoc, ...prev]);
        showToast(`Document filed for ${patient.name}`, 'success');
        closeModal();
    };

    const closeModal = () => {
        setIsUploadOpen(false);
        setCaptureMode('idle');
        setUploadForm({ patientId: '', type: 'lab_report', title: '', notes: '', file: null, fileName: '', filePreview: null });
    };

    const handleDelete = (docId) => {
        // Remove from state — no window.confirm, use inline confirm UI instead
        setDocuments(prev => prev.filter(d => d.id !== docId));
        showToast('Document removed', 'info');
        setConfirmDeleteId(null);
        if (viewDoc?.id === docId) setViewDoc(null);
    };

    return (
        <div className="animate-fade-in">
            {/* Scan-line keyframe (injected dynamically so it works without editing CSS) */}
            <style>{`
                @keyframes scanLine {
                    0%   { top: 0; opacity: 1; }
                    50%  { top: calc(100% - 2px); opacity: 0.7; }
                    100% { top: 0; opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <PageHeader title="Document Scanner & Filing" subtitle="Scan, upload, and organize patient documents digitally">
                <button className="primary-btn-sm" onClick={() => setIsUploadOpen(true)}>
                    <Plus size={15} /> Upload / Scan
                </button>
            </PageHeader>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card glass" style={{ cursor: 'default' }}>
                    <div className="icon-circle"><FolderOpen size={20} /></div>
                    <div className="stat-info">
                        <span className="label">Total Documents</span>
                        <span className="value">{documents.length}</span>
                    </div>
                </div>
                {DOC_TYPES.slice(0, 3).map(dt => (
                    <div key={dt.key} className="stat-card glass" style={{ cursor: 'pointer' }} onClick={() => setFilterType(dt.key)}>
                        <div className="icon-circle" style={{ background: `${dt.color}15`, color: dt.color }}>
                            <span style={{ fontSize: '1.2rem' }}>{dt.icon}</span>
                        </div>
                        <div className="stat-info">
                            <span className="label">{dt.label}s</span>
                            <span className="value">{documents.filter(d => d.type === dt.key).length}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search documents…" />
                <div className="flex gap-2" style={{ flexShrink: 0 }}>
                    <select className="secondary-btn" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="all">All Types</option>
                        {DOC_TYPES.map(dt => <option key={dt.key} value={dt.key}>{dt.icon} {dt.label}</option>)}
                    </select>
                    <select className="secondary-btn" value={filterPatient} onChange={e => setFilterPatient(e.target.value)}>
                        <option value="all">All Patients</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                    {(filterType !== 'all' || filterPatient !== 'all' || searchTerm) && (
                        <button className="secondary-btn" onClick={() => { setFilterType('all'); setFilterPatient('all'); setSearchTerm(''); }}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Documents Grid */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={ScanLine}
                    title="No documents found"
                    subtitle="Upload or scan patient documents to organize them digitally"
                    action={<button className="primary-btn-sm" onClick={() => setIsUploadOpen(true)}><Camera size={14} /> Scan First Document</button>}
                />
            ) : (
                <div className="doc-grid stagger-children">
                    {filtered.map(doc => {
                        const typeInfo = getDocTypeInfo(doc.type);
                        return (
                            <div
                                key={doc.id}
                                className="doc-card glass"
                                style={{ borderLeft: `3px solid ${typeInfo.color}` }}
                                onClick={() => setViewDoc(doc)}
                            >
                                {/* Thumbnail — real image or clean placeholder */}
                                <div style={{
                                    height: 130,
                                    background: 'var(--border-light, #f1f5f9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                    {doc.thumbnail ? (
                                        <img
                                            src={doc.thumbnail}
                                            alt={doc.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    ) : (
                                        /* Clean icon placeholder — no giant colored blobs */
                                        <div style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '14px',
                                            background: `${typeInfo.color}18`,
                                            border: `2px solid ${typeInfo.color}30`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.65rem',
                                            lineHeight: 1,
                                        }}>
                                            {typeInfo.icon}
                                        </div>
                                    )}

                                    {/* Type badge — top right */}
                                    <span style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        background: typeInfo.color,
                                        color: '#fff',
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        padding: '2px 7px',
                                        borderRadius: 999,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                    }}>
                                        {typeInfo.label}
                                    </span>
                                </div>

                                {/* Card body */}
                                <div className="doc-card-body">
                                    <h4 className="font-bold text-sm">{doc.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted flex items-center gap-1"><User size={11} /> {doc.patientName}</span>
                                        <span className="text-xs text-muted flex items-center gap-1"><Calendar size={11} /> {doc.date}</span>
                                    </div>
                                    {doc.notes && (
                                        <p className="text-xs text-muted mt-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {doc.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            )}

            {/* ══════════════════════════════════════════
                Upload / Scan Modal
            ══════════════════════════════════════════ */}
            <Modal isOpen={isUploadOpen} onClose={closeModal} title="Upload or Scan Document" size="lg">
                {/* ── Step 1: Choose capture method ── */}
                {captureMode === 'idle' && !uploadForm.file && (
                    <div>
                        <p className="text-sm text-muted mb-4">Choose how to add the document:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            {/* Camera Scan */}
                            <button
                                type="button"
                                className="scanner-capture-btn"
                                onClick={() => setCaptureMode('camera')}
                                style={{ flexDirection: 'column', height: 110, gap: '0.5rem' }}
                            >
                                <Camera size={32} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontWeight: 700 }}>Camera Scan</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Use your webcam to capture</span>
                            </button>

                            {/* File Upload */}
                            <button
                                type="button"
                                className="scanner-capture-btn"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ flexDirection: 'column', height: 110, gap: '0.5rem' }}
                            >
                                <Upload size={32} style={{ color: 'var(--emerald)' }} />
                                <span style={{ fontWeight: 700 }}>Upload File</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>PDF, JPG, PNG, DOC (max 10 MB)</span>
                            </button>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                )}

                {/* ── Step 2a: Live Camera ── */}
                {captureMode === 'camera' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <LiveCamera
                            onCapture={handleCameraCapture}
                            onClose={() => setCaptureMode('idle')}
                        />
                    </div>
                )}

                {/* ── Step 2b / 3: File selected — show preview + form ── */}
                {uploadForm.file && (
                    <form onSubmit={handleUpload}>
                        {/* Preview */}
                        {uploadForm.filePreview ? (
                            <div className="scanner-preview mb-4" style={{ position: 'relative' }}>
                                <img src={uploadForm.filePreview} alt="Preview" style={{ maxHeight: 220, objectFit: 'contain', width: '100%', borderRadius: 8 }} />
                                <button type="button" className="preview-remove" onClick={() => setUploadForm(prev => ({ ...prev, file: null, fileName: '', filePreview: null }))}>
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 bg-background rounded-lg mb-4 flex items-center gap-2">
                                <File size={18} className="text-primary" />
                                <span className="text-sm font-bold">{uploadForm.fileName}</span>
                                <button type="button" className="icon-btn danger" style={{ marginLeft: 'auto', width: 28, height: 28 }}
                                    onClick={() => setUploadForm(prev => ({ ...prev, file: null, fileName: '', filePreview: null }))}>
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        {/* Retake / change */}
                        <div className="flex gap-2 mb-4">
                            <button type="button" className="secondary-btn" onClick={() => { setCaptureMode('camera'); setUploadForm(prev => ({ ...prev, file: null, fileName: '', filePreview: null })); }}>
                                <Camera size={14} /> Retake
                            </button>
                            <button type="button" className="secondary-btn" onClick={() => { fileInputRef.current?.click(); }}>
                                <Upload size={14} /> Change File
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} style={{ display: 'none' }} />
                        </div>

                        {/* Patient & Type */}
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select required value={uploadForm.patientId} onChange={e => setUploadForm(prev => ({ ...prev, patientId: e.target.value }))}>
                                    <option value="">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Document Type *</label>
                                <select value={uploadForm.type} onChange={e => setUploadForm(prev => ({ ...prev, type: e.target.value }))}>
                                    {DOC_TYPES.map(dt => <option key={dt.key} value={dt.key}>{dt.icon} {dt.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Document Title</label>
                            <input type="text" placeholder="e.g. CBC Report — March 2024" value={uploadForm.title}
                                onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))} />
                        </div>

                        <div className="form-group">
                            <label>Notes (Optional)</label>
                            <textarea rows="2" placeholder="Any important observations or context…" value={uploadForm.notes}
                                onChange={e => setUploadForm(prev => ({ ...prev, notes: e.target.value }))} />
                        </div>

                        <button type="submit" className="primary-btn">
                            <ScanLine size={16} /> File Document
                        </button>
                    </form>
                )}
            </Modal>

            {/* ══════════════════════════════════════════
                View Document Modal
            ══════════════════════════════════════════ */}
            <Modal isOpen={!!viewDoc} onClose={() => { setViewDoc(null); setConfirmDeleteId(null); }} title={viewDoc?.title || 'Document'} size="lg">
                {viewDoc && (() => {
                    const typeInfo = getDocTypeInfo(viewDoc.type);
                    return (
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="doc-type-avatar" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                                    <span style={{ fontSize: '1.5rem' }}>{typeInfo.icon}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 className="font-bold text-lg">{viewDoc.title}</h3>
                                    <p className="text-sm text-muted">{typeInfo.label} • {viewDoc.fileName}</p>
                                </div>
                            </div>

                            <div className="grid-cols-2 mb-4">
                                <div className="p-3 bg-background rounded-lg">
                                    <p className="text-xs text-muted font-semibold mb-1">PATIENT</p>
                                    <p className="font-bold flex items-center gap-2"><User size={14} /> {viewDoc.patientName}</p>
                                </div>
                                <div className="p-3 bg-background rounded-lg">
                                    <p className="text-xs text-muted font-semibold mb-1">DATE</p>
                                    <p className="font-bold flex items-center gap-2"><Calendar size={14} /> {viewDoc.date}</p>
                                </div>
                            </div>

                            {viewDoc.thumbnail && (
                                <div className="scanner-preview mb-4" style={{ maxHeight: 300 }}>
                                    <img src={viewDoc.thumbnail} alt={viewDoc.title} />
                                </div>
                            )}

                            {viewDoc.notes && (
                                <div className="p-3 bg-background rounded-lg mb-4" style={{ borderLeft: `3px solid ${typeInfo.color}` }}>
                                    <p className="text-xs text-muted font-semibold mb-1">NOTES</p>
                                    <p className="text-sm">{viewDoc.notes}</p>
                                </div>
                            )}

                            {/* ── Inline delete confirmation ── */}
                            {confirmDeleteId === viewDoc.id ? (
                                <div style={{ background: 'var(--accent-light, #fee2e2)', border: '1px solid var(--accent, #f43f5e)', borderRadius: 12, padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent, #f43f5e)', margin: 0 }}>⚠ Delete this document?</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>This cannot be undone. The file will be permanently removed.</p>
                                    <div className="flex gap-2">
                                        <button
                                            className="secondary-btn flex-1"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="primary-btn flex-1"
                                            style={{ background: 'var(--accent, #f43f5e)', boxShadow: 'none' }}
                                            onClick={() => handleDelete(viewDoc.id)}
                                        >
                                            <Trash2 size={14} /> Yes, Delete
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        className="secondary-btn flex-1"
                                        onClick={() => setConfirmDeleteId(viewDoc.id)}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                    <button className="primary-btn flex-1" onClick={() => {
                                        if (viewDoc.fileData) {
                                            const a = document.createElement('a');
                                            a.href = viewDoc.fileData;
                                            a.download = viewDoc.fileName || 'document';
                                            a.click();
                                        } else {
                                            showToast('This is a demo document — no file was uploaded', 'info');
                                        }
                                    }}>
                                        <Download size={16} /> Download
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
};

export default DocumentScanner;
