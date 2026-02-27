import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgenda } from '../contexts/AgendaContext';
import { useMixes } from '../contexts/MixesContext';
import type { Participant, WorshipEvent } from '../types';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';

const EVENT_TYPES = [
    { value: 'servicio', label: 'Servicio' },
    { value: 'ensayo', label: 'Ensayo' },
    { value: 'otro', label: 'Otro' },
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
        setParticipants(prev => [...prev, { name: newName.trim() }]);
        setNewName('');
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
            const msg = error instanceof Error ? error.message : String(error);
            if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
                alert('❌ Error de permisos en Firebase.\n\nNecesitas agregar la colección "events" en las reglas de Firestore.\n\nVe a Firebase → Firestore → Reglas y agrega:\n  match /events/{id} {\n    allow read, write: if true;\n  }');
            } else {
                alert(`❌ Error al guardar: ${msg}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors";

    return (
        <div className="bg-background min-h-screen text-text-main pb-20 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-20 glass-panel border-b border-white/5 px-4 py-3 flex justify-between items-center backdrop-blur-xl shadow-lg">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="font-bold text-lg">{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                <button
                    onClick={handleSave}
                    disabled={saving || !title.trim()}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                    <Save size={16} />
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">

                {/* Title */}
                <div>
                    <label className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 block">Título</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ej. Servicio Domingo"
                        className={inputCls}
                    />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 block">Fecha</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 block">Hora (opcional)</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
                    </div>
                </div>

                {/* Type */}
                <div>
                    <label className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 block">Tipo de Evento</label>
                    <div className="flex gap-3 flex-wrap">
                        {EVENT_TYPES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setType(t.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${type === t.value ? 'bg-primary text-white border-primary' : 'border-white/10 text-text-muted hover:border-white/30'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Link Mix */}
                {mixes.length > 0 && (
                    <div>
                        <label className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 block">Mix asociado (opcional)</label>
                        <select
                            value={mixId}
                            onChange={e => setMixId(e.target.value)}
                            className={inputCls}
                        >
                            <option value="">Sin mix</option>
                            {mixes.map(m => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Participants */}
                <div>
                    <label className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 block">Participantes</label>
                    <div className="space-y-2 mb-3">
                        {participants.map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-surface px-4 py-2.5 rounded-xl border border-white/5">
                                <span className="font-semibold text-text-main">{p.name}</span>
                                <button onClick={() => removeParticipant(i)} className="text-text-muted hover:text-red-400 transition-colors p-1">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* Add participant row */}
                    <div className="flex gap-2">
                        <input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addParticipant()}
                            placeholder="Nombre del cantante / músico"
                            className={`${inputCls} flex-1`}
                        />
                        <button
                            onClick={addParticipant}
                            className="p-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 block">Notas (opcional)</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Observaciones, indicaciones especiales..."
                        rows={3}
                        className={`${inputCls} resize-none`}
                    />
                </div>
            </div>
        </div>
    );
}
