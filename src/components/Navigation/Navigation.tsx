// Navigation Component
import React from 'react';
import type { PageType } from '../../types';
import './Navigation.css';

interface NavigationProps {
    currentPage: PageType;
    onNavigate: (page: PageType) => void;
    streakDays: number;
}

const navItems: { page: PageType; label: string; icon: string }[] = [
    { page: 'home', label: '首页', icon: '🏠' },
    { page: 'lesson', label: '听力', icon: '🎧' },
    // AI页面已移除，改为悬浮窗
    { page: 'vocabulary', label: '生词本', icon: '📚' },
    { page: 'flashcards', label: '闪卡', icon: '🎴' },
    // 假名页面已移除
    { page: 'grammar', label: '语法', icon: '📖' },
    { page: 'stats', label: '统计', icon: '📊' },
    { page: 'achievements', label: '成就', icon: '🏆' },
];

export const Navigation: React.FC<NavigationProps> = ({
    currentPage,
    onNavigate,
    streakDays,
}) => {
    return (
        <nav className="nav">
            <div className="nav-brand">
                <span className="nav-logo">🎌</span>
                <span className="nav-title">日语ASMR学习</span>
            </div>

            <div className="nav-links">
                {navItems.map(({ page, label, icon }) => (
                    <button
                        key={page}
                        className={`nav-link ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onNavigate(page)}
                    >
                        <span className="nav-icon">{icon}</span>
                        <span className="nav-label">{label}</span>
                    </button>
                ))}
            </div>

            {streakDays > 0 && (
                <div className="streak-badge">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-count">{streakDays}天</span>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
