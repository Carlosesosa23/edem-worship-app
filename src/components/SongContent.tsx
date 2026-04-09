import { cn } from '../lib/utils';
import type { SingerColor, ArrangementBlock } from '../types';
import { parseSongContent, type ParsedSection, type ParsedLine } from '../lib/songParser';
import { useMemo } from 'react';
import { Repeat, Hash } from 'lucide-react';

interface SongContentProps {
    content: string;
    voiceAssignments?: Record<string, string>;
    singerColors?: SingerColor[];
    /** Prefijo de clave para voiceAssignments (ej. songId en contexto de mix) */
    keyPrefix?: string;
    onLineClick?: (lineIdx: number) => void;
    interactive?: boolean;
    /** Tamaño base de fuente: 'sm' para MixSongItem, 'base' para SongViewer */
    size?: 'sm' | 'base';
    /** Modo cantante: muestra solo letra en texto grande, sin acordes */
    singerMode?: boolean;
    /** Arreglo personalizado de secciones (si se proporciona, se reordena/filtra) */
    arrangement?: ArrangementBlock[];
}

/**
 * Renderiza el contenido de una canción (letra + acordes) con soporte para:
 * - Secciones: {Verso}, {Coro}, {Intro}, {Puente}, etc.
 * - Repeticiones: // x2, // x3, //
 * - Modo cantante: texto grande sin acordes
 * - Scroll horizontal por línea para acordes (nunca rompe el layout)
 */
