import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAgenda } from '../contexts/AgendaContext';
import { useLiveSession } from '../contexts/LiveSessionContext';
import {
    CalendarDays, Plus, Clock, Users, ChevronRight,
    Disc, LayoutList, ChevronLeft, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorshipEvent } from '../types';
import { clsx } from 'clsx';

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    servicio: { label: 'Celebración', bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
    ensayo: { label: 'Ensayo', bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
    otro: { label: 'Evento Especial', bg: 'bg-surface-high', text: 'text-text-muted', dot: 'bg-text-muted' },
};

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function EventCard({ event }: { event: WorshipEvent }) {
    const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.otro;
    const dateObj = new Date(event.date);
    
    return (
        <Link
            to={`/agenda/${event.id}`}
            className="tonal-card p-5 flex items-center gap-5 hover:bg-surface-high transition-all active:scale-[0.99] group overflow-hidden"
        >
            <div className="flex-shrink-0 w-14 h-14 bg-surface-lowest rounded-2xl flex flex-col items-center justify-center border border-white/[0.02] shadow-inner group-hover:shadow-primary/5 transition-all duration-500">
                <span className="text-[9px] text-text-muted uppercase font-bold tracking-widest">
                    {dateObj.toLocaleDateString('es', { month: 'short' })}
                </span>
                <span className="text-2xl font-bold serif-title text-text-main leading-none mt-0.5">
                    {dateObj.getDate()}
                </span>
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                    <span className={clsx("text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md", style.bg, style.text)}>
                        {style.label}
                    </span>
                    {event.time && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted/60 uppercase group-hover:text-text-muted/80 transition-colors">
                            <Clock size={12} />
                            {event.time}
                        </div>
                    )}
                </div>
                <h3 className="serif-title font-bold text-xl text-text-main group-hover:text-primary transition-colors truncate">
                    {event.title}
                </h3>
                <div className="flex items-center gap-4 text-[10px] text-text-muted/80 font-medium">
                    {event.location && (
                        <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                    )}
                    {event.participants.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Users size={12} />
                            {event.participants.length} participantes
                        </span>
                    )}
                </div>
            </div>
            
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
        </Link>
    );
}

