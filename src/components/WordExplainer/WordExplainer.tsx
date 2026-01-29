// Word Explainer Popup Component with Dictionary Lookup
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Word } from '../../types';
import { PitchAccent } from '../PitchAccent/PitchAccent';
import { lookupWord, formatPartOfSpeech, formatJlptLevel } from '../../services/dictionaryService';
import type { DictionaryEntry } from '../../services/dictionaryService';
import './WordExplainer.css';

interface WordExplainerProps {
    word: Word | null;
    position: { x: number; y: number };
    onClose: () => void;
    onAddToVocabulary: (word: Word) => void;
    isInVocabulary: boolean;
}

export const WordExplainer: React.FC<WordExplainerProps> = ({
    word,
    position,
    onClose,
    onAddToVocabulary,
    isInVocabulary,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [dictEntry, setDictEntry] = useState<DictionaryEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lookupError, setLookupError] = useState(false);

    // Lookup word in dictionary
    const lookupWordInDict = useCallback(async (text: string) => {
        setIsLoading(true);
        setLookupError(false);
        setDictEntry(null);

        try {
            const entry = await lookupWord(text);
            setDictEntry(entry);
            if (!entry) {
                setLookupError(true);
            }
        } catch {
            setLookupError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Lookup when word changes
    useEffect(() => {
        if (word) {
            lookupWordInDict(word.text);
        }
    }, [word, lookupWordInDict]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!word) return null;

    // Merge word data with dictionary data
    const displayReading = dictEntry?.reading || word.reading || '';
    const displayMeaning = dictEntry?.meanings?.join('; ') || word.meaning || '';
    const displayPos = dictEntry ? formatPartOfSpeech(dictEntry.partOfSpeech) : word.partOfSpeech;
    const jlptLevel = dictEntry ? formatJlptLevel(dictEntry.jlptLevel) : '';
    const isCommon = dictEntry?.isCommon;

    // Popup dimensions
    const popupWidth = 360;
    const popupHeight = 400; // Estimated max height
    const padding = 16;

    // Calculate position to keep popup fully visible
    let left = position.x - popupWidth / 2; // Center on click position
    let top = position.y + 20; // Below the selection

    // Keep within horizontal bounds
    if (left < padding) {
        left = padding;
    } else if (left + popupWidth > window.innerWidth - padding) {
        left = window.innerWidth - popupWidth - padding;
    }

    // If popup would go below viewport, show it above the selection
    if (top + popupHeight > window.innerHeight - padding) {
        top = position.y - popupHeight - 10;
        // If still doesn't fit, just show at top of screen
        if (top < padding) {
            top = padding;
        }
    }

    const adjustedPosition = { left, top };

    // Create enhanced word for vocabulary
    const enhancedWord: Word = {
        ...word,
        reading: displayReading,
        meaning: displayMeaning,
        partOfSpeech: displayPos,
    };

    return (
        <div
            ref={popupRef}
            className="word-explainer glass-card animate-fade-in"
            style={{
                left: adjustedPosition.left,
                top: adjustedPosition.top,
            }}
        >
            <button className="close-btn" onClick={onClose}>×</button>

            <div className="word-header">
                <span className="word-main">{word.text}</span>
                <div className="word-badges">
                    {isCommon && <span className="badge badge-green">常用</span>}
                    {jlptLevel && <span className="badge badge-purple">{jlptLevel}</span>}
                    {displayPos && <span className="badge badge-blue">{displayPos}</span>}
                </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="dict-loading">
                    <span className="loading-spinner">⏳</span>
                    <span>正在查询词典...</span>
                </div>
            )}

            {/* Error state */}
            {lookupError && !isLoading && (
                <div className="dict-error">
                    <span className="error-icon">📖</span>
                    <span>未找到词典释义</span>
                </div>
            )}

            {/* Dictionary content */}
            {!isLoading && (
                <>
                    {/* Pitch Accent */}
                    {displayReading && (
                        <div className="word-pitch">
                            <PitchAccent reading={displayReading} pitch={word.pitch} size="large" />
                        </div>
                    )}

                    {/* Reading */}
                    {displayReading && (
                        <div className="word-field">
                            <span className="field-label">读音</span>
                            <span className="field-value reading-value">{displayReading}</span>
                        </div>
                    )}

                    {/* Meaning from dictionary */}
                    {displayMeaning && (
                        <div className="word-field">
                            <span className="field-label">释义</span>
                            <span className="field-value meaning">{displayMeaning}</span>
                        </div>
                    )}

                    {/* All meanings if available */}
                    {dictEntry?.meanings && dictEntry.meanings.length > 1 && (
                        <div className="word-meanings">
                            <span className="field-label">更多释义</span>
                            <ul className="meanings-list">
                                {dictEntry.meanings.slice(0, 5).map((m, i) => (
                                    <li key={i}>{m}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Grammar note */}
                    {word.grammar && (
                        <div className="word-grammar">
                            <span className="grammar-icon">📖</span>
                            <span className="grammar-text">{word.grammar}</span>
                        </div>
                    )}

                    {/* Examples */}
                    {word.examples && word.examples.length > 0 && (
                        <div className="word-examples">
                            <span className="field-label">例句</span>
                            {word.examples.map((ex, i) => (
                                <div key={i} className="example-item">{ex}</div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Dictionary source */}
            <div className="dict-source">
                <span>数据来源: JMdict / Jisho.org</span>
            </div>

            {/* Add to vocabulary button */}
            <button
                className={`add-vocab-btn ${isInVocabulary ? 'added' : ''}`}
                onClick={() => onAddToVocabulary(enhancedWord)}
                disabled={isInVocabulary || isLoading}
            >
                {isInVocabulary ? (
                    <>✓ 已添加到生词本</>
                ) : (
                    <>📚 添加到生词本</>
                )}
            </button>
        </div>
    );
};

export default WordExplainer;
