import { useLiveSession } from '../contexts/LiveSessionContext';
import { useSongs } from '../contexts/SongsContext';
import { Link } from 'react-router-dom';
import { Radio, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Persistent banner shown when the director sets an active song.
 * Optimized for mobile visibility — always fully visible, no hidden elements.
 */
export function NowPlayingBar() {
    const { liveState, clearActiveSong, isDirector } = useLiveSession();
    const { songs } = useSongs();

    const activeSong = liveState.activeSongId
        ? songs.find(s => s.id === liveState.activeSongId)
        : null;

    if (!activeSong) return null;

    return (
        <AnimatePresence>
            <motion.div
                key={liveState.activeSongId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <Link
                    to={`/songs/${activeSong.id}`}
                    className="block bg-gradient-to-r from-primary via-purple-600 to-secondary px-4 py-3"
                >
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: pulsing dot + label + song name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Pulsing radio icon */}
                            <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                <span className="absolute inline-flex h-5 w-5 rounded-full bg-white/40 animate-ping" />
                                <Radio size={14} className="relative text-white" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest leading-tight">
                                    EN VIVO AHORA
                                </p>
                                <p className="text-white font-black text-base md:text-lg leading-tight truncate">
                                    {activeSong.title}
                                </p>
                                {activeSong.artist && (
                                    <p className="text-white/60 text-xs leading-tight truncate">
                                        {activeSong.artist}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right: tap to view hint + close for director */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] font-bold text-white/90 bg-white/20 px-3 py-1.5 rounded-full">
                                Tocar →
                            </span>
                            {isDirector && (
                                <button
                                    onClick={(e) => { e.preventDefault(); clearActiveSong(); }}
                                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white"
                                    title="Terminar canción en vivo"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}

