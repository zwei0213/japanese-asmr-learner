// Media Import Service - Handle video/audio file transcription
// Supports: MP3, MP4, WAV, WebM, and other media formats

import { transcribeAudio } from './aiService';
import type { TranscriptionResult, TranscriptionSegment } from './aiService';

// =====================================
// Types
// =====================================

export interface MediaContent {
    id: string;
    title: string;
    mediaUrl: string;          // Object URL for playback
    mediaType: 'audio' | 'video';
    duration: number;
    segments: TranscriptionSegment[];
    transcribed: boolean;
    createdAt: string;
}

export interface TranscriptionProgress {
    phase: 'reading' | 'extracting' | 'transcribing' | 'processing' | 'done' | 'error';
    message: string;
    progress?: number;
}

// =====================================
// Media Processing
// =====================================

/**
 * Import media file and optionally transcribe
 */
export async function importMediaFile(
    file: File,
    onProgress?: (progress: TranscriptionProgress) => void
): Promise<MediaContent> {
    const id = crypto.randomUUID();
    const title = file.name.replace(/\.[^.]+$/, '');
    const mediaType = file.type.startsWith('video/') ? 'video' : 'audio';

    // Create object URL for playback
    const mediaUrl = URL.createObjectURL(file);

    // Get duration
    onProgress?.({ phase: 'reading', message: '读取媒体文件...' });
    const duration = await getMediaDuration(mediaUrl, mediaType);

    return {
        id,
        title,
        mediaUrl,
        mediaType,
        duration,
        segments: [],
        transcribed: false,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Transcribe media file using AI
 */
export async function transcribeMediaFile(
    file: File,
    onProgress?: (progress: TranscriptionProgress) => void
): Promise<TranscriptionResult> {
    onProgress?.({ phase: 'extracting', message: '准备音频数据...' });

    // For video files, we need to extract audio
    // For now, we'll send the file directly to the AI
    // (Gemini can handle both audio and video)

    let audioFile = file;

    // If it's a video, we can still send it to Gemini
    // but for better results, we could extract audio first
    if (file.type.startsWith('video/')) {
        onProgress?.({ phase: 'extracting', message: '处理视频文件...' });
        // Note: For now, Gemini can accept video directly
        // In the future, we could use FFmpeg via WebAssembly to extract audio
    }

    onProgress?.({ phase: 'transcribing', message: '正在转录...' });

    try {
        const result = await transcribeAudio(audioFile, (msg) => {
            onProgress?.({ phase: 'transcribing', message: msg });
        });

        onProgress?.({ phase: 'done', message: '转录完成!' });
        return result;
    } catch (error) {
        onProgress?.({
            phase: 'error',
            message: error instanceof Error ? error.message : '转录失败'
        });
        throw error;
    }
}

/**
 * Get media duration
 */
async function getMediaDuration(url: string, type: 'audio' | 'video'): Promise<number> {
    return new Promise((resolve, reject) => {
        const media = type === 'video'
            ? document.createElement('video')
            : document.createElement('audio');

        media.preload = 'metadata';

        media.onloadedmetadata = () => {
            resolve(media.duration);
            URL.revokeObjectURL(url);
        };

        media.onerror = () => {
            reject(new Error('无法读取媒体文件'));
        };

        media.src = url;
    });
}

/**
 * Extract audio from video using Web Audio API
 * Note: This is a basic implementation. For better quality,
 * consider using FFmpeg WebAssembly
 */
export async function extractAudioFromVideo(videoFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const videoUrl = URL.createObjectURL(videoFile);

        video.src = videoUrl;
        video.muted = true;

        video.onloadedmetadata = async () => {
            try {
                const audioContext = new AudioContext();
                const source = audioContext.createMediaElementSource(video);
                const destination = audioContext.createMediaStreamDestination();
                source.connect(destination);

                const mediaRecorder = new MediaRecorder(destination.stream, {
                    mimeType: 'audio/webm',
                });

                const chunks: Blob[] = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                    URL.revokeObjectURL(videoUrl);
                    resolve(audioBlob);
                };

                mediaRecorder.start();
                video.play();

                video.onended = () => {
                    mediaRecorder.stop();
                    audioContext.close();
                };
            } catch (error) {
                reject(error);
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(videoUrl);
            reject(new Error('无法加载视频'));
        };
    });
}

// =====================================
// Storage
// =====================================

const STORAGE_KEY = 'media_contents';

export function getMediaContents(): MediaContent[] {
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

export function saveMediaContent(content: MediaContent): void {
    const contents = getMediaContents();
    const existingIndex = contents.findIndex(c => c.id === content.id);

    // Don't store the blob URL, it won't persist
    const toStore = { ...content, mediaUrl: '' };

    if (existingIndex >= 0) {
        contents[existingIndex] = toStore;
    } else {
        contents.push(toStore);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
}

export function deleteMediaContent(id: string): void {
    const contents = getMediaContents().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
}

// =====================================
// Format Helpers
// =====================================

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
