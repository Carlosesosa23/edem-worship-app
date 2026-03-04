import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db, isFirebaseEnabled } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import type { VoiceAssignments, SingerColor } from '../types';

interface LiveState {
    activeSongId: string | null;
    activeMixId: string | null;
    currentSignal: string | null;
    timestamp: number;
    voiceAssignments: VoiceAssignments; // lineIdx → singerKey
}

interface LiveSessionContextType {
    liveState: LiveState;
    isDirector: boolean;
    toggleDirectorMode: () => void;
    setActiveSong: (songId: string) => Promise<void>;
    sendSignal: (signal: string) => Promise<void>;
    clearSignal: () => Promise<void>;
    clearActiveSong: () => Promise<void>;
    assignSingerToLines: (lineIndexes: number[], singerKey: string | null, songId?: string) => Promise<void>;
    clearVoiceAssignments: () => Promise<void>;
}

const LiveSessionContext = createContext<LiveSessionContextType | undefined>(undefined);

export const SIGNALS = [
    { label: "Ministrar", color: "bg-fuchsia-600" },
    { label: "Fluir", color: "bg-cyan-600" },
    { label: "Coro", color: "bg-indigo-600" },
    { label: "Intro", color: "bg-emerald-600" },
    { label: "Verso", color: "bg-blue-600" },
    { label: "Puente", color: "bg-violet-600" },
    { label: "TERMINAR", color: "bg-rose-600 font-bold" },
    { label: "Predicador subiendo", color: "bg-amber-600" },
    { label: "Nueva Canción Solicitada", color: "bg-pink-600" },
];

export const SINGER_COLORS: SingerColor[] = [
    { key: "fuchsia", label: "Cantante 1", bg: "bg-fuchsia-500", text: "text-fuchsia-300", border: "border-fuchsia-400", light: "bg-fuchsia-500/20" },
    { key: "cyan",    label: "Cantante 2", bg: "bg-cyan-500",    text: "text-cyan-300",    border: "border-cyan-400",    light: "bg-cyan-500/20"  },
    { key: "emerald", label: "Cantante 3", bg: "bg-emerald-500", text: "text-emerald-300", border: "border-emerald-400", light: "bg-emerald-500/20" },
    { key: "amber",   label: "Cantante 4", bg: "bg-amber-500",   text: "text-amber-300",   border: "border-amber-400",   light: "bg-amber-500/20" },
    { key: "indigo",  label: "Cantante 5", bg: "bg-indigo-500",  text: "text-indigo-300",  border: "border-indigo-400",  light: "bg-indigo-500/20" },
    { key: "todos",   label: "Todos",      bg: "bg-white",       text: "text-slate-800",   border: "border-white/60",    light: "bg-white/10"      },
];

const INITIAL_STATE: LiveState = {
    activeSongId: null,
    activeMixId: null,
    currentSignal: null,
    timestamp: Date.now(),
    voiceAssignments: {},
};

export function LiveSessionProvider({ children }: { children: ReactNode }) {
    const [liveState, setLiveState] = useState<LiveState>(INITIAL_STATE);
    const [isDirector, setIsDirector] = useState(() => {
        return localStorage.getItem('edem_is_director') === 'true';
    });

    // Load state from source (Firebase or Local)
    useEffect(() => {
        if (isFirebaseEnabled && db) {
            const unsub = onSnapshot(doc(db, 'sessions', 'live'), (snap) => {
                if (snap.exists()) {
                    const data = snap.data() as Partial<LiveState>;
                    setLiveState({ ...INITIAL_STATE, ...data });
                }
            });
            return () => unsub();
        } else {
            const handleStorageChange = (e: StorageEvent) => {
                if (e.key === 'edem_live_session' && e.newValue) {
                    setLiveState(JSON.parse(e.newValue));
                }
            };
            window.addEventListener('storage', handleStorageChange);
            const stored = localStorage.getItem('edem_live_session');
            if (stored) setLiveState(JSON.parse(stored));
            return () => window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    const toggleDirectorMode = () => {
        const newState = !isDirector;
        setIsDirector(newState);
        localStorage.setItem('edem_is_director', String(newState));
    };

    const updateState = async (updates: Partial<LiveState>) => {
        const newState: LiveState = { ...liveState, ...updates, timestamp: Date.now() };
        setLiveState(newState);

        if (isFirebaseEnabled && db) {
            const sanitized = Object.fromEntries(
                Object.entries(newState).filter(([, v]) => v !== undefined)
            );
            await setDoc(doc(db, 'sessions', 'live'), {
                ...sanitized,
                updatedAt: serverTimestamp()
            });
        } else {
            localStorage.setItem('edem_live_session', JSON.stringify(newState));
        }
    };

    const setActiveSong = async (songId: string) => {
        await updateState({ activeSongId: songId });
    };

    const sendSignal = async (signal: string) => {
        await updateState({ currentSignal: signal });
    };

    const clearSignal = async () => {
        await updateState({ currentSignal: null });
    };

    const clearActiveSong = async () => {
        await updateState({ activeSongId: null });
    };

    const assignSingerToLines = async (lineIndexes: number[], singerKey: string | null, songId?: string) => {
        const updated: VoiceAssignments = { ...liveState.voiceAssignments };
        lineIndexes.forEach(idx => {
            // If songId provided (mix context), use "songId:lineIdx" as key
            const key = songId ? `${songId}:${idx}` : String(idx);
            if (singerKey === null) {
                delete updated[key];
            } else {
                updated[key] = singerKey;
            }
        });
        await updateState({ voiceAssignments: updated });
    };

    const clearVoiceAssignments = async () => {
        await updateState({ voiceAssignments: {} });
    };

    return (
        <LiveSessionContext.Provider value={{
            liveState,
            isDirector,
            toggleDirectorMode,
            setActiveSong,
            sendSignal,
            clearSignal,
            clearActiveSong,
            assignSingerToLines,
            clearVoiceAssignments,
        }}>
            {children}
        </LiveSessionContext.Provider>
    );
}

export const useLiveSession = () => {
    const context = useContext(LiveSessionContext);
    if (!context) throw new Error('useLiveSession must be used within LiveSessionProvider');
    return context;
};
