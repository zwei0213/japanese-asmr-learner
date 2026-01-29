// Achievement Definitions
import type { Achievement } from '../types';

export const achievementDefinitions: Achievement[] = [
    {
        id: 'a1',
        title: '初心者',
        titleJp: 'しょしんしゃ',
        description: '完成第一课学习',
        icon: '🌸',
        condition: { type: 'lessons', target: 1 },
    },
    {
        id: 'a2',
        title: '探索者',
        titleJp: 'たんさくしゃ',
        description: '收藏10个生词',
        icon: '🔍',
        condition: { type: 'words', target: 10 },
    },
    {
        id: 'a3',
        title: '单词达人',
        titleJp: 'たんごたつじん',
        description: '收藏100个生词',
        icon: '📚',
        condition: { type: 'words', target: 100 },
    },
    {
        id: 'a4',
        title: '坚持不懈',
        titleJp: 'がんばりや',
        description: '连续学习7天',
        icon: '🔥',
        condition: { type: 'streak', target: 7 },
    },
    {
        id: 'a5',
        title: '听力新手',
        titleJp: 'ちょうりょくしんしゅ',
        description: '完成10个句子听力',
        icon: '👂',
        condition: { type: 'sentences', target: 10 },
    },
    {
        id: 'a6',
        title: '听力高手',
        titleJp: 'ちょうりょくこうしゅ',
        description: '完成50个句子听力',
        icon: '🎧',
        condition: { type: 'sentences', target: 50 },
    },
    {
        id: 'a7',
        title: '听写专家',
        titleJp: 'ききとりめいじん',
        description: '听写正确率达90%',
        icon: '✍️',
        condition: { type: 'accuracy', target: 90 },
    },
    {
        id: 'a8',
        title: '记忆大师',
        titleJp: 'きおくたいし',
        description: '掌握200个单词',
        icon: '🧠',
        condition: { type: 'words', target: 200 },
    },
    {
        id: 'a9',
        title: '三周挑战',
        titleJp: 'さんしゅうちゃれんじ',
        description: '连续学习21天',
        icon: '🏆',
        condition: { type: 'streak', target: 21 },
    },
    {
        id: 'a10',
        title: '日语之星',
        titleJp: 'にほんごのほし',
        description: '完成10课学习',
        icon: '⭐',
        condition: { type: 'lessons', target: 10 },
    },
];

export default achievementDefinitions;