function CalendarView({ events }: { events: WorshipEvent[] }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const eventsByDay = useMemo(() => {
        const map: Record<string, WorshipEvent[]> = {};
        events.forEach(e => {
            const d = new Date(e.date);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const key = d.getDate().toString();
                if (!map[key]) map[key] = [];
                map[key].push(e);
            }
        });
        return map;
    }, [events, year, month]);

    const selectedDayEvents = selectedDay ? (eventsByDay[selectedDay.toString()] ?? []) : [];

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
        setSelectedDay(null);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
        setSelectedDay(null);
    };

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="space-y-8">
            {/* Month navigator */}
            <div className="flex items-center justify-between bg-surface-lowest/50 rounded-2xl px-6 py-4 border border-white/[0.02]">
                <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center group">
                    <h2 className="serif-title font-bold text-2xl text-text-main group-hover:text-primary transition-colors">
                        {MONTHS_ES[month]} <span className="text-primary/60 font-normal italic">{year}</span>
                    </h2>
                </div>
                <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="tonal-card p-4 md:p-8 space-y-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                    {DAYS_ES.map(d => (
                        <div key={d} className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/40 text-center py-2">{d}</div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 md:gap-3">
                    {cells.map((day, idx) => {
                        if (!day) return (
                            <div key={`empty-${idx}`} className="aspect-square opacity-0" />
                        );
                        
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        const isSelected = day === selectedDay;
                        const dayEvents = eventsByDay[day.toString()] ?? [];
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <motion.button
                                key={day}
                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                className={clsx(
                                    "aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative group",
                                    isSelected 
                                        ? "bg-primary text-on-primary shadow-xl shadow-primary/20 z-10 scale-110" 
                                        : hasEvents 
                                            ? "bg-primary/10 text-text-main hover:bg-primary/20" 
                                            : "hover:bg-white/5 text-text-muted/60 hover:text-text-main"
                                )}
                            >
                                <span className={clsx(
                                    "text-lg font-bold serif-title",
                                    isToday && !isSelected && "text-primary relative after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                                )}>
                                    {day}
                                </span>
                                
                                {hasEvents && !isSelected && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-sm shadow-primary/40 animate-pulse" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Selected day panel */}
            <AnimatePresence mode="wait">
                {selectedDay && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-[1px] flex-1 bg-white/[0.03]" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted/60 whitespace-nowrap">
                                {selectedDay} de {MONTHS_ES[month]}
                            </h3>
                            <div className="h-[1px] flex-1 bg-white/[0.03]" />
                        </div>
                        
                        <div className="grid gap-3">
                            {selectedDayEvents.length === 0 ? (
                                <div className="py-12 bg-white/[0.01] rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-40">
                                    <Disc size={32} className="mb-2" />
                                    <p className="text-xs font-medium italic">Sin actividades registradas</p>
                                </div>
                            ) : (
                                selectedDayEvents.map(e => <EventCard key={e.id} event={e} />)
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function AgendaList() {
    const { events, loading } = useAgenda();
    const { isDirector } = useLiveSession();
    const [view, setView] = useState<'list' | 'calendar'>('calendar');

    const now = Date.now();

    const upcoming = useMemo(() =>
        events.filter(e => e.date >= now - 86400000).sort((a, b) => a.date - b.date),
        [events, now]
    );
    const past = useMemo(() =>
        events.filter(e => e.date < now - 86400000).sort((a, b) => b.date - a.date),
        [events, now]
    );

    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                        <CalendarDays size={16} />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Control Maestro</span>
                    </div>
                    <h1 className="text-4xl serif-title font-bold text-text-main">Agenda</h1>
                    <p className="text-text-muted text-sm max-w-sm">Planificación estratégica de servicios, ensayos y eventos ministeriales.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* View toggle */}
                    <div className="flex p-1 bg-surface-low rounded-full overflow-hidden">
                        <button
                            onClick={() => setView('calendar')}
                            className={clsx(
                                "p-2 px-4 flex items-center gap-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider",
                                view === 'calendar' ? 'bg-primary text-on-primary shadow-lg shadow-primary/10' : 'text-text-muted hover:text-text-main'
                            )}
                        >
                            <CalendarDays size={16} />
                            <span className="hidden sm:inline">Calendario</span>
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={clsx(
                                "p-2 px-4 flex items-center gap-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider",
                                view === 'list' ? 'bg-primary text-on-primary shadow-lg shadow-primary/10' : 'text-text-muted hover:text-text-main'
                            )}
                        >
                            <LayoutList size={16} />
                            <span className="hidden sm:inline">Lista</span>
                        </button>
                    </div>
                    
                    {isDirector && (
                        <Link to="/agenda/add" className="btn-primary flex-1 md:flex-none">
                            <Plus size={18} />
                            Programar
                        </Link>
                    )}
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-text-muted">Consultando Agenda...</p>
                </div>
            ) : view === 'calendar' ? (
                <CalendarView events={events} />
            ) : (
                <div className="space-y-10">
                    {/* List: upcoming */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-[1px] flex-1 bg-white/[0.03]" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 whitespace-nowrap">Próximas Actividades</h2>
                            <div className="h-[1px] flex-1 bg-white/[0.03]" />
                        </div>
                        
                        {upcoming.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                                {upcoming.map((e, idx) => (
                                    <motion.div 
                                        key={e.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <EventCard event={e} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-surface-low/20 rounded-[2.5rem] border border-dashed border-white/5 opacity-40">
                                <Disc size={48} className="mx-auto mb-4" />
                                <p className="text-sm font-medium italic">Sin actividades pendientes</p>
                            </div>
                        )}
                    </section>

                    {/* List: past */}
                    {past.length > 0 && (
                        <section className="space-y-6 opacity-60 grayscale-[0.5]">
                            <div className="flex items-center gap-3">
                                <div className="h-[1px] flex-1 bg-white/[0.03]" />
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted/40 whitespace-nowrap">Archivo de Eventos</h2>
                                <div className="h-[1px] flex-1 bg-white/[0.03]" />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                                {(past || []).slice(0, 5).map(e => <EventCard key={e.id} event={e} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
