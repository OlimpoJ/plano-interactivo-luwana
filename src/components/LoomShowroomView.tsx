"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Fullscreen Lightbox Index State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Villa 1: Luxury Residence Media
  const villa1Gallery = [
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

  // Obtenemos la lista activa según la pestaña seleccionada
  const getActiveMediaList = useCallback(() => {
    if (activeTab === "gallery") return currentGallery;
    if (activeTab === "axonometric") return currentAxonometrics;
    if (activeTab === "plans") return currentPlans;
    return [];
  }, [activeTab, currentGallery, currentAxonometrics, currentPlans]);

  const activeMediaList = getActiveMediaList();

  const handlePrevImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || activeMediaList.length === 0) return null;
      return (prev - 1 + activeMediaList.length) % activeMediaList.length;
    });
  }, [activeMediaList.length]);

  const handleNextImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || activeMediaList.length === 0) return null;
      return (prev + 1) % activeMediaList.length;
    });
  }, [activeMediaList.length]);

  // Teclado: Flecha Izquierda, Flecha Derecha y Escape
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrevImage, handleNextImage]);

  const activeMedia = lightboxIndex !== null && activeMediaList[lightboxIndex] ? activeMediaList[lightboxIndex] : null;

  return (
    <div className="relative w-full min-h-screen bg-[#EDE7E0] text-[#0A0D0B] flex flex-col overflow-x-hidden font-sans select-none">
      
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EDE7E0] via-[#F5F1EC] to-[#EDE7E0]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B35F27]/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-4 bg-[#EDE7E0]/90 backdrop-blur-xl border-b border-[#0A0D0B]/10 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#B35F27] hover:bg-[#964d1d] active:scale-95 border border-[#B35F27] rounded-full text-xs font-bold text-[#EDE7E0] uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a la Etapa</span>
          </button>
          
          <div className="hidden sm:block h-6 w-[1px] bg-[#0A0D0B]/15" />

          <div>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#B35F27] font-semibold block font-sans">Loom Luxury Residence</span>
            <h1 className="text-sm sm:text-base font-serif font-bold text-[#0A0D0B] tracking-wide">
              Showroom Interactivo &bull; Lote <span className="text-[#B35F27]">{selectedLot.rawId}</span>
            </h1>
          </div>
        </div>

        {/* Lot Specs Pill Header */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3.5 py-1.5 bg-white/70 border border-[#0A0D0B]/10 rounded-full flex items-center gap-2 text-[#0A0D0B]/80 shadow-sm">
            <span>Área Lote:</span>
            <strong className="text-[#0A0D0B] font-semibold">{selectedLot.area} m²</strong>
          </div>
          <span className="px-3 py-1 bg-[#699385]/20 border border-[#699385]/40 text-[#699385] text-[10px] font-bold uppercase tracking-widest rounded-full">
            {selectedLot.statusRaw || "DISPONIBLE"}
          </span>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8 max-w-[3840px] mx-auto w-full">
        
        {/* Left Pane (7 cols on LG+): Villa Selector & Media Tabs */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Villa Model Selector Bar */}
          <div className="bg-white/80 border border-[#0A0D0B]/10 rounded-2xl p-2 backdrop-blur-md shadow-sm">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B35F27] font-bold block mb-2 px-3 pt-1">
              Seleccionar Modelo de Villa
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedVilla("luxury")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  selectedVilla === "luxury"
                    ? "bg-[#B35F27] border-[#B35F27] text-[#EDE7E0] shadow-lg shadow-[#B35F27]/20"
                    : "bg-[#EDE7E0]/60 border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                <span className="text-xs font-serif font-bold uppercase tracking-wider">Luxury Residence</span>
                <span className="text-[10px] mt-0.5 font-mono opacity-90">353.17 m² &bull; 3 Niveles</span>
              </button>

              <button
                onClick={() => setSelectedVilla("garden")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  selectedVilla === "garden"
                    ? "bg-[#B35F27] border-[#B35F27] text-[#EDE7E0] shadow-lg shadow-[#B35F27]/20"
                    : "bg-[#EDE7E0]/60 border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                <span className="text-xs font-serif font-bold uppercase tracking-wider">Garden Edition</span>
                <span className="text-[10px] mt-0.5 font-mono opacity-90">274.04 m² &bull; Jardín Biofílico</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex flex-wrap gap-2 border-b border-[#0A0D0B]/10 pb-3">
            {[
              { id: "gallery", label: "1. Galería de Fotos" },
              { id: "axonometric", label: "2. Axonometrías 3D" },
              { id: "plans", label: "3. Plantas Arquitectónicas" },
              { id: "tour360", label: "4. Recorrido 360°" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#B35F27] text-[#EDE7E0] shadow-lg shadow-[#B35F27]/30"
                    : "bg-white/70 border border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Panel Viewer */}
          <div className="flex-1 min-h-[380px]">
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
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider">
                      Galería Fotográfica Renders HD &bull; {selectedVilla === "luxury" ? "Luxury Residence" : "Garden Edition"}
                    </h3>
                    <span className="text-[10px] text-[#B35F27] uppercase tracking-widest font-semibold">
                      {currentGallery.length} Renderings
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentGallery.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-xl overflow-hidden border border-[#0A0D0B]/10 bg-white/60 aspect-[4/3] cursor-pointer hover:border-[#B35F27] transition-all duration-300 shadow-sm"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        {item.isPlaceholder && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#B35F27] text-[#EDE7E0] text-[9px] font-bold uppercase tracking-wider rounded">
                            FALTANTE
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-[9px] uppercase tracking-widest text-[#EBD9AB] block font-mono">
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
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider">
                      Axonometrías 3D Isométricas
                    </h3>
                    <span className="text-[10px] text-[#B35F27] uppercase tracking-widest font-semibold">
                      Diagramas de Distribución
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentAxonometrics.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-xl overflow-hidden border border-[#0A0D0B]/10 bg-white/60 aspect-[4/3] cursor-pointer hover:border-[#B35F27] transition-all duration-300 shadow-sm"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#B35F27] text-[#EDE7E0] text-[9px] font-bold uppercase tracking-wider rounded">
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
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider">
                      Plantas Arquitectónicas por Nivel
                    </h3>
                    <span className="text-[10px] text-[#0A0D0B]/60 uppercase tracking-widest">
                      3 Niveles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentPlans.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-xl overflow-hidden border border-[#0A0D0B]/10 bg-white/80 p-4 cursor-pointer hover:border-[#B35F27] transition-all duration-300 flex flex-col justify-between shadow-sm"
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-[#EDE7E0] border border-[#0A0D0B]/10">
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#B35F27] text-[#EDE7E0] text-[9px] font-bold uppercase tracking-wider rounded">
                            PLANO FALTANTE
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#0A0D0B] mb-1">{item.title}</h4>
                          <p className="text-[10px] text-[#0A0D0B]/60 leading-relaxed uppercase tracking-wider line-clamp-2">
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
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider flex items-center gap-2">
                      <span>Recorrido Virtual 360° Interactivo</span>
                      <span className="px-2 py-0.5 bg-[#699385]/20 border border-[#699385]/40 text-[#699385] text-[9px] font-mono rounded-full font-bold">EN VIVO</span>
                    </h3>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-[#0A0D0B]/10 bg-white/80 aspect-[16/10] sm:aspect-[16/9] min-h-[360px] shadow-lg">
                    <iframe
                      src="https://kuula.co/share/collection/7TKQ2?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1"
                      title="Tour Virtual 360° Loom"
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
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B35F27] font-bold">
              Plano de Ubicación del Lote
            </span>
            <span className="text-[10px] text-[#0A0D0B]/50 uppercase tracking-widest">
              Vista Cinemática Centrada
            </span>
          </div>

          <div className="flex-1 w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-[#0A0D0B]/10 shadow-sm">
            <LoomLotZoomCanvas stageId={stageId} selectedLot={selectedLot} />
          </div>
        </section>

      </main>

      {/* Fullscreen Lightbox Modal Slider */}
      <AnimatePresence>
        {activeMedia && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#EDE7E0]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 select-none"
          >
            {/* Lightbox Header */}
            <div className="flex justify-between items-center z-20 max-w-7xl mx-auto w-full border-b border-[#0A0D0B]/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B35F27] font-bold">
                  Showroom Visualizer &bull; Foto {lightboxIndex + 1} de {activeMediaList.length}
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-[#B35F27]/15 border border-[#B35F27]/30 text-[#B35F27] text-[9px] font-bold rounded-full uppercase tracking-wider">
                  Navegación &lt; &gt;
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <h3 className="text-xs sm:text-base font-serif font-bold text-[#0A0D0B] max-w-[280px] sm:max-w-md truncate">
                  {activeMedia.title}
                </h3>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2.5 bg-white border border-[#0A0D0B]/15 hover:bg-[#B35F27] hover:text-[#EDE7E0] text-[#0A0D0B] rounded-full transition-all duration-300 cursor-pointer shadow-md active:scale-95"
                  title="Cerrar (Esc)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lightbox Main Image & Navigation Arrows */}
            <div className="relative flex-1 flex justify-center items-center my-2 sm:my-4 overflow-hidden w-full max-w-7xl mx-auto">
              
              {/* Previous Image Arrow Button */}
              {activeMediaList.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 z-30 p-3 sm:p-4 bg-white/90 hover:bg-[#B35F27] border border-[#0A0D0B]/15 hover:border-[#B35F27] text-[#0A0D0B] hover:text-[#EDE7E0] rounded-full transition-all duration-300 backdrop-blur-md shadow-xl active:scale-90 cursor-pointer group"
                  title="Foto Anterior (Flecha Izquierda)"
                >
                  <svg className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Center Media Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeMedia.src}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  src={activeMedia.src}
                  alt={activeMedia.title}
                  className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-xl shadow-2xl border border-[#0A0D0B]/10 bg-white"
                />
              </AnimatePresence>

              {/* Next Image Arrow Button */}
              {activeMediaList.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 z-30 p-3 sm:p-4 bg-white/90 hover:bg-[#B35F27] border border-[#0A0D0B]/15 hover:border-[#B35F27] text-[#0A0D0B] hover:text-[#EDE7E0] rounded-full transition-all duration-300 backdrop-blur-md shadow-xl active:scale-90 cursor-pointer group"
                  title="Siguiente Foto (Flecha Derecha)"
                >
                  <svg className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Lightbox Footer & Thumbnail Navigation Bar */}
            <div className="flex flex-col items-center gap-2 z-20 max-w-7xl mx-auto w-full border-t border-[#0A0D0B]/10 pt-3">
              {/* Thumbnail Strip */}
              {activeMediaList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 px-2">
                  {activeMediaList.map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative w-12 h-9 sm:w-16 sm:h-11 rounded-md overflow-hidden border transition-all duration-300 flex-shrink-0 cursor-pointer ${
                        idx === lightboxIndex
                          ? "border-[#B35F27] ring-2 ring-[#B35F27]/50 scale-105"
                          : "border-[#0A0D0B]/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={thumb.src} alt={thumb.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-center text-[10px] sm:text-xs text-[#0A0D0B]/70 uppercase tracking-widest font-sans font-medium">
                Loom Luxury Residence &bull; Lote {selectedLot.rawId} ({selectedLot.area} m²) &bull; Use las flechas &lt; &gt; o del teclado para navegar
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
