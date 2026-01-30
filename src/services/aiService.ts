// AI Service - Multi-provider support with streaming
// Supports: DeepSeek, Google Gemini, OpenRouter

import { fetchEventSource } from '@microsoft/fetch-event-source';

// =====================================
// Types
// =====================================

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    id: string;
    choices: {
        message: ChatMessage;
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// AI Provider types
export type AIProvider = 'deepseek' | 'gemini' | 'openrouter';

export interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    model?: string;
}

// Structured analysis result
export interface StructuredAnalysis {
    translation: string;
    vocabulary: VocabularyExtraction[];
    grammarPoints: GrammarExtraction[];
    culturalContext?: string;
    difficulty?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    learningTips?: string;
}

export interface VocabularyExtraction {
    word: string;
    reading: string;
    meaning: string;
    partOfSpeech: string;
    usage?: string;
    example?: string;
}

export interface GrammarExtraction {
    pattern: string;
    explanation: string;
    example?: string;
}

// Transcription types
export interface TranscriptionSegment {
    startTime: number;
    endTime: number;
    content: string;
    speaker?: string;
}

export interface TranscriptionResult {
    segments: TranscriptionSegment[];
    fullText: string;
}

// =====================================
// API URLs
// =====================================

const API_URLS: Record<AIProvider, string> = {
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

const DEFAULT_MODELS: Record<AIProvider, string> = {
    deepseek: 'deepseek-chat',
    gemini: 'gemini-2.0-flash',
    openrouter: 'google/gemini-flash-1.5',
};

// =====================================
// System Prompts
// =====================================

const JAPANESE_TUTOR_PROMPT = `你是一位专业的日语学习助手。你的任务是帮助用户学习日语，包括：
1. 解释日语语法和句型
2. 分析单词的读音、含义和用法
3. 提供例句和自然的表达方式
4. 解答关于日语学习的问题
5. 帮助理解ASMR或对话中的日语内容

请用中文回答问题，但在引用日语时请保留原文并提供读音（平假名）和中文翻译。
回答要简洁明了，适合语言学习者理解。`;

const STRUCTURED_ANALYSIS_PROMPT = `请分析以下日语句子，并严格按照JSON格式返回结果。

要求：
1. 翻译要准确自然
2. 词汇分析要包含读音和词性
3. 语法点要详细解释

返回格式（必须是有效的JSON）：
{
  "translation": "中文翻译",
  "vocabulary": [
    { "word": "日语单词", "reading": "平假名读音", "meaning": "中文含义", "partOfSpeech": "词性", "usage": "用法说明" }
  ],
  "grammarPoints": [
    { "pattern": "语法结构", "explanation": "解释说明", "example": "例句" }
  ],
  "culturalContext": "文化背景（如有）",
  "difficulty": "N5/N4/N3/N2/N1",
  "learningTips": "学习建议"
}`;

const TRANSCRIPTION_PROMPT = `请将这段音频转录为文字，并严格按照以下JSON格式返回。

要求：
1. 按句子断句：每个segment只包含一个完整的句子
2. 句子的划分依据：遇到句号、问号、感叹号等句末标点，或自然的语音停顿时，应断开
3. 每个segment必须包含start(开始时间)和end(结束时间)字段，格式为MM:SS
4. 内容保持原文语言，不要翻译

返回格式示例：
{
  "segments": [
    { "start": "00:00", "end": "00:03", "content": "第一句话" },
    { "start": "00:03", "end": "00:06", "content": "第二句话" }
  ],
  "fullText": "完整的转录文本..."
}`;

// =====================================
// Config Management
// =====================================

const CONFIG_KEY = 'ai_config';
const LEGACY_KEY = 'deepseek_api_key';

export function getAIConfig(): AIConfig | null {
    const configStr = localStorage.getItem(CONFIG_KEY);
    if (configStr) {
        try {
            return JSON.parse(configStr);
        } catch {
            return null;
        }
    }
    // Fallback to legacy DeepSeek key
    const legacyKey = localStorage.getItem(LEGACY_KEY);
    if (legacyKey) {
        return { provider: 'deepseek', apiKey: legacyKey };
    }
    return null;
}

export function setAIConfig(config: AIConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getApiKey(): string | null {
    const config = getAIConfig();
    return config?.apiKey || null;
}

export function setApiKey(key: string): void {
    const config = getAIConfig() || { provider: 'deepseek', apiKey: '' };
    config.apiKey = key;
    setAIConfig(config);
    // Also set legacy for backward compatibility
    localStorage.setItem(LEGACY_KEY, key);
}

export function removeApiKey(): void {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(LEGACY_KEY);
}

export function hasApiKey(): boolean {
    const key = getApiKey();
    return !!key && key.length > 0;
}

// =====================================
// Core API Functions
// =====================================

/**
 * Send a chat message (non-streaming)
 */
export async function sendChatMessage(
    messages: ChatMessage[],
    apiKey?: string
): Promise<string> {
    const config = getAIConfig();
    const key = apiKey || config?.apiKey;
    const provider = config?.provider || 'deepseek';
    const model = config?.model || DEFAULT_MODELS[provider];

    if (!key) {
        throw new Error('请先设置 API Key');
    }

    const fullMessages = messages[0]?.role === 'system'
        ? messages
        : [{ role: 'system' as const, content: JAPANESE_TUTOR_PROMPT }, ...messages];

    try {
        let response: Response;
        
        if (provider === 'gemini') {
            response = await callGeminiAPI(key, model, fullMessages);
        } else {
            response = await callOpenAICompatibleAPI(provider, key, model, fullMessages);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            handleAPIError(response.status, errorData);
        }

        return await extractResponseContent(provider, response);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('网络错误，请检查网络连接');
    }
}

/**
 * Send a chat message with streaming response
 */
export async function streamChatMessage(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void,
    signal?: AbortSignal
): Promise<void> {
    const config = getAIConfig();
    const key = config?.apiKey;
    const provider = config?.provider || 'deepseek';
    const model = config?.model || DEFAULT_MODELS[provider];

    if (!key) {
        throw new Error('请先设置 API Key');
    }

    const fullMessages = messages[0]?.role === 'system'
        ? messages
        : [{ role: 'system' as const, content: JAPANESE_TUTOR_PROMPT }, ...messages];

    // Gemini doesn't support SSE in the same way, fall back to non-streaming
    if (provider === 'gemini') {
        try {
            const result = await sendChatMessage(messages);
            onChunk(result);
            onComplete?.();
        } catch (error) {
            onError?.(error as Error);
        }
        return;
    }

    const apiUrl = API_URLS[provider];

    await fetchEventSource(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
            model,
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
        }),
        signal,
        onmessage(event) {
            if (event.data === '[DONE]') {
                onComplete?.();
                return;
            }
            try {
                const data = JSON.parse(event.data);
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                    onChunk(content);
                }
            } catch {
                // Ignore parse errors for incomplete chunks
            }
        },
        onerror(error) {
            onError?.(error as Error);
            throw error; // Stop retrying
        },
    });
}

