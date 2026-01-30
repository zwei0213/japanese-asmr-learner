// ===================================
// 日语ASMR学习应用 - 类型定义
// ===================================

// 音调类型
export type PitchAccent = 'H' | 'L'; // High / Low

// 单词类型
export interface Word {
  id: string;
  text: string;           // 汉字/假名形式
  reading: string;        // 平假名读音
  meaning: string;        // 中文释义
  partOfSpeech: string;   // 词性
  pitch?: PitchAccent[];  // 音调模式
  grammar?: string;       // 相关语法说明
  examples?: string[];    // 例句
}

// 句子类型
export interface Sentence {
  id: string;
  text: string;           // 日语原文
  reading: string;        // 假名标注
  translation: string;    // 中文翻译
  startTime: number;      // 开始时间(秒)
  endTime: number;        // 结束时间(秒)
  words: Word[];          // 分词列表
}

// 课程类型
export interface Lesson {
  id: string;
  title: string;          // 课程标题
  titleJp: string;        // 日语标题
  description: string;    // 课程描述
  audioUrl: string;       // 音频URL
  duration: number;       // 时长(秒)
  difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  sentences: Sentence[];
  thumbnail?: string;
}

// 生词本条目
export interface VocabularyItem {
  id: string;
  word: Word;
  addedAt: string;        // ISO日期字符串
  lastReviewed?: string;
  nextReview?: string;
  level: number;          // 0-5 熟练度等级
  reviewCount: number;
  correctCount: number;
}

// 学习统计
export interface LearningStats {
  totalWords: number;
  masteredWords: number;
  totalSentences: number;
  listenedSentences: number;
  totalStudyTime: number;  // 分钟
  streakDays: number;
  lastStudyDate: string;
  dailyProgress: DailyProgress[];
}

export interface DailyProgress {
  date: string;
  wordsLearned: number;
  sentencesListened: number;
  studyMinutes: number;
  quizScore?: number;
}

// 每日目标
export interface DailyGoals {
  wordsTarget: number;
  sentencesTarget: number;
  studyMinutesTarget: number;
  wordsCompleted: number;
  sentencesCompleted: number;
  studyMinutesCompleted: number;
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  titleJp: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  condition: {
    type: 'words' | 'sentences' | 'streak' | 'accuracy' | 'lessons';
    target: number;
  };
}

// 语法点
export interface GrammarPoint {
  id: string;
  pattern: string;        // 语法结构
  meaning: string;        // 中文解释
  level: string;          // 级别 (不再限制为N5/N4)
  examples: {
    japanese: string;
    reading: string;
    translation: string;
  }[];
  notes?: string;
}

// 假名数据
export interface Kana {
  hiragana: string;
  katakana: string;
  romaji: string;
  row: string;           // あ行、か行等
}

// 测验类型
export interface QuizQuestion {
  id: string;
  type: 'word-meaning' | 'meaning-word' | 'listening' | 'kana';
  question: string;
  options: string[];
  correctIndex: number;
  audioUrl?: string;
}

// 应用状态
export type PageType =
  | 'home'
  | 'lesson'
  | 'vocabulary'
  | 'flashcards'
  | 'kana'
  | 'grammar'
  | 'stats'
  | 'achievements'
  | 'ai';

export interface AppState {
  currentPage: PageType;
  currentLesson?: Lesson;
  currentSentenceIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  shadowingMode: boolean;
  vocabulary: VocabularyItem[];
  stats: LearningStats;
  dailyGoals: DailyGoals;
  achievements: Achievement[];
}
