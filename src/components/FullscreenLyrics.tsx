import { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { SongContent } from './SongContent';
import { motion, AnimatePresence } from 'framer-motion';
import type { SingerColor } from '../types';

interface FullscreenLyricsProps {
    content: string;
    title: string;
    songKey: string;
    voiceAssignments?: Record<string, string>;
    singerColors?: SingerColor[];
    onClose: () => void;
}

const FONT_SIZES = [
    { label: 'M', scale: 1 },
    { label: 'L', scale: 1.3 },
    { label: 'XL', scale: 1.6 },
    { label: '2XL', scale: 2 },
] as const;

/**
 * Vista fullscreen para cantantes.
 * Muestra solo la letra en texto grande, sin acordes, con scroll suave.
 * Incluye controles de zoom y scroll automático.
 */
export function FullscreenLyrics({
    content,
    title,
    songKey,
    voiceAssignments = {},
    singerColors = [],
    onClose,
}: FullscreenLyricsProps) {
    const [fontIdx, setFontIdx] = useState(1); // Start at 'L'
    const [showControls, setShowControls] = useState(true);
    const [autoScroll, setAutoScroll] = useState(false);

    const currentSize = FONT_SIZES[fontIdx];

    const zoomIn = useCallback(() => {
        setFontIdx(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
    }, []);

    const zoomOut = useCallback(() => {
        setFontIdx(prev => Math.max(prev - 1, 0));
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (!autoScroll) return;
        const container = document.getElementById('fullscreen-lyrics-scroll');
        if (!container) return;

        const speed = 0.5; // px per frame
        let animId: number;

        const scroll = () => {
            container.scrollTop += speed;
            // Stop at bottom
            if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
                setAutoScroll(false);
                return;
            }
            animId = requestAnimationFrame(scroll);
        };
        animId = requestAnimationFrame(scroll);

        return () => cancelAnimationFrame(animId);
    }, [autoScroll]);

    // ESC to close
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') zoomIn();
            if (e.key === '-') zoomOut();
            if (e.key === ' ') {
                e.preventDefault();
                setAutoScroll(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, zoomIn, zoomOut]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
        >
            {/* Header — tap to toggle controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.header
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.15 }}
                        className="flex items-center justify-between px-6 py-4 bg-surface-lowest/80 backdrop-blur-xl border-b border-white/[0.03] z-10"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-text-muted hover:text-primary transition-all active:scale-90 shrink-0"
                            >
                                <X size={22} />
                            </button>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Modo Cantante</p>
                                <h2 className="serif-title font-bold text-sm text-text-main truncate">{title}</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Key badge */}
                            <span className="bg-primary/10 text-primary text-[10px] font-bold serif-title px-3 py-1 rounded-full border border-primary/20">
                                {songKey}
                            </span>

                            <div className="h-6 w-[1px] bg-white/5 mx-1" />

                            {/* Zoom controls */}
                            <button
                                onClick={zoomOut}
                                disabled={fontIdx === 0}
                                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-text-muted hover:text-primary transition-all disabled:opacity-20"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="text-[10px] font-black text-primary w-8 text-center">{currentSize.label}</span>
                            <button
                                onClick={zoomIn}
                                disabled={fontIdx === FONT_SIZES.length - 1}
                                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-text-muted hover:text-primary transition-all disabled:opacity-20"
                            >
                                <ZoomIn size={18} />
                            </button>

                            <div className="h-6 w-[1px] bg-white/5 mx-1" />

                            {/* Auto-scroll toggle */}
                            <button
                                onClick={() => setAutoScroll(prev => !prev)}
                                className={cn(
                                    'h-9 px-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5',
                                    autoScroll
                                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                                        : 'bg-surface-high text-text-muted hover:text-text-main'
                                )}
                            >
                                {autoScroll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                Scroll
                            </button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Lyrics Area */}
            <div
                id="fullscreen-lyrics-scroll"
                className="flex-1 overflow-y-auto overflow-x-hidden px-6 md:px-12 lg:px-24 py-12"
                onClick={() => setShowControls(prev => !prev)}
                style={{ fontSize: `${currentSize.scale}rem` }}
            >
                <div className="max-w-4xl mx-auto">
                    <SongContent
                        content={content}
                        voiceAssignments={voiceAssignments}
                        singerColors={singerColors}
                        singerMode
                        size="base"
                    />
                </div>
            </div>

            {/* Bottom hint */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="text-center py-3 text-[9px] text-text-muted/30 font-bold uppercase tracking-[0.3em] bg-surface-lowest/50"
                    >
                        Toca para ocultar controles · Espacio para auto-scroll · ESC para salir
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
