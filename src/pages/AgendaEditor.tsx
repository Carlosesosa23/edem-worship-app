import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgenda } from '../contexts/AgendaContext';
import { useMixes } from '../contexts/MixesContext';
import type { Participant, WorshipEvent } from '../types';
import { ArrowLeft, Plus, Save, Calendar, Clock, Users, FileText, Disc, ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const EVENT_TYPES = [
    { value: 'servicio', label: 'Servicio Dominical' },
    { value: 'ensayo', label: 'Ensayo / Práctica' },
    { value: 'otro', label: 'Evento Especial' },
] as const;

export function AgendaEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, addEvent, updateEvent } = useAgenda();
    const { mixes } = useMixes();
    const isEditing = Boolean(id);
    const existing = id ? events.find(e => e.id === id) : null;

    const [title, setTitle] = useState(existing?.title ?? '');
    const [date, setDate] = useState(
        existing
            ? new Date(existing.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [time, setTime] = useState(existing?.time ?? '');
    const [type, setType] = useState<WorshipEvent['type']>(existing?.type ?? 'servicio');
    const [mixId, setMixId] = useState(existing?.mixId ?? '');
    const [notes, setNotes] = useState(existing?.notes ?? '');
    const [participants, setParticipants] = useState<Participant[]>(existing?.participants ?? []);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existing) {
            setTitle(existing.title);
            setDate(new Date(existing.date).toISOString().split('T')[0]);
            setTime(existing.time ?? '');
            setType(existing.type);
            setMixId(existing.mixId ?? '');
            setNotes(existing.notes ?? '');
            setParticipants(existing.participants);
        }
    }, [existing?.id]);

    const addParticipant = () => {
        if (!newName.trim()) return;
        setParticipants(prev => [...prev, { name: newName.trim(), role: newRole.trim() || undefined }]);
        setNewName('');
        setNewRole('');
    };

    const removeParticipant = (index: number) => {
        setParticipants(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title.trim() || !date) {
            alert('Por favor ingresa el título y la fecha.');
            return;
        }
        setSaving(true);
        const payload = {
            title: title.trim(),
            date: new Date(date + 'T12:00:00').getTime(),
            time: time || undefined,
            type,
            mixId: mixId || undefined,
            notes: notes.trim() || undefined,
            participants,
        };
        try {
            if (isEditing && id) {
                await updateEvent(id, payload);
            } else {
                await addEvent(payload);
            }
            navigate('/agenda');
        } catch (error: unknown) {
            console.error('Error saving event:', error);
            alert(`Error al guardar: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setSaving(false);
        }
    };

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
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Programación Ministerial</p>
                        <h2 className="serif-title font-bold text-sm text-text-main">
                            {isEditing ? 'Revisión de Agenda' : 'Planificación Anual'}
                        </h2>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !title.trim()}
                    className="btn-primary h-10 px-6 shadow-lg shadow-primary/20"
                >
                    <Save size={18} />
                    <span className="hidden sm:inline">Preservar Evento</span>
                    <span className="sm:hidden">Guardar</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 space-y-16">
                <form className="space-y-16">
                    {/* Title Section */}
                    <header className="space-y-8 text-center sm:text-left">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 block ml-1">Contexto del Evento</label>
                            <input
                                type="text"
                                required
                                className="bg-transparent border-none p-0 w-full serif-title text-4xl md:text-6xl font-bold text-text-main placeholder:text-text-muted/10 focus:ring-0 outline-none transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Título de la convocatoria..."
                            />
                        </div>
                        <div className="h-[1px] w-full bg-white/[0.03]" />
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                        {/* Core Data Side */}
                        <div className="space-y-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 border-b border-white/[0.03] pb-3 text-center sm:text-left">Cédula del Evento</h3>
                            
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                            <Calendar size={12} className="text-primary/60" /> Fecha Señalada
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner [color-scheme:dark]"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                            <Clock size={12} className="text-secondary/60" /> Hora de Cita
                                        </label>
                                        <input
                                            type="time"
                                            className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner [color-scheme:dark]"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Categoría del Fluir</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {EVENT_TYPES.map(t => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setType(t.value)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                                    type === t.value 
                                                        ? "bg-primary text-on-primary border-primary shadow-xl shadow-primary/10" 
                                                        : "bg-surface-low border-white/5 text-text-muted/60 hover:bg-surface-high hover:text-text-main"
                                                )}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                        <Disc size={12} className="text-primary/60" /> Mix del Repertorio (Opcional)
                                    </label>
                                    <div className="relative group">
                                        <select
                                            className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner appearance-none cursor-pointer"
                                            value={mixId}
                                            onChange={e => setMixId(e.target.value)}
                                        >
                                            <option value="" className="bg-surface-low">Sin mix asociado</option>
                                            {mixes.map(m => (
                                                <option key={m.id} value={m.id} className="bg-surface-low">{m.title}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                        <FileText size={12} className="text-primary/60" /> Notas / Indicaciones
                                    </label>
                                    <textarea
                                        className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner h-32 resize-none text-xs leading-relaxed"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Escribe observaciones o detalles logísticos..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personnel Side */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 text-center sm:text-left">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">Personnel / Ministros</h3>
                                <span className="text-[9px] font-bold text-primary/60 tracking-widest">{participants.length} ASIGNADOS</span>
                            </div>

                            <div className="space-y-6">
                                {/* Personnel List */}
                                <div className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {participants.map((p, i) => (
                                            <motion.div 
                                                key={`${p.name}-${i}`}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="tonal-card p-4 flex items-center justify-between group hover:bg-surface-high transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-surface-lowest flex items-center justify-center text-primary border border-white/5 shadow-inner">
                                                        <Users size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">{p.name}</p>
                                                        {p.role && <p className="text-[9px] font-black uppercase tracking-widest text-text-muted/40">{p.role}</p>}
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeParticipant(i)} 
                                                    className="w-8 h-8 flex items-center justify-center text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Add Personnel Row */}
                                <div className="bg-surface-low/30 p-6 rounded-[2rem] border border-white/[0.03] shadow-inner space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 text-center">Incorporar Ministro</p>
                                    <div className="space-y-3">
                                        <input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addParticipant()}
                                            placeholder="Nombre del integrante..."
                                            className="input-field bg-background/50 border-white/5 text-sm"
                                        />
                                        <input
                                            value={newRole}
                                            onChange={e => setNewRole(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addParticipant()}
                                            placeholder="Función (Voz, Piano, Bajo...)"
                                            className="input-field bg-background/50 border-white/5 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={addParticipant}
                                            className="w-full h-11 flex items-center justify-center gap-2 bg-primary/20 text-primary hover:bg-primary hover:text-on-primary rounded-xl transition-all shadow-lg text-[10px] font-black uppercase tracking-[0.2em] active:scale-[0.98]"
                                        >
                                            <Plus size={16} /> Agregar Cédula
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
