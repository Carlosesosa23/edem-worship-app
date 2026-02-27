export interface Song {
    id: string;
    title: string;
    artist: string;
    bpm?: number;
    content: string; // Lyrics with chords in ChordPro or bracket format
    key: string;
    originalKey?: string;
    bestSinger?: string;
    youtubeUrl?: string; // External Reference URL
    addedBy?: string;
    createdAt: number; // Timestamp
    updatedAt?: number;
}

export interface Mix {
    id: string;
    title: string;
    date: number; // Timestamp
    description?: string;
    songs: string[]; // Array of Song IDs
    createdBy?: string;
}

export interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    role: 'admin' | 'editor' | 'viewer';
}

export interface Participant {
    name: string;
    role?: string; // e.g. "Guitarra", "Voz", "Batería"
}

export interface WorshipEvent {
    id: string;
    title: string;
    date: number;           // Timestamp (ms)
    time?: string;          // "10:00 AM"
    type: 'servicio' | 'ensayo' | 'otro';
    mixId?: string;         // Optional linked Mix
    participants: Participant[];
    notes?: string;
    createdAt: number;
}
