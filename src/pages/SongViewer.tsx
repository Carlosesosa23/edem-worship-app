import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSongs } from '../contexts/SongsContext';
import { transposeContent, normalizeContent, MAJOR_KEYS, MINOR_KEYS, getSemitonesDifference } from '../lib/transpose';
import { ArrowLeft, Edit, Music, User, Mic, Youtube, Trash2, Palette, X, Share2, Check, Timer, ChevronDown } from 'lucide-react';
import { LiveBanner } from '../components/LiveBanner';
import { DirectorControls } from '../components/DirectorControls';
import { Metronome } from '../components/Metronome';
import { SongContent } from '../components/SongContent';
import { useLiveSession, SINGER_COLORS } from '../contexts/LiveSessionContext';
import { cn } from '../lib/utils';
import { useShareSong } from '../hooks/useShareSong';
import { motion, AnimatePresence } from 'framer-motion';

function getYouTubeID(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function SongViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { songs, deleteSong } = useSongs();
    const { isDirector, liveState, assignSingerToLines, clearVoiceAssignments } = useLiveSession();

    const song = songs.find(s => s.id === id);

    const [selectedKey, setSelectedKey] = useState(song?.key || 'C');
    const [voiceMode, setVoiceMode] = useState(false);
    const [activeSinger, setActiveSinger] = useState<string | null>(null);
    const [metronomeOpen, setMetronomeOpen] = useState(false);
    const { share, status: shareStatus } = useShareSong();

    const transposedContent = useMemo(() => {
        if (!song) return '';
        const normalized = normalizeContent(song.content);
        const semitones = getSemitonesDifference(song.key, selectedKey);
        if (semitones === 0) return normalized;
        return transposeContent(normalized, semitones, song.key);
    }, [song, selectedKey]);

    if (!song) {
        return <div className="p-24 text-center serif-title text-text-muted">Archivo no encontrado</div>;
    }

    const isTransposed = selectedKey !== song.key;
    const voiceAssignments = liveState.voiceAssignments ?? {};

    const handleLineClick = (lineIdx: number) => {
        if (!isDirector || !voiceMode || activeSinger === null) return;
        const current = voiceAssignments[String(lineIdx)];
        const newKey = current === activeSinger ? null : activeSinger;
        assignSingerToLines([lineIdx], newKey);
    };

    return (
        <div className="bg-background min-h-screen pb-32 animate-fade-in sm:px-4">
            {/* Header Sticky - Editorial Glassmorphism */}
            <div className="sticky top-0 z-30 glass-panel border-b border-white/[0.03] px-4 py-3 flex justify-between items-center shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary active:scale-90"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="hidden md:block h-6 w-[1px] bg-white/5 mx-2" />
                    <div className="hidden md:block">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Interpretación</p>
                        <h2 className="serif-title font-bold text-sm text-text-main truncate max-w-[200px]">{song.title}</h2>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Key Selection - Tonal Pill */}
                    <div className="relative group">
                        <div className="flex items-center bg-surface-lowest rounded-full px-3 py-1.5 border border-white/5 shadow-inner group-hover:border-primary/20 transition-all">
                            <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mr-2">Tono:</span>
                            <select
                                value={selectedKey}
                                onChange={(e) => setSelectedKey(e.target.value)}
                                className="bg-transparent text-primary font-bold serif-title text-base appearance-none cursor-pointer focus:outline-none text-center min-w-[2.5rem] pr-4"
                            >
                                <optgroup label="Mayores" className="bg-surface-low text-text-main font-sans">
                                    {MAJOR_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </optgroup>
                                <optgroup label="Menores" className="bg-surface-low text-text-main font-sans">
                                    {MINOR_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </optgroup>
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-primary transition-colors" />
                        </div>
                    </div>

                    <div className="h-6 w-[1px] bg-white/5 mx-1" />

                    <div className="flex items-center gap-1">
                        {isDirector && (
                            <button
                                onClick={() => { setVoiceMode(v => !v); setActiveSinger(null); }}
                                className={cn(
                                    'w-10 h-10 flex items-center justify-center rounded-full transition-all',
                                    voiceMode ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-white/5'
                                )}
                                title="Asignar voces"
                            >
                                <Palette size={20} />
                            </button>
                        )}

                        <button
                            onClick={() => setMetronomeOpen(o => !o)}
                            className={cn(
                                'w-10 h-10 flex items-center justify-center rounded-full transition-all',
                                metronomeOpen ? 'bg-primary/20 text-primary' : 'text-text-muted hover:bg-white/5'
                            )}
                        >
                            <Timer size={20} />
                        </button>

                        <div className="hidden sm:flex items-center gap-1">
                            <button
                                onClick={() => share(song, selectedKey)}
                                className={cn(
                                    'w-10 h-10 flex items-center justify-center rounded-full transition-all',
                                    shareStatus === 'idle' ? 'text-text-muted hover:bg-white/5' : 'bg-green-500/10 text-green-400'
                                )}
                            >
                                {shareStatus === 'copied' || shareStatus === 'shared' ? <Check size={20} /> : <Share2 size={20} />}
                            </button>
                            
                            <Link to={`/edit/${song.id}`} className="w-10 h-10 flex items-center justify-center rounded-full text-text-muted hover:bg-white/5 transition-all">
                                <Edit size={20} />
                            </Link>

                            <button
                                onClick={async () => {
                                    if (window.confirm('¿ELIMINAR esta canción permanentemente?')) {
                                        await deleteSong(song.id);
                                        navigate('/songs');
                                    }
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-full text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voice Assignment Toolbar - Director Only */}
            <AnimatePresence>
                {isDirector && voiceMode && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="sticky top-[65px] z-20 glass-panel border-b border-white/5 px-4 py-3 shadow-xl backdrop-blur-xl overflow-hidden"
                    >
                        <div className="max-w-3xl mx-auto flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mr-2">Voz Activa:</span>
                            {SINGER_COLORS.map(s => (
                                <button
                                    key={s.key}
                                    onClick={() => setActiveSinger(prev => prev === s.key ? null : s.key)}
                                    className={cn(
                                        'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-sm',
                                        s.bg,
                                        activeSinger === s.key ? 'ring-2 ring-white scale-105 shadow-xl' : 'opacity-40 hover:opacity-100'
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                            <button
                                onClick={clearVoiceAssignments}
                                className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 px-3 py-1.5 rounded-full hover:bg-red-400/10 transition-all"
                            >
                                <X size={14} className="inline mr-1" /> Reset
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
                {/* Song Header Section */}
                <div className="mb-16 text-center space-y-6">
                    <header className="space-y-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-0.5 w-12 bg-primary/20 mb-2" />
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Propiedad de Edem Worship</p>
                        </div>
                        <h1 className="text-5xl md:text-6xl serif-title font-bold text-text-main leading-tight tracking-tight">
                            {song.title}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-text-muted/60 uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-surface-lowest">
                                <User size={14} className="text-primary/60" /> {song.artist}
                            </span>
                            {song.bpm && (
                                <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-surface-lowest">
                                    <Music size={14} className="text-primary/60" /> {song.bpm} BPM
                                </span>
                            )}
                        </div>
                    </header>

                    {song.bestSinger && (
                        <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-5 py-2 rounded-2xl border border-primary/10 shadow-inner">
                            <Mic size={14} /> Voz Predeterminada: {song.bestSinger}
                        </div>
                    )}
                </div>

                {/* Metronome Collapsible */}
                <AnimatePresence>
                    {metronomeOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-12 max-w-sm mx-auto"
                        >
                            <div className="tonal-card p-6 shadow-2xl relative border border-primary/10">
                                <Metronome
                                    initialBpm={song.bpm ?? 100}
                                    onClose={() => setMetronomeOpen(false)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="bg-surface-lowest/20 p-6 md:p-12 rounded-[2.5rem] border border-white/[0.02] shadow-inner font-mono relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none">
                        <Music size={240} />
                    </div>
                    
                    <SongContent
                        content={transposedContent}
                        voiceAssignments={voiceAssignments}
                        singerColors={SINGER_COLORS}
                        onLineClick={handleLineClick}
                        interactive={isDirector && voiceMode && activeSinger !== null}
                        size="base"
                    />
                </div>

                {/* YouTube Reference Section */}
                {song.youtubeUrl && (
                    <div className="mt-24 mb-12 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-[1px] flex-1 bg-white/[0.05]" />
                            <h3 className="serif-title font-bold text-2xl text-text-main italic flex items-center gap-3">
                                <Youtube className="text-red-500" size={28} />
                                Guía Auditiva
                            </h3>
                            <div className="h-[1px] flex-1 bg-white/[0.05]" />
                        </div>
                        
                        <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black/50 shadow-2xl border border-white/5">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${getYouTubeID(song.youtubeUrl)}`}
                                title="YouTube reference content"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="opacity-80 hover:opacity-100 transition-opacity duration-700"
                            ></iframe>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted/30 text-center uppercase tracking-[0.4em]">
                            Contenido Externo · Solo Referencia de Ensayos
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Quick Controls */}
            {isTransposed && (
                <motion.button
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={() => setSelectedKey(song.key)}
                    className="fixed bottom-24 right-6 bg-primary text-on-primary px-6 py-3 rounded-full shadow-2xl shadow-primary/20 text-[10px] font-black uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all z-40 border border-white/20"
                >
                    Original: {song.key}
                </motion.button>
            )}

            <LiveBanner />
            <DirectorControls />
        </div>
    );
}
