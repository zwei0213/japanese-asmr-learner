// AI Chat Component - Japanese Learning Assistant
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { sendChatMessage, hasApiKey, setApiKey, removeApiKey } from '../../services/aiService';
import type { ChatMessage } from '../../services/aiService';
import './AIChat.css';

interface AIChatProps {
    selectedText?: string; // Text selected from sentence panel for context
    onAddToVocabulary?: (word: any) => void;
    onSaveToNote?: (note: { title: string; content: string; type: 'general' | 'word' | 'grammar' | 'sentence' }) => void;
    onAddToGrammar?: (grammar: any) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
    selectedText,
    onAddToVocabulary,
    onSaveToNote,
    onAddToGrammar,
}) => {
    // Persist chat history
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('ai_chat_history', []);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null); // For tracking which message is being processed (saved)
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isApiKeySet, setIsApiKeySet] = useState(hasApiKey());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-fill input with selected text
    useEffect(() => {
        if (selectedText && selectedText.trim()) {
            setInputValue(`请解释：「${selectedText}」`);
            inputRef.current?.focus();
        }
    }, [selectedText]);

    const handleSendMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            // Build conversation history (limit to last 10 messages for context)
            const conversationHistory = [...messages.slice(-10), userMessage];
            const response = await sendChatMessage(conversationHistory);

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '发送失败';
            setError(errorMessage);
            // Don't add error as a message, just show it
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, isLoading, messages, setMessages]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSaveApiKey = () => {
        if (apiKeyInput.trim()) {
            setApiKey(apiKeyInput.trim());
            setIsApiKeySet(true);
            setApiKeyInput('');
            setShowSettings(false);
        }
    };

    const handleRemoveApiKey = () => {
        removeApiKey();
        setIsApiKeySet(false);
        setApiKeyInput('');
    };

    const handleClearChat = () => {
        setMessages([]);
        setError(null);
    };

    // Quick action buttons
    const quickActions = [
        { label: '语法问题', prompt: '请解释一个日语语法点：' },
        { label: '单词查询', prompt: '请解释这个日语词汇：' },
        { label: '翻译帮助', prompt: '请帮我翻译：' },
        { label: '学习建议', prompt: '请给我一些日语学习建议' },
    ];

    return (
        <div className="ai-chat glass-card">
            <div className="chat-header">
                <div className="header-title">
                    <span className="ai-icon">🤖</span>
                    <h3>AI 学习助手</h3>
                    <span className="powered-by">DeepSeek</span>
                </div>
                <div className="header-actions">
                    <button
                        className="action-btn"
                        onClick={handleClearChat}
                        title="清空对话"
                    >
                        🗑️
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => setShowSettings(!showSettings)}
                        title="设置"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="settings-panel">
                    <h4>API 设置</h4>
                    {isApiKeySet ? (
                        <div className="api-key-status">
                            <span className="status-ok">✓ API Key 已设置</span>
                            <button
                                className="btn-small btn-danger"
                                onClick={handleRemoveApiKey}
                            >
                                删除
                            </button>
                        </div>
                    ) : (
                        <div className="api-key-input">
                            <input
                                type="password"
                                placeholder="输入 DeepSeek API Key"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                            />
                            <button
                                className="btn-small btn-primary"
                                onClick={handleSaveApiKey}
                            >
                                保存
                            </button>
                        </div>
                    )}
                    <p className="api-hint">
                        获取 API Key: <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer">platform.deepseek.com</a>
                    </p>
                </div>
            )}

            {/* Quick Actions */}
            {messages.length === 0 && (
                <div className="quick-actions">
                    <p className="quick-label">快速提问：</p>
                    <div className="action-buttons">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className="quick-btn"
                                onClick={() => setInputValue(action.prompt)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="messages-container">
                {messages.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <span className="empty-icon">💬</span>
                        <p>有任何日语学习问题，随时提问！</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.role}`}
                    >
                        <div className="message-avatar">
                            {msg.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                            {msg.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}

                            {/* Actions for assistant messages */}
                            {msg.role === 'assistant' && (
                                <div className="message-actions">
                                    {onSaveToNote && (
                                        <button
                                            className="msg-action-btn"
                                            onClick={() => onSaveToNote({
                                                title: messages[index - 1]?.content.substring(0, 20) + '...' || 'AI 笔记',
                                                content: msg.content,
                                                type: 'general'
                                            })}
                                            title="保存为笔记"
                                        >
                                            📝 存笔记
                                        </button>
                                    )}
                                    {onAddToVocabulary && (
                                        <button
                                            className="msg-action-btn"
                                            disabled={!!processingId}
                                            onClick={async () => {
                                                if (processingId) return;
                                                const msgId = `msg-${index}`;
                                                setProcessingId(msgId);

                                                try {
                                                    const prompt = `请分析以下日语讲解内容，提取核心单词，并整理为JSON格式返回。
要求格式：{"text": "单词(日文)", "reading": "假名读音", "meaning": "中文释义", "partOfSpeech": "词性"}
注意：
1. 仅返回纯JSON，不要包含markdown代码块或额外文字。
2. 如果有多个单词，只提取最核心的一个。
3. 释义要精简。

内容：
${msg.content}`;

                                                    const jsonStr = await sendChatMessage([{ role: 'user', content: prompt }]);

                                                    // Clean up markdown code blocks if present
                                                    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
                                                    const data = JSON.parse(cleanJson);

                                                    onAddToVocabulary({
                                                        id: `ai-${Date.now()}`,
                                                        text: data.text || 'AI生词',
                                                        reading: data.reading || '',
                                                        meaning: data.meaning || msg.content,
                                                        partOfSpeech: data.partOfSpeech || '',
                                                        pitch: []
                                                    });
                                                } catch (e) {
                                                    console.error('Failed to parse AI format', e);
                                                    alert('自动提取失败，将保存原始内容。');
                                                    // Fallback
                                                    const possibleWord = msg.content.split(/[:：\n]/)[0].substring(0, 15);
                                                    onAddToVocabulary({
                                                        id: `ai-fallback-${Date.now()}`,
                                                        text: possibleWord.length < 10 ? possibleWord : 'AI生词',
                                                        reading: '',
                                                        meaning: msg.content,
                                                        partOfSpeech: '',
                                                        pitch: []
                                                    });
                                                } finally {
                                                    setProcessingId(null);
                                                }
                                            }}
                                            title="智能提取并添加到生词本"
                                        >
                                            {processingId === `msg-${index}` ? '⏳ 整理中...' : '📚 存单词'}
                                        </button>
                                    )}
                                    {onAddToGrammar && (
                                        <button
                                            className="msg-action-btn"
                                            disabled={!!processingId}
                                            onClick={async () => {
                                                if (processingId) return;
                                                const msgId = `grammar-${index}`;
                                                setProcessingId(msgId);

                                                try {
                                                    const prompt = `请分析以下日语讲解内容，提取语法点，并整理为JSON格式返回。
要求格式：
{
  "pattern": "语法句型",
  "meaning": "简要含义",
  "level": "N5/N4/N3/N2/N1", 
  "notes": "详细解释(支持markdown换行)",
  "examples": [
    {"japanese": "日文例句1", "reading": "例句读音", "translation": "中文翻译"}
  ]
}
注意：
1. 仅返回纯JSON，不要包含markdown代码块。
2. 确保提取了至少一个例句，如果没有则生成一个合适的例句。

内容：
${msg.content}`;

                                                    const jsonStr = await sendChatMessage([{ role: 'user', content: prompt }]);
                                                    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
                                                    const data = JSON.parse(cleanJson);

                                                    onAddToGrammar({
                                                        id: `ai-grammar-${Date.now()}`,
                                                        pattern: data.pattern || 'AI语法',
                                                        meaning: data.meaning || '未知含义',
                                                        level: data.level || 'N5',
                                                        notes: data.notes || msg.content,
                                                        examples: data.examples || []
                                                    });
                                                } catch (e) {
                                                    console.error('Failed to parse AI format', e);
                                                    alert('自动提取失败，将保存原始内容。');
                                                    // Fallback
                                                    onAddToGrammar({
                                                        id: `ai-grammar-${Date.now()}`,
                                                        pattern: 'AI语法点',
                                                        meaning: msg.content.substring(0, 50) + '...',
                                                        level: 'N5',
                                                        notes: msg.content,
                                                        examples: []
                                                    });
                                                } finally {
                                                    setProcessingId(null);
                                                }
                                            }}
                                            title="智能提取并添加到语法库"
                                        >
                                            {processingId === `grammar-${index}` ? '⏳ 整理中...' : '📖 存语法'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message assistant loading">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isApiKeySet ? "输入问题... (Shift+Enter换行)" : "请先设置 API Key"}
                    disabled={!isApiKeySet || isLoading}
                    rows={2}
                />
                <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!isApiKeySet || isLoading || !inputValue.trim()}
                >
                    {isLoading ? '⏳' : '发送'}
                </button>
            </div>
        </div>
    );
};

export default AIChat;
