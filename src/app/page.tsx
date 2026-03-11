"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, MessageCircle, ChevronDown, Compass } from "lucide-react";
import { LOTS, PROJECT_INFO, ZONES, type LotStatus, type Lot } from "@/data/lots";
import Real3DViewer from "@/components/Real3DViewer";
import LotPanel from "@/components/LotPanel";
import StatsBar from "@/components/StatsBar";

const MacroOverview = ({ onSelectZone }: { onSelectZone: (zoneId: string) => void }) => {
  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center pt-8 pb-24">
        <h2 className="text-3xl font-serif text-[var(--color-accent-light)] mb-2 text-center">Plano Interactivo 3D</h2>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-12 text-center">Selecciona una etapa o zona para explorar</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto px-4 z-10 relative pb-20">
          {Object.values(ZONES).map((zone) => (
            <button
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className="group relative flex flex-col items-center justify-center p-8 bg-black/40 border border-white/5 hover:border-[var(--color-accent)]/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
              style={{ minHeight: "160px" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-accent)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <span className="relative z-10 text-lg font-serif text-[var(--color-accent-light)] mb-2 tracking-wide group-hover:scale-105 transition-transform">{zone.name}</span>
              <span className="relative z-10 text-[10px] text-[var(--color-accent)] uppercase tracking-widest px-3 py-1 bg-[var(--color-accent)]/10 rounded-full border border-[var(--color-accent)]/20">
                {zone.type === "residential" ? "Residencial" : zone.type === "amenity" ? "Amenidad" : "Área Común"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [filter, setFilter] = useState<LotStatus | "all">("all");
  const [heroVisible, setHeroVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"topdown" | "3d" | "topdown-villa1" | "3d-villa1" | "topdown-villa2" | "3d-villa2">("topdown");
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const zoneLots = useMemo(() => {
    if (!activeZone) return LOTS;
    return LOTS.filter((lot) => lot.zoneId === activeZone);
  }, [activeZone]);

  const filteredLots = useMemo(() => {
    if (filter === "all") return zoneLots;
    return zoneLots.filter((lot) => lot.status === filter);
  }, [filter, zoneLots]);

  const statsProps = useMemo(() => {
    if (!activeZone) {
      return {
        total: PROJECT_INFO.totalLots,
        sold: PROJECT_INFO.soldLots,
        available: 0,
        reserved: 0,
        viewType: "global" as const,
      };
    }
    const total = zoneLots.length;
    const available = zoneLots.filter((l) => l.status === "available").length;
    const reserved = zoneLots.filter((l) => l.status === "reserved").length;
    const sold = zoneLots.filter((l) => l.status === "sold").length;
    return { total, available, reserved, sold, viewType: "zonal" as const };
  }, [activeZone, zoneLots]);

  const handleSelectLot = (lot: Lot) => {
    setSelectedLot(prev => prev?.id === lot.id ? null : lot);
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex flex-col font-sans">

      {/* ─────────────────────── HERO SECTION ─────────────────────── */}
      <AnimatePresence>
        {heroVisible && (
          <motion.section
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-top scale-110"
                style={{ filter: "brightness(0.45) saturate(1.2)" }}
              >
                <source src="/LUWANA LOOP.mp4" type="video/mp4" />
              </video>
              {/* Multi-layer gradient overlay */}
              <div className="absolute inset-0 hero-gradient" />
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 70%)" }} />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-4xl">
              {/* Location badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 mb-8 text-xs tracking-widest uppercase text-[var(--color-accent)]"
              >
                <MapPin size={12} />
                <span>Zona Norte, Cartagena de Indias</span>
              </motion.div>

              {/* Main title Logo */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mb-6"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/LOGO LUWANA BLANCO01.png" 
                  alt="Luwana Alma Beach" 
                  className="h-28 md:h-40 object-contain drop-shadow-2xl" 
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-sm md:text-base text-white/60 max-w-lg mx-auto mb-12 font-light leading-relaxed tracking-wide"
              >
                Un santuario de exclusividad en la Zona Norte de Cartagena. Villas de lujo frente al Mar Caribe,
                diseñadas para vivir o invertir con el más alto estándar.
              </motion.p>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center gap-12 mb-14 flex-wrap"
              >
                {[
                  { label: "Villas Totales", value: PROJECT_INFO.totalLots },
                  { label: "Disponibles", value: PROJECT_INFO.availableLots },
                  { label: "Inversión Desde", value: `$${(PROJECT_INFO.minPrice / 1000).toFixed(0)}K` },
                ].map((s) => (
                  <div key={s.label} className="text-center group relative cursor-default">
                    <p className="text-3xl font-serif text-[var(--color-accent-light)] transition-colors">{s.value}</p>
                    <p className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest mt-2">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button
                  onClick={() => setHeroVisible(false)}
                  className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[var(--color-accent)] text-black font-semibold text-xs tracking-widest uppercase transition-all hover:bg-[var(--color-accent-light)] hover:scale-[1.02] active:scale-95 border border-[var(--color-accent-light)]"
                  style={{ boxShadow: "0 4px 20px rgba(212, 175, 55, 0.2)" }}
                >
                  <Compass size={16} />
                  Ingresar al Showroom
                </button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─────────────────────── MASTERPLAN SECTION ─────────────────────── */}
      <AnimatePresence>
        {!heroVisible && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col flex-1 min-h-screen"
          >
            {/* Top nav bar */}
            <div className="glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b-0 border-white/5">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => { setSelectedLot(null); setHeroVisible(true); }}
                  className="text-white/40 hover:text-[var(--color-accent)] text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2"
                >
                  <span>⟵</span> Inicio
                </button>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/LUWANA LETRAS.png" alt="Luwana" className="h-4 object-contain mb-1" />
                  <p className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest mt-0.5">Showroom Exclusivo · Zona Norte</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] uppercase tracking-widest border border-white/20 text-white/80 hover:text-black hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all">
                  Contactar
                </button>
                <button
                  className="flex items-center gap-2 px-6 py-2.5 text-[10px] uppercase tracking-widest border border-[#25D366] bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Stats + filter bar */}
            <div className="px-6 py-4 glass border-b border-white/5 relative z-30">
              <StatsBar
                {...statsProps}
                activeFilter={filter}
                onFilterChange={setFilter}
              />
            </div>

            {/* 3D Model Viewer + side panel */}
            <div className="flex flex-1 relative w-full overflow-hidden" style={{ minHeight: "calc(100vh - 160px)" }}>
              {/* Tier 1 / Tier 2 Routing */}
              {!activeZone ? (
                <MacroOverview onSelectZone={setActiveZone} />
              ) : (
                <div className="relative flex-1 overflow-hidden bg-[var(--color-bg)] flex flex-col">
                  {/* Back button */}
                  <div className="absolute top-6 left-6 z-20">
                    <button 
                       onClick={() => { setActiveZone(null); setSelectedLot(null); setFilter("all"); }}
                       className="px-5 py-2.5 glass border border-white/10 text-[10px] uppercase tracking-widest text-white/60 hover:text-[var(--color-accent-light)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/10 transition-all flex items-center gap-2 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl"
                    >
                       <span className="text-sm font-light">⟵</span> Volver a Vista General
                    </button>
                  </div>
                  <Real3DViewer
                    lots={filteredLots}
                    selectedLot={selectedLot}
                    onSelectLot={handleSelectLot}
                    viewMode={viewMode}
                    activeZone={ZONES[activeZone]}
                  />
                </div>
              )}

              {/* Lot detail panel — slides in from right */}
              <div 
                className={`relative transition-all duration-350 ease-in-out overflow-hidden ${selectedLot ? "w-full md:w-1/2" : "w-0"}`} 
              >
                <LotPanel 
                  lot={selectedLot} 
                  onClose={() => {
                    setSelectedLot(null);
                    setViewMode("topdown"); // Reset view when closing panel
                  }} 
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!heroVisible && (
          <motion.a
            href="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ delay: 1, type: "spring" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 0 25px rgba(37,211,102,0.45)" }}
            title="Hablar por WhatsApp"
          >
            <MessageCircle size={26} className="text-white" />
          </motion.a>
        )}
      </AnimatePresence>
    </main>
  );
}
