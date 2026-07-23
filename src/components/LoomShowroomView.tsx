"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoomLotZoomCanvas from "./LoomLotZoomCanvas";

interface Lot {
  id: string;
  rawId: string;
  area: string;
  location: string;
  status: string;
  statusRaw: string;
  totalPrice: string;
  downPayment: string;
  financing: string;
  finalPayment: string;
}

interface LoomShowroomViewProps {
  selectedLot: Lot;
  stageId: string;
  onBack: () => void;
}

export default function LoomShowroomView({ selectedLot, stageId, onBack }: LoomShowroomViewProps) {
  // Active Villa Model ("luxury" | "garden")
  const [selectedVilla, setSelectedVilla] = useState<"luxury" | "garden">("luxury");
  
  // Active Content Sub-tab ("gallery" | "axonometric" | "plans" | "tour360")
  const [activeTab, setActiveTab] = useState<"gallery" | "axonometric" | "plans" | "tour360">("gallery");

  // Fullscreen Lightbox State
  const [activeLightboxImage, setActiveLightboxImage] = useState<{ src: string; title: string } | null>(null);

  // Villa 1: Luxury Residence Media
  const villa1Gallery: { title: string; src: string; category: string; isPlaceholder?: boolean }[] = [
    { title: "Fachada Principal - Luxury Residence", src: "/Render Villa 1 Fachada principal (1).jpg", category: "Exterior", isPlaceholder: false },
    { title: "Interior Living & Dining", src: "/Render Villa 1 Interior 1.jpg", category: "Interior", isPlaceholder: false },
    { title: "Fachada Posterior & Piscina Privada", src: "/Render Villa 1 Fachada Posterior.jpg", category: "Exterior", isPlaceholder: false },
  ];

  const villa1Plans = [
    { title: "Planta Arquitectónica - Nivel 1 (198.00 m²)", src: "/loom/placeholder_missing.svg", isPlaceholder: true, specs: "Acceso, Parqueadero, Espejo de Agua, Alcoba, Baño, Cocina, Sala, Deck, Piscina" },
    { title: "Planta Arquitectónica - Nivel 2 (76.04 m²)", src: "/loom/placeholder_missing.svg", isPlaceholder: true, specs: "Escalera Interna, Alcobas Secundarias, Baños Privados, Terraza" },
    { title: "Planta Arquitectónica - Nivel 3 (79.13 m²)", src: "/loom/placeholder_missing.svg", isPlaceholder: true, specs: "Habitación Master, Jacuzzi, Terraza Sunbed, Bar Exclusivo" },
  ];

  const villa1Axonometrics = [
    { title: "Axonometría 3D - Nivel 1 & Jardín Biofílico", src: "/loom/placeholder_missing.svg", isPlaceholder: true },
    { title: "Axonometría 3D - Nivel 2 & Terrazas Privadas", src: "/loom/placeholder_missing.svg", isPlaceholder: true },
    { title: "Axonometría 3D - Nivel 3 & Rooftop Lounge", src: "/loom/placeholder_missing.svg", isPlaceholder: true },
  ];

  // Villa 2: Garden Edition Media (Placeholders until assets are provided)
  const villa2Gallery = [
    { title: "Fachada Principal - Garden Edition", src: "/loom/placeholder_missing.svg", isPlaceholder: true, category: "Exterior" },
    { title: "Interior Salón Biofílico", src: "/loom/placeholder_missing.svg", isPlaceholder: true, category: "Interior" },
    { title: "Jardín Extendido & Terraza", src: "/loom/placeholder_missing.svg", isPlaceholder: true, category: "Exterior" },
  ];

  const currentGallery = selectedVilla === "luxury" ? villa1Gallery : villa2Gallery;
  const currentPlans = villa1Plans;
  const currentAxonometrics = villa1Axonometrics;

  return (
    <div className="relative w-full min-h-screen bg-[#051415] text-white flex flex-col overflow-x-hidden font-sans select-none">
      
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#051415] via-[#070c16] to-[#0b2426]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#dbaa67]/5 rounded-full blur-[140px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-4 bg-[#070c16]/80 backdrop-blur-xl border-b border-white/10 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-full text-xs font-bold text-[#dbaa67] uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a la Etapa</span>
          </button>
          
          <div className="hidden sm:block h-6 w-[1px] bg-white/15" />

          <div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#dbaa67] font-semibold block">Loom Luxury Residence</span>
            <h1 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
              Showroom Interactivo &bull; Lote <span className="text-[#dbaa67]">{selectedLot.rawId}</span>
            </h1>
          </div>
        </div>

        {/* Lot Specs Pill Header */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-white/70">
            <span>Área Lote:</span>
            <strong className="text-white font-semibold">{selectedLot.area} m²</strong>
          </div>
          <span className="px-3 py-1 bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-[10px] font-bold uppercase tracking-widest rounded-full">
            {selectedLot.statusRaw || "DISPONIBLE"}
          </span>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8 max-w-[3840px] mx-auto w-full">
        
        {/* Left Pane (7 cols on LG+): Villa Selector & Media Tabs */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Villa Model Selector Bar */}
          <div className="bg-[#070c16]/70 border border-white/10 rounded-2xl p-2 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#dbaa67] font-bold block mb-2 px-3 pt-1">
              Seleccionar Modelo de Villa
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedVilla("luxury")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  selectedVilla === "luxury"
                    ? "bg-[#dbaa67]/20 border-[#dbaa67] text-white shadow-lg shadow-[#dbaa67]/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Luxury Residence</span>
                <span className="text-[10px] text-[#dbaa67] mt-0.5 font-mono">353.17 m² &bull; 3 Niveles</span>
              </button>

              <button
                onClick={() => setSelectedVilla("garden")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  selectedVilla === "garden"
                    ? "bg-[#dbaa67]/20 border-[#dbaa67] text-white shadow-lg shadow-[#dbaa67]/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Garden Edition</span>
                <span className="text-[10px] text-[#dbaa67] mt-0.5 font-mono">274.04 m² &bull; Jardín Biofílico</span>
              </button>
            </div>
          </div>

          {/* Sub-content Tab Selector Bar */}
          <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar gap-2 pb-1">
            {[
              { id: "gallery", label: "Galería", icon: "🖼️" },
              { id: "axonometric", label: "Axonometrías", icon: "📐" },
              { id: "plans", label: "Plantas", icon: "📄" },
              { id: "tour360", label: "Tour 360°", icon: "🔄" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#dbaa67] text-[#070c16] shadow-lg"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-t border-x border-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-content Content Area */}
          <div className="flex-1 bg-[#070c16]/50 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md min-h-[350px]">
            <AnimatePresence mode="wait">
              {/* TAB 1: GALERÍA */}
              {activeTab === "gallery" && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                      Galería de Renders &bull; {selectedVilla === "luxury" ? "Luxury Residence" : "Garden Edition"}
                    </h3>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">
                      {currentGallery.length} Imágenes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentGallery.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveLightboxImage({ src: item.src, title: item.title })}
                        className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-[4/3] cursor-pointer hover:border-[#dbaa67] transition-all duration-300 shadow-md"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        {item.isPlaceholder && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#dbaa67]/90 text-black text-[9px] font-bold uppercase tracking-wider rounded">
                            FALTANTE
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-[9px] uppercase tracking-widest text-[#dbaa67] block font-mono">
                            {item.category}
                          </span>
                          <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: AXONOMETRÍAS */}
              {activeTab === "axonometric" && (
                <motion.div
                  key="axonometric"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                      Axonometrías 3D Isométricas
                    </h3>
                    <span className="text-[10px] text-[#dbaa67] uppercase tracking-widest font-semibold">
                      Diagramas de Distribución
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentAxonometrics.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveLightboxImage({ src: item.src, title: item.title })}
                        className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-[4/3] cursor-pointer hover:border-[#dbaa67] transition-all duration-300"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                        
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#dbaa67]/90 text-black text-[9px] font-bold uppercase tracking-wider rounded">
                          IMAGEN FALTANTE
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-xs font-semibold text-white">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PLANTAS ARQUITECTÓNICAS */}
              {activeTab === "plans" && (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                      Plantas Arquitectónicas por Nivel
                    </h3>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">
                      3 Niveles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentPlans.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveLightboxImage({ src: item.src, title: item.title })}
                        className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/40 p-4 cursor-pointer hover:border-[#dbaa67] transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-black/60 border border-white/5">
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#dbaa67]/90 text-black text-[9px] font-bold uppercase tracking-wider rounded">
                            PLANO FALTANTE
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-[10px] text-white/50 leading-relaxed uppercase tracking-wider line-clamp-2">
                            {item.specs}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: TOUR 360° */}
              {activeTab === "tour360" && (
                <motion.div
                  key="tour360"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Recorrido Virtual 360° Interactivo</span>
                      <span className="px-2 py-0.5 bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-[9px] font-mono rounded-full">EN VIVO</span>
                    </h3>
                    <a
                      href="https://360.buenaventura.com.pa/#/u/7295/lakeshore-Lote71/-/plans-3d/1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#dbaa67] hover:underline uppercase tracking-widest font-semibold flex items-center gap-1"
                    >
                      <span>Abrir en nueva pestaña</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/80 aspect-[16/10] sm:aspect-[16/9] min-h-[360px] shadow-2xl">
                    <iframe
                      src="https://360.buenaventura.com.pa/#/u/7295/lakeshore-Lote71/-/plans-3d/1"
                      title="Tour Virtual 360° Buenaventura / Loom"
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Pane (5 cols on LG+): Interactive Zoom Lot Canvas */}
        <section className="lg:col-span-5 flex flex-col min-h-[420px] lg:min-h-full">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#dbaa67] font-bold">
              Plano de Ubicación del Lote
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">
              Vista Cinemática Centrada
            </span>
          </div>

          <div className="flex-1 w-full h-full min-h-[400px]">
            <LoomLotZoomCanvas stageId={stageId} selectedLot={selectedLot} />
          </div>
        </section>

      </main>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6 select-none"
          >
            {/* Lightbox Header */}
            <div className="flex justify-between items-center z-10 max-w-7xl mx-auto w-full">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#dbaa67] font-bold">Showroom Visualizer</span>
                <h3 className="text-base font-serif font-bold text-white">{activeLightboxImage.title}</h3>
              </div>
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                title="Cerrar (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lightbox Image Container */}
            <div className="flex-1 flex justify-center items-center my-4 overflow-hidden">
              <img
                src={activeLightboxImage.src}
                alt={activeLightboxImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="text-center text-xs text-white/50 uppercase tracking-widest z-10 max-w-7xl mx-auto w-full border-t border-white/10 pt-4">
              Loom Luxury Residence &bull; Lote {selectedLot.rawId} ({selectedLot.area} m²)
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
