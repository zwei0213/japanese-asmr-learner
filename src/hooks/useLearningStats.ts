// useLearningStats Hook - Track learning progress
import { useCallback, useMemo } from 'react';
import type { LearningStats, DailyProgress, DailyGoals } from '../types';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_STATS: LearningStats = {
    totalWords: 0,
    masteredWords: 0,
    totalSentences: 0,
    listenedSentences: 0,
    totalStudyTime: 0,
    streakDays: 0,
    lastStudyDate: '',
    dailyProgress: [],
};

const DEFAULT_GOALS: DailyGoals = {
    wordsTarget: 10,
    sentencesTarget: 5,
    studyMinutesTarget: 15,
    wordsCompleted: 0,
    sentencesCompleted: 0,
    studyMinutesCompleted: 0,
};

export function useLearningStats() {
    const [stats, setStats] = useLocalStorage<LearningStats>('learningStats', DEFAULT_STATS);
    const [dailyGoals, setDailyGoals] = useLocalStorage<DailyGoals>('dailyGoals', DEFAULT_GOALS);

    // Get today's date string
    const getToday = () => new Date().toISOString().split('T')[0];

    // Check and update streak
    const checkStreak = useCallback(() => {
        const today = getToday();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        setStats(prev => {
            if (prev.lastStudyDate === today) {
                return prev; // Already studied today
            }

            if (prev.lastStudyDate === yesterdayStr) {
                // Continued streak
                return {
                    ...prev,
                    streakDays: prev.streakDays + 1,
                    lastStudyDate: today,
                };
            }

            // Streak broken, reset to 1
            return {
                ...prev,
                streakDays: 1,
                lastStudyDate: today,
            };
        });
    }, [setStats]);

    // Record word learned
    const recordWordLearned = useCallback(() => {
        checkStreak();
        setStats(prev => ({
            ...prev,
            totalWords: prev.totalWords + 1,
        }));
        setDailyGoals(prev => ({
            ...prev,
            wordsCompleted: prev.wordsCompleted + 1,
        }));
    }, [checkStreak, setStats, setDailyGoals]);

    // Record sentence listened
    const recordSentenceListened = useCallback(() => {
        checkStreak();
        setStats(prev => ({
            ...prev,
            listenedSentences: prev.listenedSentences + 1,
        }));
        setDailyGoals(prev => ({
            ...prev,
            sentencesCompleted: prev.sentencesCompleted + 1,
        }));
    }, [checkStreak, setStats, setDailyGoals]);

    // Record study time (in minutes)
    const recordStudyTime = useCallback((minutes: number) => {
        checkStreak();
        setStats(prev => ({
            ...prev,
            totalStudyTime: prev.totalStudyTime + minutes,
        }));
        setDailyGoals(prev => ({
            ...prev,
            studyMinutesCompleted: prev.studyMinutesCompleted + minutes,
        }));
    }, [checkStreak, setStats, setDailyGoals]);

    // Update goals
    const updateGoals = useCallback((goals: Partial<DailyGoals>) => {
        setDailyGoals(prev => ({ ...prev, ...goals }));
    }, [setDailyGoals]);

    // Reset daily progress (call at midnight or app start)
    const resetDailyProgress = useCallback(() => {
        const today = getToday();

        // Save yesterday's progress to history
        setStats(prev => {
            const todayProgress: DailyProgress = {
                date: today,
                wordsLearned: dailyGoals.wordsCompleted,
                sentencesListened: dailyGoals.sentencesCompleted,
                studyMinutes: dailyGoals.studyMinutesCompleted,
            };

            // Only add if there was any progress
            if (todayProgress.wordsLearned > 0 || todayProgress.sentencesListened > 0) {
                const updatedProgress = [...prev.dailyProgress, todayProgress].slice(-30); // Keep last 30 days
                return { ...prev, dailyProgress: updatedProgress };
            }
            return prev;
        });

        // Reset daily counters
        setDailyGoals(prev => ({
            ...prev,
            wordsCompleted: 0,
            sentencesCompleted: 0,
            studyMinutesCompleted: 0,
        }));
    }, [dailyGoals, setStats, setDailyGoals]);

    // Calculate goal completion percentage
    const goalProgress = useMemo(() => {
        const wordsPercent = Math.min((dailyGoals.wordsCompleted / dailyGoals.wordsTarget) * 100, 100);
        const sentencesPercent = Math.min((dailyGoals.sentencesCompleted / dailyGoals.sentencesTarget) * 100, 100);
        const timePercent = Math.min((dailyGoals.studyMinutesCompleted / dailyGoals.studyMinutesTarget) * 100, 100);
        const overall = (wordsPercent + sentencesPercent + timePercent) / 3;

        return { wordsPercent, sentencesPercent, timePercent, overall };
    }, [dailyGoals]);

    return {
        stats,
        dailyGoals,
        goalProgress,
        recordWordLearned,
        recordSentenceListened,
        recordStudyTime,
        updateGoals,
        resetDailyProgress,
    };
}

export default useLearningStats;