export function SongContent({
    content,
    voiceAssignments = {},
    singerColors = [],
    keyPrefix,
    onLineClick,
    interactive = false,
    size = 'base',
    singerMode = false,
    arrangement,
}: SongContentProps) {
    const parsedSections = useMemo(() => parseSongContent(content), [content]);

    // Apply custom arrangement: reorder/duplicate/filter sections
    const sections = useMemo(() => {
        if (!arrangement || arrangement.length === 0) return parsedSections;
        return arrangement
            .map(block => parsedSections[block.originalIndex])
            .filter(Boolean) as ParsedSection[];
    }, [parsedSections, arrangement]);

    // Tamaños según modo
    // singerMode: hereda fontSize del contenedor padre (controlado por zoom en FullscreenLyrics)
    // usando text-[1em] para que Tailwind no sobreescriba con un valor rem fijo
    const textSize = singerMode
        ? 'text-[1em]'
        : size === 'sm' ? 'text-base' : 'text-lg';
    const chordSize = size === 'sm' ? 'text-xs' : 'text-sm';
    const lineSpacing = singerMode ? 'mb-5' : 'mb-3';

    const renderChordLine = (line: ParsedLine) => {
        const assignKey = keyPrefix ? `${keyPrefix}:${line.originalIndex}` : String(line.originalIndex);
        const singerKey = voiceAssignments[assignKey];
        const singerCfg = singerKey ? singerColors.find(s => s.key === singerKey) : null;

        const highlightClass = singerCfg ? singerCfg.light : '';
        const borderClass = singerCfg
            ? `border-l-4 ${singerCfg.border}`
            : 'border-l-4 border-transparent';
        const interactiveClass = interactive
            ? 'cursor-pointer active:opacity-60 select-none'
            : '';

        const hasChords = line.text.includes('[');

        // ── Modo cantante: solo letra, sin acordes ──────────────────────────
        if (singerMode) {
            const lyricsOnly = hasChords
                ? line.text.replace(/\[[^\]]*\]/g, '').trim()
                : line.text;

            if (!lyricsOnly && !line.text) return (
                <div key={line.originalIndex} className={cn(lineSpacing, 'h-4')} />
            );

            return (
                <div
                    key={line.originalIndex}
                    onClick={() => onLineClick?.(line.originalIndex)}
                    className={cn(
                        lineSpacing, 'px-3 py-1.5 rounded-r-lg transition-all',
                        highlightClass, borderClass, interactiveClass,
                        textSize, 'leading-relaxed font-medium text-text-main break-words'
                    )}
                >
                    {singerCfg && (
                        <span className={cn(
                            'inline-block mb-2 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full leading-none text-white',
                            singerCfg.bg
                        )}>
                            {singerCfg.label}
                        </span>
                    )}
                    <span className="block">{lyricsOnly || '\u00A0'}</span>
                    {line.repeat !== undefined && (
                        <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-primary/60 uppercase tracking-widest">
                            <Repeat size={12} />
                            {line.repeat > 0 ? `x${line.repeat}` : '//'}
                        </span>
                    )}
                </div>
            );
        }

        // ── Línea con acordes (modo normal) ─────────────────────────────────
        if (hasChords) {
            const parts = line.text.split(/(\[[^\]]*\])/g);
            const segments: { chord: string; text: string }[] = [];
            let i = 0;
            while (i < parts.length) {
                const part = parts[i];
                if (part.startsWith('[') && part.endsWith(']')) {
                    const chord = part.replace(/[\[\]]/g, '');
                    const text = parts[i + 1] ?? '';
                    segments.push({ chord, text });
                    i += 2;
                } else {
                    if (part !== '') segments.push({ chord: '', text: part });
                    i += 1;
                }
            }

            return (
                <div
                    key={line.originalIndex}
                    onClick={() => onLineClick?.(line.originalIndex)}
                    className={cn(
                        lineSpacing, 'px-2 py-0.5 rounded-r-lg transition-all',
                        highlightClass, borderClass, interactiveClass,
                        'overflow-x-auto'
                    )}
                >
                    {singerCfg && (
                        <span className={cn(
                            'inline-block mb-1 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full leading-none text-white',
                            singerCfg.bg
                        )}>
                            {singerCfg.label}
                        </span>
                    )}

                    <div className="flex items-end w-max">
                        {segments.map((seg, j) => (
                            <span
                                key={j}
                                className="inline-flex flex-col items-start"
                                style={{ marginRight: seg.text ? 0 : '0.35rem' }}
                            >
                                <span className={cn(
                                    'font-bold leading-none mb-0.5 whitespace-nowrap',
                                    chordSize,
                                    singerCfg ? singerCfg.text : 'text-secondary',
                                    !seg.chord && 'invisible'
                                )}>
                                    {seg.chord || '\u00A0'}
                                </span>
                                <span className={cn(
                                    'leading-none whitespace-pre text-text-main',
                                    textSize
                                )}>
                                    {seg.text || (seg.chord ? '\u00A0' : '')}
                                </span>
                            </span>
                        ))}

                        {/* Repeat badge inline */}
                        {line.repeat !== undefined && (
                            <span className="inline-flex items-center gap-1 ml-4 text-[10px] font-black text-primary/70 uppercase tracking-widest self-center bg-primary/5 px-2 py-0.5 rounded-full">
                                <Repeat size={10} />
                                {line.repeat > 0 ? `x${line.repeat}` : '//'}
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        // ── Línea de solo texto ─────────────────────────────────────────────
        return (
            <div
                key={line.originalIndex}
                onClick={() => onLineClick?.(line.originalIndex)}
                className={cn(
                    'mb-2 px-2 py-0.5 rounded-r-lg transition-all flex items-center gap-2',
                    textSize, 'leading-snug',
                    highlightClass, borderClass, interactiveClass,
                    'break-words'
                )}
            >
                {singerCfg && (
                    <span className={cn(
                        'flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full leading-none text-white',
                        singerCfg.bg
                    )}>
                        {singerCfg.label}
                    </span>
                )}
                <span className="flex-1">{line.text || '\u00A0'}</span>
                {line.repeat !== undefined && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary/70 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                        <Repeat size={10} />
                        {line.repeat > 0 ? `x${line.repeat}` : '//'}
                    </span>
                )}
            </div>
        );
    };

    const renderSection = (section: ParsedSection, sectionIdx: number) => {
        const hasName = section.name.length > 0;

        return (
            <div key={sectionIdx} className={cn(hasName && 'mt-6 first:mt-0')}>
                {/* Section Header */}
                {hasName && (
                    <div className={cn(
                        'flex items-center gap-3 mb-4 pb-2',
                        singerMode ? 'border-b-2 border-primary/20' : 'border-b border-white/[0.05]'
                    )}>
                        <Hash size={singerMode ? 18 : 14} className="text-primary/50" />
                        <span className={cn(
                            'font-black uppercase tracking-[0.2em] text-primary',
                            singerMode ? 'text-[0.55em]' : 'text-[10px]'
                        )}>
                            {section.name}
                        </span>
                        <div className="flex-1 h-[1px] bg-primary/10" />
                    </div>
                )}

                {/* Section Lines */}
                <div className={cn(hasName && 'pl-2')}>
                    {section.lines.map(line => renderChordLine(line))}
                </div>
            </div>
        );
    };

    return (
        <div translate="no" className={cn(
            'notranslate text-text-main',
            singerMode ? 'font-sans' : 'font-mono'
        )}>
            {sections.map((section, idx) => renderSection(section, idx))}
        </div>
    );
}
