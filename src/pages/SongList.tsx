import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSongs } from '../contexts/SongsContext';
import { Search, Loader2, Music, Hash, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SongList() {
    const { songs, loading } = useSongs();
    const [search, setSearch] = useState('');

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(search.toLowerCase()) ||
        song.artist.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            {/* Header / Intro */}
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                    <Music size={16} />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Biblioteca Digital</span>
                </div>
                <h1 className="text-4xl serif-title font-bold text-text-main">Repertorio</h1>
                <p className="text-text-muted text-sm max-w-md">Explora nuestro catálogo de alabanza y adoración. Cada acorde y letra preparados para la edificación.</p>
            </header>

            {/* Sticky Search Header */}
            <div className="sticky top-0 bg-background/60 backdrop-blur-xl pt-4 pb-6 z-20 -mx-4 px-4">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por título, artista o etiqueta..."
                        className="input-field pl-14 h-14 bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner transition-all duration-300"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="h-6 w-[1px] bg-white/5 mx-1" />
                        <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase px-2">Total: {filteredSongs.length}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        <Loader2 className="animate-spin mb-6 text-primary relative z-10" size={48} />
                    </div>
                    <p className="font-medium tracking-wide">Sincronizando Repertorio...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredSongs.map((song, index) => (
                            <motion.div
                                key={song.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/songs/${song.id}`}
                                    className="tonal-card p-5 flex items-center justify-between group hover:bg-surface-high/80 transition-all active:scale-[0.99] border-l-2 border-l-transparent hover:border-l-primary"
                                >
                                    <div className="flex items-center gap-5 overflow-hidden">
                                        <div className="w-12 h-12 rounded-2xl bg-surface-lowest flex items-center justify-center text-text-muted group-hover:text-primary transition-all duration-500 shadow-inner">
                                            <Hash size={20} className="opacity-40" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="serif-title font-bold text-xl text-text-main group-hover:text-primary transition-colors truncate">
                                                {song.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] tracking-wider font-bold text-text-muted uppercase truncate">
                                                    {song.artist}
                                                </p>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-medium text-text-muted/60 lowercase italic">
                                                    revisado el {new Date(song.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="flex flex-col items-end">
                                            <div className="bg-primary/10 border border-primary/20 flex items-center justify-center px-4 py-1 rounded-full text-xs font-bold serif-title text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shadow-sm">
                                                {song.key}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredSongs.length === 0 && !loading && (
                        <div className="text-center py-24 space-y-4">
                            <div className="bg-surface-low w-20 h-20 rounded-full flex items-center justify-center text-text-muted/30 mx-auto shadow-inner">
                                <Search size={36} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold serif-title text-text-main">Sin coincidencias</h3>
                                <p className="text-xs text-text-muted max-w-[200px] mx-auto">No hemos encontrado temas con ese criterio en el repositorio actual.</p>
                            </div>
                            <button 
                                onClick={() => setSearch('')}
                                className="text-primary text-[10px] font-bold tracking-widest uppercase hover:underline mt-2"
                            >
                                Limpiar búsqueda
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
