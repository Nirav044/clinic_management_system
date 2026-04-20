import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Edit3, Trash2, AlertTriangle, BarChart3, Pill } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Inventory = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading]     = useState(false);

    const fetchInventory = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/inventory');
            setInventory(res.data);
        } catch (err) {
            console.error('Failed to fetch inventory:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMed, setEditingMed] = useState(null);
    const [newMed, setNewMed] = useState({
        name: '', category: 'Tablet', stock: '', price: '', costPrice: '', manufacturer: '', expiry: '', batchNo: '', minStock: 20
    });

    const categories = ['All', 'Tablet', 'Capsule', 'Syrup', 'Ointment', 'Injection', 'Sachet', 'Drops', 'Other'];

    const filtered = inventory.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || med.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalStock = inventory.reduce((sum, m) => sum + m.stock, 0);
    const lowStockItems = inventory.filter(m => m.stock <= m.minStock);
    const totalValue = inventory.reduce((sum, m) => sum + (m.stock * m.costPrice), 0);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/inventory', {
                ...newMed,
                stock: Number(newMed.stock),
                price: Number(newMed.price),
                costPrice: Number(newMed.costPrice),
                minStock: Number(newMed.minStock),
            });
            setInventory(prev => [res.data, ...prev]);
            showToast(`${res.data.name} added to inventory`, 'success');
            setIsAddOpen(false);
            setNewMed({ name: '', category: 'Tablet', stock: '', price: '', costPrice: '', manufacturer: '', expiry: '', batchNo: '', minStock: 20 });
        } catch (err) {
            showToast('Failed to add medicine', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Remove ${name} from inventory?`)) {
            try {
                await api.delete(`/api/inventory/${id}`);
                setInventory(prev => prev.filter(m => m.id !== id));
                showToast(`${name} removed`, 'info');
            } catch (err) {
                showToast('Failed to delete medicine', 'error');
            }
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        try {
            const res = await api.put(`/api/inventory/${id}`, { stock: Math.max(0, Number(newStock)) });
            setInventory(prev => prev.map(m => m.id === id ? res.data : m));
        } catch (err) {
            console.error('Failed to update stock:', err.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Medicine Inventory" subtitle={`${inventory.length} medicines in stock`}>
                <button className="primary-btn-sm" onClick={() => setIsAddOpen(true)}>
                    <Plus size={15} /> Add Medicine
                </button>
            </PageHeader>

            <div className="stats-grid">
                <StatCard icon={Package} label="Total Stock" value={totalStock.toLocaleString()} variant="luxury" />
                <StatCard icon={Pill} label="Unique Medicines" value={inventory.length} />
                <StatCard icon={AlertTriangle} label="Low Stock" value={lowStockItems.length} />
                <StatCard icon={BarChart3} label="Inventory Value" value={`₹${totalValue.toLocaleString()}`} />
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="glass p-4 rounded-xl mb-6" style={{ borderLeft: '4px solid var(--amber)' }}>
                    <p className="font-bold text-sm flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} style={{ color: 'var(--amber)' }} /> Low Stock Alert
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {lowStockItems.map(m => (
                            <span key={m.id} className="tag" style={{ background: 'var(--amber-light)', color: '#92400e' }}>
                                {m.name} ({m.stock} left)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 items-center mb-4">
                <div style={{ flex: 1 }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by medicine name, manufacturer, or ID..."
                    />
                </div>
                <select
                    className="secondary-btn"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    style={{ minWidth: 130 }}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>MRP (₹)</th>
                            <th>Manufacturer</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="8">
                                    <EmptyState
                                        icon={Package}
                                        title="No medicines found"
                                        subtitle="Add medicines to your inventory or adjust filters"
                                    />
                                </td>
                            </tr>
                        ) : (
                            filtered.map(med => {
                                const isLow = med.stock <= med.minStock;
                                const isOut = med.stock === 0;
                                return (
                                    <tr key={med.id}>
                                        <td>
                                            <div>
                                                <p className="font-bold" style={{ fontSize: '0.9rem' }}>{med.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{med.id} • Batch: {med.batchNo}</p>
                                            </div>
                                        </td>
                                        <td><span className="tag">{med.category}</span></td>
                                        <td>
                                            <span className={`font-extrabold ${isOut ? 'text-accent' : isLow ? '' : 'text-emerald'}`}
                                                style={isLow && !isOut ? { color: '#92400e' } : {}}>
                                                {med.stock}
                                            </span>
                                        </td>
                                        <td className="font-bold">₹{med.price}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{med.manufacturer}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{med.expiry}</td>
                                        <td>
                                            {isOut ? (
                                                <span className="status-badge" style={{ background: 'var(--accent-light)', color: '#9f1239' }}>Out of Stock</span>
                                            ) : isLow ? (
                                                <span className="status-badge status-waiting">Low Stock</span>
                                            ) : (
                                                <span className="status-badge status-active">In Stock</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button className="icon-btn primary" title="Edit" style={{ width: 32, height: 32 }}>
                                                    <Edit3 size={14} />
                                                </button>
                                                <button className="icon-btn danger" title="Delete" style={{ width: 32, height: 32 }}
                                                    onClick={() => handleDelete(med.id, med.name)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Medicine Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Medicine to Inventory" size="lg">
                <form onSubmit={handleAdd}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Medicine Name</label>
                            <input required type="text" placeholder="e.g. Paracetamol 500mg" value={newMed.name}
                                onChange={e => setNewMed({ ...newMed, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={newMed.category} onChange={e => setNewMed({ ...newMed, category: e.target.value })}>
                                {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input required type="text" placeholder="e.g. Cipla" value={newMed.manufacturer}
                                onChange={e => setNewMed({ ...newMed, manufacturer: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Batch Number</label>
                            <input type="text" placeholder="e.g. B2024-011" value={newMed.batchNo}
                                onChange={e => setNewMed({ ...newMed, batchNo: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Stock Quantity</label>
                            <input required type="number" min="0" placeholder="0" value={newMed.stock}
                                onChange={e => setNewMed({ ...newMed, stock: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Minimum Stock Alert</label>
                            <input type="number" min="0" placeholder="20" value={newMed.minStock}
                                onChange={e => setNewMed({ ...newMed, minStock: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>MRP (₹)</label>
                            <input required type="number" min="0" step="0.01" placeholder="0.00" value={newMed.price}
                                onChange={e => setNewMed({ ...newMed, price: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Cost Price (₹)</label>
                            <input type="number" min="0" step="0.01" placeholder="0.00" value={newMed.costPrice}
                                onChange={e => setNewMed({ ...newMed, costPrice: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Expiry Date</label>
                        <input type="month" value={newMed.expiry}
                            onChange={e => setNewMed({ ...newMed, expiry: e.target.value })} />
                    </div>
                    <button type="submit" className="primary-btn mt-4">
                        <Package size={16} /> Add to Inventory
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;
