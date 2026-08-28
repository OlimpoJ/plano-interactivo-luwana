"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";

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

const stagesData = [
  {
    id: "ZONA_1",
    name: "Etapa 1",
    active: true,
    cx: 508,
    cy: 1146,
    points: "1017.98,1445.32 14.45,1454.13 15.9,1444.36 21.97,1388.42 27.41,1276.1 27.96,1189.33 21.14,1045.23 5.28,911.6 -2.18,868.48 490.2,837.93",
  },
  {
    id: "ZONA_2",
    name: "Etapa 2",
    active: true,
    cx: 1003,
    cy: 1127,
    points: "965.47,808.43 490.2,837.93 1017.98,1445.32 1515.09,1440.95",
  },
  {
    id: "ZONA_3",
    name: "Etapa 3",
    active: true,
    cx: 1484,
    cy: 1116,
    points: "965.47,808.43 1440.74,778.94 2012.2,1436.58 1515.09,1440.95",
  },
  {
    id: "ZONA_4",
    name: "Etapa 4",
    active: true,
    cx: 1941,
    cy: 1098,
    points: "1440.74,778.94 2012.2,1436.58 2437.44,1446.29 2399.42,1302.73 1916.19,754.8",
  },
  {
    id: "ZONA_5",
    name: "Etapa 5",
    active: true,
    cx: 2507,
    cy: 1081,
    points: "1916.19,754.8 2755.25,717.93 2919.9,1452.31 2437.44,1446.29 2399.42,1302.73",
  },
  {
    id: "ZONA_6",
    name: "Alma Beach",
    active: true,
    cx: 3339,
    cy: 1040,
    points: "2755.25,717.93 3840,636.2 3839.79,1420.08 2919.9,1452.31",
  },
];

interface LoomMasterplanSelectorProps {
  lots: Lot[];
  onSelectStage: (stageId: string) => void;
  onBack: () => void;
}

