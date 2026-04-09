import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useFinance, weekLabel, getWeekStart } from '../contexts/FinanceContext';
import { ArrowLeft, Users, ShoppingBag, Save, Calendar, FileText, BadgeDollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import type { Expense } from '../types';

const CATEGORIES: { value: Expense['category']; label: string; icon: string }[] = [
    { value: 'insumos', label: 'Insumos', icon: '🎸' },
    { value: 'equipamiento', label: 'Equipamiento', icon: '🎛️' },
    { value: 'transporte', label: 'Transporte', icon: '🚗' },
    { value: 'alimentacion', label: 'Alimentación', icon: '🍽️' },
    { value: 'otro', label: 'Otros Gastos', icon: '📦' },
];

const DEFAULT_CONTRIBUTION_AMOUNT = 50;

// ─── Entry Component: Contribution ──────────────────────────────────────────

function ContributionForm({ onSave }: { onSave: () => void }) {
    const { addContribution } = useFinance();
    const [memberName, setMemberName] = useState('');
    const [amount, setAmount] = useState(DEFAULT_CONTRIBUTION_AMOUNT.toString());
    const [notes, setNotes] = useState('');
    const [weekTs, setWeekTs] = useState(() => {
        const start = getWeekStart(Date.now());
        return new Date(start).toISOString().slice(0, 10);
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!memberName.trim()) { setError('Identidad del miembro requerida.'); return; }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Monto inválido.'); return; }

        const weekStart = new Date(weekTs + 'T00:00:00').getTime();
        setSaving(true);
        try {
            await addContribution({
                memberName: memberName.trim(),
                amount: parsedAmount,
                weekLabel: weekLabel(weekStart),
                weekStart,
                notes: notes.trim() || undefined,
            });
            onSave();
        } catch {
            setError('Falla en la preservación del registro.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            <div className="space-y-8">
                <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 border-b border-white/[0.03] pb-3">Cédula de Aportación</h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                <Users size={12} className="text-primary/60" /> Ministro / Miembro *
                            </label>
                            <input
                                type="text"
                                value={memberName}
                                onChange={e => setMemberName(e.target.value)}
                                placeholder="Nombre completo..."
                                className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                    <BadgeDollarSign size={12} className="text-primary/60" /> Monto (Lempiras) *
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold serif-title pointer-events-none group-focus-within:scale-110 transition-transform">L</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        min="1"
                                        step="0.01"
                                        className="input-field pl-10 bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner text-lg font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                    <Calendar size={12} className="text-primary/60" /> Semana Correspondiente
                                </label>
                                <input
                                    type="date"
                                    value={weekTs}
                                    onChange={e => setWeekTs(e.target.value)}
                                    className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                <FileText size={12} className="text-primary/60" /> Anotaciones Adicionales
                            </label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Referencia de la transacción..."
                                className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner h-24 resize-none text-xs"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {error && (
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">{error}</motion.p>
            )}

            <button
                type="submit"
                disabled={saving}
                className={cn('btn-primary w-full h-14 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20', saving && 'opacity-60')}
            >
                <Save size={18} />
                {saving ? 'Procesando Transacción...' : 'Preservar Aportación'}
            </button>
        </form>
    );
}

// ─── Entry Component: Expense ────────────────────────────────────────────────

function ExpenseForm({ onSave }: { onSave: () => void }) {
    const { addExpense } = useFinance();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Expense['category']>('insumos');
    const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
    const [registeredBy, setRegisteredBy] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!description.trim()) { setError('Descripción contable requerida.'); return; }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Monto inválido.'); return; }

        setSaving(true);
        try {
            await addExpense({
                description: description.trim(),
                amount: parsedAmount,
                category,
                date: new Date(dateStr + 'T12:00:00').getTime(),
                registeredBy: registeredBy.trim() || undefined,
                notes: notes.trim() || undefined,
            });
            onSave();
        } catch {
            setError('Falla en la preservación del egreso.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            <div className="space-y-8">
                <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 border-b border-white/[0.03] pb-3">Cédula de Egreso</h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                <ShoppingBag size={12} className="text-secondary/60" /> Concepto / Descripción *
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Ej. Adquisición de cables XLR..."
                                className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                    <BadgeDollarSign size={12} className="text-secondary/60" /> Monto Solicitado *
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold serif-title pointer-events-none group-focus-within:scale-110 transition-transform">L</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        min="1"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="input-field pl-10 bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner text-lg font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                    <Calendar size={12} className="text-secondary/60" /> Fecha del Gasto
                                </label>
                                <input
                                    type="date"
                                    value={dateStr}
                                    onChange={e => setDateStr(e.target.value)}
                                    className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Categoría del Egreso</label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-sm font-medium',
                                            category === cat.value
                                                ? 'bg-secondary/10 border-secondary shadow-lg shadow-secondary/5'
                                                : 'bg-surface-low border-white/5 text-text-muted/40 hover:bg-surface-high hover:text-text-main'
                                        )}
                                    >
                                        <span className="text-xl">{cat.icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                    <Users size={12} className="text-secondary/60" /> Registrado Por
                                </label>
                                <input
                                    type="text"
                                    value={registeredBy}
                                    onChange={e => setRegisteredBy(e.target.value)}
                                    placeholder="Nombre del responsable..."
                                    className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                    <FileText size={12} className="text-secondary/60" /> Notas Contables
                                </label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Detalles de conciliación..."
                                    className="input-field bg-surface-low/50 hover:bg-surface-low focus:bg-surface-lowest shadow-inner text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {error && (
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">{error}</motion.p>
            )}

            <button
                type="submit"
                disabled={saving}
                className={cn('bg-secondary text-white w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-secondary/20 transition-all hover:scale-[1.01] active:scale-95', saving && 'opacity-60')}
            >
                <Save size={18} />
                {saving ? 'Procesando Egreso...' : 'Preservar Gasto'}
            </button>
        </form>
    );
}

