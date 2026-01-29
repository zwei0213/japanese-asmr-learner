// useVocabulary Hook - Manage vocabulary/flashcard state
import { useCallback, useMemo } from 'react';
import type { VocabularyItem, Word } from '../types';
import { useLocalStorage } from './useLocalStorage';

// Simple spaced repetition intervals (in days)
const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30, 60];

export function useVocabulary() {
    const [vocabulary, setVocabulary] = useLocalStorage<VocabularyItem[]>('vocabulary', []);

    // Add a word to vocabulary
    const addWord = useCallback((word: Word) => {
        setVocabulary(prev => {
            // Check if word already exists
            if (prev.some(item => item.word.text === word.text)) {
                return prev;
            }
            const newItem: VocabularyItem = {
                id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                word,
                addedAt: new Date().toISOString(),
                level: 0,
                reviewCount: 0,
                correctCount: 0,
            };
            return [...prev, newItem];
        });
    }, [setVocabulary]);

    // Remove a word from vocabulary
    const removeWord = useCallback((id: string) => {
        setVocabulary(prev => prev.filter(item => item.id !== id));
    }, [setVocabulary]);

    // Update a word in vocabulary
    const updateWord = useCallback((id: string, updates: Partial<Word>) => {
        setVocabulary(prev => prev.map(item => {
            if (item.id !== id) return item;
            return {
                ...item,
                word: { ...item.word, ...updates }
            };
        }));
    }, [setVocabulary]);

    // Check if word is in vocabulary
    const hasWord = useCallback((wordText: string) => {
        return vocabulary.some(item => item.word.text === wordText);
    }, [vocabulary]);

    // Update review progress
    const updateReview = useCallback((id: string, correct: boolean) => {
        setVocabulary(prev => prev.map(item => {
            if (item.id !== id) return item;

            const newLevel = correct
                ? Math.min(item.level + 1, REVIEW_INTERVALS.length - 1)
                : Math.max(item.level - 1, 0);

            const daysUntilNext = REVIEW_INTERVALS[newLevel];
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + daysUntilNext);

            return {
                ...item,
                level: newLevel,
                reviewCount: item.reviewCount + 1,
                correctCount: correct ? item.correctCount + 1 : item.correctCount,
                lastReviewed: new Date().toISOString(),
                nextReview: nextReview.toISOString(),
            };
        }));
    }, [setVocabulary]);

    // Get words due for review
    const dueForReview = useMemo(() => {
        const now = new Date();
        return vocabulary.filter(item => {
            if (!item.nextReview) return true; // Never reviewed
            return new Date(item.nextReview) <= now;
        });
    }, [vocabulary]);

    // Get mastered words (level >= 4)
    const masteredWords = useMemo(() => {
        return vocabulary.filter(item => item.level >= 4);
    }, [vocabulary]);

    // Statistics
    const stats = useMemo(() => ({
        total: vocabulary.length,
        mastered: masteredWords.length,
        dueForReview: dueForReview.length,
        averageAccuracy: vocabulary.length > 0
            ? vocabulary.reduce((acc, item) => {
                if (item.reviewCount === 0) return acc;
                return acc + (item.correctCount / item.reviewCount);
            }, 0) / vocabulary.filter(i => i.reviewCount > 0).length * 100 || 0
            : 0,
    }), [vocabulary, masteredWords, dueForReview]);

    return {
        vocabulary,
        addWord,
        removeWord,
        updateWord,
        hasWord,
        updateReview,
        dueForReview,
        masteredWords,
        stats,
    };
}

export default useVocabulary;
