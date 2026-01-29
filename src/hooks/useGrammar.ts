// useGrammar Hook - Manage grammar library state
import { useCallback, useEffect } from 'react';
import type { GrammarPoint } from '../types';
import { grammarPatterns as initialPatterns } from '../data/grammarPatterns';
import { useLocalStorage } from './useLocalStorage';

export function useGrammar() {
    // Initialize with static data if local storage is empty
    const [grammarPoints, setGrammarPoints] = useLocalStorage<GrammarPoint[]>('grammar_library', []);

    // Load initial data if empty (run once)
    useEffect(() => {
        if (grammarPoints.length === 0 && initialPatterns.length > 0) {
            setGrammarPoints(initialPatterns);
        }
    }, []);

    // Add a new grammar point
    const addGrammar = useCallback((point: Omit<GrammarPoint, 'id'>) => {
        setGrammarPoints(prev => {
            const newPoint: GrammarPoint = {
                ...point,
                id: `grammar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
            return [...prev, newPoint];
        });
    }, [setGrammarPoints]);

    // Remove a grammar point
    const removeGrammar = useCallback((id: string) => {
        setGrammarPoints(prev => prev.filter(p => p.id !== id));
    }, [setGrammarPoints]);

    // Update a grammar point
    const updateGrammar = useCallback((id: string, updates: Partial<GrammarPoint>) => {
        setGrammarPoints(prev => prev.map(p => {
            if (p.id !== id) return p;
            return { ...p, ...updates };
        }));
    }, [setGrammarPoints]);

    // Search grammar
    const searchGrammar = useCallback((query: string) => {
        const lowerQuery = query.toLowerCase();
        return grammarPoints.filter(p =>
            p.pattern.toLowerCase().includes(lowerQuery) ||
            p.meaning.toLowerCase().includes(lowerQuery) ||
            p.notes?.toLowerCase().includes(lowerQuery)
        );
    }, [grammarPoints]);

    return {
        grammarPoints: grammarPoints.length > 0 ? grammarPoints : initialPatterns,
        addGrammar,
        removeGrammar,
        updateGrammar,
        searchGrammar,
    };
}

export default useGrammar;
