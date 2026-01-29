// Grammar Patterns Data - N5/N4 Level
import type { GrammarPoint } from '../types';

export const grammarPatterns: GrammarPoint[] = [
    {
        id: 'g1',
        pattern: '～は～です',
        meaning: 'A是B（名词谓语句）',
        level: 'N5',
        examples: [
            {
                japanese: '私は学生です。',
                reading: 'わたしはがくせいです。',
                translation: '我是学生。',
            },
            {
                japanese: 'これは本です。',
                reading: 'これはほんです。',
                translation: '这是书。',
            },
            {
                japanese: '田中さんは先生です。',
                reading: 'たなかさんはせんせいです。',
                translation: '田中先生是老师。',
            },
        ],
        notes: '「は」标记主题，「です」是敬体结尾。',
    },
    {
        id: 'g2',
        pattern: '～ます / ～ません',
        meaning: '动词敬体肯定/否定',
        level: 'N5',
        examples: [
            {
                japanese: '毎日日本語を勉強します。',
                reading: 'まいにちにほんごをべんきょうします。',
                translation: '我每天学习日语。',
            },
            {
                japanese: 'コーヒーを飲みません。',
                reading: 'こーひーをのみません。',
                translation: '我不喝咖啡。',
            },
            {
                japanese: '明日学校に行きます。',
                reading: 'あしたがっこうにいきます。',
                translation: '明天去学校。',
            },
        ],
        notes: '「～ます」是动词的礼貌/敬体形式。',
    },
    {
        id: 'g3',
        pattern: '～を～',
        meaning: '宾格助词（动作的对象）',
        level: 'N5',
        examples: [
            {
                japanese: 'ご飯を食べます。',
                reading: 'ごはんをたべます。',
                translation: '吃饭。',
            },
            {
                japanese: '映画を見ます。',
                reading: 'えいがをみます。',
                translation: '看电影。',
            },
            {
                japanese: '音楽を聞きます。',
                reading: 'おんがくをききます。',
                translation: '听音乐。',
            },
        ],
        notes: '「を」标记动作的直接宾语。',
    },
    {
        id: 'g4',
        pattern: '～に行きます / 来ます',
        meaning: '去/来（某地）',
        level: 'N5',
        examples: [
            {
                japanese: '学校に行きます。',
                reading: 'がっこうにいきます。',
                translation: '去学校。',
            },
            {
                japanese: '日本に来ました。',
                reading: 'にほんにきました。',
                translation: '来到了日本。',
            },
            {
                japanese: '駅に行きたいです。',
                reading: 'えきにいきたいです。',
                translation: '我想去车站。',
            },
        ],
        notes: '「に」表示移动的目的地。',
    },
    {
        id: 'g5',
        pattern: '～たい',
        meaning: '想要做...',
        level: 'N5',
        examples: [
            {
                japanese: '日本に行きたいです。',
                reading: 'にほんにいきたいです。',
                translation: '我想去日本。',
            },
            {
                japanese: '寿司を食べたいです。',
                reading: 'すしをたべたいです。',
                translation: '我想吃寿司。',
            },
            {
                japanese: '日本語を話したいです。',
                reading: 'にほんごをはなしたいです。',
                translation: '我想说日语。',
            },
        ],
        notes: '动词ます形去掉「ます」加「たい」，表示第一人称的愿望。',
    },
    {
        id: 'g6',
        pattern: '～てください',
        meaning: '请做...',
        level: 'N5',
        examples: [
            {
                japanese: 'ここに書いてください。',
                reading: 'ここにかいてください。',
                translation: '请在这里写。',
            },
            {
                japanese: 'ゆっくり話してください。',
                reading: 'ゆっくりはなしてください。',
                translation: '请慢慢说。',
            },
            {
                japanese: '窓を開けてください。',
                reading: 'まどをあけてください。',
                translation: '请打开窗户。',
            },
        ],
        notes: '动词て形＋「ください」，表示礼貌的请求。',
    },
    {
        id: 'g7',
        pattern: '～ている',
        meaning: '正在.../（状态）',
        level: 'N5',
        examples: [
            {
                japanese: '本を読んでいます。',
                reading: 'ほんをよんでいます。',
                translation: '正在读书。',
            },
            {
                japanese: '東京に住んでいます。',
                reading: 'とうきょうにすんでいます。',
                translation: '住在东京。',
            },
            {
                japanese: '雨が降っています。',
                reading: 'あめがふっています。',
                translation: '正在下雨。',
            },
        ],
        notes: '表示动作的进行或状态的持续。',
    },
    {
        id: 'g8',
        pattern: '～から～まで',
        meaning: '从...到...',
        level: 'N5',
        examples: [
            {
                japanese: '9時から5時まで働きます。',
                reading: 'くじからごじまではたらきます。',
                translation: '从9点工作到5点。',
            },
            {
                japanese: '東京から大阪まで行きます。',
                reading: 'とうきょうからおおさかまでいきます。',
                translation: '从东京去大阪。',
            },
            {
                japanese: '月曜日から金曜日まで学校があります。',
                reading: 'げつようびからきんようびまでがっこうがあります。',
                translation: '从周一到周五有学校。',
            },
        ],
        notes: '可以表示时间或空间的起点和终点。',
    },
    {
        id: 'g9',
        pattern: '～が好きです / 嫌いです',
        meaning: '喜欢/讨厌...',
        level: 'N5',
        examples: [
            {
                japanese: '音楽が好きです。',
                reading: 'おんがくがすきです。',
                translation: '喜欢音乐。',
            },
            {
                japanese: '野菜が嫌いです。',
                reading: 'やさいがきらいです。',
                translation: '讨厌蔬菜。',
            },
            {
                japanese: '日本の文化が大好きです。',
                reading: 'にほんのぶんかがだいすきです。',
                translation: '非常喜欢日本文化。',
            },
        ],
        notes: '注意用「が」不是「を」来标记喜欢/讨厌的对象。',
    },
    {
        id: 'g10',
        pattern: '～ましょう',
        meaning: '让我们.../我来...',
        level: 'N5',
        examples: [
            {
                japanese: '一緒に食べましょう。',
                reading: 'いっしょにたべましょう。',
                translation: '一起吃吧。',
            },
            {
                japanese: '休みましょう。',
                reading: 'やすみましょう。',
                translation: '休息吧。',
            },
            {
                japanese: '日本語で話しましょう。',
                reading: 'にほんごではなしましょう。',
                translation: '用日语说吧。',
            },
        ],
        notes: '表示提议或邀请对方一起做某事。',
    },
    {
        id: 'g11',
        pattern: '～ないでください',
        meaning: '请不要...',
        level: 'N4',
        examples: [
            {
                japanese: 'ここで写真を撮らないでください。',
                reading: 'ここでしゃしんをとらないでください。',
                translation: '请不要在这里拍照。',
            },
            {
                japanese: '心配しないでください。',
                reading: 'しんぱいしないでください。',
                translation: '请不要担心。',
            },
            {
                japanese: '遅れないでください。',
                reading: 'おくれないでください。',
                translation: '请不要迟到。',
            },
        ],
        notes: '动词ない形＋「でください」，礼貌地请求对方不要做某事。',
    },
    {
        id: 'g12',
        pattern: '～なければなりません',
        meaning: '必须...',
        level: 'N4',
        examples: [
            {
                japanese: '宿題をしなければなりません。',
                reading: 'しゅくだいをしなければなりません。',
                translation: '必须做作业。',
            },
            {
                japanese: '早く起きなければなりません。',
                reading: 'はやくおきなければなりません。',
                translation: '必须早起。',
            },
            {
                japanese: '薬を飲まなければなりません。',
                reading: 'くすりをのまなければなりません。',
                translation: '必须吃药。',
            },
        ],
        notes: '也可以说「～なくてはいけません」，意思相同。',
    },
];

export default grammarPatterns;
