// Grammar Library Component
import React, { useState } from 'react';
import type { GrammarPoint } from '../../types';
import './GrammarLibrary.css';

interface GrammarLibraryProps {
    grammarPoints: GrammarPoint[];
    onRemoveGrammar?: (id: string) => void;
    onUpdateGrammar?: (id: string, updates: Partial<GrammarPoint>) => void;
    onAddGrammar?: (point: Omit<GrammarPoint, 'id'>) => void;
}

export const GrammarLibrary: React.FC<GrammarLibraryProps> = ({
    grammarPoints,
    onRemoveGrammar,
    onUpdateGrammar,
    onAddGrammar,
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<GrammarPoint | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    // Initialize form with safe defaults
    const [editForm, setEditForm] = useState<Partial<GrammarPoint>>({});

    const handleEditClick = (item: GrammarPoint, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingItem(item);
        setEditForm({
            pattern: item.pattern,
            meaning: item.meaning,
            level: item.level,
            notes: item.notes || '',
            examples: item.examples || []
        });
    };

    const handleAddClick = () => {
        setEditingItem(null);
        setEditForm({ pattern: '', meaning: '', level: 'N5', notes: '', examples: [] });
        setIsAdding(true);
    };

    const handleSave = () => {
        if (editingItem && onUpdateGrammar) {
            onUpdateGrammar(editingItem.id, editForm);
            setEditingItem(null);
        } else if (isAdding && onAddGrammar) {
            if (!editForm.pattern || !editForm.meaning) return; // Basic validation

            onAddGrammar({
                pattern: editForm.pattern,
                meaning: editForm.meaning,
                level: editForm.level as any || 'N5',
                notes: editForm.notes,
                examples: editForm.examples || []
            });
            setIsAdding(false);
        }
    };

    const filteredPatterns = grammarPoints.filter(p => {
        // Simple filter: showing everything by default for now, or just search
        // User asked to cancel grading, so we might just show all unless searched
        const matchesSearch =
            p.pattern.includes(searchTerm) ||
            p.meaning.includes(searchTerm);
        return matchesSearch;
    });

    return (
        <div className="grammar-library">
            <div className="grammar-header glass-card">
                <h2>📖 语法卡片库</h2>
                <p>日语语法点整理</p>
            </div>

            <div className="grammar-controls glass-card">
                <input
                    type="text"
                    className="input"
                    placeholder="搜索语法..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {onAddGrammar && (
                    <button className="add-btn btn-primary" onClick={handleAddClick} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                        + 添加语法
                    </button>
                )}
            </div>

            <div className="grammar-list">
                {filteredPatterns.map(pattern => (
                    <div
                        key={pattern.id}
                        className={`grammar-card glass-card ${expandedId === pattern.id ? 'expanded' : ''}`}
                    >
                        <div
                            className="grammar-header-row"
                            onClick={() => setExpandedId(expandedId === pattern.id ? null : pattern.id)}
                        >
                            <div className="grammar-main">
                                <span className="grammar-pattern">{pattern.pattern}</span>
                                {pattern.level && pattern.level !== 'N5' && pattern.level !== 'Auto' && (
                                    <span className={`level-badge level-${pattern.level.toLowerCase()}`}>
                                        {pattern.level}
                                    </span>
                                )}
                            </div>
                            {/* ... remaining structure ... */}
                            <span className="grammar-meaning">{pattern.meaning}</span>
                            <span className="expand-icon">
                                {expandedId === pattern.id ? '▼' : '▶'}
                            </span>
                            <div className="card-actions">
                                {onUpdateGrammar && (
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={(e) => handleEditClick(pattern, e)}
                                        title="编辑"
                                    >
                                        ✎
                                    </button>
                                )}
                                {onRemoveGrammar && (
                                    <button
                                        className="action-btn remove-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveGrammar(pattern.id);
                                        }}
                                        title="删除"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {expandedId === pattern.id && (
                            <div className="grammar-details animate-fade-in">
                                <div className="examples-section">
                                    <h4>例句</h4>
                                    {pattern.examples.map((ex, i) => (
                                        <div key={i} className="example-item">
                                            <div className="example-jp">{ex.japanese}</div>
                                            <div className="example-reading">{ex.reading}</div>
                                            <div className="example-translation">{ex.translation}</div>
                                        </div>
                                    ))}
                                </div>
                                {pattern.notes && (
                                    <div className="grammar-notes">
                                        <span className="notes-icon">💡</span>
                                        {pattern.notes}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Edit/Add Modal */}
            {(editingItem || isAdding) && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal glass-card">
                        <h3>{isAdding ? '添加语法' : '编辑语法'}</h3>

                        <div className="edit-field">
                            <label>语法句型</label>
                            <input
                                type="text"
                                className="input"
                                value={editForm.pattern || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, pattern: e.target.value }))}
                            />
                        </div>

                        <div className="edit-field">
                            <label>含义</label>
                            <input
                                type="text"
                                className="input"
                                value={editForm.meaning || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, meaning: e.target.value }))}
                            />
                        </div>

                        <div className="edit-field">
                            <label>级别 (可选)</label>
                            <input
                                type="text"
                                className="input"
                                value={editForm.level || ''}
                                placeholder="如: N3, 常用, 敬语等"
                                onChange={e => setEditForm(prev => ({ ...prev, level: e.target.value }))}
                            />
                        </div>

                        <div className="edit-field">
                            <label>笔记/解释</label>
                            <textarea
                                className="input textarea"
                                value={editForm.notes || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        <div className="edit-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setEditingItem(null);
                                    setIsAdding(false);
                                }}
                            >
                                取消
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={isAdding && (!editForm.pattern || !editForm.meaning)}
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrammarLibrary;
