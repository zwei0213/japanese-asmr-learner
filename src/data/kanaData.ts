// Kana Data - Hiragana and Katakana
import type { Kana } from '../types';

export const hiraganaRows = [
    { name: 'あ行', kana: ['あ', 'い', 'う', 'え', 'お'] },
    { name: 'か行', kana: ['か', 'き', 'く', 'け', 'こ'] },
    { name: 'さ行', kana: ['さ', 'し', 'す', 'せ', 'そ'] },
    { name: 'た行', kana: ['た', 'ち', 'つ', 'て', 'と'] },
    { name: 'な行', kana: ['な', 'に', 'ぬ', 'ね', 'の'] },
    { name: 'は行', kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
    { name: 'ま行', kana: ['ま', 'み', 'む', 'め', 'も'] },
    { name: 'や行', kana: ['や', '', 'ゆ', '', 'よ'] },
    { name: 'ら行', kana: ['ら', 'り', 'る', 'れ', 'ろ'] },
    { name: 'わ行', kana: ['わ', '', '', '', 'を'] },
    { name: 'ん', kana: ['ん', '', '', '', ''] },
];

export const kanaData: Kana[] = [
    // あ行
    { hiragana: 'あ', katakana: 'ア', romaji: 'a', row: 'あ行' },
    { hiragana: 'い', katakana: 'イ', romaji: 'i', row: 'あ行' },
    { hiragana: 'う', katakana: 'ウ', romaji: 'u', row: 'あ行' },
    { hiragana: 'え', katakana: 'エ', romaji: 'e', row: 'あ行' },
    { hiragana: 'お', katakana: 'オ', romaji: 'o', row: 'あ行' },
    // か行
    { hiragana: 'か', katakana: 'カ', romaji: 'ka', row: 'か行' },
    { hiragana: 'き', katakana: 'キ', romaji: 'ki', row: 'か行' },
    { hiragana: 'く', katakana: 'ク', romaji: 'ku', row: 'か行' },
    { hiragana: 'け', katakana: 'ケ', romaji: 'ke', row: 'か行' },
    { hiragana: 'こ', katakana: 'コ', romaji: 'ko', row: 'か行' },
    // さ行
    { hiragana: 'さ', katakana: 'サ', romaji: 'sa', row: 'さ行' },
    { hiragana: 'し', katakana: 'シ', romaji: 'shi', row: 'さ行' },
    { hiragana: 'す', katakana: 'ス', romaji: 'su', row: 'さ行' },
    { hiragana: 'せ', katakana: 'セ', romaji: 'se', row: 'さ行' },
    { hiragana: 'そ', katakana: 'ソ', romaji: 'so', row: 'さ行' },
    // た行
    { hiragana: 'た', katakana: 'タ', romaji: 'ta', row: 'た行' },
    { hiragana: 'ち', katakana: 'チ', romaji: 'chi', row: 'た行' },
    { hiragana: 'つ', katakana: 'ツ', romaji: 'tsu', row: 'た行' },
    { hiragana: 'て', katakana: 'テ', romaji: 'te', row: 'た行' },
    { hiragana: 'と', katakana: 'ト', romaji: 'to', row: 'た行' },
    // な行
    { hiragana: 'な', katakana: 'ナ', romaji: 'na', row: 'な行' },
    { hiragana: 'に', katakana: 'ニ', romaji: 'ni', row: 'な行' },
    { hiragana: 'ぬ', katakana: 'ヌ', romaji: 'nu', row: 'な行' },
    { hiragana: 'ね', katakana: 'ネ', romaji: 'ne', row: 'な行' },
    { hiragana: 'の', katakana: 'ノ', romaji: 'no', row: 'な行' },
    // は行
    { hiragana: 'は', katakana: 'ハ', romaji: 'ha', row: 'は行' },
    { hiragana: 'ひ', katakana: 'ヒ', romaji: 'hi', row: 'は行' },
    { hiragana: 'ふ', katakana: 'フ', romaji: 'fu', row: 'は行' },
    { hiragana: 'へ', katakana: 'ヘ', romaji: 'he', row: 'は行' },
    { hiragana: 'ほ', katakana: 'ホ', romaji: 'ho', row: 'は行' },
    // ま行
    { hiragana: 'ま', katakana: 'マ', romaji: 'ma', row: 'ま行' },
    { hiragana: 'み', katakana: 'ミ', romaji: 'mi', row: 'ま行' },
    { hiragana: 'む', katakana: 'ム', romaji: 'mu', row: 'ま行' },
    { hiragana: 'め', katakana: 'メ', romaji: 'me', row: 'ま行' },
    { hiragana: 'も', katakana: 'モ', romaji: 'mo', row: 'ま行' },
    // や行
    { hiragana: 'や', katakana: 'ヤ', romaji: 'ya', row: 'や行' },
    { hiragana: 'ゆ', katakana: 'ユ', romaji: 'yu', row: 'や行' },
    { hiragana: 'よ', katakana: 'ヨ', romaji: 'yo', row: 'や行' },
    // ら行
    { hiragana: 'ら', katakana: 'ラ', romaji: 'ra', row: 'ら行' },
    { hiragana: 'り', katakana: 'リ', romaji: 'ri', row: 'ら行' },
    { hiragana: 'る', katakana: 'ル', romaji: 'ru', row: 'ら行' },
    { hiragana: 'れ', katakana: 'レ', romaji: 're', row: 'ら行' },
    { hiragana: 'ろ', katakana: 'ロ', romaji: 'ro', row: 'ら行' },
    // わ行
    { hiragana: 'わ', katakana: 'ワ', romaji: 'wa', row: 'わ行' },
    { hiragana: 'を', katakana: 'ヲ', romaji: 'wo', row: 'わ行' },
    // ん
    { hiragana: 'ん', katakana: 'ン', romaji: 'n', row: 'ん' },
    // 濁音 (が行)
    { hiragana: 'が', katakana: 'ガ', romaji: 'ga', row: 'が行' },
    { hiragana: 'ぎ', katakana: 'ギ', romaji: 'gi', row: 'が行' },
    { hiragana: 'ぐ', katakana: 'グ', romaji: 'gu', row: 'が行' },
    { hiragana: 'げ', katakana: 'ゲ', romaji: 'ge', row: 'が行' },
    { hiragana: 'ご', katakana: 'ゴ', romaji: 'go', row: 'が行' },
    // ざ行
    { hiragana: 'ざ', katakana: 'ザ', romaji: 'za', row: 'ざ行' },
    { hiragana: 'じ', katakana: 'ジ', romaji: 'ji', row: 'ざ行' },
    { hiragana: 'ず', katakana: 'ズ', romaji: 'zu', row: 'ざ行' },
    { hiragana: 'ぜ', katakana: 'ゼ', romaji: 'ze', row: 'ざ行' },
    { hiragana: 'ぞ', katakana: 'ゾ', romaji: 'zo', row: 'ざ行' },
    // だ行
    { hiragana: 'だ', katakana: 'ダ', romaji: 'da', row: 'だ行' },
    { hiragana: 'ぢ', katakana: 'ヂ', romaji: 'di', row: 'だ行' },
    { hiragana: 'づ', katakana: 'ヅ', romaji: 'du', row: 'だ行' },
    { hiragana: 'で', katakana: 'デ', romaji: 'de', row: 'だ行' },
    { hiragana: 'ど', katakana: 'ド', romaji: 'do', row: 'だ行' },
    // ば行
    { hiragana: 'ば', katakana: 'バ', romaji: 'ba', row: 'ば行' },
    { hiragana: 'び', katakana: 'ビ', romaji: 'bi', row: 'ば行' },
    { hiragana: 'ぶ', katakana: 'ブ', romaji: 'bu', row: 'ば行' },
    { hiragana: 'べ', katakana: 'ベ', romaji: 'be', row: 'ば行' },
    { hiragana: 'ぼ', katakana: 'ボ', romaji: 'bo', row: 'ば行' },
    // ぱ行
    { hiragana: 'ぱ', katakana: 'パ', romaji: 'pa', row: 'ぱ行' },
    { hiragana: 'ぴ', katakana: 'ピ', romaji: 'pi', row: 'ぱ行' },
    { hiragana: 'ぷ', katakana: 'プ', romaji: 'pu', row: 'ぱ行' },
    { hiragana: 'ぺ', katakana: 'ペ', romaji: 'pe', row: 'ぱ行' },
    { hiragana: 'ぽ', katakana: 'ポ', romaji: 'po', row: 'ぱ行' },
];

export const getKanaByRow = (row: string) => kanaData.filter(k => k.row === row);

export default kanaData;