export default function LoomMasterplanSelector({ lots, onSelectStage, onBack }: LoomMasterplanSelectorProps) {
  const [hoveredStage, setHoveredStage] = useState<{
    id: string;
    name: string;
    total: number;
    available: number;
    active: boolean;
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isRightHalf: false });
  const containerRef = useRef<HTMLDivElement>(null);

  // Estadísticas globales de las etapas calculadas dinámicamente desde el Sheet
  const stageStats = useMemo(() => {
    const stats: Record<string, { total: number; available: number; active: boolean; name: string }> = {
      "ZONA_1": { total: 0, available: 0, active: true, name: "Etapa 1" },
      "ZONA_2": { total: 0, available: 0, active: true, name: "Etapa 2" },
      "ZONA_3": { total: 0, available: 0, active: true, name: "Etapa 3" },
      "ZONA_4": { total: 0, available: 0, active: true, name: "Etapa 4" },
      "ZONA_5": { total: 0, available: 0, active: true, name: "Etapa 5" },
      "ZONA_6": { total: 0, available: 0, active: true, name: "Alma Beach" },
    };

    // Procesar disponibilidad de lotes del Sheet
    lots.forEach((lot) => {
      const lotId = (lot.rawId || lot.id).toUpperCase();
      let zone = "";

      if (lotId.startsWith("A-") || lotId.startsWith("B-") || lotId.startsWith("C-")) {
        zone = "ZONA_1";
      } else if (lotId.startsWith("D-") || lotId.startsWith("E-")) {
        zone = "ZONA_2";
      } else if (lotId.startsWith("F-") || lotId.startsWith("G-")) {
        zone = "ZONA_3";
      } else if (lotId.startsWith("H-") || lotId.startsWith("I-")) {
        zone = "ZONA_4";
      } else if (lotId.startsWith("J-") || lotId.startsWith("K-") || lotId.startsWith("L-")) {
        zone = "ZONA_5";
      }

      if (zone && stats[zone]) {
        stats[zone].total += 1;
        if (lot.status === "available") {
          stats[zone].available += 1;
        }
      }
    });

    // Fallbacks si el API aún no carga o está vacía
    if (stats["ZONA_1"].total === 0) stats["ZONA_1"].total = 62;
    if (stats["ZONA_2"].total === 0) stats["ZONA_2"].total = 58;
    if (stats["ZONA_3"].total === 0) stats["ZONA_3"].total = 66;
    if (stats["ZONA_4"].total === 0) stats["ZONA_4"].total = 73;
    if (stats["ZONA_5"].total === 0) stats["ZONA_5"].total = 67;
    if (stats["ZONA_6"].total === 0) stats["ZONA_6"].total = 7;
    stats["ZONA_6"].available = 7;

    return stats;
  }, [lots]);

  // Trackear posición del cursor
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({
      x,
      y,
      isRightHalf: x > rect.width / 2,
    });
  };

  return (
    <div className="h-[100dvh] w-full bg-[#051415] text-white relative overflow-hidden select-none">
      
      {/* Fondo difuminado esmerilado */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/loom/loom_masterplan_bg.webp"
          alt="Blur background"
          className="w-full h-full object-cover opacity-25 blur-3xl scale-110 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#051415]/80 via-[#0b2426]/60 to-[#051415]/80 pointer-events-none" />
      </div>

      {/* Botón Flotante Volver al Inicio (Sobre la imagen, desplazado para no colisionar con el menú) */}
      <div className="absolute top-4 left-16 sm:left-18 z-30 pointer-events-auto">
        <button 
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-full text-[9px] uppercase tracking-wider text-[#dbaa67] hover:text-white font-bold backdrop-blur-md transition-all duration-300 shadow-md cursor-pointer"
        >
          ← Inicio
        </button>
      </div>

      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredStage(null)}
      >
            {/* Estilos CSS Nativos para Hitbox Vectorial */}
            <style dangerouslySetInnerHTML={{ __html: `
              svg polygon[id^="ZONA_"] {
                fill: transparent !important;
                stroke: transparent !important;
                cursor: pointer !important;
                pointer-events: all !important;
              }
              svg polygon[id^="ZONA_3"],
              svg polygon[id^="ZONA_4"],
              svg polygon[id^="ZONA_5"] {
                cursor: not-allowed !important;
              }
            `}} />

            {/* Wrapper del Mapa: Ocupa toda la pantalla y contiene el render y hitboxes */}
            <div className="w-full h-full relative">

              {/* SVG Visual Overlay (Glassmorphism & Zoom) */}
              <svg 
                viewBox="0 550 3840 1060" 
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
              >
              <defs>
                {stagesData.map((stage) => (
                  <clipPath 
                    key={stage.id} 
                    id={`clip-${stage.id.toLowerCase().replace('_', '-')}`}
                  >
                    <polygon points={stage.points} />
                  </clipPath>
                ))}
              </defs>

              {/* Imagen de Fondo del Masterplan Base */}
              <image
                href="/loom/loom_masterplan_bg.webp"
                x="0"
                y="0"
                width="3840"
                height="2160"
                pointerEvents="none"
              />


              {stagesData.map((stage) => {
                const isHovered = hoveredStage?.id === stage.id;
                const isActive = stage.active;
                return (
                  <g 
                    key={stage.id}
                    clipPath={`url(#clip-${stage.id.toLowerCase().replace('_', '-')})`}
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Imagen de Fondo Duplicada con Zoom y Filtros */}
                    <image
                      href="/loom/loom_masterplan_bg.webp"
                      x="0"
                      y="0"
                      width="3840"
                      height="2160"
                      style={{
                        transform: isHovered ? "scale(1.045)" : "scale(1)",
                        transformOrigin: `${stage.cx}px ${stage.cy}px`,
                        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                        filter: isHovered 
                          ? (isActive ? "blur(1.5px) brightness(1.15) saturate(1.2)" : "blur(1.5px) brightness(0.8) saturate(0.85)") 
                          : "none",
                      }}
                    />

                    {/* Tinte de Vidrio Glassmorphic */}
                    <polygon
                      points={stage.points}
                      fill={isActive ? "#dbaa67" : "#ffffff"}
                      fillOpacity={isActive ? 0.14 : 0.06}
                      stroke={isActive ? "#dbaa67" : "rgba(255,255,255,0.2)"}
                      strokeWidth={isActive ? 14 : 6}
                      style={{
                        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    />
                  </g>
                );
              })}
            </svg>

              {/* SVG Vectorial Overlay (Rótulos Nativos e Hitboxes) */}
              <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
                <svg 
                  viewBox="0 550 3840 1060" 
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full object-contain pointer-events-auto"
                >
                {/* 1. Rótulos Nativos de Etapa (100% Escala Vectorial, Cero Solapes) */}
                <g id="ROTULOS" className="pointer-events-none">
                  {stagesData.map((stage) => {
                    const isHovered = hoveredStage?.id === stage.id;
                    const isActive = stage.active;
                    
                    // Ocultar etapas inactivas en móviles para evitar saturación
                    const responsiveClass = isActive ? "" : "hidden md:block";

                    return (
                      <g 
                        key={`rotulo-${stage.id}`} 
                        className={responsiveClass}
                        style={{ transition: "all 0.3s ease" }}
                      >
                        {/* Fondo del Rótulo (Glassmorphic Marfil) */}
                        <rect
                          x={isActive ? stage.cx - 170 : stage.cx - 110}
                          y={isActive ? stage.cy - 45 : stage.cy - 30}
                          width={isActive ? 390 : 220}
                          height={isActive ? 90 : 60}
                          rx={isActive ? 45 : 30}
                          fill={isHovered ? "rgba(237, 231, 224, 0.98)" : (isActive ? "rgba(237, 231, 224, 0.92)" : "rgba(237, 231, 224, 0.75)")}
                          stroke={isHovered ? "#B35F27" : (isActive ? "rgba(179, 95, 39, 0.5)" : "rgba(10, 13, 11, 0.2)")}
                          strokeWidth={isActive ? 4 : 2}
                          style={{
                            transform: isHovered ? "scale(1.08)" : "scale(1)",
                            transformOrigin: `${stage.cx}px ${stage.cy}px`,
                            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        />

                        {/* Indicador Circular de Disponibilidad */}
                        <circle
                          cx={isActive ? stage.cx - 95 : stage.cx - 60}
                          cy={stage.cy}
                          r={isActive ? 12 : 6}
                          fill={isActive ? "#699385" : "rgba(10, 13, 11, 0.3)"}
                          style={{
                            transform: isHovered ? "scale(1.08)" : "scale(1)",
                            transformOrigin: `${stage.cx}px ${stage.cy}px`,
                            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        />
                        {isActive && (
                          <circle
                            cx={stage.cx - 95}
                            cy={stage.cy}
                            r="12"
                            fill="none"
                            stroke="#699385"
                            strokeWidth="3"
                            className="animate-ping"
                            style={{
                              transformOrigin: `${stage.cx}px ${stage.cy}px`,
                            }}
                          />
                        )}

                        {/* Texto del Rótulo */}
                        <text
                          x={isActive ? stage.cx - 50 : stage.cx - 30}
                          y={stage.cy}
                          fill={isActive ? "#0A0D0B" : "rgba(10, 13, 11, 0.55)"}
                          fontSize={isActive ? 32 : 22}
                          fontWeight={isActive ? "700" : "500"}
                          letterSpacing={isActive ? "4" : "2"}
                          textAnchor="start"
                          dominantBaseline="central"
                          style={{
                            transform: isHovered ? "scale(1.08)" : "scale(1)",
                            transformOrigin: `${stage.cx}px ${stage.cy}px`,
                            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        >
                          {stage.name.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* 2. Polígonos Hitbox Invisibles para Clic y Hover (A la cabeza del z-index del SVG) */}
                <g id="HITBOXES">
                  {stagesData.map((stage) => {
                    const stats = stageStats[stage.id];
                    const isActive = stage.active;
                    return (
                      <polygon
                        key={`hit-${stage.id}`}
                        points={stage.points}
                        fill="rgba(0,0,0,0)"
                        stroke="rgba(0,0,0,0)"
                        pointerEvents="all"
                        style={{ cursor: isActive ? "pointer" : "not-allowed" }}
                        onMouseEnter={() => {
                          if (stats) {
                            setHoveredStage({
                              id: stage.id,
                              name: stats.name,
                              total: stats.total,
                              available: stats.available,
                              active: stats.active,
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredStage((prev) => (prev?.id === stage.id ? null : prev));
                        }}
                        onClick={() => {
                          if (isActive) {
                            onSelectStage(stage.id.toLowerCase().replace("zona_", "etapa_"));
                          }
                        }}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          if (touch && containerRef.current) {
                            const rect = containerRef.current.getBoundingClientRect();
                            const touchX = touch.clientX - rect.left;
                            const touchY = touch.clientY - rect.top;
                            setMousePos({
                              x: touchX,
                              y: touchY,
                              isRightHalf: touchX > rect.width / 2,
                            });
                          }
                          if (stats) {
                            setHoveredStage({
                              id: stage.id,
                              name: stats.name,
                              total: stats.total,
                              available: stats.available,
                              active: stats.active,
                            });
                          }
                        }}
                      />
                    );
                  })}
                </g>
                </svg>
              </div>
            </div>

            {/* Tooltip Flotante */}
            <AnimatePresence>
              {hoveredStage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="absolute z-40 pointer-events-none p-3.5 rounded-lg border bg-[#0c1524]/90 border-[#dbaa67]/40 shadow-2xl backdrop-blur-md min-w-[200px]"
                  style={{
                    left: mousePos.isRightHalf ? mousePos.x - 220 : mousePos.x + 20,
                    top: mousePos.y - 40,
                  }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="font-serif text-white text-sm font-semibold tracking-wide">
                      {hoveredStage.name}
                    </h3>
                    <span 
                      className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                        hoveredStage.active 
                          ? "bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/40" 
                          : "bg-white/10 text-white/50 border border-white/20"
                      }`}
                    >
                      {hoveredStage.active ? "Activo" : "Próximamente"}
                    </span>
                  </div>
                  {hoveredStage.active ? (
                    <div className="space-y-1 text-xs text-white/70">
                      {hoveredStage.id === "ZONA_6" ? (
                        <p className="flex justify-between">
                          <span>Amenidades:</span>
                          <span className="font-semibold text-white">{hoveredStage.total}</span>
                        </p>
                      ) : (
                        <>
                          <p className="flex justify-between">
                            <span>Lotes Totales:</span>
                            <span className="font-semibold text-white">{hoveredStage.total}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Disponibles:</span>
                            <span className="font-semibold text-[#10b981]">{hoveredStage.available}</span>
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-light mt-1">
                      Esta etapa estará disponible pronto.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

        {/* Leyenda de Brújula (Flotante a la Derecha) */}
        <div className="absolute bottom-7 right-6 z-20 hidden md:flex items-center gap-2 text-[#0A0D0B]/70 text-[9px] uppercase tracking-widest font-semibold bg-[#EDE7E0]/90 border border-[#0A0D0B]/10 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
          <Compass className="h-3.5 w-3.5 text-[#B35F27] rotate-[45deg]" />
          Norte orientado hacia el mar (Derecha / Playa)
        </div>
      </div>
    </div>
  );
}
