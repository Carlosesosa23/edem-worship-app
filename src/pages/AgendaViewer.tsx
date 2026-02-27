import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAgenda } from '../contexts/AgendaContext';
import { useMixes } from '../contexts/MixesContext';
import { useLiveSession } from '../contexts/LiveSessionContext';
import { ArrowLeft, Clock, Users, FileText, Disc, Edit, Trash2, CalendarDays } from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    servicio: { label: 'Servicio', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
    ensayo: { label: 'Ensayo', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    otro: { label: 'Otro', bg: 'bg-surface-highlight', text: 'text-text-muted', border: 'border-white/10' },
};

export function AgendaViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, deleteEvent } = useAgenda();
    const { mixes } = useMixes();
    const { isDirector } = useLiveSession();

    const event = events.find(e => e.id === id);

    if (!event) {
        return <div className="p-8 text-center text-text-muted">Evento no encontrado</div>;
    }

    const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.otro;
    const dateObj = new Date(event.date);
    const linkedMix = event.mixId ? mixes.find(m => m.id === event.mixId) : null;

    const handleDelete = async () => {
        if (window.confirm('¿Eliminar este evento permanentemente?')) {
            await deleteEvent(event.id);
            navigate('/agenda');
        }
    };

    return (
        <div className="bg-background min-h-screen text-text-main pb-24 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-20 glass-panel border-b border-white/5 px-4 py-3 flex justify-between items-center backdrop-blur-xl shadow-lg">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                </span>
                {isDirector && (
                    <div className="flex gap-1">
                        <Link to={`/agenda/edit/${event.id}`} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors">
                            <Edit size={20} />
                        </Link>
                        <button onClick={handleDelete} className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-500 rounded-lg transition-colors">
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
                {!isDirector && <div className="w-10" />}
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* Title & Date Hero */}
                <div className="glass-panel rounded-2xl p-6 text-center">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-text-main to-text-muted bg-clip-text text-transparent mb-3">
                        {event.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-text-muted">
                        <div className="flex flex-col items-center">
                            <CalendarDays size={20} className="mb-1 text-primary" />
                            <span className="font-semibold text-text-main">
                                {dateObj.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        {event.time && (
                            <div className="flex flex-col items-center">
                                <Clock size={20} className="mb-1 text-secondary" />
                                <span className="font-semibold text-text-main">{event.time}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Participants */}
                <div className="glass-panel rounded-2xl p-5">
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-muted mb-4">
                        <Users size={16} /> Participantes ({event.participants.length})
                    </h2>
                    {event.participants.length === 0 ? (
                        <p className="text-text-muted text-sm italic">Sin participantes asignados.</p>
                    ) : (
                        <div className="space-y-2">
                            {event.participants.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 bg-surface/50 px-4 py-3 rounded-xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-main">{p.name}</p>
                                        {p.role && <p className="text-xs text-text-muted">{p.role}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Linked Mix */}
                {linkedMix && (
                    <div className="glass-panel rounded-2xl p-5">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-muted mb-4">
                            <Disc size={16} /> Mix del Servicio
                        </h2>
                        <Link
                            to={`/mixes/${linkedMix.id}`}
                            className="flex items-center gap-4 bg-surface/50 px-4 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                <Disc size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-text-main group-hover:text-white transition-colors">{linkedMix.title}</p>
                                <p className="text-xs text-text-muted">{linkedMix.songs.length} canciones</p>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Notes */}
                {event.notes && (
                    <div className="glass-panel rounded-2xl p-5">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-muted mb-3">
                            <FileText size={16} /> Notas
                        </h2>
                        <p className="text-text-main leading-relaxed whitespace-pre-wrap">{event.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
