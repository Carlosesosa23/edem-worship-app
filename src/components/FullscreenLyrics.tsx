import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ZoomIn, ZoomOut, ChevronDown, Minus, Plus, Pause, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { SongContent } from './SongContent';
import { motion, AnimatePresence } from 'framer-motion';
import type { SingerColor, ArrangementBlock } from '../types';

interface FullscreenLyricsProps {
    content: string;
    title: string;
    songKey: string;
    voiceAssignments?: Record<string, string>;
    singerColors?: SingerColor[];
    onClose: () => void;
    arrangement?: ArrangementBlock[];
}

const FONT_SIZES = [
    { label: 'M', scale: 1.5 },
    { label: 'L', scale: 2 },
    { label: 'XL', scale: 2.5 },
    { label: '2XL', scale: 3 },
] as const;

/** Velocidades de scroll: px per frame (~60fps) */
const SPEED_MIN = 0.2;
const SPEED_MAX = 3.0;
const SPEED_STEP = 0.2;
const SPEED_DEFAULT = 0.8;

/**
 * Vista fullscreen para cantantes.
 * Muestra solo la letra en texto grande, sin acordes, con scroll suave.
 * Incluye controles de zoom y scroll automático con velocidad ajustable.
 */
export function FullscreenLyrics({
    content,
    title,
    songKey,
    voiceAssignments = {},
    singerColors = [],
    onClose,
    arrangement,
}: FullscreenLyricsProps) {
    const [fontIdx, setFontIdx] = useState(1); // Start at 'L'
    const [showControls, setShowControls] = useState(true);
    const [autoScroll, setAutoScroll] = useState(false);
    const [speed, setSpeed] = useState(SPEED_DEFAULT);
    const speedRef = useRef(speed);

    // Keep ref in sync so the animation frame reads the latest value
    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    const currentSize = FONT_SIZES[fontIdx];

    const zoomIn = useCallback(() => {
        setFontIdx(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
    }, []);

    const zoomOut = useCallback(() => {
        setFontIdx(prev => Math.max(prev - 1, 0));
    }, []);

    const increaseSpeed = useCallback(() => {
        setSpeed(prev => Math.min(parseFloat((prev + SPEED_STEP).toFixed(1)), SPEED_MAX));
    }, []);

    const decreaseSpeed = useCallback(() => {
        setSpeed(prev => Math.max(parseFloat((prev - SPEED_STEP).toFixed(1)), SPEED_MIN));
    }, []);

    // Auto-scroll with dynamic speed via ref
    useEffect(() => {
        if (!autoScroll) return;
        const container = document.getElementById('fullscreen-lyrics-scroll');
        if (!container) return;

        let animId: number;

        const scroll = () => {
            container.scrollTop += speedRef.current;
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') zoomIn();
            if (e.key === '-') zoomOut();
            if (e.key === ' ') {
                e.preventDefault();
                setAutoScroll(prev => !prev);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                increaseSpeed();
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                decreaseSpeed();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, zoomIn, zoomOut, increaseSpeed, decreaseSpeed]);

    // Lock body scroll + use Fullscreen API for true fullscreen
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        // Try native fullscreen
        const el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {
                // Safari / user-gesture requirement — gracefully ignore
            });
        }

        return () => {
            document.body.style.overflow = '';
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { /* ignore */ });
            }
        };
    }, []);

    /** Speed label for display */
    const speedLabel = speed.toFixed(1) + 'x';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background flex flex-col"
            style={{
                /* Ensure it truly covers everything including notch/status bar */
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                /* Override any parent transforms */
                margin: 0,
                padding: 0,
            }}
        >
            {/* Header — tap to toggle controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.header
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.15 }}
                        className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-lowest/90 backdrop-blur-xl border-b border-white/[0.03] z-10 shrink-0"
                    >
                        <div className="flex items-center gap-3 min-w-0">
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

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Key badge */}
                            <span className="bg-primary/10 text-primary text-[10px] font-bold serif-title px-3 py-1 rounded-full border border-primary/20">
                                {songKey}
                            </span>

                            <div className="h-6 w-[1px] bg-white/5 mx-0.5 sm:mx-1" />

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
                        arrangement={arrangement}
                    />
                </div>
            </div>

            {/* Bottom Controls — Speed + Auto-scroll */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        className="shrink-0 bg-surface-lowest/90 backdrop-blur-xl border-t border-white/[0.03] px-4 sm:px-6 py-3"
                    >
                        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
                            {/* Auto-scroll play/pause */}
                            <button
                                onClick={() => setAutoScroll(prev => !prev)}
                                className={cn(
                                    'h-10 w-10 flex items-center justify-center rounded-full transition-all shrink-0',
                                    autoScroll
                                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                                        : 'bg-surface-high text-text-muted hover:text-text-main hover:bg-surface-lighter'
                                )}
                            >
                                {autoScroll ? <Pause size={18} /> : <Play size={18} />}
                            </button>

                            {/* Speed control */}
                            <div className="flex items-center gap-2 flex-1 justify-center">
                                <button
                                    onClick={decreaseSpeed}
                                    disabled={speed <= SPEED_MIN}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-text-muted hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <Minus size={16} />
                                </button>

                                {/* Visual speed bar */}
                                <div className="flex-1 max-w-[200px] relative h-8 flex items-center">
                                    <div className="w-full h-1.5 bg-surface-high rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-200"
                                            style={{ width: `${((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100}%` }}
                                        />
                                    </div>
                                    {/* Draggable thumb (click-based for simplicity) */}
                                    <input
                                        type="range"
                                        min={SPEED_MIN}
                                        max={SPEED_MAX}
                                        step={SPEED_STEP}
                                        value={speed}
                                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                <button
                                    onClick={increaseSpeed}
                                    disabled={speed >= SPEED_MAX}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-text-muted hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <Plus size={16} />
                                </button>

                                <span className="text-[10px] font-black text-primary w-10 text-center tabular-nums">{speedLabel}</span>
                            </div>

                            {/* Scroll direction indicator */}
                            <div className="flex items-center gap-1 shrink-0">
                                {autoScroll ? (
                                    <ChevronDown size={16} className="text-primary animate-bounce" />
                                ) : (
                                    <ChevronDown size={16} className="text-text-muted/30" />
                                )}
                            </div>
                        </div>

                        {/* Hint text */}
                        <p className="text-center mt-2 text-[8px] text-text-muted/30 font-bold uppercase tracking-[0.3em]">
                            Espacio: play/pausa · Flechas: velocidad · +/-: zoom · ESC: salir
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
