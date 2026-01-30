// Media Import Component - Import audio, video, text files with AI transcription
import React, { useRef, useState, useCallback } from 'react';
import type { Sentence } from '../../types';
import { parseSubtitleFile } from '../../utils/subtitleParser';
import { transcribeAudio, hasApiKey } from '../../services/aiService';
import { parseTextContent, parseSRT, parseVTT } from '../../services/textImportService';
import './AudioImport.css';

type ImportMode = 'audio' | 'video' | 'text';
type TranscribeStatus = 'idle' | 'loading' | 'success' | 'error';

interface AudioImportProps {
    onAudioImport: (audioUrl: string, fileName: string) => void;
    onSubtitleImport: (sentences: Sentence[], fileName: string) => void;
    currentAudioName?: string;
    currentSubtitleName?: string;
}

export const AudioImport: React.FC<AudioImportProps> = ({
    onAudioImport,
    onSubtitleImport,
    currentAudioName,
    currentSubtitleName,
}) => {
    const [activeMode, setActiveMode] = useState<ImportMode>('audio');
    const [isDraggingMedia, setIsDraggingMedia] = useState(false);
    const [isDraggingSubtitle, setIsDraggingSubtitle] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcribeStatus, setTranscribeStatus] = useState<TranscribeStatus>('idle');
    const [transcribeMessage, setTranscribeMessage] = useState('');
    const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);

    const mediaInputRef = useRef<HTMLInputElement>(null);
    const subtitleInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    // Handle audio/video file
    const handleMediaFile = useCallback((file: File) => {
        setError(null);

        const isAudio = file.type.startsWith('audio/');
        const isVideo = file.type.startsWith('video/');

        if (!isAudio && !isVideo) {
            setError('请上传音频或视频文件');
            return;
        }

        const maxSize = 500 * 1024 * 1024; // 500MB for video
        if (file.size > maxSize) {
            setError('文件大小不能超过500MB');
            return;
        }

        const mediaUrl = URL.createObjectURL(file);
        onAudioImport(mediaUrl, file.name);

        if (isVideo) {
            setCurrentVideoFile(file);
            setActiveMode('video');
        }
    }, [onAudioImport]);

    // Handle subtitle file
    const handleSubtitleFile = useCallback(async (file: File) => {
        setError(null);

        const validExtensions = ['srt', 'vtt', 'txt'];
        const extension = file.name.toLowerCase().split('.').pop() || '';

        if (!validExtensions.includes(extension)) {
            setError('请上传字幕文件（SRT、VTT格式）');
            return;
        }

        try {
            const content = await file.text();
            const sentences = parseSubtitleFile(content, file.name);

            if (sentences.length === 0) {
                setError('无法解析字幕文件，请检查格式');
                return;
            }

            onSubtitleImport(sentences, file.name);
        } catch (err) {
            setError('读取字幕文件失败');
            console.error(err);
        }
    }, [onSubtitleImport]);

    // Handle text file (Japanese text for learning)
    const handleTextFile = useCallback(async (file: File) => {
        setError(null);

        try {
            const content = await file.text();
            const fileName = file.name.toLowerCase();

            let segments;
            if (fileName.endsWith('.srt')) {
                segments = parseSRT(content);
            } else if (fileName.endsWith('.vtt')) {
                segments = parseVTT(content);
            } else {
                segments = parseTextContent(content, 'sentence');
            }

            // Convert to Sentence format
            const sentences: Sentence[] = segments.map((seg, index) => ({
                id: `text-${index}`,
                text: seg.content,
                reading: '',
                translation: '',
                startTime: seg.startTime,
                endTime: seg.endTime,
                words: [],
            }));

            if (sentences.length === 0) {
                setError('文本内容为空');
                return;
            }

            onSubtitleImport(sentences, file.name);
        } catch (err) {
            setError('读取文本文件失败');
            console.error(err);
        }
    }, [onSubtitleImport]);

    // AI Transcription
    const handleAITranscribe = useCallback(async () => {
        if (!currentVideoFile) {
            setError('请先导入视频或音频文件');
            return;
        }

        if (!hasApiKey()) {
            setError('请先配置 AI API Key（推荐 Gemini）');
            return;
        }

        setTranscribeStatus('loading');
        setTranscribeMessage('正在准备转录...');
        setError(null);

        try {
            const result = await transcribeAudio(currentVideoFile, (msg) => {
                setTranscribeMessage(msg);
            });

            if (result.segments.length === 0) {
                setError('未能识别到语音内容');
                setTranscribeStatus('error');
                return;
            }

            // Convert to Sentence format
            const sentences: Sentence[] = result.segments.map((seg, index) => ({
                id: `ai-${index}`,
                text: seg.content,
                reading: '',
                translation: '',
                startTime: seg.startTime,
                endTime: seg.endTime,
                words: [],
            }));

            onSubtitleImport(sentences, `${currentVideoFile.name}_AI转录`);
            setTranscribeStatus('success');
            setTranscribeMessage(`成功转录 ${sentences.length} 句`);
        } catch (err) {
            setError(err instanceof Error ? err.message : '转录失败');
            setTranscribeStatus('error');
        }
    }, [currentVideoFile, onSubtitleImport]);

    // Drag and drop handlers
    const handleDrop = useCallback((e: React.DragEvent, type: 'media' | 'subtitle' | 'text') => {
        e.preventDefault();
        setIsDraggingMedia(false);
        setIsDraggingSubtitle(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (type === 'media') {
                handleMediaFile(files[0]);
            } else if (type === 'subtitle') {
                handleSubtitleFile(files[0]);
            } else {
                handleTextFile(files[0]);
            }
        }
    }, [handleMediaFile, handleSubtitleFile, handleTextFile]);

    const handleDragOver = useCallback((e: React.DragEvent, type: 'media' | 'subtitle') => {
        e.preventDefault();
        if (type === 'media') {
            setIsDraggingMedia(true);
        } else {
            setIsDraggingSubtitle(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent, type: 'media' | 'subtitle') => {
        e.preventDefault();
        if (type === 'media') {
            setIsDraggingMedia(false);
        } else {
            setIsDraggingSubtitle(false);
        }
    }, []);

    return (
        <div className="media-import">
            {/* Mode Tabs */}
            <div className="import-tabs">
                <button
                    className={`tab-btn ${activeMode === 'audio' ? 'active' : ''}`}
                    onClick={() => setActiveMode('audio')}
                >
                    🎵 音频
                </button>
                <button
                    className={`tab-btn ${activeMode === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveMode('video')}
                >
                    🎬 视频
                </button>
                <button
                    className={`tab-btn ${activeMode === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveMode('text')}
                >
                    📄 文本
                </button>
            </div>

            <div className="import-grid">
                {/* Media Import Zone (Audio/Video) */}
                {(activeMode === 'audio' || activeMode === 'video') && (
                    <div
                        className={`drop-zone glass-card ${isDraggingMedia ? 'dragging' : ''} ${currentAudioName ? 'has-file' : ''}`}
                        onDrop={(e) => handleDrop(e, 'media')}
                        onDragOver={(e) => handleDragOver(e, 'media')}
                        onDragLeave={(e) => handleDragLeave(e, 'media')}
                        onClick={() => mediaInputRef.current?.click()}
                    >
                        <input
                            ref={mediaInputRef}
                            type="file"
                            accept={activeMode === 'video' ? 'video/*,audio/*' : 'audio/*'}
                            onChange={(e) => e.target.files?.[0] && handleMediaFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />

                        {currentAudioName ? (
                            <div className="file-info">
                                <span className="file-icon">{activeMode === 'video' ? '🎬' : '🎵'}</span>
                                <span className="file-name">{currentAudioName}</span>
                                <span className="change-hint">点击更换</span>
                            </div>
                        ) : (
                            <div className="upload-prompt">
                                <span className="upload-icon">{activeMode === 'video' ? '🎬' : '🎵'}</span>
                                <span className="upload-text">
                                    {isDraggingMedia ? '松开上传' : activeMode === 'video' ? '视频文件' : '音频文件'}
                                </span>
                                <span className="upload-hint">
                                    {activeMode === 'video' ? 'MP4、WebM等' : 'MP3、WAV等'}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Text Import Zone */}
                {activeMode === 'text' && (
                    <div
                        className={`drop-zone glass-card ${isDraggingMedia ? 'dragging' : ''}`}
                        onDrop={(e) => handleDrop(e, 'text')}
                        onDragOver={(e) => handleDragOver(e, 'media')}
                        onDragLeave={(e) => handleDragLeave(e, 'media')}
                        onClick={() => textInputRef.current?.click()}
                    >
                        <input
                            ref={textInputRef}
                            type="file"
                            accept=".txt,.srt,.vtt,.json"
                            onChange={(e) => e.target.files?.[0] && handleTextFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />

                        <div className="upload-prompt">
                            <span className="upload-icon">📄</span>
                            <span className="upload-text">日语文本</span>
                            <span className="upload-hint">TXT、SRT、VTT格式</span>
                        </div>
                    </div>
                )}

                {/* Subtitle Import Zone */}
                <div
                    className={`drop-zone glass-card ${isDraggingSubtitle ? 'dragging' : ''} ${currentSubtitleName ? 'has-file' : ''}`}
                    onDrop={(e) => handleDrop(e, 'subtitle')}
                    onDragOver={(e) => handleDragOver(e, 'subtitle')}
                    onDragLeave={(e) => handleDragLeave(e, 'subtitle')}
                    onClick={() => subtitleInputRef.current?.click()}
                >
                    <input
                        ref={subtitleInputRef}
                        type="file"
                        accept=".srt,.vtt,.txt"
                        onChange={(e) => e.target.files?.[0] && handleSubtitleFile(e.target.files[0])}
                        style={{ display: 'none' }}
                    />

                    {currentSubtitleName ? (
                        <div className="file-info">
                            <span className="file-icon">📝</span>
                            <span className="file-name">{currentSubtitleName}</span>
                            <span className="change-hint">点击更换</span>
                        </div>
                    ) : (
                        <div className="upload-prompt">
                            <span className="upload-icon">📝</span>
                            <span className="upload-text">
                                {isDraggingSubtitle ? '松开上传' : '字幕文件'}
                            </span>
                            <span className="upload-hint">SRT、VTT格式</span>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Transcription Button */}
            {(activeMode === 'video' || activeMode === 'audio') && currentAudioName && (
                <div className="ai-transcribe-section glass-card">
                    <div className="transcribe-header">
                        <span className="transcribe-icon">🤖</span>
                        <span className="transcribe-title">AI 字幕提取</span>
                    </div>
                    <p className="transcribe-desc">
                        没有字幕？使用 AI 自动识别语音内容
                    </p>
                    <button
                        className={`transcribe-btn ${transcribeStatus === 'loading' ? 'loading' : ''}`}
                        onClick={handleAITranscribe}
                        disabled={transcribeStatus === 'loading'}
                    >
                        {transcribeStatus === 'loading' ? (
                            <>
                                <span className="spinner"></span>
                                {transcribeMessage}
                            </>
                        ) : transcribeStatus === 'success' ? (
                            <>✅ {transcribeMessage}</>
                        ) : (
                            <>🎙️ 开始 AI 转录</>
                        )}
                    </button>
                    {!hasApiKey() && (
                        <p className="transcribe-warning">
                            ⚠️ 需要配置 Gemini API Key
                        </p>
                    )}
                </div>
            )}

            {error && (
                <div className="import-error">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* Status Summary */}
            {(currentAudioName || currentSubtitleName) && (
                <div className="import-status glass-card">
                    <div className="status-item">
                        <span className={`status-indicator ${currentAudioName ? 'active' : ''}`}></span>
                        <span>媒体: {currentAudioName || '未导入'}</span>
                    </div>
                    <div className="status-item">
                        <span className={`status-indicator ${currentSubtitleName ? 'active' : ''}`}></span>
                        <span>字幕: {currentSubtitleName || '未导入'}</span>
                    </div>
                </div>
            )}

            <div className="import-tips">
                <h4>💡 使用说明</h4>
                <ul>
                    {activeMode === 'audio' && (
                        <>
                            <li><strong>音频:</strong> 支持 MP3、WAV、OGG 格式</li>
                            <li><strong>字幕:</strong> 支持 SRT、VTT 格式</li>
                        </>
                    )}
                    {activeMode === 'video' && (
                        <>
                            <li><strong>视频:</strong> 支持 MP4、WebM 格式</li>
                            <li><strong>AI转录:</strong> 自动提取视频中的日语对话</li>
                        </>
                    )}
                    {activeMode === 'text' && (
                        <>
                            <li><strong>文本:</strong> 直接导入日语文章或小说</li>
                            <li>支持 TXT、SRT、VTT 格式</li>
                        </>
                    )}
                    <li>导入后可使用 AI 助手分析句子和词汇</li>
                </ul>
            </div>
        </div>
    );
};

export default AudioImport;
