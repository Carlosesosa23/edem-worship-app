import { useState, useRef, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSongs } from '../contexts/SongsContext';
import { Save, ArrowLeft, User, Music, Youtube, Mic, Hash, ChevronDown } from 'lucide-react';
import { MAJOR_KEYS, MINOR_KEYS, normalizeContent } from '../lib/transpose';
import { SECTION_NAMES, sectionMarker } from '../lib/songParser';

export function SongEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addSong, updateSong, songs } = useSongs();

    const existingSong = id ? songs.find(s => s.id === id) : null;

    const [title, setTitle] = useState(existingSong?.title || '');
    const [artist, setArtist] = useState(existingSong?.artist || '');
    const [key, setKey] = useState(existingSong?.key || 'C');
    const [bpm, setBpm] = useState<number | ''>(existingSong?.bpm || '');
    const [content, setContent] = useState(existingSong?.content || '');
    const [bestSinger, setBestSinger] = useState(existingSong?.bestSinger || '');
    const [youtubeUrl, setYoutubeUrl] = useState(existingSong?.youtubeUrl || '');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /** Inserta texto en la posición actual del cursor en el textarea */
    const insertAtCursor = (text: string) => {
        const ta = textareaRef.current;
        if (!ta) return;

        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = content.slice(0, start);
        const after = content.slice(end);

        // Si no estamos al inicio de una línea, agregar salto primero
        const needsNewline = before.length > 0 && !before.endsWith('\n');
        const insert = (needsNewline ? '\n' : '') + text + '\n';

        const newContent = before + insert + after;
        setContent(newContent);

        // Restaurar foco y cursor después del insert
        requestAnimationFrame(() => {
            ta.focus();
            const newPos = start + insert.length;
            ta.setSelectionRange(newPos, newPos);
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const songData = {
            title,
            artist,
            key,
            bpm: Number(bpm) || undefined,
            content: normalizeContent(content),
            bestSinger,
            youtubeUrl: youtubeUrl || undefined,
            addedBy: 'User'
        };
        try {
            if (id && existingSong) {
                await updateSong(id, songData);
            } else {
                await addSong(songData);
            }
            navigate('/songs');
        } catch (error) {
            console.error(error);
            alert('Error al guardar la canción');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen text-text-main pb-32 animate-fade-in font-sans">
            {/* Minimalist Editor Header */}
            <div className="sticky top-0 z-30 glass-panel border-b border-white/[0.03] px-4 py-3 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary active:scale-90"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="h-6 w-[1px] bg-white/5 mx-2" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Manuscrito Digital</p>
                        <h2 className="serif-title font-bold text-sm text-text-main">
                            {id ? 'Edición de Obra' : 'Composición Nueva'}
                        </h2>
                    </div>
                </div>

                <button
                    onClick={(e) => handleSubmit(e as unknown as FormEvent)}
                    disabled={loading}
                    className="btn-primary h-10 px-6 shadow-lg shadow-primary/20"
                >
                    <Save size={18} />
                    <span className="hidden sm:inline">Preservar Cambios</span>
                    <span className="sm:hidden">Guardar</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Hero Input Section */}
                    <header className="space-y-8 text-center sm:text-left">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 block ml-1">Título de la Obra</label>
                            <input
                                type="text"
                                required
                                className="bg-transparent border-none p-0 w-full serif-title text-4xl md:text-6xl font-bold text-text-main placeholder:text-text-muted/10 focus:ring-0 outline-none transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Nombre de la canción..."
                            />
                        </div>
                        <div className="h-[1px] w-full bg-white/[0.03]" />
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Meta Fields */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 border-b border-white/[0.03] pb-3">Atributos del Tema</h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                        <User size={12} className="text-primary/60" /> Artista / Autor
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner"
                                        value={artist}
                                        onChange={e => setArtist(e.target.value)}
                                        placeholder="Ej. Hillsong, Elevation Worship..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                            <Hash size={12} className="text-primary/60" /> Tono Maestro
                                        </label>
                                        <div className="relative group">
                                            <select
                                                className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner appearance-none cursor-pointer"
                                                value={key}
                                                onChange={e => setKey(e.target.value)}
                                            >
                                                <optgroup label="Mayores" className="bg-surface-low text-text-main">
                                                    {MAJOR_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                                </optgroup>
                                                <optgroup label="Menores" className="bg-surface-low text-text-main">
                                                    {MINOR_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                                </optgroup>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                            <Music size={12} className="text-primary/60" /> BPM
                                        </label>
                                        <input
                                            type="number"
                                            className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner"
                                            value={bpm}
                                            onChange={e => setBpm(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="Ej. 72"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                        <Mic size={12} className="text-primary/60" /> Voz Recomendada
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner"
                                        value={bestSinger}
                                        onChange={e => setBestSinger(e.target.value)}
                                        placeholder="Ej. Ana, Marcos, Dúo..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                        <Youtube size={12} className="text-red-500/60" /> Referencia YouTube
                                    </label>
                                    <input
                                        type="url"
                                        className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner text-xs"
                                        value={youtubeUrl}
                                        onChange={e => setYoutubeUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lyrics / Editor Section */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 border-b border-white/[0.03] pb-3">Cuerpo de la Obra</h3>
                            <div className="space-y-4">
                                {/* Section Insertion Toolbar */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted/40">Insertar Sección</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SECTION_NAMES.map(name => (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => insertAtCursor(sectionMarker(name))}
                                                className="px-3 py-1 rounded-full bg-surface-low hover:bg-surface-high text-[10px] font-bold text-text-muted hover:text-primary transition-all active:scale-95 border border-white/[0.03]"
                                            >
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-surface-lowest/30 p-6 rounded-[2rem] border border-white/[0.03] shadow-inner space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted/40">Editor Monospaciado</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Notación: [Acorde] Letra</span>
                                    </div>
                                    <textarea
                                        ref={textareaRef}
                                        className="w-full bg-transparent border-none p-0 font-mono text-sm leading-relaxed resize-none h-[400px] focus:ring-0 outline-none scrollbar-hide"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder={"{Intro}\n[C]  [F]  [Am]  [G]\n\n{Verso}\n[C] Sublime gracia [F] del Señor\n[C] Que a un infeliz [G] salvó\n\n{Coro}\n[F] Amazing [C] Grace // x2\n[Am] How sweet [G] the sound //"}
                                    />
                                </div>

                                {/* Format Guide */}
                                <div className="bg-surface-low/30 rounded-2xl p-4 space-y-3 border border-white/[0.03]">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Guía de formato</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-text-muted">
                                        <div className="space-y-1.5">
                                            <p className="font-bold text-text-main">Acordes</p>
                                            <p className="font-mono text-primary/70">[C] texto [Am7] texto</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="font-bold text-text-main">Secciones</p>
                                            <p className="font-mono text-primary/70">{'{Verso}'} {'{Coro}'} {'{Puente}'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="font-bold text-text-main">Repetir línea</p>
                                            <p className="font-mono text-primary/70">Letra aquí // x2</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="font-bold text-text-main">Barra de repetición</p>
                                            <p className="font-mono text-primary/70">Línea con barra //</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Action - Mobile Only or extra anchor */}
                    <div className="pt-12 md:hidden">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
                        >
                            {loading ? 'Procesando...' : 'Guardar en Repositorio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
