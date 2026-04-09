import { useState, useMemo } from 'react';
import type { Song } from '../types/index';
import { transposeContent, normalizeContent, MAJOR_KEYS, MINOR_KEYS, getSemitonesDifference } from '../lib/transpose';
import { Music, User, ChevronDown, Timer, Play, Radio } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLiveSession, SINGER_COLORS } from '../contexts/LiveSessionContext';
import { Metronome } from './Metronome';
import { SongContent } from './SongContent';
import { motion, AnimatePresence } from 'framer-motion';

interface MixSongItemProps {
    song: Song;
    index: number;
    voiceMode: boolean;
    activeSinger: string | null;
}

export function MixSongItem({ song, index, voiceMode, activeSinger }: MixSongItemProps) {
    const { isDirector, setActiveSong, clearActiveSong, liveState, assignSingerToLines } = useLiveSession();

    const isActive = liveState.activeSongId === song.id;
    const voiceAssignments = liveState.voiceAssignments ?? {};

    const [selectedKey, setSelectedKey] = useState(song.key || 'C');
    const [metronomeOpen, setMetronomeOpen] = useState(false);

    const transposedContent = useMemo(() => {
        const normalized = normalizeContent(song.content);
        const semitones = getSemitonesDifference(song.key, selectedKey);
        if (semitones === 0) return normalized;
        return transposeContent(normalized, semitones, song.key);
    }, [song.content, song.key, selectedKey]);

    const handleLineClick = (lineIdx: number) => {
        if (!isDirector || !voiceMode || activeSinger === null) return;
        const key = `${song.id}:${lineIdx}`;
        const current = voiceAssignments[key];
        const newSingerKey = current === activeSinger ? null : activeSinger;
        assignSingerToLines([lineIdx], newSingerKey, song.id);
    };

    const usedSingers = SINGER_COLORS.filter(s =>
        Object.entries(voiceAssignments).some(
            ([k, v]) => k.startsWith(`${song.id}:`) && v === s.key
        )
    );

    return (
        <section
            id={`song-${song.id}`}
            className={cn(
                "scroll-mt-48 transition-all duration-700",
                isActive ? "scale-[1.02] shadow-2xl shadow-primary/10" : ""
            )}
        >
            {/* Song Segment Header - Sticky Inside Scroller */}
            <header className="sticky top-[110px] z-20 bg-background/90 backdrop-blur-xl py-6 border-b border-white/[0.03] shadow-sm mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="w-10 h-10 rounded-2xl bg-surface-low border border-white/5 text-[10px] font-black flex items-center justify-center text-primary shadow-inner">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            
                            <AnimatePresence>
                                {isActive && (
                                    <motion.span 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-primary text-on-primary text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-primary/20 flex items-center gap-2 uppercase tracking-[0.2em]"
                                    >
                                        <Radio size={12} className="animate-pulse" /> Interpretando Ahora
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Per-song singer legend */}
                            <div className="flex gap-1.5 flex-wrap">
                                {usedSingers.map(s => (
                                    <span key={s.key} className={cn(
                                        'text-[9px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest shadow-sm',
                                        s.bg
                                    )}>
                                        {s.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-4xl md:text-5xl serif-title font-bold text-text-main tracking-tight">
                                {song.title}
                            </h2>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-1.5"><User size={14} className="text-primary/40" /> {song.artist}</span>
                                <span className="w-1 h-1 rounded-full bg-white/5" />
                                {song.bpm && <span className="flex items-center gap-1.5"><Timer size={14} className="text-secondary/40" /> {song.bpm} BPM</span>}
                            </div>
                        </div>
                    </div>

                    {/* Controls Suite */}
                    <div className="flex items-center gap-2 bg-surface-low/30 p-2 rounded-[1.5rem] border border-white/[0.03] shadow-inner self-start md:self-end">
                        <button
                            onClick={() => setMetronomeOpen(o => !o)}
                            className={cn(
                                'w-10 h-10 flex items-center justify-center rounded-xl transition-all',
                                metronomeOpen ? 'bg-primary/10 text-primary shadow-lg border border-primary/20' : 'text-text-muted hover:bg-white/5'
                            )}
                        >
                            <Timer size={18} />
                        </button>

                        <div className="h-6 w-[1px] bg-white/5 mx-1" />

                        <div className="relative group flex items-center px-4 py-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                            <span className="text-[10px] font-black text-primary serif-title mr-2">{selectedKey}</span>
                            <ChevronDown size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                            <select
                                value={selectedKey}
                                onChange={(e) => setSelectedKey(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            >
                                <optgroup label="Mayores" className="bg-surface-low text-text-main font-sans">
                                    {MAJOR_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </optgroup>
                                <optgroup label="Menores" className="bg-surface-low text-text-main font-sans">
                                    {MINOR_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </optgroup>
                            </select>
                        </div>

                        {isDirector && (
                            <>
                                <div className="h-6 w-[1px] bg-white/5 mx-1" />
                                <button
                                    onClick={() => {
                                        if (isActive) clearActiveSong();
                                        else setActiveSong(song.id);
                                    }}
                                    className={cn(
                                        "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg",
                                        isActive
                                            ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                            : "bg-primary text-on-primary shadow-primary/20 hover:scale-105 active:scale-95"
                                    )}
                                >
                                    {isActive ? <Radio size={14} /> : <Play size={14} />}
                                    {isActive ? "Off-Air" : "Broadcast"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Metronome Collapsible */}
            <AnimatePresence>
                {metronomeOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-12 max-w-sm overflow-hidden"
                    >
                        <div className="tonal-card p-6 border border-primary/10 shadow-2xl relative">
                            <Metronome
                                initialBpm={song.bpm ?? 100}
                                onClose={() => setMetronomeOpen(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Song Content Segment */}
            <div className="bg-surface-lowest/10 p-4 md:p-10 rounded-[2.5rem] border border-white/[0.02] shadow-inner relative group transition-colors hover:bg-surface-lowest/[0.15]">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
                    <Music size={120} />
                </div>
                
                <SongContent
                    content={transposedContent}
                    voiceAssignments={voiceAssignments}
                    singerColors={SINGER_COLORS}
                    keyPrefix={song.id}
                    onLineClick={handleLineClick}
                    interactive={isDirector && voiceMode && activeSinger !== null}
                    size="sm"
                />
            </div>
            
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent mt-24 mb-12" />
        </section>
    );
}
