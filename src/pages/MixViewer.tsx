import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMixes } from '../contexts/MixesContext';
import { useSongs } from '../contexts/SongsContext';
import { ArrowLeft, Calendar, Music, Trash2, Palette, X, Edit, Share2, Check } from 'lucide-react';
import { MixSongItem } from '../components/MixSongItem';
import { LiveBanner } from '../components/LiveBanner';
import { DirectorControls } from '../components/DirectorControls';
import { NowPlayingBar } from '../components/NowPlayingBar';
import { useLiveSession, SINGER_COLORS } from '../contexts/LiveSessionContext';
import { useShareMix } from '../hooks/useShareMix';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function MixViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { mixes, deleteMix } = useMixes();
    const { songs } = useSongs();
    const { liveState, isDirector, clearVoiceAssignments } = useLiveSession();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [voiceMode, setVoiceMode] = useState(false);
    const [activeSinger, setActiveSinger] = useState<string | null>(null);
    const { share: shareMix, status: shareStatus } = useShareMix();

    const mix = mixes.find(m => m.id === id);

    if (!mix) {
        return <div className="p-24 text-center serif-title text-text-muted italic">Repositorio no encontrado</div>;
    }

    const mixSongs = mix.songs.map(songId => songs.find(s => s.id === songId)).filter(Boolean);

    const scrollToSong = (songId: string) => {
        const element = document.getElementById(`song-${songId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="bg-background min-h-screen text-text-main pb-40 animate-fade-in font-sans" ref={scrollContainerRef}>
            {/* Header Sticky - Editorial Glassmorphism */}
            <div className="sticky top-0 z-40 glass-panel border-b border-white/[0.03] shadow-2xl backdrop-blur-2xl">
                <NowPlayingBar />

                <div className="px-4 py-4 max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary active:scale-90">
                            <ArrowLeft size={22} />
                        </button>
                        <div className="h-6 w-[1px] bg-white/5 mx-1" />
                        <div className="hidden sm:block">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Servicio de Alabanza</p>
                            <h2 className="serif-title font-bold text-sm text-text-main truncate max-w-[200px]">{mix.title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                            onClick={() => shareMix(mix, songs)}
                            className={cn(
                                'w-10 h-10 flex items-center justify-center rounded-full transition-all',
                                shareStatus === 'idle' ? 'text-text-muted hover:bg-white/5' : 'bg-green-500/10 text-green-400'
                            )}
                        >
                            {shareStatus === 'copied' || shareStatus === 'shared' ? <Check size={20} /> : <Share2 size={20} />}
                        </button>

                        <div className="h-6 w-[1px] bg-white/5 mx-1" />

                        <Link
                            to={`/mixes/edit/${mix.id}`}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-text-muted hover:bg-white/5 transition-all"
                            title="Editar mix"
                        >
                            <Edit size={20} />
                        </Link>
                        <button
                            onClick={async () => {
                                if (window.confirm('¿ELIMINAR este mix permanentemente?')) {
                                    await deleteMix(mix.id);
                                    navigate('/mixes');
                                }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            title="Eliminar mix"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Quick Navigation - Horizontal Band */}
                <div className="bg-surface-low/30 border-t border-white/[0.02]">
                    <div className="max-w-5xl mx-auto px-4 overflow-x-auto pb-4 pt-1 scrollbar-hide flex gap-3 mask-fade-right">
                        {mixSongs.map((song, idx) => song && (
                            <button
                                key={song.id}
                                onClick={() => scrollToSong(song.id)}
                                className={cn(
                                    'flex-shrink-0 h-10 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all active:scale-95 flex items-center gap-2 border box-border shadow-sm group',
                                    liveState.activeSongId === song.id
                                        ? 'bg-primary text-on-primary border-primary shadow-xl shadow-primary/20 scale-105'
                                        : 'bg-surface-lowest/50 border-white/5 text-text-muted/60 hover:bg-surface-low hover:text-text-main hover:border-primary/20'
                                )}
                            >
                                <span className={cn('opacity-30 group-hover:opacity-100 transition-opacity', liveState.activeSongId === song.id && 'opacity-100')}>
                                    {String(idx + 1).padStart(2, '0')}.
                                </span>
                                {song.title}
                                {liveState.activeSongId === song.id && (
                                    <div className="w-2 h-2 rounded-full bg-on-primary animate-pulse ml-1 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Voice Assignment - Director Context */}
                <AnimatePresence>
                    {isDirector && voiceMode && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/[0.03] px-4 py-3 bg-surface-lowest/40"
                        >
                            <div className="max-w-5xl mx-auto flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest mr-2">Voz activa:</span>
                                {SINGER_COLORS.map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => setActiveSinger(prev => prev === s.key ? null : s.key)}
                                        className={cn(
                                            'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95',
                                            s.bg,
                                            activeSinger === s.key ? 'ring-2 ring-white scale-105 shadow-xl' : 'opacity-30 hover:opacity-100'
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
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 space-y-24">
                {/* Mix Poster Header */}
                <header className="text-center space-y-6">
                    <div className="flex flex-col items-center gap-1">
                        <div className="h-0.5 w-12 bg-primary/20 mb-2" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Liturgia y Alabanza</p>
                    </div>
                    <h1 className="text-5xl md:text-7xl serif-title font-bold text-text-main leading-tight tracking-tight">
                        {mix.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-text-muted/60 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-surface-lowest/50 shadow-inner">
                            <Calendar size={14} className="text-primary/60" />
                            {new Date(mix.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-surface-lowest/50 shadow-inner">
                            <Music size={14} className="text-primary/60" /> {mixSongs.length} Temas
                        </span>
                    </div>
                    <div className="h-[1px] w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-white/[0.05] to-transparent mt-12" />
                </header>

                {/* Song Program Section */}
                <div className="space-y-32">
                    {mixSongs.map((song, index) => {
                        if (!song) return null;
                        return (
                            <MixSongItem
                                key={`${mix.id}-${song.id}-${index}`}
                                song={song}
                                index={index}
                                voiceMode={voiceMode}
                                activeSinger={activeSinger}
                            />
                        );
                    })}
                </div>

                {/* Footer Transition */}
                {mixSongs.length === 0 ? (
                    <div className="text-center py-32 bg-surface-low/10 rounded-[3rem] border border-dashed border-white/5 opacity-50">
                        <p className="serif-title italic text-lg text-text-muted">Este repertorio carece de contenido.</p>
                        <Link to={`/mixes/edit/${mix.id}`} className="mt-6 btn-primary inline-flex">
                            Añadir Repertorio
                        </Link>
                    </div>
                ) : (
                    <div className="text-center pt-24 pb-12 opacity-30">
                        <div className="h-0.5 w-8 bg-text-muted mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Fin de la Liturgia</p>
                    </div>
                )}
            </div>

            <LiveBanner />
            <DirectorControls />
        </div>
    );
}
