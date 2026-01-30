// AI Chat Component - Japanese Learning Assistant with Multi-Provider Support
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
    sendChatMessage,
    streamChatMessage,
    hasApiKey,
    setApiKey,
    removeApiKey,
    getAIConfig,
    setAIConfig,
    testConnection
} from '../../services/aiService';
import type { ChatMessage, AIProvider, AIConfig } from '../../services/aiService';
import './AIChat.css';

interface AIChatProps {
    selectedText?: string;
    onAddToVocabulary?: (word: any) => void;
    onSaveToNote?: (note: { title: string; content: string; type: 'general' | 'word' | 'grammar' | 'sentence' }) => void;
    onAddToGrammar?: (grammar: any) => void;
}

const PROVIDERS: { id: AIProvider; name: string; hint: string }[] = [
    { id: 'deepseek', name: 'DeepSeek', hint: 'platform.deepseek.com' },
    { id: 'gemini', name: 'Gemini', hint: 'aistudio.google.com' },
    { id: 'openrouter', name: 'OpenRouter', hint: 'openrouter.ai' },
];

export const AIChat: React.FC<AIChatProps> = ({
    selectedText,
    onAddToVocabulary,
    onSaveToNote,
    onAddToGrammar,
}) => {
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('ai_chat_history', []);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isApiKeySet, setIsApiKeySet] = useState(hasApiKey());
    const [selectedProvider, setSelectedProvider] = useState<AIProvider>(() => {
        const config = getAIConfig();
        return config?.provider || 'deepseek';
    });
    const [modelInput, setModelInput] = useState(() => {
        const config = getAIConfig();
        return config?.model || '';
    });
    const [useStreaming, setUseStreaming] = useState(true);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    useEffect(() => {
        if (selectedText && selectedText.trim()) {
            setInputValue(`请解释：「${selectedText}」`);
            inputRef.current?.focus();
        }
    }, [selectedText]);

    // Update model input when provider changes if it's empty or using default
    useEffect(() => {
        const defaults: Record<string, string> = {
            deepseek: 'deepseek-chat',
            gemini: 'gemini-2.0-flash',
            openrouter: 'google/gemini-flash-1.5'
        };
        if (!modelInput || Object.values(defaults).includes(modelInput)) {
            setModelInput(defaults[selectedProvider] || '');
        }
    }, [selectedProvider]);

    const getModelSuggestions = (provider: AIProvider) => {
        switch (provider) {
            case 'deepseek': return ['deepseek-chat', 'deepseek-reasoner'];
            case 'gemini': return ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
            case 'openrouter': return ['google/gemini-flash-1.5', 'anthropic/claude-3-haiku', 'openai/gpt-4o-mini', 'deepseek/deepseek-r1'];
            default: return [];
        }
    };

    // Get current provider name
    const currentProviderName = PROVIDERS.find(p => p.id === selectedProvider)?.name || 'AI';

    const handleSendMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setStreamingContent('');
        setError(null);

        try {
            const conversationHistory = [...messages.slice(-10), userMessage];

            if (useStreaming && selectedProvider !== 'gemini') {
                // Streaming mode
                abortControllerRef.current = new AbortController();
                let fullContent = '';

                await streamChatMessage(
                    conversationHistory,
                    (chunk) => {
                        fullContent += chunk;
                        setStreamingContent(fullContent);
                    },
                    () => {
                        // On complete
                        const assistantMessage: ChatMessage = {
                            role: 'assistant',
                            content: fullContent
                        };
                        setMessages(prev => [...prev, assistantMessage]);
                        setStreamingContent('');
                    },
                    (err) => {
                        setError(err.message);
                    },
                    abortControllerRef.current.signal
                );
            } else {
                // Non-streaming mode
                const response = await sendChatMessage(conversationHistory);
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: response
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '发送失败';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setStreamingContent('');
        }
    }, [inputValue, isLoading, messages, setMessages, useStreaming, selectedProvider]);

    const handleStopStreaming = useCallback(() => {
        abortControllerRef.current?.abort();
        setIsLoading(false);
        if (streamingContent) {
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: streamingContent + ' [已停止]'
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingContent('');
        }
    }, [streamingContent, setMessages]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSaveSettings = () => {
        if (apiKeyInput.trim()) {
            const config: AIConfig = {
                provider: selectedProvider,
                apiKey: apiKeyInput.trim(),
                model: modelInput.trim() || undefined
            };
            setAIConfig(config);
            setApiKey(apiKeyInput.trim());
            setIsApiKeySet(true);
            setApiKeyInput('');
            setShowSettings(false);
            setTestResult(null);
        } else if (isApiKeySet) {
            // Allow updating model without re-entering key
            const currentConfig = getAIConfig();
            if (currentConfig) {
                setAIConfig({
                    ...currentConfig,
                    provider: selectedProvider,
                    model: modelInput.trim() || undefined
                });
                setShowSettings(false);
            }
        }
    };

    const handleRemoveApiKey = () => {
        removeApiKey();
        setIsApiKeySet(false);
        setApiKeyInput('');
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const success = await testConnection();
            setTestResult(success ? 'success' : 'failed');
        } catch {
            setTestResult('failed');
        } finally {
            setIsTesting(false);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setError(null);
        setStreamingContent('');
    };

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
                    <div className="provider-badge">
                        {currentProviderName}
                        <span className="model-badge">{modelInput}</span>
                    </div>
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
                <div className="settings-panel fade-in">
                    <div className="settings-header">
                        <h4>⚙️ AI 配置</h4>
                        <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
                    </div>

                    {/* Provider Selection */}
                    <div className="settings-section">
                        <label className="settings-label">选择 AI 提供商</label>
                        <div className="provider-grid">
                            {PROVIDERS.map(provider => (
                                <button
                                    key={provider.id}
                                    className={`provider-card ${selectedProvider === provider.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedProvider(provider.id);
                                        setTestResult(null);
                                    }}
                                >
                                    <span className="provider-name">{provider.name}</span>
                                    <span className="provider-hint">{provider.hint}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Selection */}
                    <div className="settings-section">
                        <label className="settings-label">模型名称 (Model ID)</label>
                        <div className="input-with-datalist">
                            <input
                                type="text"
                                list="model-suggestions"
                                value={modelInput}
                                onChange={(e) => setModelInput(e.target.value)}
                                placeholder="输入模型ID (如 deepseek-chat)"
                                className="model-input"
                            />
                            <datalist id="model-suggestions">
                                {getModelSuggestions(selectedProvider).map(model => (
                                    <option key={model} value={model} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="settings-section">
                        <label className="settings-label">API Key {isApiKeySet && <span className="tag-success">✓ 已设置</span>}</label>
                        {isApiKeySet ? (
                            <div className="api-actions">
                                <button className="btn-small btn-secondary" onClick={handleTestConnection} disabled={isTesting}>
                                    {isTesting ? '📡 测试中...' : '📡 测试连接'}
                                </button>
                                <button className="btn-small btn-danger" onClick={handleRemoveApiKey}>
                                    删除 Key
                                </button>
                            </div>
                        ) : (
                            <div className="api-input-group">
                                <input
                                    type="password"
                                    placeholder={`输入 ${PROVIDERS.find(p => p.id === selectedProvider)?.name} API Key`}
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    className="api-key-field"
                                />
                            </div>
                        )}
                        <p className="field-hint">
                            获取 Key: <a href={`https://${PROVIDERS.find(p => p.id === selectedProvider)?.hint}`} target="_blank" rel="noopener noreferrer">
                                {PROVIDERS.find(p => p.id === selectedProvider)?.hint}
                            </a>
                        </p>
                    </div>

                    {/* Streaming Toggle */}
                    <div className="settings-section checkbox-section">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={useStreaming}
                                onChange={(e) => setUseStreaming(e.target.checked)}
                            />
                            <span className="checkbox-text">启用流式响应 (打字机效果)</span>
                        </label>
                        {selectedProvider === 'gemini' && useStreaming && (
                            <p className="field-warning">* Gemini 暂不支持流式响应，将自动降级为普通模式</p>
                        )}
                    </div>

                    {testResult && (
                        <div className={`status-message ${testResult}`}>
                            {testResult === 'success' ? '✅ 连接成功!' : '❌ 连接失败，请检查 API Key'}
                        </div>
                    )}

                    <div className="settings-footer">
                        <button className="btn-primary full-width" onClick={handleSaveSettings}>
                            💾 保存配置
                        </button>
                    </div>
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

                {/* Streaming content */}
                {streamingContent && (
                    <div className="message assistant streaming">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            {streamingContent.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                            <span className="streaming-cursor">▌</span>
                        </div>
                    </div>
                )}

                {isLoading && !streamingContent && (
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
                {isLoading && streamingContent ? (
                    <button
                        className="send-btn stop-btn"
                        onClick={handleStopStreaming}
                    >
                        ⏹ 停止
                    </button>
                ) : (
                    <button
                        className="send-btn"
                        onClick={handleSendMessage}
                        disabled={!isApiKeySet || isLoading || !inputValue.trim()}
                    >
                        {isLoading ? '⏳' : '发送'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AIChat;
