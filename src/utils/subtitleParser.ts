// Subtitle Parser Utility - Parse SRT/VTT subtitle files
import type { Sentence, Word } from '../types';

interface SubtitleEntry {
    id: number;
    startTime: number;
    endTime: number;
    text: string;
}

// Parse SRT time format: "00:00:01,500" -> seconds
function parseSrtTime(timeStr: string): number {
    const cleanTime = timeStr.trim().replace(',', '.');
    const parts = cleanTime.split(':');

    if (parts.length === 3) {
        const hours = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        const seconds = parseFloat(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
        const minutes = parseFloat(parts[0]);
        const seconds = parseFloat(parts[1]);
        return minutes * 60 + seconds;
    }

    return parseFloat(cleanTime) || 0;
}

// Parse VTT time format: "00:00:01.500" -> seconds
function parseVttTime(timeStr: string): number {
    return parseSrtTime(timeStr); // Same logic works for both
}

// Detect if text is Japanese (utility for future use)
export function isJapanese(text: string): boolean {
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

// Split Japanese text into words (improved tokenization)
// Creates clickable segments for dictionary lookup
function tokenizeJapanese(text: string, sentenceId: string): Word[] {
    const words: Word[] = [];
    let wordIndex = 0;

    // Regular expressions for character types
    const kanjiPattern = /[\u4E00-\u9FAF\u3400-\u4DBF]/;
    const hiraganaPattern = /[\u3040-\u309F]/;
    const katakanaPattern = /[\u30A0-\u30FF]/;
    const punctPattern = /[。、！？「」『』（）・…\.\,\!\?\(\)\[\]]/;

    // Common particles and auxiliaries (single hiragana that are usually standalone)
    const particles = new Set(['は', 'が', 'を', 'に', 'の', 'で', 'へ', 'と', 'や', 'も', 'か', 'ね', 'よ', 'わ', 'な', 'ば', 'て', 'た', 'だ']);

    let i = 0;
    while (i < text.length) {
        const char = text[i];

        // Skip whitespace
        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // Handle punctuation
        if (punctPattern.test(char)) {
            i++;
            continue;
        }

        let segment = '';
        let segmentType = '';

        // Determine the type of current character
        if (kanjiPattern.test(char)) {
            segmentType = 'kanji';
        } else if (hiraganaPattern.test(char)) {
            segmentType = 'hiragana';
        } else if (katakanaPattern.test(char)) {
            segmentType = 'katakana';
        } else {
            segmentType = 'other';
        }

        if (segmentType === 'kanji') {
            // Collect kanji + following hiragana (okurigana pattern)
            while (i < text.length && kanjiPattern.test(text[i])) {
                segment += text[i];
                i++;
            }
            // Include trailing hiragana (okurigana) up to particles
            let hiraganaBuffer = '';
            let tempI = i;
            while (tempI < text.length && hiraganaPattern.test(text[tempI])) {
                hiraganaBuffer += text[tempI];
                // Stop at particles
                if (particles.has(hiraganaBuffer)) {
                    break;
                }
                tempI++;
            }
            // Only include hiragana if it looks like okurigana (not a standalone particle)
            if (hiraganaBuffer && !particles.has(hiraganaBuffer)) {
                segment += hiraganaBuffer;
                i = tempI;
            }
        } else if (segmentType === 'katakana') {
            // Collect consecutive katakana (loanwords)
            while (i < text.length && (katakanaPattern.test(text[i]) || text[i] === 'ー')) {
                segment += text[i];
                i++;
            }
        } else if (segmentType === 'hiragana') {
            // Check if it's a particle first
            if (particles.has(char)) {
                segment = char;
                i++;
            } else {
                // Collect hiragana until a particle or different type
                while (i < text.length && hiraganaPattern.test(text[i])) {
                    segment += text[i];
                    i++;
                    // Check if we've hit a particle
                    if (particles.has(segment)) {
                        break;
                    }
                }
            }
        } else {
            // Other characters (romaji, numbers)
            while (i < text.length && !kanjiPattern.test(text[i]) &&
                !hiraganaPattern.test(text[i]) && !katakanaPattern.test(text[i]) &&
                !punctPattern.test(text[i]) && !/\s/.test(text[i])) {
                segment += text[i];
                i++;
            }
        }

        if (segment) {
            words.push(createWord(segment, `${sentenceId}-w${wordIndex}`));
            wordIndex++;
        }
    }

    return words;
}

function createWord(text: string, id: string): Word {
    return {
        id,
        text,
        reading: '',
        meaning: '点击查看更多',
        partOfSpeech: '',
        pitch: [],
    };
}

// Parse SRT format
export function parseSRT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const blocks = content.trim().split(/\n\n+/);

    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 3) continue;

        // First line is the index
        const id = parseInt(lines[0], 10);
        if (isNaN(id)) continue;

        // Second line is the timestamp
        const timeMatch = lines[1].match(/(\d{1,2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{3})/);
        if (!timeMatch) continue;

        const startTime = parseSrtTime(timeMatch[1]);
        const endTime = parseSrtTime(timeMatch[2]);

        // Rest is the text (can be multiple lines)
        const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '').trim();

        if (text) {
            entries.push({ id, startTime, endTime, text });
        }
    }

    return entries;
}

// Parse VTT format
export function parseVTT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    let lines = content.split('\n');

    // Skip WEBVTT header and any metadata
    let i = 0;
    while (i < lines.length && !lines[i].includes('-->')) {
        i++;
    }

    let entryId = 1;
    while (i < lines.length) {
        const line = lines[i].trim();

        // Look for timestamp line
        const timeMatch = line.match(/(\d{1,2}:\d{2}:\d{2}[\.,]\d{3}|\d{1,2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[\.,]\d{3}|\d{1,2}:\d{2}[\.,]\d{3})/);

        if (timeMatch) {
            const startTime = parseVttTime(timeMatch[1]);
            const endTime = parseVttTime(timeMatch[2]);

            // Collect text lines until empty line or next timestamp
            const textLines: string[] = [];
            i++;
            while (i < lines.length && lines[i].trim() && !lines[i].includes('-->')) {
                textLines.push(lines[i].trim());
                i++;
            }

            const text = textLines.join(' ').replace(/<[^>]*>/g, '').trim();
            if (text) {
                entries.push({ id: entryId++, startTime, endTime, text });
            }
        } else {
            i++;
        }
    }

    return entries;
}

// Convert subtitle entries to Sentence[] format
export function subtitlesToSentences(entries: SubtitleEntry[]): Sentence[] {
    return entries.map((entry) => {
        const sentenceId = `sub-${entry.id}`;
        const words = tokenizeJapanese(entry.text, sentenceId);

        return {
            id: sentenceId,
            text: entry.text,
            reading: '', // Would need phonetic converter
            translation: '', // Would need translation service
            startTime: entry.startTime,
            endTime: entry.endTime,
            words: words.length > 0 ? words : [createWord(entry.text, `${sentenceId}-w0`)],
        };
    });
}

// Auto-detect and parse subtitle file
export function parseSubtitleFile(content: string, fileName: string): Sentence[] {
    const extension = fileName.toLowerCase().split('.').pop();

    let entries: SubtitleEntry[];

    if (extension === 'vtt') {
        entries = parseVTT(content);
    } else {
        // Default to SRT parsing
        entries = parseSRT(content);
    }

    return subtitlesToSentences(entries);
}

export type { SubtitleEntry };
