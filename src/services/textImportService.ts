// Text Import Service - Import text content for learning
// Supports: Plain text, SRT/VTT subtitles, structured JSON

import type { TranscriptionSegment, TranscriptionResult } from './aiService';

// =====================================
// Types
// =====================================

export interface TextContent {
    id: string;
    title: string;
    content: string;
    segments: TranscriptionSegment[];
    sourceType: 'text' | 'srt' | 'vtt' | 'json';
    createdAt: string;
}

// =====================================
// Text Parsing
// =====================================

/**
 * Parse plain text into segments (by paragraph or sentence)
 */
export function parseTextContent(
    text: string,
    splitBy: 'paragraph' | 'sentence' = 'sentence'
): TranscriptionSegment[] {
    if (splitBy === 'paragraph') {
        return text
            .split(/\n\s*\n/)
            .filter(p => p.trim())
            .map((content, index) => ({
                startTime: index,
                endTime: index + 1,
                content: content.trim(),
            }));
    }

    // Split by sentence (Japanese sentence endings)
    const sentences = text
        .split(/(?<=[。！？\n])|(?<=\. )|(?<=! )|(?<=\? )/)
        .filter(s => s.trim())
        .map(s => s.trim());

    return sentences.map((content, index) => ({
        startTime: index,
        endTime: index + 1,
        content,
    }));
}

/**
 * Parse SRT subtitle file
 */
export function parseSRT(content: string): TranscriptionSegment[] {
    const segments: TranscriptionSegment[] = [];
    const blocks = content.trim().split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length < 2) continue;

        // Find timestamp line (format: 00:00:00,000 --> 00:00:00,000)
        const timestampLine = lines.find(l => l.includes('-->'));
        if (!timestampLine) continue;

        const [startStr, endStr] = timestampLine.split('-->').map(s => s.trim());
        const startTime = parseSRTTime(startStr);
        const endTime = parseSRTTime(endStr);

        // Get content (all lines after timestamp)
        const timestampIndex = lines.indexOf(timestampLine);
        const textLines = lines.slice(timestampIndex + 1);
        const text = textLines.join(' ').replace(/<[^>]*>/g, ''); // Remove HTML tags

        if (text.trim()) {
            segments.push({
                startTime,
                endTime,
                content: text.trim(),
            });
        }
    }

    return segments;
}

/**
 * Parse VTT subtitle file
 */
export function parseVTT(content: string): TranscriptionSegment[] {
    // Remove WEBVTT header and any style blocks
    let cleaned = content.replace(/^WEBVTT.*\n/i, '');
    cleaned = cleaned.replace(/STYLE\s*\n[\s\S]*?(?=\n\n|\n[0-9])/g, '');
    cleaned = cleaned.replace(/NOTE[\s\S]*?\n\n/g, '');

    const segments: TranscriptionSegment[] = [];
    const blocks = cleaned.trim().split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length === 0) continue;

        // Find timestamp line (format: 00:00:00.000 --> 00:00:00.000)
        const timestampLine = lines.find(l => l.includes('-->'));
        if (!timestampLine) continue;

        const [startStr, endStr] = timestampLine.split('-->').map(s => s.trim().split(' ')[0]);
        const startTime = parseVTTTime(startStr);
        const endTime = parseVTTTime(endStr);

        // Get content
        const timestampIndex = lines.indexOf(timestampLine);
        const textLines = lines.slice(timestampIndex + 1);
        const text = textLines.join(' ').replace(/<[^>]*>/g, ''); // Remove tags

        if (text.trim()) {
            segments.push({
                startTime,
                endTime,
                content: text.trim(),
            });
        }
    }

    return segments;
}

/**
 * Parse SRT timestamp (00:00:00,000) to seconds
 */
function parseSRTTime(timeStr: string): number {
    const match = timeStr.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
    if (!match) return 0;

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    const milliseconds = parseInt(match[4]);

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Parse VTT timestamp (00:00:00.000 or 00:00.000) to seconds
 */
function parseVTTTime(timeStr: string): number {
    const parts = timeStr.split(':');

    if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseFloat(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const seconds = parseFloat(parts[1]);
        return minutes * 60 + seconds;
    }

    return 0;
}

/**
 * Auto-detect file type and parse accordingly
 */
export async function parseSubtitleFile(file: File): Promise<TranscriptionResult> {
    const content = await file.text();
    const fileName = file.name.toLowerCase();

    let segments: TranscriptionSegment[];

    if (fileName.endsWith('.srt')) {
        segments = parseSRT(content);
    } else if (fileName.endsWith('.vtt')) {
        segments = parseVTT(content);
    } else if (fileName.endsWith('.json')) {
        try {
            const parsed = JSON.parse(content);
            segments = (parsed.segments || parsed).map((s: {
                startTime?: number;
                start_time?: number;
                start?: number;
                endTime?: number;
                end_time?: number;
                end?: number;
                content?: string;
                text?: string;
            }) => ({
                startTime: s.startTime || s.start_time || s.start || 0,
                endTime: s.endTime || s.end_time || s.end || 0,
                content: s.content || s.text || '',
            }));
        } catch {
            segments = parseTextContent(content, 'sentence');
        }
    } else {
        // Plain text
        segments = parseTextContent(content, 'sentence');
    }

    return {
        segments,
        fullText: segments.map(s => s.content).join(' '),
    };
}

// =====================================
// Text Content Management
// =====================================

const STORAGE_KEY = 'text_contents';

export function getTextContents(): TextContent[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

export function saveTextContent(content: TextContent): void {
    const contents = getTextContents();
    const existingIndex = contents.findIndex(c => c.id === content.id);

    if (existingIndex >= 0) {
        contents[existingIndex] = content;
    } else {
        contents.push(content);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
}

export function deleteTextContent(id: string): void {
    const contents = getTextContents().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
}

export function createTextContent(
    title: string,
    text: string,
    sourceType: TextContent['sourceType'] = 'text'
): TextContent {
    const segments = parseTextContent(text, 'sentence');

    return {
        id: crypto.randomUUID(),
        title,
        content: text,
        segments,
        sourceType,
        createdAt: new Date().toISOString(),
    };
}
