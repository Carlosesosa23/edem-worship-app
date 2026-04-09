import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { useLiveSession } from '../contexts/LiveSessionContext';
import {
    Wallet, Plus, TrendingUp, TrendingDown, DollarSign,
    Trash2, ChevronDown, ShoppingBag, Users,
    BarChart3, CheckCircle2, ChevronRight,
    ArrowUpRight, ArrowDownRight, History, CreditCard,
    PieChart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Contribution, Expense, MemberDebt } from '../types';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Expense['category'], string> = {
    insumos: 'Insumos',
    equipamiento: 'Equipamiento',
    transporte: 'Transporte',
    alimentacion: 'Alimentación',
    otro: 'Otro',
};

const CATEGORY_STYLES: Record<Expense['category'], { bg: string; text: string; icon: string }> = {
    insumos: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: '🎸' },
    equipamiento: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: '🎛️' },
    transporte: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: '🚗' },
    alimentacion: { bg: 'bg-green-500/10', text: 'text-green-400', icon: '🍽️' },
    otro: { bg: 'bg-white/5', text: 'text-text-muted', icon: '📦' },
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    colorClass,
    sub,
    trend
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    colorClass: string;
    sub?: string;
    trend?: 'up' | 'down';
}) {
    return (
        <div className="tonal-card p-6 flex flex-col gap-4 group transition-all duration-500 hover:bg-surface-high">
            <div className="flex justify-between items-start">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500', colorClass)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        "p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider",
                        trend === 'up' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend === 'up' ? "Ingreso" : "Egreso"}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold group-hover:text-primary transition-colors">{label}</p>
                <p className="text-3xl font-bold serif-title text-text-main mt-1">{value}</p>
                {sub && <p className="text-[10px] font-bold text-text-muted/60 mt-1 uppercase tracking-widest">{sub}</p>}
            </div>
        </div>
    );
}

