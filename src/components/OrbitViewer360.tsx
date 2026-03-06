"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Layers } from "lucide-react";
import type { Lot } from "@/data/lots";
import MasterplanMap from "@/components/MasterplanMap";

// 4 orbit views with real renders from 0°, 90°, 180°, 270°
const VIEWS = [
    { angle: 0, src: "/house_000.png", label: "Vista Frontal", isTopDown: false },
    { angle: 90, src: "/house_090.png", label: "Perfil Derecha", isTopDown: false },
    { angle: 180, src: "/house_180.png", label: "Vista Trasera", isTopDown: false },
    { angle: 270, src: "/house_270.png", label: "Perfil Izquierda", isTopDown: false },
] as const;

type ViewIndex = 0 | 1 | 2 | 3;

// Hotspots visible on 3D views
const HOTSPOTS = [
    { id: "pool", label: "Piscina Privada", x: "44%", y: "60%", icon: "🏊" },
    { id: "beach", label: "Club de Playa", x: "16%", y: "45%", icon: "🏖️" },
    { id: "dock", label: "Muelle Privado", x: "58%", y: "72%", icon: "⚓" },
    { id: "garden", label: "Jardines Tropicales", x: "30%", y: "65%", icon: "🌴" },
];

interface OrbitViewer360Props {
    lots: Lot[];
    selectedLot: Lot | null;
    onSelectLot: (lot: Lot) => void;
}

