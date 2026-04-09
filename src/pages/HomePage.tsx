import { Link } from 'react-router-dom';
import { useSongs } from '../contexts/SongsContext';
import { useMixes } from '../contexts/MixesContext';
import { useLiveSession } from '../contexts/LiveSessionContext';
import { Music, Disc, Plus, Calendar, ArrowRight, Mic2, Sparkles } from 'lucide-react';
// framer-motion available if needed

export function HomePage() {
    const { songs } = useSongs();
    const { mixes } = useMixes();
    const { isDirector, toggleDirectorMode } = useLiveSession();

    const safeSongs = songs || [];
    const safeMixes = mixes || [];
    const recentSongs = [...safeSongs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
    const upcomingMix = safeMixes[0];

    return (
        <div className="space-y-12 pb-20 animate-fade-in">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[2rem] bg-surface-lowest p-8 md:p-12">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                            <Sparkles size={12} />
                            Ministerio de Alabanza
                        </div>
                        <h1 className="text-4xl md:text-5xl serif-title font-bold text-primary leading-tight">
                            La excelencia es nuestra <span className="italic text-text-main">alabanza.</span>
                        </h1>
                        <p className="text-text-muted text-sm md:text-base leading-relaxed">
                            Bienvenido a Edem Worship. Aquí gestionamos la armonía de cada servicio y la preparación de cada corazón.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={toggleDirectorMode}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isDirector
                                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                                : 'bg-surface-high text-text-muted hover:text-text-main hover:bg-surface-high/80'
                                }`}
                        >
                            <Mic2 size={18} />
                            {isDirector ? "Modo Director On" : "Modo Ensayo"}
                        </button>
                        <Link to="/songs/add" className="btn-primary">
                            <Plus size={18} />
                            Nueva Canción
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Link to="/songs" className="tonal-card group">
                    <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Music size={24} />
                    </div>
                    <div className="text-3xl font-bold serif-title text-text-main">{safeSongs.length}</div>
                    <div className="text-[10px] tracking-wider font-bold text-text-muted uppercase mt-1">Canciones</div>
                </Link>

                <Link to="/mixes" className="tonal-card group">
                    <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Disc size={24} />
                    </div>
                    <div className="text-3xl font-bold serif-title text-text-main">{safeMixes.length}</div>
                    <div className="text-[10px] tracking-wider font-bold text-text-muted uppercase mt-1">Mixes</div>
                </Link>

                <Link to="/mixes/add" className="tonal-card col-span-2 group flex items-center justify-between border-primary/20 bg-primary/[0.03]">
                    <div className="flex items-center gap-5">
                        <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                            <Plus size={24} />
                        </div>
                        <div className="text-left">
                            <div className="text-xl font-bold serif-title">Crear nuevo Servicio</div>
                            <div className="text-xs text-text-muted mt-0.5">Crear un nuevo mix musical para el domingo</div>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
            </div>

            {/* Content Split */}
            <div className="grid lg:grid-cols-5 gap-10">
                {/* Recent Songs List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold serif-title">Agregado Reciente</h2>
                            <div className="h-0.5 w-8 bg-primary rounded-full"></div>
                        </div>
                        <Link to="/songs" className="text-[10px] font-bold text-primary hover:text-primary-container tracking-widest uppercase transition-colors">
                            Ver Biblioteca
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentSongs.length > 0 ? (
                            recentSongs.map(song => (
                                <Link
                                    key={song.id}
                                    to={`/songs/${song.id}`}
                                    className="tonal-card p-4 flex items-center gap-4 group hover:bg-surface-high transition-all"
                                >
                                    <div className="bg-surface-lowest w-12 h-12 rounded-xl flex items-center justify-center text-primary font-bold serif-title text-sm border-white/[0.02]">
                                        {song.key}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-text-main truncate group-hover:text-primary transition-colors">{song.title}</div>
                                        <div className="text-[10px] text-text-muted tracking-wide font-medium uppercase truncate">{song.artist}</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                        <ArrowRight size={14} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="bg-surface-low/50 rounded-2xl py-12 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-50">
                                <Music className="text-text-muted mb-2" size={32} />
                                <p className="text-xs">No hay registros recientes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Mix Featured */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold serif-title">Servicio Próximo</h2>
                        <div className="h-0.5 w-8 bg-primary rounded-full"></div>
                    </div>

                    {upcomingMix ? (
                        <div className="relative group overflow-hidden rounded-3xl bg-surface-low p-8 border-white/[0.02]">
                            <div className="absolute top-0 right-0 p-8 text-primary opacity-[0.03] scale-[4] rotate-12 group-hover:rotate-6 transition-transform duration-700">
                                <Calendar size={100} />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Repertorio Confirmado</div>
                                    <h3 className="text-3xl md:text-4xl serif-title font-bold text-text-main group-hover:text-primary transition-colors duration-500">
                                        {upcomingMix.title}
                                    </h3>
                                    <p className="text-text-muted flex items-center gap-2 font-medium">
                                        <Calendar size={16} className="text-primary" />
                                        {new Date(upcomingMix.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(upcomingMix.songs || []).slice(0, 4).map((_, i) => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-primary/20" />
                                    ))}
                                    <span className="text-[10px] text-text-muted font-bold ml-1 uppercase">{(upcomingMix.songs || []).length} temas seleccionados</span>
                                </div>

                                <div className="pt-4 flex items-center gap-4">
                                    <Link to={`/mixes/${upcomingMix.id}`} className="btn-primary">
                                        Explorar Mix <ArrowRight size={18} />
                                    </Link>
                                    <button className="btn-secondary text-[10px] h-12 uppercase tracking-widest font-bold">
                                        Compartir PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-low rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 border border-dashed border-white/5">
                            <div className="bg-surface-lowest w-20 h-20 rounded-full flex items-center justify-center text-text-muted/30">
                                <Calendar size={40} />
                            </div>
                            <div className="max-w-xs">
                                <h4 className="font-bold serif-title text-xl text-text-main">Agenda Disponible</h4>
                                <p className="text-xs text-text-muted mt-2">No se ha planeado el próximo servicio dominical todavía.</p>
                            </div>
                            <Link to="/mixes/add" className="btn-primary">
                                Programar Ahora
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
