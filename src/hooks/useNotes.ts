// useNotes Hook - Manage study notes from AI explanations
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface StudyNote {
    id: string;
    type: 'word' | 'grammar' | 'sentence' | 'general';
    title: string;
    content: string;
    source?: string;  // e.g., "AI助手" or "词典"
    createdAt: string;
    tags?: string[];
}

export function useNotes() {
    const [notes, setNotes] = useLocalStorage<StudyNote[]>('study_notes', []);

    // Add a new note
    const addNote = useCallback((note: Omit<StudyNote, 'id' | 'createdAt'>) => {
        const newNote: StudyNote = {
            ...note,
            id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        setNotes(prev => [newNote, ...prev]);
        return newNote.id;
    }, [setNotes]);

    // Remove a note
    const removeNote = useCallback((id: string) => {
        setNotes(prev => prev.filter(note => note.id !== id));
    }, [setNotes]);

    // Update a note
    const updateNote = useCallback((id: string, updates: Partial<StudyNote>) => {
        setNotes(prev => prev.map(note => {
            if (note.id !== id) return note;
            return { ...note, ...updates };
        }));
    }, [setNotes]);

    // Get notes by type
    const getNotesByType = useCallback((type: StudyNote['type']) => {
        return notes.filter(note => note.type === type);
    }, [notes]);

    // Search notes
    const searchNotes = useCallback((query: string) => {
        const lowerQuery = query.toLowerCase();
        return notes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }, [notes]);

    return {
        notes,
        addNote,
        removeNote,
        updateNote,
        getNotesByType,
        searchNotes,
    };
}

export default useNotes;
