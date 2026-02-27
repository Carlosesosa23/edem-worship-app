import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAgenda } from '../contexts/AgendaContext';
import { useLiveSession } from '../contexts/LiveSessionContext';
import {
    CalendarDays, Plus, Clock, Users, ChevronRight,
    Disc, LayoutList, ChevronLeft
} from 'lucide-react';
import type { WorshipEvent } from '../types';

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    servicio: { label: 'Servicio', bg: 'bg-primary/20', text: 'text-primary', dot: 'bg-primary' },
    ensayo: { label: 'Ensayo', bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
    otro: { label: 'Otro', bg: 'bg-surface', text: 'text-text-muted', dot: 'bg-text-muted' },
};

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function EventCard({ event }: { event: WorshipEvent }) {
    const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.otro;
    const dateObj = new Date(event.date);
    return (
        <Link
            to={`/agenda/${event.id}`}
            className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all active:scale-[0.99] group"
        >
            <div className="flex-shrink-0 w-12 h-12 bg-surface rounded-xl flex flex-col items-center justify-center border border-white/10">
                <span className="text-[10px] text-text-muted uppercase font-semibold">
                    {dateObj.toLocaleDateString('es', { month: 'short' })}
                </span>
                <span className="text-xl font-black text-text-main leading-tight">
                    {dateObj.getDate()}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                        {style.label}
                    </span>
                </div>
                <h3 className="font-bold text-text-main truncate group-hover:text-white transition-colors">{event.title}</h3>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5 flex-wrap">
                    {event.time && <span className="flex items-center gap-1"><Clock size={10} /> {event.time}</span>}
                    {event.participants.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Users size={10} />
                            {event.participants.slice(0, 2).map(p => p.name).join(', ')}
                            {event.participants.length > 2 && ` +${event.participants.length - 2}`}
                        </span>
                    )}
                </div>
            </div>
            <ChevronRight className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" size={18} />
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

    // Color bg pill per type
    const PILL_SOLID: Record<string, string> = {
        servicio: 'bg-primary text-white',
        ensayo: 'bg-amber-500 text-white',
        otro: 'bg-surface-highlight text-text-muted',
    };

    return (
        <div className="space-y-4">
            {/* Month navigator */}
            <div className="flex items-center justify-between glass-panel rounded-xl px-4 py-3">
                <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="font-bold text-lg">{MONTHS_ES[month]} {year}</h2>
                <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center">
                {DAYS_ES.map(d => (
                    <div key={d} className="text-[11px] font-semibold uppercase text-text-muted py-1">{d}</div>
                ))}
            </div>

            {/* Calendar grid — variable height rows */}
            <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
                {cells.map((day, idx) => {
                    if (!day) return (
                        <div key={`empty-${idx}`} className="bg-background min-h-[4rem]" />
                    );
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const isSelected = day === selectedDay;
                    const dayEvents = eventsByDay[day.toString()] ?? [];

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(isSelected ? null : day)}
                            className={`
                                bg-background p-1.5 text-left flex flex-col min-h-[4rem] transition-colors
                                ${isSelected ? 'bg-primary/10' : 'hover:bg-white/3'}
                            `}
                        >
                            {/* Day number */}
                            <span className={`
                                text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mb-1 self-center
                                ${isSelected ? 'bg-primary text-white' : isToday ? 'bg-primary/20 text-primary' : 'text-text-muted'}
                            `}>
                                {day}
                            </span>

                            {/* Event pills with participants */}
                            <div className="flex flex-col gap-1 w-full">
                                {dayEvents.slice(0, 2).map((e, i) => (
                                    <div key={i} className="flex flex-col gap-0.5">
                                        <span
                                            className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate leading-tight ${PILL_SOLID[e.type] ?? PILL_SOLID.otro}`}
                                        >
                                            {e.title}
                                        </span>
                                        {e.participants.length > 0 && (
                                            <span className="text-[8px] text-text-muted pl-1 truncate leading-tight">
                                                {e.participants.slice(0, 2).map(p => p.name).join(', ')}
                                                {e.participants.length > 2 && ` +${e.participants.length - 2}`}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {dayEvents.length > 2 && (
                                    <span className="text-[9px] text-text-muted pl-1">+{dayEvents.length - 2} más</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected day panel */}
            {selectedDay && (
                <div className="space-y-2 mt-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                        {selectedDay} de {MONTHS_ES[month]}
                    </h3>
                    {selectedDayEvents.length === 0 ? (
                        <p className="text-sm text-text-muted italic py-3 text-center">Sin eventos este día.</p>
                    ) : (
                        selectedDayEvents.map(e => <EventCard key={e.id} event={e} />)
                    )}
                </div>
            )}
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
        <div className="space-y-5 pb-24">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                        <CalendarDays size={28} className="text-primary" />
                        Agenda
                    </h1>
                    <p className="text-text-muted mt-1">Servicios y ensayos</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex bg-surface border border-white/10 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setView('calendar')}
                            className={`p-2 transition-colors ${view === 'calendar' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
                            title="Vista calendario"
                        >
                            <CalendarDays size={18} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
                            title="Vista lista"
                        >
                            <LayoutList size={18} />
                        </button>
                    </div>
                    {isDirector && (
                        <Link to="/agenda/add" className="btn-primary flex items-center gap-2 text-sm shadow-xl shadow-primary/20">
                            <Plus size={18} />
                            <span>Nuevo</span>
                        </Link>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center text-text-muted py-10">Cargando agenda...</div>
            ) : view === 'calendar' ? (
                <CalendarView events={events} />
            ) : (
                <>
                    {/* List: upcoming */}
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Próximos</h2>
                        {upcoming.length > 0 ? (
                            <div className="grid gap-3">
                                {upcoming.map(e => <EventCard key={e.id} event={e} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center text-text-muted mx-auto mb-4 border border-dashed border-white/20">
                                    <Disc size={32} className="opacity-30" />
                                </div>
                                <h3 className="text-lg font-bold text-text-main">Sin eventos próximos</h3>
                                {isDirector ? (
                                    <Link to="/agenda/add" className="text-primary hover:underline mt-2 inline-block">
                                        Crear primer evento
                                    </Link>
                                ) : (
                                    <p className="text-text-muted text-sm mt-1">El director agregará eventos próximamente.</p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* List: past */}
                    {past.length > 0 && (
                        <section className="opacity-60">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Pasados</h2>
                            <div className="grid gap-3">
                                {past.slice(0, 5).map(e => <EventCard key={e.id} event={e} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
