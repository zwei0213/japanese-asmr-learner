// Home Page Component
import React from 'react';
import type { DailyGoals, LearningStats } from '../../types';
import './HomePage.css';

interface HomePageProps {
    stats: LearningStats;
    dailyGoals: DailyGoals;
    goalProgress: {
        wordsPercent: number;
        sentencesPercent: number;
        timePercent: number;
        overall: number;
    };
    vocabularyCount: number;
    onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
    stats,
    dailyGoals,
    goalProgress,
    vocabularyCount,
    onNavigate,
}) => {
    return (
        <div className="home-page">
            {/* Welcome Banner */}
            <div className="welcome-banner glass-card">
                <div className="welcome-content">
                    <h1>
                        <span className="welcome-emoji">🎌</span>
                        日语ASMR学习
                    </h1>
                    <p>通过轻柔的ASMR音频，沉浸式学习日语</p>
                </div>
                <button
                    className="btn btn-primary start-btn"
                    onClick={() => onNavigate('lesson')}
                >
                    开始学习 ▶
                </button>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.streakDays}</span>
                        <span className="stat-label">连续天数</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <span className="stat-value">{vocabularyCount}</span>
                        <span className="stat-label">生词本</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">🎧</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.listenedSentences}</span>
                        <span className="stat-label">已听句子</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalStudyTime}</span>
                        <span className="stat-label">学习分钟</span>
                    </div>
                </div>
            </div>

            {/* Daily Goals */}
            <div className="daily-goals glass-card">
                <h3>🎯 今日目标</h3>
                <div className="goals-grid">
                    <div className="goal-item">
                        <div className="goal-header">
                            <span className="goal-icon">📝</span>
                            <span className="goal-label">单词</span>
                            <span className="goal-progress">
                                {dailyGoals.wordsCompleted}/{dailyGoals.wordsTarget}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${goalProgress.wordsPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="goal-item">
                        <div className="goal-header">
                            <span className="goal-icon">🎧</span>
                            <span className="goal-label">句子</span>
                            <span className="goal-progress">
                                {dailyGoals.sentencesCompleted}/{dailyGoals.sentencesTarget}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${goalProgress.sentencesPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="goal-item">
                        <div className="goal-header">
                            <span className="goal-icon">⏱️</span>
                            <span className="goal-label">时间</span>
                            <span className="goal-progress">
                                {dailyGoals.studyMinutesCompleted}/{dailyGoals.studyMinutesTarget}分钟
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${goalProgress.timePercent}%` }}
                            />
                        </div>
                    </div>
                </div>
                {goalProgress.overall >= 100 && (
                    <div className="goal-complete">
                        🎉 今日目标已完成！太棒了！
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>快速开始</h3>
                <div className="actions-grid">
                    <button
                        className="action-card glass-card"
                        onClick={() => onNavigate('lesson')}
                    >
                        <span className="action-icon">🎧</span>
                        <span className="action-label">听力练习</span>
                    </button>
                    <button
                        className="action-card glass-card"
                        onClick={() => onNavigate('flashcards')}
                    >
                        <span className="action-icon">🎴</span>
                        <span className="action-label">闪卡复习</span>
                    </button>
                    <button
                        className="action-card glass-card"
                        onClick={() => onNavigate('kana')}
                    >
                        <span className="action-icon">🔤</span>
                        <span className="action-label">假名学习</span>
                    </button>
                    <button
                        className="action-card glass-card"
                        onClick={() => onNavigate('grammar')}
                    >
                        <span className="action-icon">📖</span>
                        <span className="action-label">语法学习</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
