import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMixes } from '../contexts/MixesContext';
import { useSongs } from '../contexts/SongsContext';
import { Save, ArrowLeft, Plus, X, Search, Check, ChevronUp, ChevronDown, GripVertical, Music, Calendar, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function MixEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addMix, updateMix, mixes } = useMixes();
    const { songs } = useSongs();

    const isEditing = Boolean(id);
    const existingMix = id ? mixes.find(m => m.id === id) : null;

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [isSelecting, setIsSelecting] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingMix) {
            setTitle(existingMix.title);
            setDate(new Date(existingMix.date).toISOString().substring(0, 10));
            setSelectedSongIds([...existingMix.songs]);
        }
    }, [existingMix?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title,
                date: new Date(date).getTime(),
                songs: selectedSongIds,
                description: existingMix?.description ?? '',
            };

            if (isEditing && id) {
                await updateMix(id, payload);
                navigate(`/mixes/${id}`, { replace: true });
            } else {
                const newId = await addMix(payload);
                navigate(`/mixes/${newId}`, { replace: true });
            }
        } catch {
            alert('Error al guardar el mix');
        } finally {
            setLoading(false);
        }
    };

    const toggleSong = (songId: string) => {
        if (selectedSongIds.includes(songId)) {
            setSelectedSongIds(prev => prev.filter(s => s !== songId));
        } else {
            setSelectedSongIds(prev => [...prev, songId]);
        }
    };

    const moveSong = (index: number, direction: 'up' | 'down') => {
        const newList = [...selectedSongIds];
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= newList.length) return;
        [newList[index], newList[target]] = [newList[target], newList[index]];
        setSelectedSongIds(newList);
    };

    const removeSong = (songId: string) => {
        setSelectedSongIds(prev => prev.filter(s => s !== songId));
    };

    const filteredSongs = songs.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-background min-h-screen text-text-main pb-32 animate-fade-in font-sans">
            {/* Header */}
            <div className="sticky top-0 z-30 glass-panel border-b border-white/[0.03] px-4 py-3 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary active:scale-90">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="h-6 w-[1px] bg-white/5 mx-2" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Curaduría Dominical</p>
                        <h2 className="serif-title font-bold text-sm text-text-main">
                            {isEditing ? 'Revisión de Mix' : 'Estructura de Servicio'}
                        </h2>
                    </div>
                </div>
                <button
                    onClick={(e) => handleSubmit(e as any)}
                    disabled={loading || !title.trim()}
                    className="btn-primary h-10 px-6 shadow-lg shadow-primary/20"
                >
                    <Save size={18} />
                    <span className="hidden sm:inline">{isEditing ? 'Actualizar Mix' : 'Preservar Mix'}</span>
                    <span className="sm:hidden">Guardar</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Hero Section */}
                    <header className="space-y-8">
                        <div className="space-y-4 text-center sm:text-left">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 block ml-1">Contexto del Servicio</label>
                            <input
                                type="text"
                                required
                                className="bg-transparent border-none p-0 w-full serif-title text-4xl md:text-6xl font-bold text-text-main placeholder:text-text-muted/10 focus:ring-0 outline-none transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej. Domingo de Gloria..."
                            />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-1 space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                    <Calendar size={12} className="text-primary/60" /> Fecha del Evento
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner [color-scheme:dark]"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                            <div className="hidden sm:block w-[1px] bg-white/[0.03]" />
                            <div className="flex-1 flex flex-col justify-end pb-3">
                                <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.2em] italic">
                                    {selectedSongIds.length} temas seleccionados para este repertorio.
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Sequence Section */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-end border-b border-white/[0.03] pb-4">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">Secuencia Musical</h3>
                                <p className="text-[10px] text-text-muted/60 uppercase tracking-widest">Orden cronológico del fluir</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSelecting(true)}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white flex items-center gap-2 transition-all group"
                            >
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                    <Plus size={14} />
                                </div>
                                Anexar Temas
                            </button>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {selectedSongIds.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-24 bg-surface-low/10 rounded-[2.5rem] border border-dashed border-white/5 opacity-30"
                                    >
                                        <Layers size={48} className="mx-auto mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-[0.3em]">Lista Vacía</p>
                                    </motion.div>
                                ) : (
                                    selectedSongIds.map((songId, index) => {
                                        const song = songs.find(s => s.id === songId);
                                        if (!song) return null;
                                        return (
                                            <motion.div
                                                key={`${songId}-${index}`}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="tonal-card p-4 flex items-center gap-4 group transition-all duration-300 hover:bg-surface-high relative overflow-hidden"
                                            >
                                                <GripVertical size={16} className="text-text-muted/20 flex-shrink-0 group-hover:text-primary transition-colors cursor-grab" />
                                                <div className="w-10 h-10 rounded-xl bg-surface-lowest flex items-center justify-center text-[10px] font-black text-text-muted group-hover:text-primary transition-colors shadow-inner">
                                                    {String(index + 1).padStart(2, '0')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-base text-text-main group-hover:text-primary transition-colors truncate">{song.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest truncate">{song.artist}</p>
                                                        <span className="w-1 h-1 rounded-full bg-white/5" />
                                                        <span className="text-[10px] font-bold text-primary serif-title">{song.key}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveSong(index, 'up')}
                                                            disabled={index === 0}
                                                            className={cn(
                                                                'w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                                                                index === 0 ? 'opacity-10 cursor-not-allowed' : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                                                            )}
                                                        >
                                                            <ChevronUp size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveSong(index, 'down')}
                                                            disabled={index === selectedSongIds.length - 1}
                                                            className={cn(
                                                                'w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                                                                index === selectedSongIds.length - 1 ? 'opacity-10 cursor-not-allowed' : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                                                            )}
                                                        >
                                                            <ChevronDown size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-white/5 mx-1" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSong(songId)}
                                                        className="w-8 h-8 flex items-center justify-center text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </form>
            </div>

            {/* Song Selector Modal */}
            <AnimatePresence>
                {isSelecting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-50 flex flex-col p-4 sm:p-8 md:p-12"
                    >
                        <div className="max-w-4xl mx-auto w-full flex flex-col h-full space-y-8">
                            <header className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Repositorio General</p>
                                    <h3 className="serif-title font-bold text-2xl text-text-main">Selección de Repertorio</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setIsSelecting(false); setSearch(''); }}
                                    className="w-12 h-12 flex items-center justify-center bg-surface-low rounded-full hover:bg-surface-high transition-all shadow-xl text-text-muted active:scale-95"
                                >
                                    <X size={24} />
                                </button>
                            </header>

                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Consultar por título o artista..."
                                    className="input-field pl-16 h-16 bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner border-white/5 transition-all text-lg"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pb-32 pr-2 custom-scrollbar">
                                {filteredSongs.map((song, i) => {
                                    const isSelected = selectedSongIds.includes(song.id);
                                    return (
                                        <motion.button
                                            key={song.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            type="button"
                                            onClick={() => toggleSong(song.id)}
                                            className={cn(
                                                "w-full text-left p-5 rounded-[1.5rem] transition-all border flex items-center justify-between group",
                                                isSelected
                                                    ? "bg-primary/10 border-primary shadow-xl shadow-primary/5"
                                                    : "bg-surface-low border-white/5 hover:bg-surface-high"
                                            )}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-inner",
                                                    isSelected ? "bg-primary text-on-primary" : "bg-surface-lowest text-text-muted group-hover:text-primary"
                                                )}>
                                                    <Music size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn("font-bold text-lg transition-colors", isSelected ? "text-primary" : "text-text-main")}>
                                                        {song.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">{song.artist}</p>
                                                        <span className="w-1 h-1 rounded-full bg-white/5" />
                                                        <span className="text-[11px] font-bold text-primary serif-title">{song.key}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20"><Check size={20} /></div>}
                                        </motion.button>
                                    );
                                })}

                                {filteredSongs.length === 0 && (
                                    <div className="text-center py-24 opacity-30 italic text-sm font-medium tracking-wide">
                                        No se han encontrado registros en el censo actual.
                                    </div>
                                )}
                            </div>

                            <motion.div 
                                initial={{ y: 50 }}
                                animate={{ y: 0 }}
                                className="fixed bottom-8 left-8 right-8 max-w-4xl mx-auto"
                            >
                                <button
                                    type="button"
                                    onClick={() => { setIsSelecting(false); setSearch(''); }}
                                    className="w-full bg-primary text-on-primary py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 text-sm active:scale-[0.98] transition-all"
                                >
                                    Consolidar Selección — ({selectedSongIds.length}) Temas
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
