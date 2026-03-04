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

/** Asignación de voz por línea: key = índice de línea como string, value = singerKey (ej. "purple") */
export type VoiceAssignments = Record<string, string>;

/** Paleta de un cantante: color Tailwind completo para bg y texto */
export interface SingerColor {
    key: string;       // identificador único, ej. "purple"
    label: string;     // nombre visible, ej. "Cantante 1"
    bg: string;        // clase Tailwind completa, ej. "bg-purple-500"
    text: string;      // clase Tailwind completa, ej. "text-purple-300"
    border: string;    // clase Tailwind completa, ej. "border-purple-400"
    light: string;     // bg suave para highlight de línea, ej. "bg-purple-500/20"
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
