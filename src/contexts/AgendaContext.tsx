import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { WorshipEvent } from '../types';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseEnabled } from '../lib/firebase';

interface AgendaContextType {
    events: WorshipEvent[];
    loading: boolean;
    addEvent: (event: Omit<WorshipEvent, 'id' | 'createdAt'>) => Promise<string>;
    updateEvent: (id: string, updates: Partial<WorshipEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export function AgendaProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<WorshipEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFirebaseEnabled && db) {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const loadedEvents = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as WorshipEvent[];
                setEvents(loadedEvents);
                setLoading(false);
            }, (error) => {
                console.error('Error fetching events:', error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            // LocalStorage fallback
            const localEvents = localStorage.getItem('edem_events');
            if (localEvents) setEvents(JSON.parse(localEvents));
            setLoading(false);
        }
    }, []);

    const saveLocal = (updated: WorshipEvent[]) => {
        setEvents(updated);
        localStorage.setItem('edem_events', JSON.stringify(updated));
    };

    const addEvent = async (event: Omit<WorshipEvent, 'id' | 'createdAt'>): Promise<string> => {
        if (isFirebaseEnabled && db) {
            // Firestore does NOT accept undefined values — sanitize before saving
            const sanitized = Object.fromEntries(
                Object.entries({ ...event, createdAt: Date.now() })
                    .filter(([, v]) => v !== undefined)
            );
            try {
                const docRef = await addDoc(collection(db, 'events'), sanitized);
                return docRef.id;
            } catch (error) {
                console.error('Error adding event to Firebase:', error);
                throw error;
            }
        } else {
            const newEvent: WorshipEvent = { ...event, id: crypto.randomUUID(), createdAt: Date.now() };
            saveLocal([...events, newEvent].sort((a, b) => a.date - b.date));
            return newEvent.id;
        }
    };

    const updateEvent = async (id: string, updates: Partial<WorshipEvent>) => {
        if (isFirebaseEnabled && db) {
            // Firestore does NOT accept undefined values — sanitize first
            const sanitized = Object.fromEntries(
                Object.entries(updates).filter(([, v]) => v !== undefined)
            );
            try {
                await updateDoc(doc(db, 'events', id), sanitized);
            } catch (error) {
                console.error('Error updating event in Firebase:', error);
                throw error;
            }
        } else {
            saveLocal(events.map(e => e.id === id ? { ...e, ...updates } : e));
        }
    };

    const deleteEvent = async (id: string) => {
        if (isFirebaseEnabled && db) {
            await deleteDoc(doc(db, 'events', id));
        } else {
            saveLocal(events.filter(e => e.id !== id));
        }
    };

    return (
        <AgendaContext.Provider value={{ events, loading, addEvent, updateEvent, deleteEvent }}>
            {children}
        </AgendaContext.Provider>
    );
}

export function useAgenda() {
    const ctx = useContext(AgendaContext);
    if (!ctx) throw new Error('useAgenda must be used within AgendaProvider');
    return ctx;
}
