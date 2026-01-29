// Vocabulary Book Component
import React, { useState, useMemo } from 'react';
import type { VocabularyItem, Word } from '../../types';
import { PitchAccent } from '../PitchAccent/PitchAccent';
import './VocabularyBook.css';

interface VocabularyBookProps {
    vocabulary: VocabularyItem[];
    onRemoveWord: (id: string) => void;
    onUpdateWord?: (id: string, updates: Partial<VocabularyItem['word']>) => void;
    onAddWord?: (word: Word) => void;
    onStartFlashcards: () => void;
    dueForReview: number;
}

export const VocabularyBook: React.FC<VocabularyBookProps> = ({
    vocabulary,
    onRemoveWord,
    onUpdateWord,
    onAddWord,
    onStartFlashcards,
    dueForReview,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'level' | 'name'>('date');
    const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    // Unified form for adding and editing
    const [wordForm, setWordForm] = useState({ text: '', reading: '', meaning: '' });

    const handleEditClick = (item: VocabularyItem) => {
        setEditingItem(item);
        setWordForm({
            text: item.word.text,
            reading: item.word.reading,
            meaning: item.word.meaning
        });
    };

    const handleAddClick = () => {
        setEditingItem(null);
        setWordForm({ text: '', reading: '', meaning: '' });
        setIsAdding(true);
    };

    const handleSave = () => {
        if (editingItem && onUpdateWord) {
            onUpdateWord(editingItem.id, {
                reading: wordForm.reading,
                meaning: wordForm.meaning
                // Usually text isn't editable to maintain ID consistency, but if needed we could allows it.
                // For now, assume text is fixed on edit, but let's allow updating reading/meaning.
            });
            setEditingItem(null);
        } else if (isAdding && onAddWord) {
            if (!wordForm.text.trim()) return; // Required

            const newWord: Word = {
                id: `manual-${Date.now()}`,
                text: wordForm.text,
                reading: wordForm.reading,
                meaning: wordForm.meaning,
                partOfSpeech: '',
                pitch: []
            };
            onAddWord(newWord);
            setIsAdding(false);
        }
    };

    const filteredVocabulary = useMemo(() => {
        let filtered = vocabulary.filter(item =>
            item.word.text.includes(searchTerm) ||
            item.word.reading.includes(searchTerm) ||
            item.word.meaning.includes(searchTerm)
        );

        // Sort
        switch (sortBy) {
            case 'date':
                filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
                break;
            case 'level':
                filtered.sort((a, b) => b.level - a.level);
                break;
            case 'name':
                filtered.sort((a, b) => a.word.text.localeCompare(b.word.text));
                break;
        }

        return filtered;
    }, [vocabulary, searchTerm, sortBy]);

    const getLevelLabel = (level: number) => {
        const labels = ['新词', '初学', '熟悉', '掌握', '精通', '完美'];
        return labels[Math.min(level, labels.length - 1)];
    };

    const getLevelColor = (level: number) => {
        const colors = ['#ff6b6b', '#ff9f43', '#feca57', '#00d9a5', '#00d4ff', '#a855f7'];
        return colors[Math.min(level, colors.length - 1)];
    };

    return (
        <div className="vocabulary-book">
            <div className="vocab-header glass-card">
                <div className="vocab-title">
                    <h2>📚 生词本</h2>
                    <span className="vocab-count">{vocabulary.length} 个单词</span>
                </div>

                <div className="vocab-actions">
                    {onAddWord && (
                        <button className="add-btn btn-primary" onClick={handleAddClick}>
                            + 添加生词
                        </button>
                    )}
                    {dueForReview > 0 && (
                        <button className="review-btn btn-accent" onClick={onStartFlashcards}>
                            🎴 复习 ({dueForReview})
                        </button>
                    )}
                </div>
            </div>

            <div className="vocab-controls glass-card">
                <input
                    type="text"
                    className="input search-input"
                    placeholder="搜索单词..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="sort-options">
                    <span className="sort-label">排序:</span>
                    {[
                        { key: 'date', label: '时间' },
                        { key: 'level', label: '熟练度' },
                        { key: 'name', label: '名称' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`sort-btn ${sortBy === key ? 'active' : ''}`}
                            onClick={() => setSortBy(key as typeof sortBy)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {vocabulary.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">📭</div>
                    <h3>生词本是空的</h3>
                    <p>在学习过程中点击单词，将它们添加到生词本！</p>
                </div>
            ) : filteredVocabulary.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">🔍</div>
                    <h3>未找到匹配的单词</h3>
                    <p>尝试其他搜索关键词</p>
                </div>
            ) : (
                <div className="vocab-grid">
                    {filteredVocabulary.map(item => (
                        <div key={item.id} className="vocab-card glass-card">
                            <div className="card-actions">
                                {onUpdateWord && (
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => handleEditClick(item)}
                                        title="编辑"
                                    >
                                        ✎
                                    </button>
                                )}
                                <button
                                    className="action-btn remove-btn"
                                    onClick={() => onRemoveWord(item.id)}
                                    title="从生词本移除"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="vocab-word">{item.word.text}</div>

                            <div className="vocab-reading">
                                <PitchAccent reading={item.word.reading} pitch={item.word.pitch} size="small" />
                            </div>

                            <div className="vocab-meaning">{item.word.meaning}</div>

                            <div className="vocab-meta">
                                <span
                                    className="level-badge"
                                    style={{ backgroundColor: `${getLevelColor(item.level)}20`, color: getLevelColor(item.level) }}
                                >
                                    {getLevelLabel(item.level)}
                                </span>
                                <span className="review-count">
                                    复习 {item.reviewCount} 次
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Add Modal */}
            {(editingItem || isAdding) && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal glass-card">
                        <h3>{isAdding ? '添加生词' : '编辑单词'}</h3>

                        {isAdding ? (
                            <div className="edit-field">
                                <label>单词 (必填)</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={wordForm.text}
                                    onChange={e => setWordForm(prev => ({ ...prev, text: e.target.value }))}
                                    placeholder="例如：日本語"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="edit-word-display">{editingItem?.word.text}</div>
                        )}

                        <div className="edit-field">
                            <label>读音 (假名)</label>
                            <input
                                type="text"
                                className="input"
                                value={wordForm.reading}
                                onChange={e => setWordForm(prev => ({ ...prev, reading: e.target.value }))}
                                placeholder="例如：にほんご"
                            />
                        </div>

                        <div className="edit-field">
                            <label>释义</label>
                            <textarea
                                className="input textarea"
                                value={wordForm.meaning}
                                onChange={e => setWordForm(prev => ({ ...prev, meaning: e.target.value }))}
                                rows={3}
                                placeholder="输入中文释义..."
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
                                disabled={isAdding && !wordForm.text.trim()}
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

export default VocabularyBook;
