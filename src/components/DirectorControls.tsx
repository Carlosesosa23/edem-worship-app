import { useState } from 'react';
import { useLiveSession, SIGNALS } from '../contexts/LiveSessionContext';
import { X, Mic2, Activity, RadioTower } from 'lucide-react';
import { cn } from '../lib/utils';

export function DirectorControls() {
    const { isDirector, sendSignal, clearSignal, liveState } = useLiveSession();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isDirector) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="fixed bottom-24 right-4 z-50 bg-accent text-white p-5 rounded-full shadow-xl shadow-accent/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                title="Controles de Director"
            >
                {isExpanded ? <X size={32} /> : <Activity size={32} />}
            </button>

            {/* Controls Panel — fullscreen overlay on mobile */}
            <div className={cn(
                "fixed inset-x-0 bottom-0 z-40 bg-surface/99 backdrop-blur-xl border-t border-white/10 shadow-2xl transition-all duration-300",
                "md:inset-x-auto md:bottom-36 md:right-4 md:w-[460px] md:rounded-2xl md:border md:border-white/10",
                isExpanded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
            )}>
                <div className="p-6 pb-32 md:pb-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h3 className="font-bold text-white text-xl flex items-center gap-3">
                            <RadioTower size={22} className="text-accent" />
                            Modo Director
                        </h3>
                        <button
                            onClick={clearSignal}
                            className="text-sm text-text-muted hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-white/10"
                        >
                            Limpiar señal
                        </button>
                    </div>

                    {/* Signal Buttons Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {SIGNALS.map((signal) => (
                            <button
                                key={signal.label}
                                onClick={() => sendSignal(signal.label)}
                                className={cn(
                                    "py-5 px-4 rounded-2xl text-base font-bold text-white transition-all active:scale-95 shadow-md leading-tight",
                                    signal.color,
                                    liveState.currentSignal === signal.label
                                        ? "ring-4 ring-white/60 scale-105 shadow-xl"
                                        : "opacity-80 hover:opacity-100 hover:scale-[1.03]"
                                )}
                            >
                                {signal.label}
                            </button>
                        ))}
                    </div>

                    {/* Active Signal Indicator */}
                    {liveState.currentSignal && (
                        <div className="mt-5 flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-4 border border-white/10">
                            <Mic2 size={18} className="text-accent shrink-0" />
                            <p className="text-base text-white font-semibold truncate">
                                {liveState.currentSignal}
                            </p>
                            <span className="ml-auto text-xs text-accent font-bold uppercase tracking-widest shrink-0">
                                EN VIVO
                            </span>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-text-muted">
                            Señales visibles para todo el equipo
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
