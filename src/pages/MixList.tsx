import { Link } from 'react-router-dom';
import { useMixes } from '../contexts/MixesContext';
import { Plus, Calendar, ChevronRight, Disc, Layers, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MixList() {
    const { mixes, loading } = useMixes();

    return (
        <div className="space-y-10 pb-24 animate-fade-in">
            {/* Editorial Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/[0.03] pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                        <Layers size={16} />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase underline underline-offset-4 decoration-primary/30">Curación Musical</span>
                    </div>
                    <h1 className="text-4xl serif-title font-bold text-text-main">
                        Mis <span className="italic text-primary">Mixes</span>
                    </h1>
                    <p className="text-text-muted text-sm max-w-sm">Listas de reproducción estructuradas para el fluir de la adoración dominical y ensayos.</p>
                </div>
                <Link 
                    to="/mixes/add" 
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Configurar Nuevo Mix
                </Link>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted/60">
                    <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="text-xs font-bold tracking-widest uppercase">Consultando Archivos...</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    <AnimatePresence mode="popLayout">
                        {mixes.map((mix, index) => (
                            <motion.div
                                key={mix.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/mixes/${mix.id}`}
                                    className="tonal-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between group hover:bg-surface-high transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700">
                                        <Disc size={120} />
                                    </div>

                                    <div className="flex items-center gap-6 relative z-10 w-full">
                                        <div className="w-14 h-14 rounded-2xl bg-surface-lowest flex items-center justify-center text-text-muted group-hover:text-primary transition-all duration-500 shadow-inner group-hover:shadow-primary/5">
                                            <Disc size={24} className="group-hover:rotate-45 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h3 className="serif-title font-bold text-2xl text-text-main group-hover:text-primary transition-colors truncate">
                                                {mix.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                    <Calendar size={12} className="text-primary/60" />
                                                    {new Date(mix.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-white/10 hidden md:block" />
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">
                                                    <Music size={12} />
                                                    {mix.songs?.length || 0} Temas Seleccionados
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 md:mt-0 md:ml-4 flex items-center gap-3 relative z-10 w-full md:w-auto self-end md:self-center">
                                        <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-white/5 text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                        <div className="md:hidden w-full h-[1px] bg-white/5 absolute bottom-0 -mb-4" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {mixes.length === 0 && !loading && (
                        <div className="text-center py-20 bg-surface-low/30 rounded-[2.5rem] border border-dashed border-white/5 space-y-6">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                                <div className="relative bg-surface-lowest w-24 h-24 rounded-full flex items-center justify-center text-text-muted/20 mx-auto border border-white/5 shadow-inner">
                                    <Layers size={40} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl serif-title font-bold text-text-main">Sin planeación activa</h3>
                                <p className="text-text-muted text-xs max-w-[240px] mx-auto leading-relaxed">Comienza a estructurar el repertorio para el próximo servicio dominical.</p>
                            </div>
                            <Link to="/mixes/add" className="btn-primary h-12">
                                <Plus size={18} />
                                Crear Primer Mix
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
