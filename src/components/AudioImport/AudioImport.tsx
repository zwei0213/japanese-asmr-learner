// Media Import Component - Allow users to import MP3 and Subtitle files
import React, { useRef, useState, useCallback } from 'react';
import type { Sentence } from '../../types';
import { parseSubtitleFile } from '../../utils/subtitleParser';
import './AudioImport.css';

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
    const [isDraggingAudio, setIsDraggingAudio] = useState(false);
    const [isDraggingSubtitle, setIsDraggingSubtitle] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const subtitleInputRef = useRef<HTMLInputElement>(null);

    const handleAudioFile = useCallback((file: File) => {
        setError(null);

        if (!file.type.includes('audio')) {
            setError('请上传音频文件（MP3、WAV等）');
            return;
        }

        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('文件大小不能超过100MB');
            return;
        }

        const audioUrl = URL.createObjectURL(file);
        onAudioImport(audioUrl, file.name);
    }, [onAudioImport]);

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

    const handleDrop = useCallback((e: React.DragEvent, type: 'audio' | 'subtitle') => {
        e.preventDefault();
        setIsDraggingAudio(false);
        setIsDraggingSubtitle(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (type === 'audio') {
                handleAudioFile(files[0]);
            } else {
                handleSubtitleFile(files[0]);
            }
        }
    }, [handleAudioFile, handleSubtitleFile]);

    const handleDragOver = useCallback((e: React.DragEvent, type: 'audio' | 'subtitle') => {
        e.preventDefault();
        if (type === 'audio') {
            setIsDraggingAudio(true);
        } else {
            setIsDraggingSubtitle(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent, type: 'audio' | 'subtitle') => {
        e.preventDefault();
        if (type === 'audio') {
            setIsDraggingAudio(false);
        } else {
            setIsDraggingSubtitle(false);
        }
    }, []);

    return (
        <div className="media-import">
            <div className="import-grid">
                {/* Audio Import Zone */}
                <div
                    className={`drop-zone glass-card ${isDraggingAudio ? 'dragging' : ''} ${currentAudioName ? 'has-file' : ''}`}
                    onDrop={(e) => handleDrop(e, 'audio')}
                    onDragOver={(e) => handleDragOver(e, 'audio')}
                    onDragLeave={(e) => handleDragLeave(e, 'audio')}
                    onClick={() => audioInputRef.current?.click()}
                >
                    <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && handleAudioFile(e.target.files[0])}
                        style={{ display: 'none' }}
                    />

                    {currentAudioName ? (
                        <div className="file-info">
                            <span className="file-icon">🎵</span>
                            <span className="file-name">{currentAudioName}</span>
                            <span className="change-hint">点击更换</span>
                        </div>
                    ) : (
                        <div className="upload-prompt">
                            <span className="upload-icon">🎵</span>
                            <span className="upload-text">
                                {isDraggingAudio ? '松开上传' : '音频文件'}
                            </span>
                            <span className="upload-hint">MP3、WAV等</span>
                        </div>
                    )}
                </div>

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
                        <span>音频: {currentAudioName || '未导入'}</span>
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
                    <li><strong>音频:</strong> 支持 MP3、WAV、OGG 格式，最大100MB</li>
                    <li><strong>字幕:</strong> 支持 SRT、VTT 格式，用于句子同步</li>
                    <li>导入字幕后，点击句子可跳转到对应位置</li>
                </ul>
            </div>
        </div>
    );
};

export default AudioImport;