export default function OrbitViewer360({ lots, selectedLot, onSelectLot }: OrbitViewer360Props) {
    const [currentIndex, setCurrentIndex] = useState<ViewIndex>(0);
    const [prevIndex, setPrevIndex] = useState<ViewIndex | null>(null);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isAutoRotating, setIsAutoRotating] = useState(false);
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef<number>(0);
    const autoRotateTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentView = VIEWS[currentIndex];

    // Preload all images once on mount for instant transitions
    useEffect(() => {
        VIEWS.forEach((v) => {
            const img = new Image();
            img.src = v.src;
        });
    }, []);

    const goTo = useCallback(
        (newIndex: number, dir: 1 | -1) => {
            if (isTransitioning) return;
            const next = ((newIndex + VIEWS.length) % VIEWS.length) as ViewIndex;
            if (next === currentIndex) return;

            setDirection(dir);
            setPrevIndex(currentIndex);
            setIsTransitioning(true);
            setCurrentIndex(next);
            setActiveHotspot(null);

            // Clear prev after crossfade completes
            if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
            transitionTimeout.current = setTimeout(() => {
                setPrevIndex(null);
                setIsTransitioning(false);
            }, 700); // matches transition duration
        },
        [currentIndex, isTransitioning]
    );

    const prev = useCallback(() => goTo(currentIndex - 1, -1), [currentIndex, goTo]);
    const next = useCallback(() => goTo(currentIndex + 1, 1), [currentIndex, goTo]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [prev, next]);

    // Auto-rotate
    useEffect(() => {
        if (isAutoRotating) {
            autoRotateTimer.current = setInterval(() => next(), 3500);
        } else {
            if (autoRotateTimer.current) clearInterval(autoRotateTimer.current);
        }
        return () => { if (autoRotateTimer.current) clearInterval(autoRotateTimer.current); };
    }, [isAutoRotating, next]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
        };
    }, []);

    // Drag/swipe support
    const handleMouseDown = (e: React.MouseEvent) => {
        dragStartX.current = e.clientX;
        setIsDragging(true);
    };
    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        const dx = e.clientX - dragStartX.current;
        if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    };
    const handleTouchStart = (e: React.TouchEvent) => { dragStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - dragStartX.current;
        if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    };

    // Compute parallax direction offset for entering image (very subtle)
    // Going clockwise (dir=1): new image slides from a tiny right offset inward
    // Going counter-clockwise (dir=-1): from a tiny left offset
    const enterX = direction > 0 ? "1.5%" : "-1.5%";

    return (
        <div
            className="relative w-full h-full select-none overflow-hidden bg-[#030810]"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* ── IMAGE LAYER — stacked dissolve ── */}
            <div className="absolute inset-0">

                {/* OUTGOING image (prev) — fades out */}
                {prevIndex !== null && (
                    <motion.div
                        key={`prev-${prevIndex}`}
                        className="absolute inset-0"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.015 }}
                        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={VIEWS[prevIndex].src}
                            alt={VIEWS[prevIndex].label}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                        {/* Subtle vignette */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,8,16,0.4) 100%)" }}
                        />
                    </motion.div>
                )}

                {/* INCOMING image (current) — fades in with micro parallax */}
                <motion.div
                    key={`curr-${currentIndex}`}
                    className="absolute inset-0"
                    initial={{ opacity: 0, x: enterX, scale: 1.01 }}
                    animate={{ opacity: 1, x: "0%", scale: 1 }}
                    transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={currentView.src}
                        alt={currentView.label}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                    {/* Subtle vignette */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,8,16,0.4) 100%)" }}
                    />
                </motion.div>
            </div>

            {/* ── LOT SVG OVERLAY — only on top-down views ── */}
            <AnimatePresence>
                {currentView.isTopDown && (
                    <motion.div
                        key="lot-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 pointer-events-auto"
                    >
                        <MasterplanMap lots={lots} selectedLot={selectedLot} onSelectLot={onSelectLot} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 3D HOTSPOTS — always visible on angled views ── */}
            <AnimatePresence>
                {!currentView.isTopDown && !isTransitioning && (
                    <motion.div
                        key="hotspots"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, delay: 0.4 }}
                        className="absolute inset-0 pointer-events-auto"
                    >
                        {HOTSPOTS.map((h) => (
                            <div
                                key={h.id}
                                className="absolute"
                                style={{ left: h.x, top: h.y, transform: "translate(-50%, -50%)" }}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveHotspot(p => p === h.id ? null : h.id); }}
                                    className="relative group flex flex-col items-center"
                                >
                                    {/* Pulsing ring */}
                                    <span className="absolute inline-flex w-10 h-10 rounded-full opacity-40 animate-ping"
                                        style={{ background: "rgba(14,165,233,0.5)" }} />
                                    {/* Icon button */}
                                    <span className="relative z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-lg shadow-lg"
                                        style={{ border: "1.5px solid rgba(14,165,233,0.6)", boxShadow: "0 0 14px rgba(14,165,233,0.35)" }}>
                                        {h.icon}
                                    </span>

                                    {/* Tooltip */}
                                    <AnimatePresence>
                                        {activeHotspot === h.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                                                className="absolute bottom-full mb-2 glass rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap z-20"
                                                style={{ border: "1px solid rgba(14,165,233,0.3)" }}
                                            >
                                                <p className="font-bold">{h.icon} {h.label}</p>
                                                <p className="text-white/50 mt-0.5">Amenidad del proyecto</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 3D VIEW badge ── */}
            <AnimatePresence>
                {!currentView.isTopDown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs flex items-center gap-2 pointer-events-none z-20"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                        <span className="text-sky-400">🌐</span>
                        Vista 3D — arrastra para girar
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── TOP-DOWN indicator badge ── */}
            <AnimatePresence>
                {currentView.isTopDown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs text-white/60 flex items-center gap-2 pointer-events-none z-20"
                    >
                        <Layers size={12} className="text-sky-400" />
                        Plano Interactivo — haz click en un lote
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── LEFT ARROW ── */}
            <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 group"
                aria-label="Vista anterior"
                disabled={isTransitioning}
            >
                <motion.div
                    whileHover={{ scale: 1.12, x: -3 }}
                    whileTap={{ scale: 0.93 }}
                    className="w-14 h-14 rounded-full glass flex items-center justify-center transition-all"
                    style={{
                        border: "1.5px solid rgba(255,255,255,0.18)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}
                >
                    <ChevronLeft size={26} className="text-white group-hover:text-sky-300 transition-colors" />
                </motion.div>
                <p className="text-center text-[10px] text-white/30 mt-1 group-hover:text-white/60 transition-colors">Prev</p>
            </button>

            {/* ── RIGHT ARROW ── */}
            <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 group"
                aria-label="Vista siguiente"
                disabled={isTransitioning}
            >
                <motion.div
                    whileHover={{ scale: 1.12, x: 3 }}
                    whileTap={{ scale: 0.93 }}
                    className="w-14 h-14 rounded-full glass flex items-center justify-center transition-all"
                    style={{
                        border: "1.5px solid rgba(255,255,255,0.18)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}
                >
                    <ChevronRight size={26} className="text-white group-hover:text-sky-300 transition-colors" />
                </motion.div>
                <p className="text-center text-[10px] text-white/30 mt-1 group-hover:text-white/60 transition-colors">Next</p>
            </button>

            {/* ── COMPASS / ORBIT INDICATOR ── */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                {/* Dot step indicators */}
                <div className="flex items-center gap-2">
                    {VIEWS.map((v, i) => (
                        <button
                            key={v.angle}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isTransitioning) goTo(i, i > currentIndex ? 1 : -1);
                            }}
                            className="transition-all"
                            style={{
                                width: i === currentIndex ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: i === currentIndex
                                    ? "linear-gradient(90deg, #0ea5e9, #38bdf8)"
                                    : "rgba(255,255,255,0.25)",
                                boxShadow: i === currentIndex ? "0 0 8px rgba(14,165,233,0.6)" : "none",
                                transition: "all 0.3s ease",
                            }}
                            aria-label={v.label}
                        />
                    ))}
                </div>

                {/* Compass arc */}
                <div className="glass rounded-full px-4 py-1.5 flex items-center gap-3 text-xs">
                    {/* Animated compass needle */}
                    <div className="relative w-5 h-5">
                        <svg viewBox="0 0 20 20" className="w-5 h-5">
                            <circle cx="10" cy="10" r="9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                            <motion.line
                                x1="10" y1="10" x2="10" y2="3"
                                stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"
                                animate={{ rotate: currentView.angle }}
                                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                style={{ transformOrigin: "10px 10px" }}
                            />
                            <circle cx="10" cy="10" r="2" fill="#0ea5e9" />
                        </svg>
                    </div>
                    <motion.span
                        key={currentIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="text-white/70 font-medium"
                    >
                        {currentView.angle}° · {currentView.label}
                    </motion.span>
                </div>
            </div>

            {/* ── AUTO-ROTATE TOGGLE ── */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsAutoRotating(p => !p); }}
                className="absolute bottom-16 right-4 z-30 w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:bg-white/10"
                style={{ border: isAutoRotating ? "1.5px solid rgba(14,165,233,0.6)" : "1px solid rgba(255,255,255,0.1)" }}
                title={isAutoRotating ? "Pausar rotación" : "Auto-rotar"}
            >
                {isAutoRotating
                    ? <Pause size={14} className="text-sky-400" />
                    : <Play size={14} className="text-white/50" />
                }
            </button>

            {/* ── LEGEND (only on top-down views) ── */}
            <AnimatePresence>
                {currentView.isTopDown && (
                    <motion.div
                        key="legend"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute bottom-4 left-4 glass rounded-xl p-3 flex flex-col gap-2 text-xs z-10"
                    >
                        <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Leyenda</p>
                        {([
                            { label: "Disponible", color: "#22c55e" },
                            { label: "Reservado", color: "#f59e0b" },
                            { label: "Vendido", color: "#ef4444" },
                        ]).map(s => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                                <span className="text-white/70">{s.label}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ROTATION HINT ── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/20 pointer-events-none z-10">
                ← → para navegar · arrastra para girar
            </div>
        </div>
    );
}
