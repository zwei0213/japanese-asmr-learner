// Kana Learning Component
import React, { useState } from 'react';
import { kanaData, hiraganaRows } from '../../data/kanaData';
import './KanaLearning.css';

type KanaMode = 'chart' | 'quiz';
type QuizType = 'hiragana-romaji' | 'romaji-hiragana' | 'katakana-romaji';

export const KanaLearning: React.FC = () => {
    const [mode, setMode] = useState<KanaMode>('chart');
    const [showKatakana, setShowKatakana] = useState(false);
    const [quizType, setQuizType] = useState<QuizType>('hiragana-romaji');
    const [quizIndex, setQuizIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const currentKana = kanaData[quizIndex];

    const handleQuizSubmit = () => {
        const isCorrect = checkAnswer();
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
        }));
        setShowResult(true);
    };

    const checkAnswer = () => {
        const answer = userAnswer.toLowerCase().trim();
        if (quizType === 'hiragana-romaji' || quizType === 'katakana-romaji') {
            return answer === currentKana.romaji;
        } else {
            return answer === currentKana.hiragana || answer === currentKana.katakana;
        }
    };

    const nextQuestion = () => {
        const nextIndex = Math.floor(Math.random() * kanaData.length);
        setQuizIndex(nextIndex);
        setUserAnswer('');
        setShowResult(false);
    };

    const getQuizQuestion = () => {
        switch (quizType) {
            case 'hiragana-romaji':
                return currentKana.hiragana;
            case 'katakana-romaji':
                return currentKana.katakana;
            case 'romaji-hiragana':
                return currentKana.romaji;
        }
    };

    const getCorrectAnswer = () => {
        switch (quizType) {
            case 'hiragana-romaji':
            case 'katakana-romaji':
                return currentKana.romaji;
            case 'romaji-hiragana':
                return `${currentKana.hiragana} / ${currentKana.katakana}`;
        }
    };

    return (
        <div className="kana-learning">
            <div className="kana-header glass-card">
                <h2>🔤 假名学习</h2>
                <div className="mode-tabs">
                    <button
                        className={`tab-btn ${mode === 'chart' ? 'active' : ''}`}
                        onClick={() => setMode('chart')}
                    >
                        📊 对照表
                    </button>
                    <button
                        className={`tab-btn ${mode === 'quiz' ? 'active' : ''}`}
                        onClick={() => setMode('quiz')}
                    >
                        ✏️ 测验
                    </button>
                </div>
            </div>

            {mode === 'chart' ? (
                <div className="kana-chart glass-card">
                    <div className="chart-controls">
                        <button
                            className={`toggle-btn ${!showKatakana ? 'active' : ''}`}
                            onClick={() => setShowKatakana(false)}
                        >
                            平假名
                        </button>
                        <button
                            className={`toggle-btn ${showKatakana ? 'active' : ''}`}
                            onClick={() => setShowKatakana(true)}
                        >
                            片假名
                        </button>
                    </div>

                    <div className="chart-grid">
                        <div className="chart-header">
                            <span></span>
                            <span>a</span>
                            <span>i</span>
                            <span>u</span>
                            <span>e</span>
                            <span>o</span>
                        </div>
                        {hiraganaRows.map((row) => (
                            <div key={row.name} className="chart-row">
                                <span className="row-label">{row.name}</span>
                                {row.kana.map((kana, i) => {
                                    const data = kanaData.find(k => k.hiragana === kana);
                                    if (!kana) {
                                        return <span key={i} className="kana-cell empty"></span>;
                                    }
                                    return (
                                        <span key={i} className="kana-cell">
                                            <span className="kana-main">
                                                {showKatakana ? data?.katakana : kana}
                                            </span>
                                            <span className="kana-romaji">{data?.romaji}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="kana-quiz glass-card">
                    <div className="quiz-type-selector">
                        {[
                            { type: 'hiragana-romaji' as QuizType, label: '平假名 → 罗马字' },
                            { type: 'katakana-romaji' as QuizType, label: '片假名 → 罗马字' },
                            { type: 'romaji-hiragana' as QuizType, label: '罗马字 → 假名' },
                        ].map(({ type, label }) => (
                            <button
                                key={type}
                                className={`quiz-type-btn ${quizType === type ? 'active' : ''}`}
                                onClick={() => {
                                    setQuizType(type);
                                    nextQuestion();
                                    setScore({ correct: 0, total: 0 });
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="quiz-score">
                        正确: {score.correct} / {score.total}
                        {score.total > 0 && (
                            <span className="accuracy">
                                ({Math.round((score.correct / score.total) * 100)}%)
                            </span>
                        )}
                    </div>

                    <div className="quiz-question">
                        <span className="question-kana">{getQuizQuestion()}</span>
                    </div>

                    {!showResult ? (
                        <div className="quiz-input-area">
                            <input
                                type="text"
                                className="input quiz-input"
                                placeholder={quizType === 'romaji-hiragana' ? '输入假名' : '输入罗马字'}
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuizSubmit()}
                                autoFocus
                            />
                            <button className="btn btn-primary" onClick={handleQuizSubmit}>
                                确认
                            </button>
                        </div>
                    ) : (
                        <div className={`quiz-result ${checkAnswer() ? 'correct' : 'incorrect'}`}>
                            <div className="result-icon">
                                {checkAnswer() ? '✅' : '❌'}
                            </div>
                            <div className="result-text">
                                {checkAnswer() ? '正确！' : `答案是: ${getCorrectAnswer()}`}
                            </div>
                            <button className="btn btn-primary" onClick={nextQuestion}>
                                下一题
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KanaLearning;
