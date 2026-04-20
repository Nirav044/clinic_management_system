import { useState } from 'react';
import {
    Pill, Download, Search, Eye, User, Package, CheckCircle2, Clock,
    FileText, Printer, Share2, ChevronDown, ChevronUp
} from 'lucide-react';
import useDispensary from '../hooks/useDispensary';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';

const OutdoorDispensary = () => {
    const { outdoorOrders, toggleItemDispensed, updateOrderStatus } = useDispensary();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewOrder, setViewOrder] = useState(null);

    const filtered = outdoorOrders.filter(o =>
        o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = outdoorOrders.filter(o => o.status === 'pending').length;
    const dispensedCount = outdoorOrders.filter(o => o.status === 'dispensed').length;

    const handleDownloadReceipt = (order) => {
        // In a real app, this would generate a PDF
        showToast(`Receipt for ${order.patientName} downloaded`, 'success');
    };

    const handlePrint = (order) => {
        // Build a printable window
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) {
            showToast('Please allow popups to print', 'error');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Outdoor Prescription - ${order.patientName}</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #333; max-width: 380px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
                    .header h2 { color: #4f46e5; margin: 0; font-size: 1.2rem; }
                    .header p { font-size: 0.8rem; color: #666; margin: 4px 0 0; }
                    .patient-info { background: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 0.85rem; }
                    .patient-info strong { color: #1a1a2e; }
                    h3 { font-size: 0.9rem; color: #4f46e5; border-bottom: 1px dotted #ddd; padding-bottom: 6px; }
                    .med-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.85rem; }
                    .med-name { font-weight: 600; }
                    .med-details { color: #666; font-size: 0.78rem; }
                    .footer { margin-top: 20px; text-align: center; font-size: 0.75rem; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
                    .doctor-sig { margin-top: 30px; text-align: right; }
                    .doctor-sig p { font-size: 0.85rem; }
                    @media print { body { padding: 10px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>SmartClinic</h2>
                    <p>MG Road, Mumbai - 400001 • +91 98765 43210</p>
                </div>
                <div class="patient-info">
                    <p><strong>Patient:</strong> ${order.patientName}</p>
                    <p><strong>Date:</strong> ${order.date}</p>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                </div>
                <h3>💊 Take-Home Medications</h3>
                ${order.items.map(item => `
                    <div class="med-item">
                        <div>
                            <div class="med-name">${item.name}</div>
                            <div class="med-details">${item.dosage} • ${item.duration}</div>
                        </div>
                        <div style="text-align:right">
                            <div>Qty: ${item.quantity}</div>
                        </div>
                    </div>
                `).join('')}
                ${order.notes ? `<p style="margin-top:12px; font-size:0.82rem; color:#666;"><strong>Notes:</strong> ${order.notes}</p>` : ''}
                <div class="doctor-sig">
                    <p><strong>${order.doctor}</strong></p>
                    <p style="font-size:0.78rem; color:#888;">Prescribing Physician</p>
                </div>
                <div class="footer">
                    <p>This is a digitally generated prescription.</p>
                    <p>Please follow the prescribed dosage and duration carefully.</p>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        showToast('Printing outdoor prescription...', 'info');
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Outdoor Dispensary" subtitle="Patient take-home medications and prescription receipts" />

            <div className="stats-grid">
                <StatCard icon={Clock} label="Pending Handover" value={pendingCount} variant="luxury" />
                <StatCard icon={CheckCircle2} label="Handed Over" value={dispensedCount} />
                <StatCard icon={Package} label="Total Outdoor" value={outdoorOrders.length} />
                <StatCard icon={FileText} label="Receipts Generated" value={dispensedCount} />
            </div>

            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by patient name or order ID..." />

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Pill}
                    title="No outdoor prescriptions"
                    subtitle="Outdoor prescriptions from consultations will appear here"
                />
            ) : (
                <div className="outdoor-orders-grid">
                    {filtered.map(order => {
                        const totalItems = order.items.length;
                        const dispensedItems = order.items.filter(i => i.dispensed).length;

                        return (
                            <div key={order.id} className={`outdoor-order-card glass ${order.status === 'dispensed' ? 'order-done' : ''}`}>
                                <div className="outdoor-card-header">
                                    <div className="flex items-center gap-3">
                                        <div className="order-patient-avatar">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{order.patientName}</h3>
                                            <p className="text-xs text-muted">{order.id} • {order.date}</p>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${order.status === 'dispensed' ? 'status-done' : 'status-waiting'}`}>
                                        {order.status === 'dispensed' ? 'Handed Over' : 'Ready'}
                                    </span>
                                </div>

                                <div className="outdoor-meds-list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="outdoor-med-row">
                                            <div className="flex items-center gap-2">
                                                <Pill size={14} style={{ color: 'var(--primary)' }} />
                                                <div>
                                                    <strong className="text-sm">{item.name}</strong>
                                                    <p className="text-xs text-muted">{item.dosage} • {item.duration}</p>
                                                </div>
                                            </div>
                                            <span className="tag">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.notes && (
                                    <p className="text-xs text-muted" style={{ padding: '0.5rem 1rem', fontStyle: 'italic', borderTop: '1px solid var(--border-light)' }}>
                                        📝 {order.notes}
                                    </p>
                                )}

                                <div className="outdoor-card-actions">
                                    <button className="secondary-btn flex-1" onClick={() => setViewOrder(order)}>
                                        <Eye size={14} /> View
                                    </button>
                                    <button className="primary-btn-sm flex-1" onClick={() => handlePrint(order)}>
                                        <Printer size={14} /> Print
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View Order Detail Modal */}
            <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Outdoor Prescription — ${viewOrder?.patientName || ''}`} size="lg">
                {viewOrder && (
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="order-patient-avatar" style={{ width: 52, height: 52 }}>
                                <User size={22} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="font-bold text-lg">{viewOrder.patientName}</h3>
                                <p className="text-sm text-muted">{viewOrder.id} • {viewOrder.date} • {viewOrder.doctor}</p>
                            </div>
                            <span className={`status-badge ${viewOrder.status === 'dispensed' ? 'status-done' : 'status-waiting'}`}>
                                {viewOrder.status === 'dispensed' ? 'Handed Over' : 'Ready'}
                            </span>
                        </div>

                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <Pill size={14} className="text-primary" /> Take-Home Medications
                        </h4>

                        <div className="glass p-4 rounded-xl mb-4">
                            {viewOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2" style={{ borderBottom: idx < viewOrder.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                    <div>
                                        <p className="font-bold text-sm">{item.name}</p>
                                        <p className="text-xs text-muted">{item.dosage} • {item.duration}</p>
                                    </div>
                                    <span className="font-bold">x{item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        {viewOrder.notes && (
                            <div className="p-3 bg-background rounded-lg mb-4" style={{ borderLeft: '3px solid var(--primary)' }}>
                                <p className="text-xs text-muted font-semibold mb-1">DOCTOR'S NOTES</p>
                                <p className="text-sm">{viewOrder.notes}</p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button className="primary-btn flex-1" onClick={() => handlePrint(viewOrder)}>
                                <Printer size={16} /> Print Receipt
                            </button>
                            <button className="secondary-btn flex-1" onClick={() => handleDownloadReceipt(viewOrder)}>
                                <Download size={14} /> Download PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OutdoorDispensary;
