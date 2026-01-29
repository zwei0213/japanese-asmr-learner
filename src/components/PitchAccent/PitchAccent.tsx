// Pitch Accent Visualization Component
import React from 'react';
import type { PitchAccent as PitchAccentType } from '../../types';
import './PitchAccent.css';

interface PitchAccentProps {
    reading: string;
    pitch?: PitchAccentType[];
    size?: 'small' | 'medium' | 'large';
}

export const PitchAccent: React.FC<PitchAccentProps> = ({
    reading,
    pitch,
    size = 'medium'
}) => {
    // If no pitch data, just show reading
    if (!pitch || pitch.length === 0) {
        return <span className="pitch-reading">{reading}</span>;
    }

    // Split reading into mora (basic Japanese syllables)
    const moras = splitIntoMora(reading);

    return (
        <div className={`pitch-accent pitch-${size}`}>
            <svg className="pitch-svg" viewBox={`0 0 ${moras.length * 30} 40`}>
                {/* Draw pitch contour line */}
                <path
                    d={generatePitchPath(pitch, moras.length)}
                    className="pitch-line"
                    fill="none"
                    strokeWidth="2"
                />
                {/* Draw dots at each mora position */}
                {pitch.map((p, i) => (
                    <circle
                        key={i}
                        cx={i * 30 + 15}
                        cy={p === 'H' ? 10 : 30}
                        r="4"
                        className={`pitch-dot ${p === 'H' ? 'high' : 'low'}`}
                    />
                ))}
            </svg>
            <div className="pitch-moras">
                {moras.map((mora, i) => (
                    <span
                        key={i}
                        className={`mora ${pitch[i] === 'H' ? 'high' : 'low'}`}
                    >
                        {mora}
                    </span>
                ))}
            </div>
        </div>
    );
};

// Split Japanese text into mora (syllables)
function splitIntoMora(text: string): string[] {
    const moras: string[] = [];
    const chars = [...text];

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const nextChar = chars[i + 1];

        // Small kana (っ, ゃ, ゅ, ょ, etc.) should be combined with previous
        if (nextChar && isSmallKana(nextChar)) {
            moras.push(char + nextChar);
            i++;
        } else {
            moras.push(char);
        }
    }

    return moras;
}

function isSmallKana(char: string): boolean {
    const smallKana = 'ゃゅょぁぃぅぇぉっャュョァィゥェォッ';
    return smallKana.includes(char);
}

function generatePitchPath(pitch: PitchAccentType[], length: number): string {
    if (length === 0) return '';

    let path = '';

    for (let i = 0; i < pitch.length; i++) {
        const x = i * 30 + 15;
        const y = pitch[i] === 'H' ? 10 : 30;

        if (i === 0) {
            path = `M ${x} ${y}`;
        } else {
            path += ` L ${x} ${y}`;
        }
    }

    return path;
}

export default PitchAccent;
