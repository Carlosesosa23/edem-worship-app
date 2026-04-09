import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAgenda } from '../contexts/AgendaContext';
import { useMixes } from '../contexts/MixesContext';
import { useLiveSession } from '../contexts/LiveSessionContext';
import { ArrowLeft, Clock, Users, FileText, Disc, Edit, Trash2, CalendarDays, ChevronRight, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    servicio: { label: 'Servicio Dominical', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    ensayo: { label: 'Sesión de Ensayo', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    otro: { label: 'Evento Especial', bg: 'bg-surface-low', text: 'text-text-muted', border: 'border-white/5' },
};

export function AgendaViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, deleteEvent } = useAgenda();
    const { mixes } = useMixes();
    const { isDirector } = useLiveSession();

    const event = events.find(e => e.id === id);

    if (!event) {
        return <div className="p-24 text-center serif-title text-text-muted italic">Cédula no encontrada</div>;
    }

    const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.otro;
    const dateObj = new Date(event.date);
    const linkedMix = event.mixId ? mixes.find(m => m.id === event.mixId) : null;

    const handleDelete = async () => {
        if (window.confirm('¿ELIMINAR este evento permanentemente?')) {
            await deleteEvent(event.id);
            navigate('/agenda');
        }
    };

    return (
        <div className="bg-background min-h-screen text-text-main pb-32 animate-fade-in font-sans">
            {/* Header Sticky */}
            <div className="sticky top-0 z-30 glass-panel border-b border-white/[0.03] px-4 py-3 flex justify-between items-center shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary active:scale-90">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="h-6 w-[1px] bg-white/5 mx-1" />
                    <div className="hidden sm:block">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Bitácora Ministerial</p>
                        <h2 className="serif-title font-bold text-sm text-text-main truncate max-w-[200px]">{event.title}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm",
                        cfg.bg, cfg.text, cfg.border
                    )}>
                        {cfg.label}
                    </span>

                    {isDirector && (
                        <div className="flex items-center gap-1 border-l border-white/5 pl-2 ml-1">
                            <Link to={`/agenda/edit/${event.id}`} className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:bg-white/5 transition-all">
                                <Edit size={18} />
                            </Link>
                            <button onClick={handleDelete} className="w-9 h-9 flex items-center justify-center rounded-full text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 space-y-16">
                {/* Hero Header */}
                <header className="text-center space-y-8">
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-0.5 w-12 bg-primary/20 mb-2" />
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Convocatoria</p>
                        </div>
                        <h1 className="text-5xl md:text-7xl serif-title font-bold text-text-main leading-tight tracking-tight">
                            {event.title}
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16">
                        <div className="flex flex-col items-center group">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-surface-low border border-white/5 flex items-center justify-center text-primary mb-3 shadow-inner group-hover:scale-110 transition-transform">
                                <CalendarDays size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 mb-1">Fecha Señalada</span>
                            <span className="text-lg font-bold text-text-main serif-title">
                                {dateObj.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        {event.time && (
                            <div className="flex flex-col items-center group">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-surface-low border border-white/5 flex items-center justify-center text-secondary mb-3 shadow-inner group-hover:scale-110 transition-transform">
                                    <Clock size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 mb-1">Hora de Cita</span>
                                <span className="text-lg font-bold text-text-main serif-title">{event.time}</span>
                            </div>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Personnel Section */}
                    <section className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 border-b border-white/[0.03] pb-4">
                            <Users size={18} className="text-primary/60" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">Personnel / Ministros</h3>
                            <span className="ml-auto text-[9px] font-bold text-text-muted/40 uppercase tracking-widest">{event.participants.length} ASIGNADOS</span>
                        </div>

                        {event.participants.length === 0 ? (
                            <div className="tonal-card p-8 text-center opacity-30 italic text-sm">
                                No se han designado participantes para este evento.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {event.participants.map((p, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="tonal-card p-4 flex items-center gap-4 hover:bg-surface-high transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-[1rem] bg-surface-lowest flex items-center justify-center text-primary border border-white/5 shadow-inner">
                                            <User size={20} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-base text-text-main truncate">{p.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">{p.role || 'Colaborador'}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Meta Sidebar */}
                    <aside className="space-y-12">
                        {/* Linked Mix */}
                        {linkedMix && (
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted border-b border-white/[0.03] pb-3">Programa Musical</h3>
                                <Link
                                    to={`/mixes/${linkedMix.id}`}
                                    className="tonal-card p-5 group flex flex-col gap-4 border-2 border-primary/5 hover:border-primary/20 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
                                            <Disc size={20} />
                                        </div>
                                        <ChevronRight size={18} className="text-text-muted/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg leading-tight text-text-main group-hover:text-primary transition-colors">{linkedMix.title}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 mt-1">{linkedMix.songs.length} Temas en secuencia</p>
                                    </div>
                                </Link>
                            </section>
                        )}

                        {/* Notes */}
                        {event.notes && (
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted border-b border-white/[0.03] pb-3">Anotaciones</h3>
                                <div className="bg-surface-low/30 rounded-[2rem] p-6 border border-white/[0.03] shadow-inner">
                                    <FileText size={18} className="text-primary/20 mb-4" />
                                    <p className="text-xs font-semibold leading-relaxed text-text-muted/80 whitespace-pre-wrap italic">
                                        "{event.notes}"
                                    </p>
                                </div>
                            </section>
                        )}
                    </aside>
                </div>

                {/* Footer Mark */}
                <div className="pt-24 pb-8 text-center opacity-10">
                    <div className="h-[1px] w-full bg-white mb-2" />
                    <p className="text-[10px] uppercase tracking-[1em] font-black">MINISTERIO DE ALABANZA</p>
                </div>
            </main>
        </div>
    );
}
