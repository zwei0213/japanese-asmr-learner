// Sentence Panel Component - Display sentences with text selection and AI analysis
import React, { useCallback, useRef, useState } from 'react';
import type { Sentence } from '../../types';
import { IconPlay, IconCheck, IconList } from '../Icons';
import { analyzeSentenceStructured } from '../../services/aiService';
import type { StructuredAnalysis } from '../../services/aiService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './SentencePanel.css';

interface SentencePanelProps {
    sentences: Sentence[];
    currentIndex: number;
    onSentenceClick: (index: number) => void;
    onTextSelect: (text: string, event: { x: number; y: number }) => void;
    showReading: boolean;
    showTranslation: boolean;
    onAddToVocabulary?: (word: any) => void;
    onAddToGrammar?: (grammar: any) => void;
}

export const SentencePanel: React.FC<SentencePanelProps> = ({
    sentences,
    currentIndex,
    onSentenceClick,
    onTextSelect,
    showReading,
    showTranslation,
    onAddToVocabulary,
    onAddToGrammar,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    // Persist analysis data to localStorage
    const [analysisData, setAnalysisData] = useLocalStorage<Record<string, StructuredAnalysis>>('ai_sentence_analysis_cache', {});
    const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

    // Feedback state for added items: { itemId: 'vocab' | 'grammar' }
    const [addedFeedback, setAddedFeedback] = useState<Record<string, string>>({});

    const showFeedback = (id: string, type: string) => {
        setAddedFeedback(prev => ({ ...prev, [id]: type }));
        setTimeout(() => {
            setAddedFeedback(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        }, 2000);
    };

    // Handle text selection
    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 0 && selectedText.length < 50) {
            const range = selection?.getRangeAt(0);
            const rect = range?.getBoundingClientRect();

            if (rect) {
                onTextSelect(selectedText, {
                    x: rect.left + rect.width / 2,
                    y: rect.bottom
                });
            }
        }
    }, [onTextSelect]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection?.toString().trim();

            if (selectedText && selectedText.length > 0) {
                onTextSelect(selectedText, { x: e.clientX, y: e.clientY });
            }
        }, 10);
    }, [onTextSelect]);

    const handleSentenceClick = (index: number) => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }
        onSentenceClick(index);
    };

    const handleAnalyze = async (e: React.MouseEvent, sentence: Sentence) => {
        e.stopPropagation();
        if (analyzingId) return;

        // Toggle visibility if already analyzed
        if (analysisData[sentence.id]) {
            setExpandedAnalysis(prev => ({
                ...prev,
                [sentence.id]: !prev[sentence.id]
            }));
            return;
        }

        setAnalyzingId(sentence.id);
        try {
            const result = await analyzeSentenceStructured(sentence.text);
            setAnalysisData(prev => ({
                ...prev,
                [sentence.id]: result
            }));
            setExpandedAnalysis(prev => ({
                ...prev,
                [sentence.id]: true
            }));
        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setAnalyzingId(null);
        }
    };

    return (
        <div className="sentence-panel glass-card" ref={panelRef}>
            <div className="panel-header">
                <h3><span className="icon-wrapper"><IconList /></span> 句子列表</h3>
                <div className="panel-controls">
                    <span className="hint-text">选中查词 / 双击快查 / 点击🤖AI解析</span>
                </div>
            </div>

            <div className="sentences-list">
                {sentences.map((sentence, index) => (
                    <div
                        key={sentence.id}
                        className={`sentence-item ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
                        onClick={() => handleSentenceClick(index)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="sentence-number">
                            {index + 1}
                        </div>

                        <div
                            className="sentence-content"
                            onMouseUp={handleMouseUp}
                            onDoubleClick={handleDoubleClick}
                        >
                            <div className="sentence-japanese selectable-text">
                                {sentence.text}
                                <button
                                    className={`ai-analyze-btn ${analysisData[sentence.id] ? 'active' : ''} ${analyzingId === sentence.id ? 'loading' : ''}`}
                                    onClick={(e) => handleAnalyze(e, sentence)}
                                    title="AI 智能解析"
                                >
                                    {analyzingId === sentence.id ? '⏳' : '🤖'}
                                </button>
                            </div>

                            {showReading && sentence.reading && (
                                <div className="sentence-reading">{sentence.reading}</div>
                            )}

                            {showTranslation && sentence.translation && (
                                <div className="sentence-translation">{sentence.translation}</div>
                            )}

                            {/* AI Analysis Result */}
                            {expandedAnalysis[sentence.id] && analysisData[sentence.id] && (
                                <div className="ai-analysis-result" onClick={e => e.stopPropagation()}>
                                    <div className="analysis-section">
                                        <span className="section-label">📝 翻译</span>
                                        <p>{analysisData[sentence.id].translation}</p>
                                    </div>

                                    {analysisData[sentence.id].vocabulary.length > 0 && (
                                        <div className="analysis-section">
                                            <span className="section-label">📖 核心词汇</span>
                                            <div className="tags-container">
                                                {analysisData[sentence.id].vocabulary.map((vocab, i) => (
                                                    <div key={i} className="analysis-tag vocab-tag">
                                                        <span className="tag-main">
                                                            {vocab.word}
                                                            <span className="tag-sub">{vocab.reading}</span>
                                                        </span>
                                                        <span className="tag-meaning">{vocab.meaning}</span>
                                                        {onAddToVocabulary && (
                                                            <button
                                                                className={`add-to-lib-btn ${addedFeedback[`vocab-${i}-${sentence.id}`] ? 'success' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const feedbackId = `vocab-${i}-${sentence.id}`;
                                                                    if (addedFeedback[feedbackId]) return;

                                                                    onAddToVocabulary({
                                                                        id: `ai-vocab-${Date.now()}-${i}`,
                                                                        text: vocab.word,
                                                                        reading: vocab.reading,
                                                                        meaning: vocab.meaning,
                                                                        partOfSpeech: vocab.partOfSpeech,
                                                                        pitch: []
                                                                    });
                                                                    showFeedback(feedbackId, 'vocab');
                                                                }}
                                                                title="添加到生词本"
                                                            >
                                                                {addedFeedback[`vocab-${i}-${sentence.id}`] ? '✓ 已添加' : '+ 添加到生词本'}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analysisData[sentence.id].grammarPoints.length > 0 && (
                                        <div className="analysis-section">
                                            <span className="section-label">📚 语法点</span>
                                            <div className="tags-container">
                                                {analysisData[sentence.id].grammarPoints.map((grammar, i) => (
                                                    <div key={i} className="analysis-tag grammar-tag">
                                                        <span className="tag-main">{grammar.pattern}</span>
                                                        <span className="tag-meaning">{grammar.explanation}</span>
                                                        {onAddToGrammar && (
                                                            <button
                                                                className={`add-to-lib-btn ${addedFeedback[`grammar-${i}-${sentence.id}`] ? 'success' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const feedbackId = `grammar-${i}-${sentence.id}`;
                                                                    if (addedFeedback[feedbackId]) return;

                                                                    onAddToGrammar({
                                                                        id: `ai-grammar-${Date.now()}-${i}`,
                                                                        pattern: grammar.pattern,
                                                                        meaning: grammar.explanation,
                                                                        level: 'Auto', // Use 'Auto' or empty, essentially "Unclassified"
                                                                        notes: grammar.explanation,
                                                                        examples: grammar.example ? [{
                                                                            japanese: grammar.example,
                                                                            reading: '',
                                                                            translation: ''
                                                                        }] : []
                                                                    });
                                                                    showFeedback(feedbackId, 'grammar');
                                                                }}
                                                                title="添加到语法库"
                                                            >
                                                                {addedFeedback[`grammar-${i}-${sentence.id}`] ? '✓ 已添加' : '+ 添加到语法库'}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="sentence-status">
                            {index === currentIndex && <span className="status-playing"><IconPlay /></span>}
                            {index < currentIndex && <span className="status-done"><IconCheck /></span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SentencePanel;
