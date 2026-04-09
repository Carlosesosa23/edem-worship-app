/**
 * songParser.ts — Parser de secciones y repeticiones para canciones.
 *
 * Formato de secciones (en el texto plano de la canción):
 *   {Verso}           → marcador de sección
 *   {Coro}            → marcador de sección
 *   {Intro}           → marcador de sección
 *   {Puente}          → marcador de sección
 *   {Pre-Coro}        → marcador de sección
 *   {Outro}           → marcador de sección
 *   {Instrumental}    → marcador de sección
 *
 * Formato de repeticiones:
 *   // x2    → repetir 2 veces (al final de una línea o sola)
 *   // x3    → repetir 3 veces
 *   //       → marca de barra (sin conteo explícito)
 *
 * Se usan llaves {} para secciones porque los corchetes [] ya se usan para acordes.
 */

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Nombres de sección reconocidos (case-insensitive match) */
export const SECTION_NAMES = [
    'Intro',
    'Verso',
    'Verso 1',
    'Verso 2',
    'Verso 3',
    'Pre-Coro',
    'Coro',
    'Puente',
    'Outro',
    'Instrumental',
    'Interludio',
    'Final',
    'Tag',
    'Ad Lib',
] as const;

export type SectionName = (typeof SECTION_NAMES)[number];

// ─── Regex ───────────────────────────────────────────────────────────────────

/** Detecta una línea que es SOLO un marcador de sección: {Verso}, {Coro}, etc. */
const SECTION_REGEX = /^\s*\{([^}]+)\}\s*$/;

/** Detecta repetición al final de una línea:  "// x3" o "//" */
const REPEAT_REGEX = /\s*\/\/\s*(?:x(\d+))?\s*$/i;

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ParsedLine {
    /** Índice original de la línea (para voice assignments) */
    originalIndex: number;
    /** Texto de la línea SIN el marcador de repetición */
    text: string;
    /** Si tiene repetición, cuántas veces (2 = "// x2", 0 = "//") */
    repeat?: number;
    /** true si esta línea es un marcador de sección */
    isSection: boolean;
    /** Nombre de la sección si isSection es true */
    sectionName?: string;
}

export interface ParsedSection {
    /** Nombre de la sección (o "Inicio" si no hay marcador explícito) */
    name: string;
    /** Líneas que pertenecen a esta sección */
    lines: ParsedLine[];
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parsea el contenido de una canción y devuelve un arreglo de secciones.
 * Cada sección contiene sus líneas con metadata de repeticiones.
 *
 * Mantiene compatibilidad total con canciones que NO usan secciones ni
 * repeticiones: devuelve una sola sección "Inicio" con todas las líneas.
 */
export function parseSongContent(content: string): ParsedSection[] {
    const rawLines = content.split('\n');
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection = { name: '', lines: [] };

    for (let i = 0; i < rawLines.length; i++) {
        const raw = rawLines[i];

        // ¿Es un marcador de sección?
        const sectionMatch = raw.match(SECTION_REGEX);
        if (sectionMatch) {
            // Si la sección actual tiene líneas, guardarla
            if (currentSection.lines.length > 0 || sections.length > 0) {
                sections.push(currentSection);
            }
            currentSection = {
                name: sectionMatch[1].trim(),
                lines: [],
            };
            continue;
        }

        // ¿Tiene marcador de repetición?
        const repeatMatch = raw.match(REPEAT_REGEX);
        let text = raw;
        let repeat: number | undefined;

        if (repeatMatch) {
            text = raw.replace(REPEAT_REGEX, '');
            repeat = repeatMatch[1] ? parseInt(repeatMatch[1], 10) : 0;
        }

        currentSection.lines.push({
            originalIndex: i,
            text,
            repeat,
            isSection: false,
        });
    }

    // Agregar la última sección
    if (currentSection.lines.length > 0 || sections.length === 0) {
        sections.push(currentSection);
    }

    return sections;
}

/**
 * Verifica si una línea de contenido es un marcador de sección.
 * Útil para filtrar secciones en el editor.
 */
export function isSectionMarker(line: string): boolean {
    return SECTION_REGEX.test(line);
}

/**
 * Verifica si el contenido de la canción usa secciones.
 */
export function hasSections(content: string): boolean {
    return content.split('\n').some(line => SECTION_REGEX.test(line));
}

/**
 * Genera el texto de un marcador de sección para insertar.
 */
export function sectionMarker(name: string): string {
    return `{${name}}`;
}

/**
 * Extrae la info de repetición de una línea para display.
 * Devuelve null si no hay repetición.
 */
export function getRepeatInfo(line: string): { cleanText: string; count: number } | null {
    const match = line.match(REPEAT_REGEX);
    if (!match) return null;
    return {
        cleanText: line.replace(REPEAT_REGEX, ''),
        count: match[1] ? parseInt(match[1], 10) : 0,
    };
}
