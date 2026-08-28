"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ZONES = [
  { id: "ZONA_1", label: "LOTES DEL 1 AL 60", img: "/LUWANA_1_thumb.jpg", imgMobile: "/LUWANA_1_thumb_vertical.jpg" },
  { id: "ZONA_2", label: "LOTES DEL 61 AL 122", img: "/LUWANA_2_thumb.jpg", imgMobile: "/LUWANA_2_thumb_vertical.jpg" },
  { id: "ZONA_3", label: "CLUB DE PLAYA Y AMENIDADES", img: "/LUWANA_3_thumb.jpg", imgMobile: "/LUWANA_3_thumb_vertical.jpg" },
];

export default function MasterplanSelector({ onSelectZone }: { onSelectZone: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-6 sm:py-20 px-2 sm:px-8">
      
      {/* Fondo difuminado */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <img
          src="/LUWANA_1_bg.jpg"
          alt="Background blur"
          className="w-full h-full object-cover opacity-20 blur-xl scale-110 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-[1600px] h-full">
        
        {/* Cabecera / Títulos */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-white mb-1 sm:mb-3" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
            PLANO INTERACTIVO
          </h1>
          <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-[0.2em] font-medium">
            Selecciona una etapa para explorar los lotes
          </p>
        </div>

        {/* Contenedor Premium del Mapa */}
        <div 
          className="relative w-full max-w-[1800px] mx-auto rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-hidden bg-black/50 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          onMouseLeave={() => setHoveredZone(null)}
        >
          
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5"
          >
            {/* 1. Fondo particionado con las 3 imágenes */}
            <div className="flex flex-col landscape:flex-row w-full portrait:aspect-[3/16] landscape:aspect-[16/3] cursor-pointer">
              {ZONES.map((zone, index) => (
                <div 
                  key={zone.id}
                  className="flex-1 relative overflow-hidden group"
                  onMouseEnter={() => {
                    setHoveredZone(zone.label);
                    setHoveredZoneId(zone.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredZone(null);
                    setHoveredZoneId(null);
                  }}
                  onClick={() => onSelectZone(`etapa-${index + 1}`)}
                >
                  <picture className="w-full h-full block">
                    <source media="(orientation: portrait), (max-width: 768px)" srcSet={zone.imgMobile} />
                    <img
                      src={zone.img}
                      alt={`Masterplan Luwana ${zone.label}`}
                      className={`w-full h-full object-fill block transition-transform duration-700 ease-out ${hoveredZoneId === zone.id ? "scale-105" : "scale-100"}`}
                    />
                  </picture>
                  {/* Overlay sutil para las etapas NO seleccionadas, dando foco a la seleccionada */}
                  <div className={`absolute inset-0 bg-black transition-opacity duration-700 pointer-events-none ${hoveredZoneId && hoveredZoneId !== zone.id ? "opacity-50" : "opacity-0"}`} />
                </div>
              ))}
            </div>

            {/* Tooltip Dinámico */}
            <AnimatePresence>
              {hoveredZone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute z-40 pointer-events-none px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-black/80 border border-[#CBAA85]"
                  style={{
                    left: mousePos.x + 20,
                    top: mousePos.y - 30,
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.5), 0 0 10px rgba(203,170,133,0.2)"
                  }}
                >
                  <p className="text-white/90 tracking-[0.2em] text-[8px] sm:text-[10px] uppercase font-medium hidden sm:block">Clic para explorar</p>
                  <p className="text-white/90 tracking-[0.2em] text-[8px] sm:text-[10px] uppercase font-medium block sm:hidden">Toca para explorar</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