// ─── Main Editorial Page ─────────────────────────────────────────────────────

export function FinanceEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('tipo') === 'gasto' ? 'gasto' : 'aportacion';
    const [tipo, setTipo] = useState<'aportacion' | 'gasto'>(initialType);

    const handleSave = () => navigate('/finanzas');

    return (
        <div className="min-h-screen bg-background text-text-main pb-32 animate-fade-in font-sans">
            {/* Header Sticky */}
            <header className="sticky top-0 z-40 glass-panel border-b border-white/[0.03] shadow-2xl backdrop-blur-2xl">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/finanzas"
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-text-muted hover:text-primary active:scale-90"
                        >
                            <ArrowLeft size={22} />
                        </Link>
                        <div className="h-6 w-[1px] bg-white/5 mx-2" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Tesorería Ministerial</p>
                            <h2 className="serif-title font-bold text-sm text-text-main">Gestión de Haberes</h2>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
                {/* Entry Type Toggle - Scholarly Tonal Style */}
                <div className="flex bg-surface-low p-1.5 rounded-[1.8rem] border border-white/[0.03] shadow-inner relative">
                    <button
                        onClick={() => setTipo('aportacion')}
                        className={cn(
                            'flex-1 h-12 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all rounded-3xl relative z-10',
                            tipo === 'aportacion' ? 'text-on-primary' : 'text-text-muted/60 hover:text-text-main'
                        )}
                    >
                        <Users size={16} /> Presupuesto
                    </button>
                    <button
                        onClick={() => setTipo('gasto')}
                        className={cn(
                            'flex-1 h-12 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all rounded-3xl relative z-10',
                            tipo === 'gasto' ? 'text-white' : 'text-text-muted/60 hover:text-text-main'
                        )}
                    >
                        <ShoppingBag size={16} /> Egresos
                    </button>
                    
                    {/* Animated Highlighting Backdrop */}
                    <motion.div 
                        initial={false}
                        animate={{ x: tipo === 'aportacion' ? '0%' : '100%' }}
                        className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-[1.4rem] shadow-xl z-0"
                        style={{ backgroundColor: tipo === 'aportacion' ? '#f2ca50' : '#8b5cf6' }} // Gold vs Purple/Secondary
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                </div>

                <div className="space-y-12">
                    {tipo === 'aportacion' ? (
                        <ContributionForm onSave={handleSave} />
                    ) : (
                        <ExpenseForm onSave={handleSave} />
                    )}
                </div>
            </div>
            
            {/* Footer Mark */}
            <div className="pt-24 pb-8 text-center opacity-10">
                <div className="h-[1px] w-full bg-white mb-2" />
                <p className="text-[10px] uppercase tracking-[1em] font-black">LUMINARY EDITORIAL SYSTEM</p>
            </div>
        </div>
    );
}