// =====================================
// Structured Analysis
// =====================================

/**
 * Analyze a Japanese sentence and return structured data
 */
export async function analyzeSentenceStructured(
    sentence: string
): Promise<StructuredAnalysis> {
    const prompt = `${STRUCTURED_ANALYSIS_PROMPT}\n\n句子：「${sentence}」`;
    
    const response = await sendChatMessage([
        { role: 'user', content: prompt }
    ]);

    return parseStructuredResponse(response);
}

/**
 * Parse structured JSON response from AI
 */
function parseStructuredResponse(response: string): StructuredAnalysis {
    // Try to extract JSON from the response
    const jsonStr = extractJSON(response);
    
    try {
        const parsed = JSON.parse(jsonStr);
        return {
            translation: parsed.translation || '',
            vocabulary: parsed.vocabulary || [],
            grammarPoints: parsed.grammarPoints || parsed.grammar_points || [],
            culturalContext: parsed.culturalContext || parsed.cultural_context,
            difficulty: parsed.difficulty,
            learningTips: parsed.learningTips || parsed.learning_tips,
        };
    } catch {
        // If parsing fails, return a basic structure with the raw response
        return {
            translation: response,
            vocabulary: [],
            grammarPoints: [],
        };
    }
}

/**
 * Extract JSON from a text that might contain markdown code blocks
 */
function extractJSON(content: string): string {
    // Try markdown code block
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }

    // Try generic code block
    const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
        return codeMatch[1].trim();
    }

    // Try finding JSON object directly
    const braceMatch = content.match(/\{[\s\S]*\}/);
    if (braceMatch) {
        return braceMatch[0];
    }

    return content.trim();
}

// =====================================
// Audio/Video Transcription
// =====================================

/**
 * Transcribe audio using Gemini multimodal API
 */
