// Sentence Panel Component - Display sentences with text selection for dictionary lookup
import React, { useCallback, useRef } from 'react';
import type { Sentence } from '../../types';
import { IconPlay, IconCheck, IconList } from '../Icons';
import './SentencePanel.css';

interface SentencePanelProps {
    sentences: Sentence[];
    currentIndex: number;
    onSentenceClick: (index: number) => void;
    onTextSelect: (text: string, event: { x: number; y: number }) => void;
    showReading: boolean;
    showTranslation: boolean;
}

export const SentencePanel: React.FC<SentencePanelProps> = ({
    sentences,
    currentIndex,
    onSentenceClick,
    onTextSelect,
    showReading,
    showTranslation,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Handle text selection
    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 0 && selectedText.length < 50) {
            // Get selection position
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

    // Handle double-click for quick word selection
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        // Let browser handle the selection, then get it
        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection?.toString().trim();

            if (selectedText && selectedText.length > 0) {
                onTextSelect(selectedText, { x: e.clientX, y: e.clientY });
            }
        }, 10);
    }, [onTextSelect]);

    // Handle sentence click only if not selecting text
    const handleSentenceClick = (index: number) => {
        const selection = window.getSelection();
        // If there's text selected, don't trigger the jump
        if (selection && selection.toString().length > 0) {
            return;
        }
        onSentenceClick(index);
    };

    return (
        <div className="sentence-panel glass-card" ref={panelRef}>
            <div className="panel-header">
                <div className="panel-header">
                    <h3><span className="icon-wrapper"><IconList /></span> 句子列表</h3>
                    <div className="panel-controls">
                        <span className="hint-text">选中文字查词典 / 双击快速查词</span>
                    </div>
                </div>
            </div>

            <div className="sentences-list">
                {sentences.map((sentence, index) => (
                    <div
                        key={sentence.id}
                        className={`sentence-item ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
                        onClick={() => handleSentenceClick(index)} // Make entire row clickable
                        style={{ cursor: 'pointer' }}
                    >
                        <div
                            className="sentence-number"
                        // Removed individual onClick to let it bubble or handled by parent
                        >
                            {index + 1}
                        </div>

                        <div
                            className="sentence-content"
                            onMouseUp={handleMouseUp}
                            onDoubleClick={handleDoubleClick}
                        >
                            {/* Japanese text - now selectable */}
                            <div className="sentence-japanese selectable-text">
                                {sentence.text}
                            </div>

                            {/* Reading (full sentence) */}
                            {showReading && sentence.reading && (
                                <div className="sentence-reading">{sentence.reading}</div>
                            )}

                            {/* Translation */}
                            {showTranslation && sentence.translation && (
                                <div className="sentence-translation">{sentence.translation}</div>
                            )}
                        </div>

                        {/* Status indicator */}
                        <div
                            className="sentence-status"
                        >
                            {/* Status indicator */}
                            <div
                                className="sentence-status"
                            >
                                {index === currentIndex && <span className="status-playing"><IconPlay /></span>}
                                {index < currentIndex && <span className="status-done"><IconCheck /></span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SentencePanel;
