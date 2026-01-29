// Audio Player Component with Real Audio Support
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Sentence } from '../../types';
import { IconPlay, IconPause, IconSkipBack, IconSkipForward, IconRepeat, IconMic } from '../Icons';
import './AudioPlayer.css';

interface AudioPlayerProps {
    sentences: Sentence[];
    currentIndex: number;
    onSentenceChange: (index: number) => void;
    shadowingMode: boolean;
    onShadowingModeChange: (enabled: boolean) => void;
    audioUrl?: string; // Real audio file URL
    registerSeekFunction?: (seekFn: (index: number) => void) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    sentences,
    currentIndex,
    onSentenceChange,
    shadowingMode,
    onShadowingModeChange,
    audioUrl,
    registerSeekFunction,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [loopSentence, setLoopSentence] = useState(false);
    const [shadowingPause, setShadowingPause] = useState(false);
    const [shadowingCountdown, setShadowingCountdown] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const shadowingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const hasRealAudio = !!audioUrl;
    const currentSentence = sentences[currentIndex];
    const totalDuration = sentences.length > 0
        ? sentences[sentences.length - 1].endTime
        : 0;

    // Handle real audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    // Update audio playback rate
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    // Simulated playback for demo mode (no real audio)
    useEffect(() => {
        if (hasRealAudio) return; // Skip if we have real audio

        if (isPlaying && !shadowingPause) {
            simulationRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    const newTime = prev + 0.1 * playbackRate;
                    const sentenceEnd = currentSentence?.endTime || 0;

                    if (loopSentence && newTime >= sentenceEnd) {
                        return currentSentence?.startTime || 0;
                    }

                    if (newTime >= sentenceEnd && currentIndex < sentences.length - 1) {
                        if (shadowingMode) {
                            setShadowingPause(true);
                            setShadowingCountdown(3);
                            return sentenceEnd;
                        }
                        onSentenceChange(currentIndex + 1);
                    }

                    if (newTime >= totalDuration) {
                        setIsPlaying(false);
                        return totalDuration;
                    }

                    return newTime;
                });
            }, 100);
        }

        return () => {
            if (simulationRef.current) clearInterval(simulationRef.current);
        };
    }, [hasRealAudio, isPlaying, playbackRate, loopSentence, shadowingMode, shadowingPause, currentSentence, currentIndex, sentences.length, totalDuration, onSentenceChange]);

    // Shadowing mode countdown
    useEffect(() => {
        if (shadowingPause && shadowingCountdown > 0) {
            shadowingTimerRef.current = setTimeout(() => {
                setShadowingCountdown(prev => prev - 1);
            }, 1000);
        } else if (shadowingPause && shadowingCountdown === 0) {
            setShadowingPause(false);
            if (currentIndex < sentences.length - 1) {
                onSentenceChange(currentIndex + 1);
                // Resume audio after shadowing pause
                if (hasRealAudio && audioRef.current) {
                    audioRef.current.play();
                }
            }
        }

        return () => {
            if (shadowingTimerRef.current) clearTimeout(shadowingTimerRef.current);
        };
    }, [shadowingPause, shadowingCountdown, currentIndex, sentences.length, onSentenceChange, hasRealAudio]);

    // Handle sentence boundaries for real audio with shadowing mode
    useEffect(() => {
        if (!hasRealAudio || !shadowingMode || !currentSentence) return;

        const sentenceEnd = currentSentence.endTime;
        if (currentTime >= sentenceEnd && !shadowingPause && currentIndex < sentences.length - 1) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setShadowingPause(true);
            setShadowingCountdown(3);
        }
    }, [hasRealAudio, shadowingMode, currentTime, currentSentence, shadowingPause, currentIndex, sentences.length]);

    // Loop sentence for real audio
    useEffect(() => {
        if (!hasRealAudio || !loopSentence || !currentSentence || !audioRef.current) return;

        const sentenceEnd = currentSentence.endTime;
        const sentenceStart = currentSentence.startTime;

        if (currentTime >= sentenceEnd) {
            audioRef.current.currentTime = sentenceStart;
        }
    }, [hasRealAudio, loopSentence, currentTime, currentSentence]);

    // Sync current sentence with time
    useEffect(() => {
        const sentenceIndex = sentences.findIndex(
            s => currentTime >= s.startTime && currentTime < s.endTime
        );
        if (sentenceIndex !== -1 && sentenceIndex !== currentIndex) {
            onSentenceChange(sentenceIndex);
        }
    }, [currentTime, sentences, currentIndex, onSentenceChange]);

    // Set duration for demo mode
    useEffect(() => {
        if (!hasRealAudio) {
            setDuration(totalDuration);
        }
    }, [hasRealAudio, totalDuration]);

    const handlePlayPause = useCallback(() => {
        if (shadowingPause) {
            setShadowingPause(false);
            setShadowingCountdown(0);
        }

        if (hasRealAudio && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying, shadowingPause, hasRealAudio]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;

        setCurrentTime(newTime);
        if (hasRealAudio && audioRef.current) {
            audioRef.current.currentTime = newTime;
        }

        const sentenceIndex = sentences.findIndex(
            s => newTime >= s.startTime && newTime < s.endTime
        );
        if (sentenceIndex !== -1) {
            onSentenceChange(sentenceIndex);
        }
    };

    const jumpToSentence = useCallback((index: number) => {
        if (index >= 0 && index < sentences.length) {
            onSentenceChange(index);
            const newTime = sentences[index].startTime;
            setCurrentTime(newTime);
            if (hasRealAudio && audioRef.current) {
                audioRef.current.currentTime = newTime;
                // Auto-play when jumping to a sentence
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    }, [sentences, hasRealAudio, onSentenceChange]);

    // Register the seek function with parent component
    useEffect(() => {
        if (registerSeekFunction) {
            registerSeekFunction(jumpToSentence);
        }
    }, [registerSeekFunction, jumpToSentence]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const speeds = [0.5, 0.75, 1, 1.25, 1.5];

    return (
        <div className="audio-player glass-card">
            {/* Hidden audio element */}
            {audioUrl && (
                <audio ref={audioRef} src={audioUrl} preload="metadata" />
            )}

            {/* Audio status indicator */}
            {hasRealAudio && (
                <div className="audio-status">
                    <span className="status-dot active"></span>
                    <span className="status-text">音频已加载</span>
                </div>
            )}

            {!hasRealAudio && (
                <div className="audio-status demo">
                    <span className="status-dot"></span>
                    <span className="status-text">演示模式（无音频）</span>
                </div>
            )}

            {/* Waveform visualization */}
            <div className="waveform">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className={`wave-bar ${isPlaying && !shadowingPause ? 'active' : ''}`}
                        style={{
                            height: `${20 + Math.sin(i * 0.5 + currentTime) * 20}px`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>

            {/* Shadowing countdown overlay */}
            {shadowingPause && (
                <div className="shadowing-overlay">
                    <div className="shadowing-countdown">{shadowingCountdown}</div>
                    <div className="shadowing-text">跟读时间 🎤</div>
                </div>
            )}

            {/* Progress bar */}
            <div className="progress-section">
                <span className="time-display">{formatTime(currentTime)}</span>
                <div
                    className="progress-track"
                    ref={progressRef}
                    onClick={handleProgressClick}
                >
                    <div
                        className="progress-fill"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div
                        className="progress-thumb"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                    {/* Sentence markers */}
                    {sentences.map((sentence, i) => (
                        <div
                            key={sentence.id}
                            className={`sentence-marker ${i === currentIndex ? 'active' : ''}`}
                            style={{ left: `${(sentence.startTime / duration) * 100}%` }}
                            onClick={(e) => {
                                e.stopPropagation();
                                jumpToSentence(i);
                            }}
                        />
                    ))}
                </div>
                <span className="time-display">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="controls">
                <div className="controls-left">
                    {/* Speed control */}
                    <div className="speed-control">
                        {speeds.map(speed => (
                            <button
                                key={speed}
                                className={`speed-btn ${playbackRate === speed ? 'active' : ''}`}
                                onClick={() => setPlaybackRate(speed)}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                <div className="controls-center">
                    <button
                        className="control-btn"
                        onClick={() => jumpToSentence(currentIndex - 1)}
                        disabled={currentIndex === 0}
                    >
                        <IconSkipBack />
                    </button>

                    <button
                        className="control-btn play-btn"
                        onClick={handlePlayPause}
                    >
                        {isPlaying && !shadowingPause ? <IconPause /> : <IconPlay />}
                    </button>

                    <button
                        className="control-btn"
                        onClick={() => jumpToSentence(currentIndex + 1)}
                        disabled={currentIndex === sentences.length - 1}
                    >
                        <IconSkipForward />
                    </button>
                </div>

                <div className="controls-right">
                    <button
                        className={`mode-btn ${loopSentence ? 'active' : ''}`}
                        onClick={() => setLoopSentence(!loopSentence)}
                        title="循环当前句"
                    >
                        <IconRepeat />
                    </button>
                    <button
                        className={`mode-btn ${shadowingMode ? 'active' : ''}`}
                        onClick={() => onShadowingModeChange(!shadowingMode)}
                        title="跟读模式"
                    >
                        <IconMic />
                    </button>
                </div>
            </div>

            {/* Current sentence info */}
            <div className="current-sentence-info">
                <span className="player-sentence-count">
                    句子 {currentIndex + 1} / {sentences.length}
                </span>
                {shadowingMode && (
                    <span className="mode-indicator">跟读模式开启</span>
                )}
                {loopSentence && (
                    <span className="mode-indicator">循环播放</span>
                )}
            </div>
        </div >
    );
};

export default AudioPlayer;
