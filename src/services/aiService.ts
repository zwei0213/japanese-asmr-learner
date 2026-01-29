// DeepSeek AI Service - For Japanese learning assistance
// API Documentation: https://platform.deepseek.com/api-docs

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

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// System prompt for Japanese learning assistant
const JAPANESE_TUTOR_PROMPT = `你是一位专业的日语学习助手。你的任务是帮助用户学习日语，包括：
1. 解释日语语法和句型
2. 分析单词的读音、含义和用法
3. 提供例句和自然的表达方式
4. 解答关于日语学习的问题
5. 帮助理解ASMR或对话中的日语内容

请用中文回答问题，但在引用日语时请保留原文并提供读音（平假名）和中文翻译。
回答要简洁明了，适合语言学习者理解。`;

// Get API key from localStorage
export function getApiKey(): string | null {
    return localStorage.getItem('deepseek_api_key');
}

// Save API key to localStorage
export function setApiKey(key: string): void {
    localStorage.setItem('deepseek_api_key', key);
}

// Remove API key from localStorage
export function removeApiKey(): void {
    localStorage.removeItem('deepseek_api_key');
}

// Check if API key is set
export function hasApiKey(): boolean {
    const key = getApiKey();
    return !!key && key.length > 0;
}

// Send message to DeepSeek API
export async function sendChatMessage(
    messages: ChatMessage[],
    apiKey?: string
): Promise<string> {
    const key = apiKey || getApiKey();

    if (!key) {
        throw new Error('请先设置 DeepSeek API Key');
    }

    // Add system prompt if not present
    const fullMessages = messages[0]?.role === 'system'
        ? messages
        : [{ role: 'system' as const, content: JAPANESE_TUTOR_PROMPT }, ...messages];

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: fullMessages,
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) {
                throw new Error('API Key 无效，请检查后重试');
            } else if (response.status === 429) {
                throw new Error('请求过于频繁，请稍后再试');
            } else {
                throw new Error(errorData.error?.message || `API 请求失败 (${response.status})`);
            }
        }

        const data: ChatResponse = await response.json();
        return data.choices[0]?.message?.content || '无法获取回复';
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('网络错误，请检查网络连接');
    }
}

// Quick question about Japanese
export async function askAboutJapanese(question: string): Promise<string> {
    return sendChatMessage([
        { role: 'user', content: question }
    ]);
}

// Ask about a specific sentence
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

// Ask about a specific word
export async function explainWord(word: string): Promise<string> {
    return sendChatMessage([
        {
            role: 'user',
            content: `请解释这个日语词汇：「${word}」
请包括读音（平假名）、词性、含义和例句。`
        }
    ]);
}
