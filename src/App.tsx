// Main App Component
import React, { useState, useCallback, useMemo } from 'react';
import type { PageType, Word, Sentence } from './types';
import { useVocabulary } from './hooks/useVocabulary';
import { useGrammar } from './hooks/useGrammar';
import { useNotes } from './hooks/useNotes';
import { useLearningStats } from './hooks/useLearningStats';
import { sampleLesson } from './data/sampleLesson';

// Components
import { Navigation } from './components/Navigation/Navigation';
import { HomePage } from './components/HomePage/HomePage';
import { AudioPlayer } from './components/AudioPlayer/AudioPlayer';
import { SentencePanel } from './components/SentencePanel/SentencePanel';
import { WordExplainer } from './components/WordExplainer/WordExplainer';
import { VocabularyBook } from './components/VocabularyBook/VocabularyBook';
import { FlashcardReview } from './components/FlashcardReview/FlashcardReview';
import { GrammarLibrary } from './components/GrammarLibrary/GrammarLibrary';
import { AudioImport } from './components/AudioImport/AudioImport';
import { FloatingAIChat } from './components/FloatingAIChat/FloatingAIChat';

import './index.css';
import './App.css';

function App() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  // Lesson state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [shadowingMode, setShadowingMode] = useState(false);
  const [showReading, setShowReading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');

  // Subtitle state
  const [importedSentences, setImportedSentences] = useState<Sentence[] | null>(null);
  const [subtitleFileName, setSubtitleFileName] = useState<string>('');

  // Word explainer state
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [wordPosition, setWordPosition] = useState({ x: 0, y: 0 });

  // Audio seek function (registered by AudioPlayer)
  const [seekToSentence, setSeekToSentence] = useState<((index: number) => void) | null>(null);

  // Floating AI Chat state
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiSelectedText, setAISelectedText] = useState<string | undefined>(undefined);

  // Hooks
  const {
    vocabulary,
    addWord,
    removeWord,
    updateWord,
    hasWord,
    updateReview,
    dueForReview,
    stats: vocabStats,
  } = useVocabulary();

  const {
    grammarPoints,
    addGrammar,
    removeGrammar,
    updateGrammar,
  } = useGrammar();

  const {
    addNote,
  } = useNotes();

  const {
    stats: learningStats,
    dailyGoals,
    goalProgress,
    recordSentenceListened,
    recordWordLearned,
    recordStudyTime,
  } = useLearningStats();

  // Handlers
  const handleTextSelect = useCallback((text: string, position: { x: number; y: number }) => {
    // Create a Word object from the selected text
    const selectedWord: Word = {
      id: `selected-${Date.now()}`,
      text: text,
      reading: '',
      meaning: '',
      partOfSpeech: '',
      pitch: [],
    };
    setSelectedWord(selectedWord);
    setWordPosition(position);
  }, []);

  const handleAddToVocabulary = useCallback((word: Word) => {
    addWord(word);
    recordWordLearned();
    // Use renamed recordWordLearned instead of recordWordLearned from hook if it was shadowing
  }, [addWord, recordWordLearned]);

  const handleSentenceChange = useCallback((index: number) => {
    setCurrentSentenceIndex(index);
    recordSentenceListened();
  }, [recordSentenceListened]);

  const handleAudioImport = useCallback((url: string, fileName: string) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(url);
    setAudioFileName(fileName);
  }, [audioUrl]);

  const handleSubtitleImport = useCallback((sentences: Sentence[], fileName: string) => {
    setImportedSentences(sentences);
    setSubtitleFileName(fileName);
    setCurrentSentenceIndex(0); // Reset to first sentence
  }, []);

  // Use imported sentences or sample lesson sentences
  const activeSentences = useMemo(() => {
    return importedSentences || sampleLesson.sentences;
  }, [importedSentences]);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as PageType);
    setSelectedWord(null);
  }, []);

  // Effect to record study time
  // This effect runs when currentPage changes.
  // It records study time for the previous page when navigating away.
  // For simplicity, let's assume a fixed duration for now or calculate based on time spent.
  // A more robust solution would involve tracking start/end times for each page.
  React.useEffect(() => {
    const duration = 5; // Example: record 5 minutes of study time for each page visit
    return () => {
      // This cleanup function runs when the component unmounts or before the effect re-runs
      // We can use it to record study time for the page that was just left
      recordStudyTime(duration);
    };
  }, [currentPage, recordStudyTime]);

  // Render page content
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            stats={learningStats}
            dailyGoals={dailyGoals}
            goalProgress={goalProgress}
            vocabularyCount={vocabulary.length}
            onNavigate={handleNavigate}
          />
        );

      case 'lesson':
        return (
          <div className="lesson-page">
            <div className="lesson-header glass-card">
              <h2>{sampleLesson.titleJp}</h2>
              <p>{sampleLesson.title}</p>
              <div className="lesson-controls">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showReading}
                    onChange={(e) => setShowReading(e.target.checked)}
                  />
                  显示读音
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                  />
                  显示翻译
                </label>
              </div>
            </div>

            <AudioImport
              onAudioImport={handleAudioImport}
              onSubtitleImport={handleSubtitleImport}
              currentAudioName={audioFileName}
              currentSubtitleName={subtitleFileName}
            />

            <AudioPlayer
              sentences={activeSentences}
              currentIndex={currentSentenceIndex}
              onSentenceChange={handleSentenceChange}
              shadowingMode={shadowingMode}
              onShadowingModeChange={setShadowingMode}
              audioUrl={audioUrl || undefined}
              registerSeekFunction={(fn) => setSeekToSentence(() => fn)}
            />

            <SentencePanel
              sentences={activeSentences}
              currentIndex={currentSentenceIndex}
              onSentenceClick={(index) => {
                if (seekToSentence) {
                  seekToSentence(index);
                } else {
                  setCurrentSentenceIndex(index);
                }
              }}
              onTextSelect={(text, pos) => {
                handleTextSelect(text, pos);
                // Also pass to AI chat if open
                if (showAIChat) {
                  setAISelectedText(text);
                }
              }}
              showReading={showReading}
              showTranslation={showTranslation}
              onAddToVocabulary={addWord}
              onAddToGrammar={addGrammar}
            />

            {/* Floating AI Chat Toggle Button */}
            <button
              className={`ai-toggle-btn ${showAIChat ? 'active' : ''}`}
              onClick={() => setShowAIChat(!showAIChat)}
              title={showAIChat ? '关闭AI助手' : '打开AI助手'}
            >
              🤖
            </button>

            {/* Floating AI Chat Window */}
            <FloatingAIChat
              isOpen={showAIChat}
              onClose={() => setShowAIChat(false)}
              selectedText={aiSelectedText}
            />
          </div>
        );

      case 'vocabulary':
        return (
          <VocabularyBook
            vocabulary={vocabulary}
            onRemoveWord={removeWord}
            onUpdateWord={updateWord}
            onAddWord={addWord}
            onStartFlashcards={() => setCurrentPage('flashcards')}
            dueForReview={dueForReview.length}
          />
        );

      case 'flashcards':
        return (
          <FlashcardReview
            vocabulary={dueForReview.length > 0 ? dueForReview : vocabulary}
            onUpdateReview={updateReview}
            onClose={() => setCurrentPage('vocabulary')}
          />
        );

      case 'grammar':
        return (
          <GrammarLibrary
            grammarPoints={grammarPoints}
            onRemoveGrammar={removeGrammar}
            onUpdateGrammar={updateGrammar}
            onAddGrammar={addGrammar}
          />
        );

      case 'stats':
        return (
          <div className="stats-page glass-card">
            <h2>📊 学习统计</h2>
            <div className="stats-detail-grid">
              <div className="stat-detail">
                <span className="detail-label">总学习时间</span>
                <span className="detail-value">{learningStats.totalStudyTime} 分钟</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">连续学习</span>
                <span className="detail-value">{learningStats.streakDays} 天</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">已听句子</span>
                <span className="detail-value">{learningStats.listenedSentences}</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">生词数量</span>
                <span className="detail-value">{vocabulary.length}</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">已掌握</span>
                <span className="detail-value">{vocabStats.mastered}</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">平均正确率</span>
                <span className="detail-value">{Math.round(vocabStats.averageAccuracy)}%</span>
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="achievements-page glass-card">
            <h2>🏆 成就</h2>
            <p className="coming-soon">成就系统开发中...</p>
            <div className="achievement-preview">
              <div className="achievement-badge locked">🌸 初心者</div>
              <div className="achievement-badge locked">📚 单词达人</div>
              <div className="achievement-badge locked">🔥 坚持不懈</div>
              <div className="achievement-badge locked">🎧 听力高手</div>
              <div className="achievement-badge locked">✍️ 听写专家</div>
              <div className="achievement-badge locked">🧠 记忆大师</div>
            </div>
          </div>
        );



      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        streakDays={learningStats.streakDays}
      />

      <main className="app-container">
        {renderPage()}
      </main>

      {/* Word Explainer Popup */}
      {selectedWord && (
        <WordExplainer
          word={selectedWord}
          position={wordPosition}
          onClose={() => setSelectedWord(null)}
          onAddToVocabulary={handleAddToVocabulary}
          isInVocabulary={hasWord(selectedWord.text)}
        />
      )}
    </div>
  );
}

export default App;
