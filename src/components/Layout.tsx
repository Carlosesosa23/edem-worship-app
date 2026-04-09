import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Music, Disc, CalendarDays, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { LiveBanner } from './LiveBanner';
import { DirectorControls } from './DirectorControls';
import { NowPlayingBar } from './NowPlayingBar';

export function Layout() {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Music, label: 'Canciones', path: '/songs' },
        { icon: Disc, label: 'Mixes', path: '/mixes' },
        { icon: CalendarDays, label: 'Agenda', path: '/agenda' },
        { icon: Wallet, label: 'Finanzas', path: '/finanzas' },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-background text-text-main font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 glass-panel m-4 overflow-hidden pointer-events-auto">
                <div className="p-8 pb-4 flex flex-col items-start gap-4">
                    <img src="/logo.png" alt="Edem Logo" className="w-12 h-12 object-contain" />
                    <div className="space-y-0.5">
                        <h1 className="text-2xl serif-title font-bold text-primary tracking-tight">
                            EDEM
                        </h1>
                        <p className="text-[10px] tracking-[0.2em] font-semibold text-text-muted uppercase">
                            Worship Academy
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || 
                                       (item.path !== '/' && location.pathname.startsWith(item.path));
                        
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                                    isActive
                                        ? "text-primary bg-primary/5"
                                        : "text-text-muted hover:text-text-main hover:bg-white/[0.03]"
                                )}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={clsx(
                                    "font-medium transition-transform duration-300",
                                    isActive ? "translate-x-1" : "group-hover:translate-x-1"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="nav-pill"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                    />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-surface-low rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold serif-title" style={{ fontFamily: 'var(--font-serif)' }}>
                            EW
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-text-muted font-medium truncate">Edem Worship v1.2</p>
                            <p className="text-[9px] text-primary/60 font-semibold tracking-wider">PREMIUM EDITION</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 glass-panel z-50 px-2">
                <div className="flex justify-around items-center h-full">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || 
                                       (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center justify-center h-12 px-3 rounded-xl transition-all relative",
                                    isActive ? "text-primary" : "text-text-muted hover:text-text-main"
                                )}
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="relative z-10"
                                >
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </motion.div>
                                <span className="text-[9px] font-bold mt-1 tracking-wider uppercase z-10">{item.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="mobile-nav-pill"
                                        className="absolute inset-0 bg-primary/10 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth p-4 md:p-10 pb-24 md:pb-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <NowPlayingBar />
                    <Outlet />
                </div>
            </main>

            {/* Live Session Overlays */}
            <LiveBanner />
            <DirectorControls />
        </div>
    );
}