function ContributionRow({
    contribution,
    canDelete,
    onDelete,
}: {
    contribution: Contribution;
    canDelete: boolean;
    onDelete: (id: string) => void;
}) {
    return (
        <div className="flex items-center gap-4 py-4 px-5 rounded-2xl hover:bg-surface-high/50 transition-all group border-l-2 border-transparent hover:border-primary">
            <div className="w-10 h-10 bg-surface-lowest rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:text-primary transition-colors">
                <Users size={18} className="opacity-40" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-text-main group-hover:text-primary transition-colors truncate">{contribution.memberName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">{contribution.weekLabel}</p>
                    {contribution.notes && (
                        <>
                            <div className="w-1 h-1 rounded-full bg-white/5" />
                            <p className="text-[11px] text-text-muted/40 italic truncate">{contribution.notes}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="text-right flex items-center gap-3">
                <span className="text-primary font-bold serif-title text-lg whitespace-nowrap">
                    +L {contribution.amount.toFixed(0)}
                </span>
                {canDelete && (
                    <button
                        onClick={() => onDelete(contribution.id)}
                        className="p-2 rounded-full text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar aportación"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

function ExpenseRow({
    expense,
    canDelete,
    onDelete,
}: {
    expense: Expense;
    canDelete: boolean;
    onDelete: (id: string) => void;
}) {
    const style = CATEGORY_STYLES[expense.category];
    return (
        <div className="flex items-center gap-4 py-4 px-5 rounded-2xl hover:bg-surface-high/50 transition-all group border-l-2 border-transparent hover:border-red-400/30 overflow-hidden">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg shadow-inner group-hover:scale-110 transition-transform duration-500', style.bg)}>
                <span className="grayscale-[0.3] group-hover:grayscale-0">{style.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-text-main group-hover:text-red-400/80 transition-colors truncate">{expense.description}</p>
                <div className="flex items-center gap-3 mt-1 overflow-hidden">
                    <span className={cn('text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md', style.bg, style.text)}>
                        {CATEGORY_LABELS[expense.category]}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                    </span>
                    {expense.registeredBy && (
                        <span className="hidden sm:inline text-[10px] text-text-muted/30 uppercase tracking-widest truncate">· {expense.registeredBy}</span>
                    )}
                </div>
            </div>
            <div className="text-right flex items-center gap-3">
                <span className="text-red-400 font-bold serif-title text-lg whitespace-nowrap">
                    -L {expense.amount.toFixed(0)}
                </span>
                {canDelete && (
                    <button
                        onClick={() => onDelete(expense.id)}
                        className="p-2 rounded-full text-red-100/10 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar gasto"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── DebtCard ─────────────────────────────────────────────────────────────────

function DebtCard({ debt }: { debt: MemberDebt }) {
    const [expanded, setExpanded] = useState(false);
    const pct = debt.applicableWeeks > 0
        ? Math.round((debt.paidWeeks / debt.applicableWeeks) * 100)
        : 100;

    return (
        <div className={cn(
            'tonal-card overflow-hidden transition-all duration-500 hover:bg-surface-high',
            !debt.isUpToDate && 'ring-1 ring-red-400/10 hover:ring-red-400/20'
        )}>
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-5 p-5 text-left group"
            >
                {/* Avatar inicial */}
                <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl serif-title flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500',
                    debt.isUpToDate
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-400/10 text-red-400 shadow-red-400/5'
                )}>
                    {debt.memberName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <p className="font-bold text-xl text-text-main group-hover:text-primary transition-colors truncate">{debt.memberName}</p>
                        {debt.isUpToDate ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-green-400 bg-green-500/5 px-2 py-1 rounded-md flex-shrink-0">
                                <CheckCircle2 size={12} /> Al día
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-red-100 bg-red-400 px-2 py-1 rounded-md flex-shrink-0 shadow-sm shadow-red-400/20">
                                Pendiente
                            </span>
                        )}
                    </div>

                    {/* Barra de cumplimiento */}
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1 bg-surface-lowest rounded-full h-2 overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className={cn(
                                    'h-full rounded-full transition-all duration-1000',
                                    debt.isUpToDate ? 'bg-green-400' : pct >= 75 ? 'bg-amber-400' : 'bg-red-400'
                                )}
                            />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-text-muted/60 uppercase flex-shrink-0">
                            {pct}% Semanas
                        </span>
                    </div>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                    {debt.isUpToDate ? (
                        <p className="text-green-400 font-bold serif-title text-xl">L {debt.totalPaid.toFixed(0)}</p>
                    ) : (
                        <>
                            <p className="text-red-400 font-bold serif-title text-xl">L {debt.debtAmount.toFixed(0)}</p>
                            <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest mt-0.5">Saldo pend.</p>
                        </>
                    )}
                </div>

                <div className={cn(
                    "w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-text-muted transition-all",
                    expanded && "bg-primary/10 text-primary border-primary/20 rotate-90"
                )}>
                    <ChevronRight size={18} />
                </div>
            </button>

            {/* Detalle expandible */}
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-surface-lowest/30"
                    >
                        <div className="px-6 pb-6 pt-2 space-y-4">
                            <div className="h-[1px] bg-white/[0.03] w-full" />
                            {!debt.isUpToDate ? (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60">Semanas sin registro ({debt.missedWeeks})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {debt.missedWeekLabels.map((label, i) => (
                                            <span
                                                key={i}
                                                className="text-[9px] font-bold bg-surface-lowest text-red-400 border border-white/5 px-2.5 py-1.5 rounded-lg uppercase tracking-wider"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="pt-2 flex justify-between items-center text-xs font-bold text-text-muted">
                                        <span>Total adeudado:</span>
                                        <span className="text-red-400 text-lg serif-title">L {debt.debtAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 space-y-2">
                                    <p className="text-primary font-bold serif-title text-lg italic">
                                        Tesorería al día
                                    </p>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em]">
                                        Total aportado: L {debt.totalPaid.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Monthly Summary Table ────────────────────────────────────────────────────

function MonthlySummaryTable({ contributions, memberDebts }: { contributions: Contribution[], memberDebts: MemberDebt[] }) {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    
    // Generate options
    const monthOptions = useMemo(() => {
        const opts = new Set<string>();
        const currentYear = new Date().getFullYear();
        for (let m = 1; m <= 12; m++) opts.add(`${currentYear}-${String(m).padStart(2, '0')}`);
        contributions.forEach(c => {
            const d = new Date(c.weekStart);
            opts.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        });
        return Array.from(opts).sort((a, b) => b.localeCompare(a)).map(val => {
            const [y, m] = val.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1, 1);
            return { value: val, label: date.toLocaleDateString('es', { month: 'long', year: 'numeric' }) };
        });
    }, [contributions]);

    // Compute weeks
    const weeksInMonth = useMemo(() => {
        const [y, m] = selectedMonth.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1, 1);
        while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
        const weeks: number[] = [];
        while (date.getMonth() === parseInt(m) - 1) {
            weeks.push(date.getTime());
            date.setDate(date.getDate() + 7);
        }
        return weeks;
    }, [selectedMonth]);

    // Member data
    const memberRows = useMemo(() => {
        return memberDebts.map(debt => {
            let totalMonthly = 0;
            const weekStatus = weeksInMonth.map(weekTs => {
                const c = contributions.find(c => c.memberName === debt.memberName && c.weekStart === weekTs);
                if (c) { totalMonthly += c.amount; return { ts: weekTs, status: 'paid', amount: c.amount }; }
                return { ts: weekTs, status: 'pending', amount: 0 };
            });
            return { memberName: debt.memberName, weeks: weekStatus, totalMonthly };
        }).sort((a, b) => a.memberName.localeCompare(b.memberName));
    }, [memberDebts, weeksInMonth, contributions]);

    return (
        <div className="tonal-card overflow-hidden mt-8">
            <header className="px-6 py-5 border-b border-white/[0.03] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Reporte Estructural</p>
                    <h3 className="serif-title font-bold text-xl text-text-main flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary/60" />
                        Libro Contable Mensual
                    </h3>
                </div>
                <div className="relative w-full sm:w-auto">
                    <select 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="w-full sm:w-auto appearance-none bg-surface-lowest border border-white/5 text-text-main rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary/30 transition-all cursor-pointer pr-10"
                    >
                        {monthOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
            </header>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap table-fixed min-w-[800px]">
                    <thead className="bg-surface-lowest/50 text-[9px] font-bold uppercase tracking-widest text-text-muted/60">
                        <tr>
                            <th className="px-6 py-4 w-48 sticky left-0 bg-surface-lowest z-10 border-r border-white/5 shadow-xl">Integrantes</th>
                            {weeksInMonth.map((w, i) => (
                                <th key={w} className="px-5 py-4 text-center border-r border-white/5">Semana {i + 1}</th>
                            ))}
                            <th className="px-6 py-4 w-32 text-right">Total Acumulado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {memberRows.length === 0 ? (
                            <tr>
                                <td colSpan={weeksInMonth.length + 2} className="text-center py-20 text-text-muted/40 italic font-medium tracking-wide">
                                    No se han encontrado registros en este periodo
                                </td>
                            </tr>
                        ) : memberRows.map((row) => (
                            <tr key={row.memberName} className="group hover:bg-surface-high/30 transition-colors">
                                <td className="px-6 py-5 font-bold text-sm text-text-main sticky left-0 bg-background/50 backdrop-blur-md group-hover:bg-surface-high/50 transition-colors z-10 border-r border-white/5 shadow-xl">
                                    {row.memberName}
                                </td>
                                {row.weeks.map(w => (
                                    <td key={w.ts} className="px-5 py-5 border-r border-white/[0.01] text-center">
                                        {w.status === 'paid' ? (
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-primary group-hover:scale-110 transition-transform">L {w.amount.toFixed(0)}</span>
                                                <div className="w-1 h-1 rounded-full bg-primary/40 mt-1" />
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-bold text-text-muted/20 uppercase tracking-widest group-hover:text-text-muted/40 transition-colors italic">Pendiente</span>
                                        )}
                                    </td>
                                ))}
                                <td className="px-6 py-5 font-bold text-base serif-title text-right text-primary group-hover:brightness-110 transition-all">
                                    {row.totalMonthly > 0 ? (
                                        <div className="flex flex-col items-end">
                                            <span>L {row.totalMonthly.toFixed(0)}</span>
                                            <span className="text-[8px] font-bold text-text-muted/40 uppercase tracking-[0.2em] mt-0.5">Realizado</span>
                                        </div>
                                    ) : <span className="opacity-10">-</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

type ActiveTab = 'resumen' | 'aportaciones' | 'gastos' | 'deudas';

export function FinanceList() {
    const {
        contributions, expenses, loading,
        totalContributions, totalExpenses, balance,
        deleteContribution, deleteExpense,
        memberDebts,
    } = useFinance();
    const { isDirector } = useLiveSession();

    const [activeTab, setActiveTab] = useState<ActiveTab>('resumen');
    const [showAllContributions, setShowAllContributions] = useState(false);
    const [showAllExpenses, setShowAllExpenses] = useState(false);

    const debtCount = (memberDebts || []).filter(d => !d.isUpToDate).length;



    const expensesByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        (expenses || []).forEach(e => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
        return Object.entries(map)
            .map(([cat, total]) => ({ cat: cat as Expense['category'], total }))
            .sort((a, b) => b.total - a.total);
    }, [expenses]);

    const displayedContributions = showAllContributions ? (contributions || []) : (contributions || []).slice(0, 8);
    const displayedExpenses = showAllExpenses ? (expenses || []) : (expenses || []).slice(0, 8);

    const handleDeleteContribution = async (id: string) => {
        if (!confirm('¿Eliminar esta aportación?')) return;
        await deleteContribution(id);
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('¿Eliminar este gasto?')) return;
        await deleteExpense(id);
    };

    return (
        <div className="space-y-8 pb-32 animate-fade-in">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                        <Wallet size={16} />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Módulo Administrativo</span>
                    </div>
                    <h1 className="text-4xl serif-title font-bold text-text-main">
                        Salud <span className="italic text-primary">Financiera</span>
                    </h1>
                    <p className="text-text-muted text-sm max-w-sm">Seguimiento editorial de fondos, diezmos y gastos operativos del ministerio.</p>
                </div>
                {isDirector && (
                    <Link
                        to="/finanzas/add"
                        className="btn-primary w-full md:w-auto"
                    >
                        <Plus size={18} />
                        Contabilizar Flujo
                    </Link>
                )}
            </header>

            {/* ── Stats cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                    label="Fondo actual"
                    value={`L ${balance.toFixed(0)}`}
                    icon={CreditCard}
                    colorClass={balance >= 0 ? 'bg-primary/20 text-primary shadow-primary/10' : 'bg-red-400/20 text-red-400 shadow-red-400/10'}
                    sub={balance >= 0 ? 'Recurso disponible' : 'Compromiso pendiente'}
                />
                <StatCard
                    label="Ingresos Totales"
                    value={`L ${totalContributions.toFixed(0)}`}
                    icon={TrendingUp}
                    trend="up"
                    colorClass="bg-green-500/10 text-green-400"
                    sub="Recaudación acumulada"
                />
                <StatCard
                    label="Egresos Totales"
                    value={`L ${totalExpenses.toFixed(0)}`}
                    icon={TrendingDown}
                    trend="down"
                    colorClass="bg-red-400/10 text-red-400"
                    sub="Inversión y gastos"
                />
            </div>

            {/* ── Navigation Tabs ─────────────────────────────────────────────────────── */}
            <div className="flex p-1.5 bg-surface-low rounded-[2rem] overflow-hidden w-full sm:w-fit sticky top-2 z-30 shadow-2xl shadow-background/50 border border-white/[0.03] backdrop-blur-xl">
                {([
                    { key: 'resumen', label: 'Balance', icon: PieChart },
                    { key: 'aportaciones', label: 'Ingresos', icon: TrendingUp },
                    { key: 'gastos', label: 'Egresos', icon: TrendingDown },
                    { key: 'deudas', label: 'Pendientes', icon: History, badge: debtCount > 0 ? debtCount : undefined },
                ] as { key: ActiveTab; label: string; icon: React.ElementType; badge?: number }[]).map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 relative',
                            activeTab === tab.key
                                ? 'bg-primary text-on-primary shadow-xl shadow-primary/20'
                                : 'text-text-muted hover:text-text-main'
                        )}
                    >
                        <tab.icon size={16} className={activeTab === tab.key ? "" : "opacity-40"} />
                        <span className="hidden xs:inline">{tab.label}</span>
                        {tab.badge !== undefined && (
                            <span className={cn(
                                "absolute -top-1 -right-1 w-5 h-5 font-black rounded-full flex items-center justify-center text-[9px] border-2 border-background",
                                activeTab === tab.key ? "bg-white text-primary" : "bg-red-400 text-white"
                            )}>
                                {tab.badge}
                            </span>
                        )}
                        {activeTab === tab.key && (
                            <motion.div 
                                layoutId="activeTabGlow"
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/40 rounded-full blur-[2px]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-10 h-10 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-text-muted/60">Sincronizando Libro...</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* ── Tab: Resumen ──────────────────────────────────────────────── */}
                        {activeTab === 'resumen' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Eficiencia del fondo */}
                                    {totalContributions > 0 && (
                                        <div className="tonal-card p-8 flex flex-col justify-center space-y-6 overflow-hidden relative">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Ratio de ejecución</p>
                                                    <h4 className="serif-title font-bold text-2xl text-text-main">Salud del Fondo</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-bold serif-title text-text-main">{((totalExpenses / totalContributions) * 100).toFixed(0)}%</p>
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Gasto vs Ingreso</p>
                                                </div>
                                            </div>
                                            
                                            <div className="relative pt-6">
                                                <div className="w-full bg-surface-lowest h-3 rounded-full shadow-inner overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((totalExpenses / totalContributions) * 100, 100)}%` }}
                                                        className={cn(
                                                            'h-full rounded-full transition-all duration-1000',
                                                            totalExpenses > totalContributions ? 'bg-red-400' : 'bg-primary shadow-[0_0_15px_rgba(242,202,80,0.3)]'
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-4 text-[9px] font-bold uppercase tracking-[0.3em] text-text-muted/40">
                                                    <span>L 0</span>
                                                    <span>L {totalContributions.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Categorías destacadas */}
                                    <div className="tonal-card p-8 space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Inversión Sectorial</p>
                                            <h4 className="serif-title font-bold text-2xl text-text-main">Distribución</h4>
                                        </div>
                                        <div className="space-y-4">
                                            {expensesByCategory.slice(0, 3).map(({ cat, total }) => {
                                                const style = CATEGORY_STYLES[cat];
                                                const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
                                                return (
                                                    <div key={cat} className="group">
                                                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-2">
                                                            <span className="flex items-center gap-2 text-text-main">
                                                                <span className={cn("w-2 h-2 rounded-full shadow-sm", style.bg.replace('/10', '/100'))} />
                                                                {CATEGORY_LABELS[cat]}
                                                            </span>
                                                            <span className="text-text-muted">L {total.toFixed(0)}</span>
                                                        </div>
                                                        <div className="w-full bg-surface-lowest h-1.5 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                className={cn("h-full transition-all duration-1000", style.bg.replace('/10', '/60'))} 
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {expensesByCategory.length === 0 && (
                                                <p className="text-xs text-text-muted italic py-4 opacity-40">Sin gastos sectorizados aún.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla Resumen Mensual */}
                                <MonthlySummaryTable contributions={contributions} memberDebts={memberDebts} />
                            </div>
                        )}

                        {/* ── Tab: Aportaciones ────────────────────────────────────────── */}
                        {activeTab === 'aportaciones' && (
                            <div className="space-y-6">
                                <div className="tonal-card overflow-hidden">
                                    <div className="px-6 py-5 border-b border-white/[0.03] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp size={20} className="text-primary/60" />
                                            <h3 className="serif-title font-bold text-xl text-text-main">Registro de Ingresos</h3>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">{contributions.length} Entradas</span>
                                    </div>
                                    {contributions.length === 0 ? (
                                        <div className="py-24 text-center space-y-4 opacity-30">
                                            <DollarSign size={48} className="mx-auto" />
                                            <p className="text-xs font-bold uppercase tracking-[0.3em]">Cero ingresos documentados</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/[0.02]">
                                            {displayedContributions.map(c => (
                                                <ContributionRow
                                                    key={c.id}
                                                    contribution={c}
                                                    canDelete={isDirector}
                                                    onDelete={handleDeleteContribution}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {contributions.length > 8 && (
                                        <button
                                            onClick={() => setShowAllContributions(v => !v)}
                                            className="w-full py-5 text-[10px] font-bold text-text-muted/60 hover:text-primary hover:bg-surface-high transition-all flex items-center justify-center gap-2 border-t border-white/[0.03] uppercase tracking-[0.4em]"
                                        >
                                            {showAllContributions ? "Contraer Archivo" : `Expandir +${contributions.length - 8} Registros`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Gastos ──────────────────────────────────────────────── */}
                        {activeTab === 'gastos' && (
                            <div className="space-y-6">
                                <div className="tonal-card overflow-hidden border-l-4 border-l-red-400/20">
                                    <div className="px-6 py-5 border-b border-white/[0.03] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TrendingDown size={20} className="text-red-400/60" />
                                            <h3 className="serif-title font-bold text-xl text-text-main">Bitácora de Egresos</h3>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-400/10 text-red-400 px-3 py-1 rounded-full">{expenses.length} Salidas</span>
                                    </div>
                                    {expenses.length === 0 ? (
                                        <div className="py-24 text-center space-y-4 opacity-30">
                                            <ShoppingBag size={48} className="mx-auto" />
                                            <p className="text-xs font-bold uppercase tracking-[0.3em]">Cero egresos documentados</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/[0.02]">
                                            {displayedExpenses.map(e => (
                                                <ExpenseRow
                                                    key={e.id}
                                                    expense={e}
                                                    canDelete={isDirector}
                                                    onDelete={handleDeleteExpense}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {expenses.length > 8 && (
                                        <button
                                            onClick={() => setShowAllExpenses(v => !v)}
                                            className="w-full py-5 text-[10px] font-bold text-text-muted/60 hover:text-red-400 hover:bg-surface-high transition-all flex items-center justify-center gap-2 border-t border-white/[0.03] uppercase tracking-[0.4em]"
                                        >
                                            {showAllExpenses ? "Contraer Bitácora" : `Expandir +${expenses.length - 8} Salidas`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Deudas ──────────────────────────────────────────────── */}
                        {activeTab === 'deudas' && (
                            <div className="space-y-10">
                                {/* Insights de cumplimiento */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="tonal-card p-6 border-b-2 border-b-primary shadow-lg shadow-black/20">
                                        <p className="text-3xl font-bold serif-title text-text-main">{memberDebts.length}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mt-1">Censo Activo</p>
                                    </div>
                                    <div className="tonal-card p-6 border-b-2 border-b-red-400 shadow-lg shadow-black/20">
                                        <p className="text-3xl font-bold serif-title text-red-400">{debtCount}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mt-1">Con Compromiso</p>
                                    </div>
                                    <div className="tonal-card p-6 border-b-2 border-b-amber-400 shadow-lg shadow-black/20">
                                        <p className="text-3xl font-bold serif-title text-text-main">L {memberDebts.reduce((s, d) => s + d.debtAmount, 0).toFixed(0)}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mt-1">Monto Exigible</p>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    {/* Deudas primero */}
                                    {debtCount > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-[1px] flex-1 bg-white/[0.03]" />
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400/80 whitespace-nowrap">Altas de Morosidad</h4>
                                                <div className="h-[1px] flex-1 bg-white/[0.03]" />
                                            </div>
                                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                                                {(memberDebts || []).filter(d => !d.isUpToDate).map(d => (
                                                    <DebtCard key={d.memberName} debt={d} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Al día */}
                                    {memberDebts.some(d => d.isUpToDate) && (
                                        <div className="space-y-6 opacity-60">
                                            <div className="flex items-center gap-4">
                                                <div className="h-[1px] flex-1 bg-white/[0.03]" />
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-400/80 whitespace-nowrap">Saldos Conciliados</h4>
                                                <div className="h-[1px] flex-1 bg-white/[0.03]" />
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {(memberDebts || []).filter(d => d.isUpToDate).map(d => (
                                                    <DebtCard key={d.memberName} debt={d} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Empty State General */}
            {!loading && contributions.length === 0 && expenses.length === 0 && (
                <div className="text-center py-32 space-y-8 bg-surface-low/10 rounded-[4rem] border border-dashed border-white/5 mx-4">
                    <div className="relative mx-auto w-32 h-32">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl animate-pulse rounded-full" />
                        <div className="relative bg-surface-lowest w-32 h-32 rounded-full flex items-center justify-center text-text-muted/10 mx-auto shadow-inner border border-white/5">
                            <Wallet size={64} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="serif-title font-bold text-3xl text-text-main italic">Sin Actividad Registrada</h3>
                        <p className="text-text-muted text-xs max-w-[280px] mx-auto leading-relaxed">Inicie la gestión financiera registrando los primeros aportes o egresos operativos.</p>
                    </div>
                    {isDirector && (
                        <Link to="/finanzas/add" className="btn-primary h-14 px-8">
                            <Plus size={20} />
                            Iniciar Libro Contable
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
