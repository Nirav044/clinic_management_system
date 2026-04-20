import { useState } from 'react';
import { Wallet, Plus, Download, ChevronRight, QrCode, Search, Receipt, CreditCard, Eye, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import useBilling from '../hooks/useBilling';

const Billing = () => {
    const { invoices, addInvoice, markAsPaid, totalCollected, totalPending } = useBilling();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewInvoice, setViewInvoice] = useState(null);

    const [newInvoice, setNewInvoice] = useState({
        patient: '',
        items: [{ description: '', amount: '' }],
        method: 'Cash'
    });

    const filteredInvoices = invoices.filter(inv =>
        inv.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const upiCount = invoices.filter(inv => inv.method === 'UPI').length;

    const addLineItem = () => {
        setNewInvoice({
            ...newInvoice,
            items: [...newInvoice.items, { description: '', amount: '' }]
        });
    };

    const updateLineItem = (index, field, value) => {
        const items = [...newInvoice.items];
        items[index][field] = field === 'amount' ? (value ? Number(value) : '') : value;
        setNewInvoice({ ...newInvoice, items });
    };

    const removeLineItem = (index) => {
        if (newInvoice.items.length <= 1) return;
        const items = newInvoice.items.filter((_, i) => i !== index);
        setNewInvoice({ ...newInvoice, items });
    };

    const handleCreateInvoice = (e) => {
        e.preventDefault();
        const total = newInvoice.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        addInvoice({
            patient: newInvoice.patient,
            items: newInvoice.items.filter(item => item.description && item.amount),
        });
        showToast(`Invoice created for ₹${total}`, 'success');
        setIsCreateOpen(false);
        setNewInvoice({ patient: '', items: [{ description: '', amount: '' }], method: 'Cash' });
    };

    const handleMarkAsPaid = (invoiceId, method = 'Cash') => {
        markAsPaid(invoiceId, method);
        showToast('Invoice marked as paid', 'success');
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Billing & Payments" subtitle="Manage invoices and track clinic revenue">
                <button className="primary-btn-sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus size={15} /> New Invoice
                </button>
            </PageHeader>

            <div className="stats-grid">
                <StatCard icon={Wallet} label="Total Collected" value={`₹${totalCollected.toLocaleString()}`} />
                <StatCard icon={CreditCard} label="Pending" value={`₹${totalPending.toLocaleString()}`} />
                <StatCard icon={QrCode} label="UPI Payments" value={upiCount} />
                <StatCard icon={Receipt} label="Total Invoices" value={invoices.length} variant="luxury" />
            </div>

            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by patient name or invoice ID..."
            />

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="7">
                                    <EmptyState
                                        icon={Receipt}
                                        title="No invoices found"
                                        subtitle="Create your first invoice to get started"
                                    />
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td className="font-bold" style={{ color: 'var(--primary)' }}>{inv.id}</td>
                                    <td className="font-semibold">{inv.patient}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                                    <td className="font-extrabold">₹{inv.amount.toLocaleString()}</td>
                                    <td>
                                        <span className="tag">{inv.method}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${inv.status === 'Paid' ? 'status-done' : 'status-waiting'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="icon-btn" title="View" onClick={() => setViewInvoice(inv)}>
                                                <Eye size={15} />
                                            </button>
                                            <button className="icon-btn primary" title="Download PDF">
                                                <Download size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Invoice Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Invoice" size="lg">
                <form onSubmit={handleCreateInvoice}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Patient Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Enter patient name"
                                value={newInvoice.patient}
                                onChange={e => setNewInvoice({ ...newInvoice, patient: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Payment Method</label>
                            <select value={newInvoice.method} onChange={e => setNewInvoice({ ...newInvoice, method: e.target.value })}>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                                <option>Insurance</option>
                            </select>
                        </div>
                    </div>

                    <h4 className="font-bold text-sm mt-4 mb-3">Line Items</h4>
                    {newInvoice.items.map((item, index) => (
                        <div key={index} className="flex gap-3 items-end mb-3">
                            <div className="form-group flex-1 mb-0">
                                {index === 0 && <label>Description</label>}
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Consultation Fee"
                                    value={item.description}
                                    onChange={e => updateLineItem(index, 'description', e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-0" style={{ width: 120 }}>
                                {index === 0 && <label>Amount (₹)</label>}
                                <input
                                    required
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    value={item.amount}
                                    onChange={e => updateLineItem(index, 'amount', e.target.value)}
                                />
                            </div>
                            {newInvoice.items.length > 1 && (
                                <button type="button" className="icon-btn danger" onClick={() => removeLineItem(index)} style={{ marginBottom: '2px' }}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}

                    <button type="button" className="secondary-btn mb-4" onClick={addLineItem}>
                        <Plus size={14} /> Add Line Item
                    </button>

                    <div className="p-4 bg-background rounded-xl mb-4">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-extrabold text-xl text-primary">
                                ₹{newInvoice.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="primary-btn">
                        <Receipt size={16} /> Create Invoice
                    </button>
                </form>
            </Modal>

            {/* View Invoice Modal */}
            <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title={`Invoice ${viewInvoice?.id || ''}`}>
                {viewInvoice && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-xs text-muted font-semibold">BILLED TO</p>
                                <p className="font-bold text-lg">{viewInvoice.patient}</p>
                            </div>
                            <span className={`status-badge ${viewInvoice.status === 'Paid' ? 'status-done' : 'status-waiting'}`}>
                                {viewInvoice.status}
                            </span>
                        </div>

                        <div className="grid-cols-2 mb-4">
                            <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted font-semibold">DATE</p>
                                <p className="font-bold">{viewInvoice.date}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted font-semibold">METHOD</p>
                                <p className="font-bold">{viewInvoice.method}</p>
                            </div>
                        </div>

                        {viewInvoice.items && (
                            <div className="mb-4">
                                <p className="text-xs text-muted font-semibold mb-2">ITEMS</p>
                                {viewInvoice.items.map((item, i) => (
                                    <div key={i} className="flex justify-between p-2 border-b">
                                        <span className="text-sm">{item.description}</span>
                                        <span className="font-bold text-sm">₹{item.amount}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-4 bg-background rounded-xl mb-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-extrabold text-xl text-primary">₹{viewInvoice.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {viewInvoice.status === 'Pending' && (
                                <button className="primary-btn flex-1" onClick={() => {
                                    handleMarkAsPaid(viewInvoice.id);
                                    setViewInvoice({ ...viewInvoice, status: 'Paid', method: 'Cash' });
                                }}>
                                    <Wallet size={16} /> Mark as Paid
                                </button>
                            )}
                            <button className="secondary-btn flex-1">
                                <Download size={14} /> Download PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Billing;
