// Floating AI Chat Container - Draggable and Resizable
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AIChat } from '../AIChat/AIChat';
import './FloatingAIChat.css';

interface FloatingAIChatProps {
    isOpen: boolean;
    onClose: () => void;
    selectedText?: string;
}

export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({
    isOpen,
    onClose,
    selectedText,
}) => {
    const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
    const [size, setSize] = useState({ width: 380, height: 500 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    // Handle dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.floating-header')) {
            e.preventDefault();
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [position]);

    // Handle resize
    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
                const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
                setPosition({ x: newX, y: newY });
            }
            if (isResizing && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const newWidth = Math.max(300, Math.min(600, e.clientX - rect.left));
                const newHeight = Math.max(300, Math.min(700, e.clientY - rect.top));
                setSize({ width: newWidth, height: newHeight });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, size.width]);

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className={`floating-ai-chat ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                left: position.x,
                top: position.y,
                width: isMinimized ? 200 : size.width,
                height: isMinimized ? 'auto' : size.height,
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Header */}
            <div className="floating-header">
                <div className="header-drag-area">
                    <span className="drag-icon">⋮⋮</span>
                    <span className="header-title">🤖 AI 助手</span>
                </div>
                <div className="header-controls">
                    <button
                        className="control-btn"
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? '展开' : '最小化'}
                    >
                        {isMinimized ? '□' : '−'}
                    </button>
                    <button
                        className="control-btn close"
                        onClick={onClose}
                        title="关闭"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="floating-content">
                    <AIChat
                        selectedText={selectedText}
                    // Action buttons removed as per user request
                    />
                </div>
            )}

            {/* Resize Handle */}
            {!isMinimized && (
                <div
                    className="resize-handle"
                    onMouseDown={handleResizeMouseDown}
                />
            )}
        </div>
    );
};

export default FloatingAIChat;
