import { useState } from 'react';
import {
    Pill, Syringe, Droplets, Wind, Cross, ClipboardList, CheckCircle2,
    Clock, AlertCircle, Search, Eye, ChevronDown, ChevronUp, User, Package
} from 'lucide-react';
import useDispensary, { DISPENSARY_CATEGORIES } from '../hooks/useDispensary';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';

const CATEGORY_ICONS = {
    medication: Pill,
    injection: Syringe,
    iv_fluid: Droplets,
    nebulization: Wind,
    dressing: Cross,
    other: ClipboardList,
};

const IndoorDispensary = () => {
    const { indoorOrders, toggleItemDispensed, updateOrderStatus } = useDispensary();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [viewOrder, setViewOrder] = useState(null);

    const filtered = indoorOrders.filter(o => {
        const matchSearch = o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const pendingCount = indoorOrders.filter(o => o.status === 'pending' || o.status === 'partial').length;
    const dispensedCount = indoorOrders.filter(o => o.status === 'dispensed').length;

    // Group items by category for the detail view
    const groupByCategory = (items) => {
        const groups = {};
        items.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    };

    const getCategoryInfo = (key) => DISPENSARY_CATEGORIES.find(c => c.key === key) || DISPENSARY_CATEGORIES[5];

    const handleDispenseAll = (orderId) => {
        const order = indoorOrders.find(o => o.id === orderId);
        if (order) {
            order.items.forEach((_, idx) => {
                if (!order.items[idx].dispensed) {
                    toggleItemDispensed(orderId, idx);
                }
            });
            showToast('All items marked as dispensed', 'success');
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Indoor Dispensary" subtitle="Dispense medications, injections & IV fluids for in-clinic patients">
                <div className="flex gap-2">
                    <select
                        className="secondary-btn"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="dispensed">Dispensed</option>
                    </select>
                </div>
            </PageHeader>

            <div className="stats-grid">
                <StatCard icon={Clock} label="Pending" value={pendingCount} variant="luxury" />
                <StatCard icon={CheckCircle2} label="Dispensed" value={dispensedCount} />
                <StatCard icon={Package} label="Total Today" value={indoorOrders.length} />
                <StatCard icon={AlertCircle} label="Categories" value={DISPENSARY_CATEGORIES.length} />
            </div>

            {/* Category Legend */}
            <div className="dispensary-categories glass mb-6">
                {DISPENSARY_CATEGORIES.map(cat => (
                    <div key={cat.key} className="dispensary-cat-chip" style={{ '--cat-color': cat.color }}>
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-label">{cat.label}</span>
                    </div>
                ))}
            </div>

            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by patient name or order ID..." />

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Pill}
                    title="No indoor dispensary orders"
                    subtitle="When doctor prescribes indoor items, they'll appear here"
                />
            ) : (
                <div className="dispensary-orders-list">
                    {filtered.map(order => {
                        const grouped = groupByCategory(order.items);
                        const isExpanded = expandedOrder === order.id;
                        const totalItems = order.items.length;
                        const dispensedItems = order.items.filter(i => i.dispensed).length;

                        return (
                            <div key={order.id} className={`dispensary-order-card glass ${order.status === 'dispensed' ? 'order-done' : ''}`}>
                                {/* Order Header */}
                                <div className="order-header" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                    <div className="order-header-left">
                                        <div className="order-patient-avatar">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{order.patientName}</h3>
                                            <p className="text-xs text-muted">{order.id} • {order.date} • {order.doctor}</p>
                                        </div>
                                    </div>
                                    <div className="order-header-right">
                                        <div className="order-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${totalItems > 0 ? (dispensedItems / totalItems) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted">{dispensedItems}/{totalItems}</span>
                                        </div>
                                        <span className={`status-badge ${order.status === 'dispensed' ? 'status-done' : order.status === 'partial' ? 'status-active' : 'status-waiting'}`}>
                                            {order.status === 'dispensed' ? 'Dispensed' : order.status === 'partial' ? 'Partial' : 'Pending'}
                                        </span>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="order-detail animate-fade-in">
                                        {order.notes && (
                                            <div className="order-notes">
                                                <AlertCircle size={14} />
                                                <span>{order.notes}</span>
                                            </div>
                                        )}

                                        {Object.entries(grouped).map(([catKey, items]) => {
                                            const catInfo = getCategoryInfo(catKey);
                                            const CatIcon = CATEGORY_ICONS[catKey] || ClipboardList;

                                            return (
                                                <div key={catKey} className="dispensary-cat-section">
                                                    <h4 className="cat-section-title" style={{ color: catInfo.color }}>
                                                        <CatIcon size={16} /> {catInfo.label}
                                                    </h4>
                                                    <div className="cat-items">
                                                        {items.map((item, idx) => {
                                                            const globalIdx = order.items.indexOf(item);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`dispensary-item ${item.dispensed ? 'item-dispensed' : ''}`}
                                                                    onClick={() => {
                                                                        toggleItemDispensed(order.id, globalIdx);
                                                                        showToast(
                                                                            item.dispensed ? `${item.name} marked as not dispensed` : `${item.name} dispensed ✓`,
                                                                            item.dispensed ? 'info' : 'success'
                                                                        );
                                                                    }}
                                                                >
                                                                    <div className="item-checkbox">
                                                                        {item.dispensed ? (
                                                                            <CheckCircle2 size={20} style={{ color: 'var(--emerald)' }} />
                                                                        ) : (
                                                                            <div className="checkbox-empty" />
                                                                        )}
                                                                    </div>
                                                                    <div className="item-info">
                                                                        <strong>{item.name}</strong>
                                                                        <span>{item.dosage} • {item.duration} • Qty: {item.quantity}</span>
                                                                    </div>
                                                                    <span className="cat-icon-mini">{catInfo.icon}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {order.status !== 'dispensed' && (
                                            <button
                                                className="primary-btn mt-4"
                                                onClick={() => handleDispenseAll(order.id)}
                                            >
                                                <CheckCircle2 size={16} /> Mark All Dispensed
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default IndoorDispensary;
