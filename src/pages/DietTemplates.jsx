import { useState, useEffect } from 'react';
import {
    Apple, Baby, Heart, AlertTriangle, Copy, Download, Printer,
    ChevronDown, ChevronUp, Search, BookOpen, Utensils, Ban, CheckCircle2,
    Thermometer, Droplets, Moon, Plus, Trash2, Edit3, Save, X
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';

export const DEFAULT_DIET_TEMPLATES = [
    {
        id: 'dt001',
        ageGroup: 'Infant (0-6 months)',
        ageRange: '0-6m',
        icon: '👶',
        color: '#ec4899',
        recommended: [
            { item: 'Breast milk (exclusive)', details: 'On demand, 8-12 times/day', priority: 'essential' },
            { item: 'Formula milk (if needed)', details: 'As per pediatrician advice', priority: 'optional' },
        ],
        avoid: [
            { item: 'Honey', reason: 'Risk of infant botulism' },
            { item: 'Cow\'s milk', reason: 'Not suitable for infants under 1 year' },
            { item: 'Solid foods', reason: 'Digestive system not ready' },
            { item: 'Sugar / Salt', reason: 'Kidneys too immature to process' },
            { item: 'Fruit juices', reason: 'No nutritional benefit for infants' },
        ],
        homecare: [
            { tip: 'Burp the baby after every feed', icon: '🍼' },
            { tip: 'Keep the baby upright 15-20 min after feeding', icon: '👶' },
            { tip: 'Watch for signs of dehydration: dry diapers, sunken fontanelle', icon: '💧' },
            { tip: 'Maintain room temperature 26-28°C', icon: '🌡️' },
            { tip: 'Use cotton clothing, avoid synthetic fabrics', icon: '👕' },
        ],
    },
    {
        id: 'dt002',
        ageGroup: 'Infant (6-12 months)',
        ageRange: '6-12m',
        icon: '🍼',
        color: '#f97316',
        recommended: [
            { item: 'Breast milk / Formula', details: 'Continue alongside solids', priority: 'essential' },
            { item: 'Rice cereal / Ragi porridge', details: 'Start with 1-2 tbsp, gradually increase', priority: 'essential' },
            { item: 'Mashed banana, apple, pear', details: 'Introduce one fruit at a time', priority: 'recommended' },
            { item: 'Mashed dal / khichdi', details: 'Well-cooked, mashed consistency', priority: 'recommended' },
            { item: 'Boiled and mashed vegetables', details: 'Carrot, potato, sweet potato, pumpkin', priority: 'recommended' },
            { item: 'Curd / Yogurt', details: 'Small quantities, plain/unflavored', priority: 'optional' },
        ],
        avoid: [
            { item: 'Honey', reason: 'Risk of botulism until 1 year' },
            { item: 'Whole nuts / Seeds', reason: 'Choking hazard' },
            { item: 'Cow\'s milk as main drink', reason: 'Not suitable as replacement' },
            { item: 'Processed / Packaged food', reason: 'High sodium and preservatives' },
            { item: 'Spicy food', reason: 'Can cause stomach irritation' },
        ],
        homecare: [
            { tip: 'Introduce one new food every 3-5 days to watch for allergies', icon: '🔍' },
            { tip: 'Continue breastfeeding alongside solid foods', icon: '🍼' },
            { tip: 'Tummy time: 30 min/day to strengthen muscles', icon: '💪' },
            { tip: 'Establish sleep routine: 12-14 hours total', icon: '😴' },
            { tip: 'Keep small objects away — everything goes in mouth', icon: '⚠️' },
        ],
    },
    {
        id: 'dt003',
        ageGroup: 'Toddler (1-3 years)',
        ageRange: '1-3y',
        icon: '🧒',
        color: '#10b981',
        recommended: [
            { item: 'Whole milk / Buffalo milk', details: '2 cups per day', priority: 'essential' },
            { item: 'Roti / Rice / Chapati', details: 'Age-appropriate portions', priority: 'essential' },
            { item: 'Dal / Lentils', details: 'Good protein source, daily', priority: 'essential' },
            { item: 'Fruits (banana, apple, mango, papaya)', details: '2-3 servings daily', priority: 'recommended' },
            { item: 'Eggs (boiled/scrambled)', details: '1 per day, excellent protein', priority: 'recommended' },
            { item: 'Green vegetables (palak, beans, broccoli)', details: 'Finely chopped', priority: 'recommended' },
            { item: 'Ghee / Butter', details: 'Small amounts for healthy fats', priority: 'optional' },
            { item: 'Dry fruits powder (in milk)', details: 'Almonds, walnuts — powdered form', priority: 'optional' },
        ],
        avoid: [
            { item: 'Candy / Chocolates / Toffees', reason: 'Dental caries and sugar addiction' },
            { item: 'Chips / Packaged snacks', reason: 'High sodium, artificial flavors' },
            { item: 'Carbonated drinks', reason: 'No nutritional value, harmful' },
            { item: 'Tea / Coffee', reason: 'Caffeine not suitable for toddlers' },
            { item: 'Whole grapes / Cherry tomatoes', reason: 'Choking hazard — cut into quarters' },
            { item: 'Raw salads', reason: 'Difficult to digest, risk of contamination' },
        ],
        homecare: [
            { tip: 'Regular meal times: Breakfast, Lunch, Snack, Dinner', icon: '🕐' },
            { tip: 'Limit screen time to 30 min/day', icon: '📱' },
            { tip: '1-2 hours outdoor play daily', icon: '🏃' },
            { tip: 'Brush teeth twice daily with pea-sized fluoride toothpaste', icon: '🦷' },
            { tip: 'Hand washing before meals and after play', icon: '🧼' },
            { tip: 'Ensure vaccinations are up to date', icon: '💉' },
        ],
    },
];

const FEVER_HOMECARE = [
    { tip: 'Give Paracetamol as prescribed (dose based on weight)', icon: '💊' },
    { tip: 'Sponge bath with lukewarm water (NOT cold water)', icon: '🛁' },
    { tip: 'Keep child lightly dressed, avoid heavy blankets', icon: '👕' },
    { tip: 'Push fluids: ORS, coconut water, dal ka paani, juices', icon: '💧' },
    { tip: 'Monitor temperature every 4-6 hours', icon: '🌡️' },
    { tip: 'Visit doctor if fever persists beyond 3 days or exceeds 103°F', icon: '🏥' },
];

const GENERAL_HOMECARE = [
    { tip: 'Ensure adequate hydration throughout the day', icon: '💧' },
    { tip: 'Maintain a fixed schedule for meals and sleep', icon: '🕐' },
    { tip: 'Keep the environment clean and well-ventilated', icon: '🪟' },
    { tip: 'Wash hands frequently, especially before meals', icon: '🧼' },
    { tip: 'Encourage eating at the dining table, not in front of TV', icon: '🍽️' },
];

const DietTemplates = () => {
    const [templates, setTemplates] = useState(() => {
        const saved = localStorage.getItem('diet_templates');
        return saved ? JSON.parse(saved) : DEFAULT_DIET_TEMPLATES;
    });
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHomecare, setShowHomecare] = useState(null); // 'fever' | 'general' | null
    const [expandedSection, setExpandedSection] = useState('recommended');
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Form states for adding/editing
    const [templateForm, setTemplateForm] = useState({
        ageGroup: '', ageRange: '', icon: '🍽️', color: '#4f46e5',
        recommended: [], avoid: [], homecare: []
    });

    // Helper states for adding items within the form
    const [newItem, setNewItem] = useState({ type: 'recommended', field1: '', field2: '', priority: 'recommended', icon: '✅' });

    useEffect(() => {
        localStorage.setItem('diet_templates', JSON.stringify(templates));
    }, [templates]);

    const filtered = templates.filter(t =>
        t.ageGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopyTemplate = (template) => {
        const text = [
            `🍽️ DIET PLAN — ${template.ageGroup}`,
            '',
            '✅ RECOMMENDED FOODS:',
            ...template.recommended.map(r => `• ${r.item}: ${r.details}`),
            '',
            '❌ FOODS TO AVOID:',
            ...template.avoid.map(a => `• ${a.item}: ${a.reason}`),
            '',
            '🏠 HOMECARE TIPS:',
            ...template.homecare.map(h => `${h.icon} ${h.tip}`),
        ].join('\n');

        navigator.clipboard?.writeText(text);
        showToast('Diet plan copied to clipboard', 'success');
    };

    const handlePrintTemplate = (template) => {
        const printWindow = window.open('', '_blank', 'width=500,height=700');
        if (!printWindow) {
            showToast('Please allow popups to print', 'error');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Diet Plan - ${template.ageGroup}</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 24px; color: #333; max-width: 480px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
                    .header h2 { color: #4f46e5; margin: 0; }
                    .header p { font-size: 0.85rem; color: #666; margin: 4px 0 0; }
                    h3 { font-size: 1rem; margin-top: 16px; padding-bottom: 6px; border-bottom: 1px dotted #ddd; }
                    h3.green { color: #059669; }
                    h3.red { color: #dc2626; }
                    h3.blue { color: #2563eb; }
                    .item { padding: 4px 0; font-size: 0.85rem; }
                    .item strong { font-size: 0.9rem; }
                    .item span { color: #666; }
                    .tip { padding: 3px 0; font-size: 0.85rem; }
                    .footer { margin-top: 24px; text-align: center; font-size: 0.75rem; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>🍽️ Diet & Homecare Plan</h2>
                    <p>${template.ageGroup}</p>
                    <p>SmartClinic • Dr. Payal Patel</p>
                </div>
                <h3 class="green">✅ Recommended Foods</h3>
                ${template.recommended.map(r => `<div class="item"><strong>• ${r.item}</strong> — <span>${r.details}</span></div>`).join('')}
                <h3 class="red">❌ Foods to Avoid</h3>
                ${template.avoid.map(a => `<div class="item"><strong>• ${a.item}</strong> — <span>${a.reason}</span></div>`).join('')}
                <h3 class="blue">🏠 Homecare Tips</h3>
                ${template.homecare.map(h => `<div class="tip">${h.icon} ${h.tip}</div>`).join('')}
                <div class="footer">
                    <p>This diet plan should be followed as per doctor's advice.</p>
                    <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        showToast('Printing diet plan...', 'info');
    };

    const handleAddTemplate = () => {
        setIsAdding(true);
        setTemplateForm({
            ageGroup: '', ageRange: '', icon: '🍽️', color: '#4f46e5',
            recommended: [], avoid: [], homecare: []
        });
    };

    const handleEditTemplate = (template) => {
        setSelectedTemplate(null);
        setIsEditing(true);
        setTemplateForm({ ...template });
    };

    const handleDeleteTemplate = (id) => {
        if (window.confirm('Are you sure you want to delete this diet template?')) {
            setTemplates(templates.filter(t => t.id !== id));
            showToast('Template deleted', 'info');
            setSelectedTemplate(null);
        }
    };

    const handleSaveTemplate = () => {
        if (!templateForm.ageGroup) {
            showToast('Age group name is required', 'error');
            return;
        }

        if (isAdding) {
            const newId = `dt${Date.now()}`;
            setTemplates([...templates, { ...templateForm, id: newId }]);
            showToast('Template added successfully', 'success');
        } else {
            setTemplates(templates.map(t => t.id === templateForm.id ? templateForm : t));
            showToast('Template updated successfully', 'success');
        }
        setIsAdding(false);
        setIsEditing(false);
        setTemplateForm({
            ageGroup: '', ageRange: '', icon: '🍽️', color: '#4f46e5',
            recommended: [], avoid: [], homecare: []
        });
    };

    const addItemToForm = (section) => {
        if (!newItem.field1) return;
        
        let formattedItem = {};
        if (section === 'recommended') {
            formattedItem = { item: newItem.field1, details: newItem.field2, priority: newItem.priority };
        } else if (section === 'avoid') {
            formattedItem = { item: newItem.field1, reason: newItem.field2 };
        } else if (section === 'homecare') {
            formattedItem = { tip: newItem.field1, icon: newItem.icon };
        }

        setTemplateForm({
            ...templateForm,
            [section]: [...templateForm[section], formattedItem]
        });
        setNewItem({ type: section, field1: '', field2: '', priority: 'recommended', icon: '✅' });
    };

    const removeItemFromForm = (section, index) => {
        const updatedSection = [...templateForm[section]];
        updatedSection.splice(index, 1);
        setTemplateForm({ ...templateForm, [section]: updatedSection });
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Diet Templates & Homecare" subtitle="Manage diet plans and homecare advice for patients">
                <div className="flex gap-2">
                    <button className="primary-btn-sm" onClick={handleAddTemplate}>
                        <Plus size={14} /> Add Template
                    </button>
                    <button className="secondary-btn" onClick={() => setShowHomecare('fever')}>
                        <Thermometer size={14} /> Fever Homecare
                    </button>
                    <button className="secondary-btn" onClick={() => setShowHomecare('general')}>
                        <Heart size={14} /> General Tips
                    </button>
                </div>
            </PageHeader>

            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by age group..." />

            {/* Age Group Cards */}
            <div className="diet-template-grid stagger-children">
                {filtered.map(template => (
                    <div
                        key={template.id}
                        className="diet-template-card glass"
                        onClick={() => setSelectedTemplate(template)}
                        style={{ '--template-color': template.color }}
                    >
                        <div className="diet-card-header">
                            <span className="diet-icon">{template.icon}</span>
                            <div style={{ flex: 1 }}>
                                <h3 className="font-bold">{template.ageGroup}</h3>
                                <p className="text-xs text-muted">
                                    {template.recommended.length} foods • {template.avoid.length} restrictions • {template.homecare.length} tips
                                </p>
                            </div>
                        </div>

                        <div className="diet-card-preview">
                            <div className="diet-preview-section">
                                <span className="text-xs font-bold" style={{ color: 'var(--emerald)' }}>✅ Top Recommended</span>
                                {template.recommended.slice(0, 3).map((r, i) => (
                                    <p key={i} className="text-xs text-muted">• {r.item}</p>
                                ))}
                            </div>
                            <div className="diet-preview-section">
                                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>❌ Key Restrictions</span>
                                {template.avoid.slice(0, 2).map((a, i) => (
                                    <p key={i} className="text-xs text-muted">• {a.item}</p>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button className="primary-btn-sm flex-1" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }} style={{ '--btn-color': template.color }}>
                                <BookOpen size={14} /> View Plan
                            </button>
                            <button className="secondary-btn" onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }} title="Edit Template">
                                <Edit3 size={14} /> Edit
                            </button>
                            <button className="icon-btn danger" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }} title="Delete Template">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Template Detail Modal */}
            <Modal
                isOpen={!!selectedTemplate}
                onClose={() => setSelectedTemplate(null)}
                title={`${selectedTemplate?.icon || ''} ${selectedTemplate?.ageGroup || ''}`}
                size="lg"
            >
                {selectedTemplate && (
                    <div>
                        {/* Section Tabs */}
                        <div className="emr-tabs mb-4">
                            <button className={`emr-tab ${expandedSection === 'recommended' ? 'active' : ''}`} onClick={() => setExpandedSection('recommended')}>
                                <CheckCircle2 size={14} /> Recommended ({selectedTemplate.recommended.length})
                            </button>
                            <button className={`emr-tab ${expandedSection === 'avoid' ? 'active' : ''}`} onClick={() => setExpandedSection('avoid')}>
                                <Ban size={14} /> Avoid ({selectedTemplate.avoid.length})
                            </button>
                            <button className={`emr-tab ${expandedSection === 'homecare' ? 'active' : ''}`} onClick={() => setExpandedSection('homecare')}>
                                <Heart size={14} /> Homecare ({selectedTemplate.homecare.length})
                            </button>
                        </div>

                        {/* Recommended Foods */}
                        {expandedSection === 'recommended' && (
                            <div className="diet-detail-list">
                                {selectedTemplate.recommended.map((item, i) => (
                                    <div key={i} className="diet-detail-item">
                                        <div className={`priority-dot priority-${item.priority}`} />
                                        <div style={{ flex: 1 }}>
                                            <p className="font-bold text-sm">{item.item}</p>
                                            <p className="text-xs text-muted">{item.details}</p>
                                        </div>
                                        <span className={`tag tag-${item.priority}`}>{item.priority}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Foods to Avoid */}
                        {expandedSection === 'avoid' && (
                            <div className="diet-detail-list">
                                {selectedTemplate.avoid.map((item, i) => (
                                    <div key={i} className="diet-avoid-item">
                                        <Ban size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                        <div>
                                            <p className="font-bold text-sm">{item.item}</p>
                                            <p className="text-xs text-muted">{item.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Homecare Tips */}
                        {expandedSection === 'homecare' && (
                            <div className="diet-detail-list">
                                {selectedTemplate.homecare.map((item, i) => (
                                    <div key={i} className="homecare-tip-item">
                                        <span className="tip-icon">{item.icon}</span>
                                        <p className="text-sm">{item.tip}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-6">
                            <button className="primary-btn flex-1" onClick={() => handlePrintTemplate(selectedTemplate)}>
                                <Printer size={16} /> Print Plan
                            </button>
                            <button className="secondary-btn flex-1" onClick={() => handleCopyTemplate(selectedTemplate)}>
                                <Copy size={14} /> Copy
                            </button>
                            <button className="secondary-btn" onClick={() => handleEditTemplate(selectedTemplate)}>
                                <Edit3 size={14} /> Edit
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add / Edit Template Modal */}
            <Modal
                isOpen={isAdding || isEditing}
                onClose={() => { setIsAdding(false); setIsEditing(false); }}
                title={isAdding ? "✨ Add New Diet Template" : "✏️ Edit Diet Template"}
                size="lg"
            >
                <div className="form-grid mb-4">
                    <div className="form-group">
                        <label>Age Group Name *</label>
                        <input type="text" placeholder="e.g. Newborns" value={templateForm.ageGroup}
                            onChange={e => setTemplateForm({ ...templateForm, ageGroup: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Age Range</label>
                        <input type="text" placeholder="e.g. 0-1m" value={templateForm.ageRange}
                            onChange={e => setTemplateForm({ ...templateForm, ageRange: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Icon (Emoji)</label>
                        <input type="text" placeholder="👶" value={templateForm.icon}
                            onChange={e => setTemplateForm({ ...templateForm, icon: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Theme Color</label>
                        <input type="color" value={templateForm.color}
                            onChange={e => setTemplateForm({ ...templateForm, color: e.target.value })} />
                    </div>
                </div>

                {/* Internal Section Tabs for Form */}
                <div className="emr-tabs mb-4">
                    <button className={`emr-tab ${expandedSection === 'recommended' ? 'active' : ''}`} onClick={() => setExpandedSection('recommended')}>
                        Recommended
                    </button>
                    <button className={`emr-tab ${expandedSection === 'avoid' ? 'active' : ''}`} onClick={() => setExpandedSection('avoid')}>
                        Avoid
                    </button>
                    <button className={`emr-tab ${expandedSection === 'homecare' ? 'active' : ''}`} onClick={() => setExpandedSection('homecare')}>
                        Homecare
                    </button>
                </div>

                <div className="section-builder p-4 bg-background rounded-lg border border-border">
                    <div className="flex gap-2 mb-4">
                        <input type="text" className="flex-1 text-sm" placeholder={expandedSection === 'homecare' ? "Enter tip..." : "Item name..."}
                            value={newItem.field1} onChange={e => setNewItem({ ...newItem, field1: e.target.value })} />
                        
                        {expandedSection !== 'homecare' && (
                            <input type="text" className="flex-1 text-sm" placeholder={expandedSection === 'recommended' ? "Dosage/Details" : "Reason to avoid"}
                                value={newItem.field2} onChange={e => setNewItem({ ...newItem, field2: e.target.value })} />
                        )}

                        {expandedSection === 'homecare' && (
                            <input type="text" className="w-16 text-center text-sm" placeholder="Icon"
                                value={newItem.icon} onChange={e => setNewItem({ ...newItem, icon: e.target.value })} />
                        )}

                        {expandedSection === 'recommended' && (
                            <select className="text-sm" value={newItem.priority} onChange={e => setNewItem({ ...newItem, priority: e.target.value })}>
                                <option>essential</option>
                                <option>recommended</option>
                                <option>optional</option>
                            </select>
                        )}

                        <button className="primary-btn-sm" onClick={() => addItemToForm(expandedSection)}>
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="item-list-mini max-h-40 overflow-y-auto">
                        {templateForm[expandedSection].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border-b border-border text-xs">
                                <div className="flex gap-2">
                                    {expandedSection === 'homecare' && <span>{item.icon}</span>}
                                    <strong>{item.item || item.tip}</strong>
                                    <span className="text-muted">{item.details || item.reason}</span>
                                </div>
                                <button className="text-accent" onClick={() => removeItemFromForm(expandedSection, idx)}>
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button className="primary-btn flex-1" onClick={handleSaveTemplate}>
                        <Save size={16} /> Save Template
                    </button>
                    <button className="secondary-btn" onClick={() => { setIsAdding(false); setIsEditing(false); }}>
                        Cancel
                    </button>
                </div>
            </Modal>

            {/* Fever Homecare Modal */}
            <Modal isOpen={showHomecare === 'fever'} onClose={() => setShowHomecare(null)} title="🌡️ Fever Homecare Guide">
                <div className="diet-detail-list">
                    {FEVER_HOMECARE.map((item, i) => (
                        <div key={i} className="homecare-tip-item">
                            <span className="tip-icon">{item.icon}</span>
                            <p className="text-sm">{item.tip}</p>
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-background rounded-lg mt-4" style={{ borderLeft: '3px solid var(--accent)' }}>
                    <p className="text-xs font-bold text-accent mb-1">⚠️ IMPORTANT</p>
                    <p className="text-xs text-muted">
                        If fever exceeds 103°F or lasts more than 3 days, or child shows signs of
                        dehydration, breathing difficulty, or rashes — seek immediate medical attention.
                    </p>
                </div>
            </Modal>

            {/* General Homecare Modal */}
            <Modal isOpen={showHomecare === 'general'} onClose={() => setShowHomecare(null)} title="🏠 General Homecare Tips">
                <div className="diet-detail-list">
                    {GENERAL_HOMECARE.map((item, i) => (
                        <div key={i} className="homecare-tip-item">
                            <span className="tip-icon">{item.icon}</span>
                            <p className="text-sm">{item.tip}</p>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default DietTemplates;