export async function transcribeAudio(
    audioFile: File,
    onProgress?: (message: string) => void
): Promise<TranscriptionResult> {
    const config = getAIConfig();
    
    // Prefer Gemini for transcription
    let provider = config?.provider;
    let apiKey = config?.apiKey;
    
    // Check for Gemini key
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (geminiKey) {
        provider = 'gemini';
        apiKey = geminiKey;
    }
    
    if (!apiKey) {
        throw new Error('请先设置 API Key（推荐使用 Gemini 以支持音频转录）');
    }

    onProgress?.('正在读取音频文件...');
    
    // Convert file to base64
    const audioBase64 = await fileToBase64(audioFile);
    const mimeType = audioFile.type || 'audio/mpeg';
    
    onProgress?.('正在转录音频...');

    if (provider === 'gemini') {
        return transcribeWithGemini(apiKey, audioBase64, mimeType);
    } else {
        // For other providers, we need to use their audio capabilities if available
        throw new Error('当前 AI 提供商不支持音频转录，请配置 Gemini API Key');
    }
}

/**
 * Transcribe using Gemini multimodal API
 */
async function transcribeWithGemini(
    apiKey: string,
    audioBase64: string,
    mimeType: string
): Promise<TranscriptionResult> {
    const model = 'gemini-2.0-flash';
    const url = `${API_URLS.gemini}/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: audioBase64,
                        },
                    },
                    {
                        text: TRANSCRIPTION_PROMPT,
                    },
                ],
            }],
            generationConfig: {
                response_mime_type: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `转录失败 (${response.status})`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return parseTranscriptionResponse(content);
}

/**
 * Parse transcription response
 */
function parseTranscriptionResponse(content: string): TranscriptionResult {
    if (!content.trim()) {
        return { segments: [], fullText: '' };
    }

    const jsonStr = extractJSON(content);
    
    try {
        const parsed = JSON.parse(jsonStr);
        const segments: TranscriptionSegment[] = (parsed.segments || []).map((seg: {
            start?: string;
            end?: string;
            timestamp?: string;
            content?: string;
            text?: string;
            speaker?: string;
        }) => ({
            startTime: parseTimeStr(seg.start || seg.timestamp || '00:00'),
            endTime: parseTimeStr(seg.end || seg.timestamp || '00:00'),
            content: seg.content || seg.text || '',
            speaker: seg.speaker,
        }));

        return {
            segments,
            fullText: parsed.fullText || parsed.full_text || segments.map(s => s.content).join(' '),
        };
    } catch {
        return { segments: [], fullText: content };
    }
}

/**
 * Parse time string (MM:SS or HH:MM:SS) to seconds
 */
function parseTimeStr(timeStr: string): number {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

/**
 * Convert file to base64
 */
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// =====================================
// Helper Functions
// =====================================

async function callGeminiAPI(
    apiKey: string,
    model: string,
    messages: ChatMessage[]
): Promise<Response> {
    const url = `${API_URLS.gemini}/${model}:generateContent?key=${apiKey}`;
    
    // Convert messages to Gemini format
    const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

    // Add system instruction if present
    const systemMessage = messages.find(m => m.role === 'system');
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents,
            systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
        }),
    });
}

async function callOpenAICompatibleAPI(
    provider: AIProvider,
    apiKey: string,
    model: string,
    messages: ChatMessage[]
): Promise<Response> {
    const apiUrl = API_URLS[provider];
    
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
        }),
    });
}

async function extractResponseContent(
    provider: AIProvider,
    response: Response
): Promise<string> {
    const data = await response.json();
    
    if (provider === 'gemini') {
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
        return data.choices?.[0]?.message?.content || '';
    }
}

function handleAPIError(status: number, errorData: Record<string, unknown>): never {
    if (status === 401) {
        throw new Error('API Key 无效，请检查后重试');
    } else if (status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
    } else {
        const message = (errorData.error as { message?: string })?.message || `API 请求失败 (${status})`;
        throw new Error(message);
    }
}

// =====================================
// Convenience Functions
// =====================================

export async function askAboutJapanese(question: string): Promise<string> {
    return sendChatMessage([
        { role: 'user', content: question }
    ]);
}

export async function explainSentence(sentence: string): Promise<string> {
    return sendChatMessage([
        {
            role: 'user',
            content: `请详细分析这个日语句子：「${sentence}」
请包括：
1. 逐词分析（包括读音和词性）
2. 语法结构
3. 整句翻译
4. 文化背景或使用场景（如有）`
        }
    ]);
}

export async function explainWord(word: string): Promise<string> {
    return sendChatMessage([
        {
            role: 'user',
            content: `请解释这个日语词汇：「${word}」
请包括读音（平假名）、词性、含义和例句。`
        }
    ]);
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
    try {
        const response = await sendChatMessage([
            { role: 'user', content: 'こんにちは' }
        ]);
        return !!response;
    } catch {
        return false;
    }
}
