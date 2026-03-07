import { cn } from '../lib/utils';
import type { SingerColor } from '../types';

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
}

/**
 * Renderiza el contenido de una canción (letra + acordes) de forma
 * responsiva para móvil:
 *
 * - Líneas con acordes: scroll horizontal si no caben — el acorde NUNCA
 *   se separa de su sílaba (overflow-x: auto por línea).
 * - Líneas de solo texto: wrap normal.
 * - Fuente monospace para alineación correcta de acordes.
 */
export function SongContent({
    content,
    voiceAssignments = {},
    singerColors = [],
    keyPrefix,
    onLineClick,
    interactive = false,
    size = 'base',
}: SongContentProps) {
    const lines = content.split('\n');

    const textSize    = size === 'sm' ? 'text-base' : 'text-lg';
    const chordSize   = size === 'sm' ? 'text-xs'   : 'text-sm';

    const renderLine = (line: string, lineIdx: number) => {
        const assignKey  = keyPrefix ? `${keyPrefix}:${lineIdx}` : String(lineIdx);
        const singerKey  = voiceAssignments[assignKey];
        const singerCfg  = singerKey ? singerColors.find(s => s.key === singerKey) : null;

        const highlightClass  = singerCfg ? singerCfg.light : '';
        const borderClass     = singerCfg
            ? `border-l-4 ${singerCfg.border}`
            : 'border-l-4 border-transparent';
        const interactiveClass = interactive
            ? 'cursor-pointer active:opacity-60 select-none'
            : '';

        const hasChords = line.includes('[');

        // ── Línea con acordes ────────────────────────────────────────────────
        if (hasChords) {
            const parts    = line.split(/(\[[^\]]*\])/g);
            const segments: { chord: string; text: string }[] = [];
            let i = 0;
            while (i < parts.length) {
                const part = parts[i];
                if (part.startsWith('[') && part.endsWith(']')) {
                    const chord = part.replace(/[\[\]]/g, '');
                    const text  = parts[i + 1] ?? '';
                    segments.push({ chord, text });
                    i += 2;
                } else {
                    if (part !== '') segments.push({ chord: '', text: part });
                    i += 1;
                }
            }

            return (
                <div
                    key={lineIdx}
                    onClick={() => onLineClick?.(lineIdx)}
                    className={cn(
                        'mb-3 px-2 py-0.5 rounded-r-lg transition-all',
                        highlightClass,
                        borderClass,
                        interactiveClass,
                        // Scroll horizontal solo en esta línea — nunca rompe el layout
                        'overflow-x-auto'
                    )}
                >
                    {/* Badge del cantante */}
                    {singerCfg && (
                        <span className={cn(
                            'inline-block mb-1 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full leading-none text-white',
                            singerCfg.bg
                        )}>
                            {singerCfg.label}
                        </span>
                    )}

                    {/*
                     * Contenedor inline-flex sin wrap.
                     * Cada segmento es una columna: acorde arriba, sílaba abajo.
                     * Al no hacer wrap, el acorde siempre queda sobre su sílaba.
                     * Si la línea es muy larga → scroll horizontal del contenedor padre.
                     */}
                    <div className="flex items-end w-max">
                        {segments.map((seg, j) => (
                            <span
                                key={j}
                                className="inline-flex flex-col items-start"
                                // Separación mínima entre segmentos para legibilidad
                                style={{ marginRight: seg.text ? 0 : '0.35rem' }}
                            >
                                {/* Acorde */}
                                <span className={cn(
                                    'font-bold leading-none mb-0.5 whitespace-nowrap',
                                    chordSize,
                                    singerCfg ? singerCfg.text : 'text-secondary',
                                    !seg.chord && 'invisible'
                                )}>
                                    {seg.chord || '\u00A0'}
                                </span>
                                {/* Sílaba / texto */}
                                <span className={cn(
                                    'leading-none whitespace-pre text-text-main',
                                    textSize
                                )}>
                                    {seg.text || (seg.chord ? '\u00A0' : '')}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            );
        }

        // ── Línea de solo texto (letra sin acordes, sección, etc.) ──────────
        return (
            <div
                key={lineIdx}
                onClick={() => onLineClick?.(lineIdx)}
                className={cn(
                    'mb-2 px-2 py-0.5 rounded-r-lg transition-all flex items-center gap-2',
                    textSize, 'leading-snug',
                    highlightClass,
                    borderClass,
                    interactiveClass,
                    // Texto normal: wrap suave, no corta palabras
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
                <span>{line || '\u00A0'}</span>
            </div>
        );
    };

    return (
        <div translate="no" className="notranslate font-mono text-text-main">
            {lines.map((line, idx) => renderLine(line, idx))}
        </div>
    );
}
