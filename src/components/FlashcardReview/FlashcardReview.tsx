// Flashcard Review Component
import React, { useState, useCallback, useMemo } from 'react';
import type { VocabularyItem } from '../../types';
import { PitchAccent } from '../PitchAccent/PitchAccent';
import './FlashcardReview.css';

interface FlashcardReviewProps {
    vocabulary: VocabularyItem[];
    onUpdateReview: (id: string, correct: boolean) => void;
    onClose: () => void;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
    vocabulary,
    onUpdateReview,
    onClose,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState<{ correct: number; incorrect: number }>({
        correct: 0,
        incorrect: 0,
    });
    const [isComplete, setIsComplete] = useState(false);

    const currentCard = vocabulary[currentIndex];
    const totalCards = vocabulary.length;

    const handleFlip = useCallback(() => {
        setIsFlipped(!isFlipped);
    }, [isFlipped]);

    const handleAnswer = useCallback((correct: boolean) => {
        if (!currentCard) return;

        onUpdateReview(currentCard.id, correct);
        setResults(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            incorrect: prev.incorrect + (correct ? 0 : 1),
        }));

        if (currentIndex < totalCards - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            setIsComplete(true);
        }
    }, [currentCard, currentIndex, totalCards, onUpdateReview]);

    const accuracy = useMemo(() => {
        const total = results.correct + results.incorrect;
        if (total === 0) return 0;
        return Math.round((results.correct / total) * 100);
    }, [results]);

    if (vocabulary.length === 0) {
        return (
            <div className="flashcard-review glass-card">
                <div className="review-empty">
                    <div className="empty-icon">🎉</div>
                    <h3>没有需要复习的单词！</h3>
                    <p>继续学习，添加更多单词到生词本</p>
                    <button className="btn btn-primary" onClick={onClose}>
                        返回
                    </button>
                </div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="flashcard-review glass-card">
                <div className="review-complete">
                    <div className="complete-icon">🎊</div>
                    <h3>复习完成！</h3>

                    <div className="results-stats">
                        <div className="stat correct">
                            <span className="stat-value">{results.correct}</span>
                            <span className="stat-label">正确</span>
                        </div>
                        <div className="stat accuracy">
                            <span className="stat-value">{accuracy}%</span>
                            <span className="stat-label">正确率</span>
                        </div>
                        <div className="stat incorrect">
                            <span className="stat-value">{results.incorrect}</span>
                            <span className="stat-label">错误</span>
                        </div>
                    </div>

                    <div className="complete-message">
                        {accuracy >= 90 ? '太棒了！继续保持！🌟' :
                            accuracy >= 70 ? '做得不错！继续努力！💪' :
                                accuracy >= 50 ? '还需要多练习！加油！📚' :
                                    '多复习，你会进步的！🔥'}
                    </div>

                    <button className="btn btn-primary" onClick={onClose}>
                        完成
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flashcard-review">
            <div className="review-header glass-card">
                <button className="close-btn" onClick={onClose}>×</button>
                <h3>🎴 闪卡复习</h3>
                <div className="progress-info">
                    <span className="current">{currentIndex + 1}</span>
                    <span className="separator">/</span>
                    <span className="total">{totalCards}</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${((currentIndex) / totalCards) * 100}%` }}
                    />
                </div>
            </div>

            <div
                className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                onClick={handleFlip}
            >
                <div className="flashcard-inner">
                    <div className="flashcard-front glass-card">
                        <div className="card-label">单词</div>
                        <div className="card-word">{currentCard.word.text}</div>
                        <div className="card-hint">点击翻转查看答案</div>
                    </div>

                    <div className="flashcard-back glass-card">
                        <div className="card-word">{currentCard.word.text}</div>
                        <div className="card-pitch">
                            <PitchAccent
                                reading={currentCard.word.reading}
                                pitch={currentCard.word.pitch}
                                size="large"
                            />
                        </div>
                        <div className="card-meaning">{currentCard.word.meaning}</div>
                        {currentCard.word.grammar && (
                            <div className="card-grammar">{currentCard.word.grammar}</div>
                        )}
                    </div>
                </div>
            </div>

            {isFlipped && (
                <div className="answer-buttons animate-slide-up">
                    <button
                        className="answer-btn incorrect"
                        onClick={() => handleAnswer(false)}
                    >
                        <span className="btn-icon">❌</span>
                        <span className="btn-text">不认识</span>
                    </button>
                    <button
                        className="answer-btn correct"
                        onClick={() => handleAnswer(true)}
                    >
                        <span className="btn-icon">✅</span>
                        <span className="btn-text">认识</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default FlashcardReview;
