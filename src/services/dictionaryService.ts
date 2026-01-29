// Dictionary Service - Using Jisho.org API (based on JMdict)
// JMdict is a comprehensive Japanese-English dictionary maintained by the EDRDG

export interface DictionaryEntry {
    word: string;
    reading: string;
    meanings: string[];
    partOfSpeech: string[];
    isCommon: boolean;
    jlptLevel?: string;
    pitch?: number[];
}

export interface JishoResponse {
    data: JishoWord[];
}

interface JishoWord {
    slug: string;
    is_common: boolean;
    tags: string[];
    jlpt: string[];
    japanese: {
        word?: string;
        reading: string;
    }[];
    senses: {
        english_definitions: string[];
        parts_of_speech: string[];
        tags: string[];
        info: string[];
    }[];
}

// Cache for dictionary lookups
const cache = new Map<string, DictionaryEntry | null>();

// CORS proxy options - Jisho doesn't support CORS directly
// We'll use a public CORS proxy or fall back to local data
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
];

const JISHO_API = 'https://jisho.org/api/v1/search/words';

async function fetchWithProxy(url: string): Promise<Response> {
    // Try direct fetch first (may work in some environments)
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) return response;
    } catch {
        // Direct fetch failed, try proxies
    }

    // Try each proxy
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            if (response.ok) return response;
        } catch {
            continue;
        }
    }

    throw new Error('All fetch attempts failed');
}

// Parse Jisho response to our format
function parseJishoResponse(data: JishoWord[], searchTerm: string): DictionaryEntry | null {
    if (!data || data.length === 0) return null;

    // Find the best match
    const exactMatch = data.find(word =>
        word.japanese.some(jp => jp.word === searchTerm || jp.reading === searchTerm)
    );

    const entry = exactMatch || data[0];
    const japanese = entry.japanese[0];
    const sense = entry.senses[0];

    return {
        word: japanese.word || japanese.reading,
        reading: japanese.reading,
        meanings: sense.english_definitions,
        partOfSpeech: sense.parts_of_speech,
        isCommon: entry.is_common,
        jlptLevel: entry.jlpt[0] || undefined,
    };
}

// Main lookup function
export async function lookupWord(word: string): Promise<DictionaryEntry | null> {
    // Check cache first
    if (cache.has(word)) {
        return cache.get(word) || null;
    }

    try {
        const url = `${JISHO_API}?keyword=${encodeURIComponent(word)}`;
        const response = await fetchWithProxy(url);
        const json: JishoResponse = await response.json();

        const entry = parseJishoResponse(json.data, word);
        cache.set(word, entry);
        return entry;
    } catch (error) {
        console.error('Dictionary lookup failed:', error);
        cache.set(word, null);
        return null;
    }
}

// Batch lookup for multiple words
export async function lookupWords(words: string[]): Promise<Map<string, DictionaryEntry | null>> {
    const results = new Map<string, DictionaryEntry | null>();

    // Process in parallel with concurrency limit
    const batchSize = 3;
    for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        const promises = batch.map(async word => {
            const entry = await lookupWord(word);
            results.set(word, entry);
        });
        await Promise.all(promises);
    }

    return results;
}

// Format part of speech for display
export function formatPartOfSpeech(parts: string[]): string {
    const translations: Record<string, string> = {
        'Noun': '名詞',
        'Verb': '動詞',
        'Adjective': '形容詞',
        'Adverb': '副詞',
        'Particle': '助詞',
        'Pronoun': '代名詞',
        'Conjunction': '接続詞',
        'Interjection': '感動詞',
        'Expression': '表現',
        'Godan verb': '五段動詞',
        'Ichidan verb': '一段動詞',
        'Suru verb': 'する動詞',
        'I-adjective': 'い形容詞',
        'Na-adjective': 'な形容詞',
    };

    return parts.map(p => {
        for (const [eng, jp] of Object.entries(translations)) {
            if (p.toLowerCase().includes(eng.toLowerCase())) {
                return jp;
            }
        }
        return p;
    }).join('、');
}

// Format JLPT level for display
export function formatJlptLevel(level?: string): string {
    if (!level) return '';
    return level.toUpperCase().replace('jlpt-', 'JLPT ');
}
