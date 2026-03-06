"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, MessageCircle, ChevronDown, Compass } from "lucide-react";
import { LOTS, PROJECT_INFO, type LotStatus, type Lot } from "@/data/lots";
import Real3DViewer from "@/components/Real3DViewer";
import LotPanel from "@/components/LotPanel";
import StatsBar from "@/components/StatsBar";

export default function Home() {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [filter, setFilter] = useState<LotStatus | "all">("all");
  const [heroVisible, setHeroVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"topdown" | "3d" | "topdown-villa1" | "3d-villa1" | "topdown-villa2" | "3d-villa2">("topdown");

  const filteredLots = useMemo(() =>
    filter === "all" ? LOTS : LOTS.filter(l => l.status === filter),
    [filter]
  );

  const handleSelectLot = (lot: Lot) => {
    setSelectedLot(prev => prev?.id === lot.id ? null : lot);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans">

      {/* ─────────────────────── HERO SECTION ─────────────────────── */}
      <AnimatePresence>
        {heroVisible && (
          <motion.section
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background image with parallax feel */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Vista Áerea.jpg"
                alt="Luwana Alma Beach"
                className="w-full h-full object-cover scale-110"
                style={{ filter: "brightness(0.45) saturate(1.2)" }}
              />
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
                className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 mb-8 text-xs tracking-widest uppercase text-[#D4AF37]"
              >
                <MapPin size={12} />
                <span>Zona Norte, Cartagena de Indias</span>
              </motion.div>

              {/* Main title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-6xl md:text-8xl font-serif text-white leading-none mb-6 tracking-tight"
              >
                Luwana <br className="md:hidden" />
                <span className="text-[#D4AF37] italic">Alma Beach</span>
              </motion.h1>

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
                    <p className="text-3xl font-serif text-[#F8F8F8] transition-colors">{s.value}</p>
                    <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest mt-2">{s.label}</p>
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
                  className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#D4AF37] text-black font-semibold text-xs tracking-widest uppercase transition-all hover:bg-[#F2D588] hover:scale-[1.02] active:scale-95 border border-[#F2D588]"
                  style={{ boxShadow: "0 4px 20px rgba(212, 175, 55, 0.2)" }}
                >
                  <Compass size={16} />
                  Ingresar al Showroom
                </button>
                <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 glass text-[#F8F8F8] font-semibold text-xs tracking-widest uppercase transition-all hover:bg-white/5 border border-white/20 hover:border-[#D4AF37]">
                  <MessageCircle size={16} className="text-[#D4AF37]" />
                  Contactar Asesor
                </button>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/40 text-[10px] tracking-widest uppercase cursor-pointer hover:text-[#D4AF37] transition-colors"
              onClick={() => setHeroVisible(false)}
            >
              <span>Explorar Proyecto</span>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                <ChevronDown size={16} strokeWidth={1} />
              </motion.div>
            </motion.div>
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
                  className="text-white/40 hover:text-[#D4AF37] text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2"
                >
                  <span>⟵</span> Inicio
                </button>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <h1 className="text-base font-serif text-white tracking-wide">Luwana Alma Beach</h1>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest mt-0.5">Showroom Exclusivo · Zona Norte</p>
                </div>

                {/* View Mode Toggle */}
                <div className="ml-8 flex items-center bg-transparent border border-white/10 p-1 overflow-x-auto max-w-[600px] no-scrollbar">
                  <button
                    onClick={() => setViewMode("topdown")}
                    className={`px-4 py-2 whitespace-nowrap text-[10px] tracking-widest uppercase transition-all ${viewMode === "topdown" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/50 hover:text-white"}`}
                  >
                    Plano Master
                  </button>
                  <button
                    onClick={() => setViewMode("3d")}
                    className={`px-4 py-2 whitespace-nowrap text-[10px] tracking-widest uppercase transition-all ${viewMode === "3d" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/50 hover:text-white"}`}
                  >
                    Modelo 3D Luwana
                  </button>
                  <button
                    onClick={() => setViewMode("topdown-villa1")}
                    className={`px-4 py-2 whitespace-nowrap text-[10px] tracking-widest uppercase transition-all ${viewMode === "topdown-villa1" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/50 hover:text-white"}`}
                  >
                    Plano Villa 1
                  </button>
                  <button
                    onClick={() => setViewMode("3d-villa1")}
                    className={`px-4 py-2 whitespace-nowrap text-[10px] tracking-widest uppercase transition-all ${viewMode === "3d-villa1" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/50 hover:text-white"}`}
                  >
                    Modelo 3D Villa 1
                  </button>
                  <button
                    onClick={() => setViewMode("topdown-villa2")}
                    className={`px-4 py-2 whitespace-nowrap text-[10px] tracking-widest uppercase transition-all ${viewMode === "topdown-villa2" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/50 hover:text-white"}`}
                  >
                    Plano Villa 2
                  </button>
                  <button
                    onClick={() => setViewMode("3d-villa2")}
                    className={`px-4 py-2 whitespace-nowrap text-[10px] tracking-widest uppercase transition-all ${viewMode === "3d-villa2" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/50 hover:text-white"}`}
                  >
                    Modelo 3D Villa 2
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] uppercase tracking-widest border border-white/20 text-white/80 hover:text-black hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all">
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
            <div className="px-6 py-4 glass border-b border-white/5">
              <StatsBar
                total={PROJECT_INFO.totalLots}
                available={PROJECT_INFO.availableLots}
                reserved={PROJECT_INFO.reservedLots}
                sold={PROJECT_INFO.soldLots}
                activeFilter={filter}
                onFilterChange={setFilter}
              />
            </div>

            {/* 3D Model Viewer + side panel */}
            <div className="flex flex-1 overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>
              {/* Real3DViewer — handles both topdown 2D map and fully interactive 3D model */}
              <div className="relative flex-1 overflow-hidden bg-[#030810]">
                <Real3DViewer
                  lots={filteredLots}
                  selectedLot={selectedLot}
                  onSelectLot={handleSelectLot}
                  viewMode={viewMode}
                />
              </div>

              {/* Lot detail panel — slides in from right */}
              <div className="relative" style={{ width: selectedLot ? 360 : 0, transition: "width 0.35s ease", overflow: "hidden" }}>
                <LotPanel lot={selectedLot} onClose={() => setSelectedLot(null)} />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp button (always visible) */}
      <motion.a
        href="https://wa.me/573001234567"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 0 25px rgba(37,211,102,0.45)" }}
        title="Hablar por WhatsApp"
      >
        <MessageCircle size={26} className="text-white" />
      </motion.a>
    </main>
  );
}
