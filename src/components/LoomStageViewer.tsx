"use client";

import { useEffect, useState, useMemo } from "react";
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

interface LoomStageViewerProps {
  stageId: string; // "etapa_1", "etapa_2", or "etapa_6"
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
  onBack: () => void;
  onChangeStage?: (newStageId: string) => void;
}

interface ParsedPin {
  cx: number;
  cy: number;
  manzana: string;
  lotId: string;
  xPercent: number;
  yPercent: number;
  lotData: Lot;
}

export default function LoomStageViewer({ stageId, lots, selectedLot, onSelectLot, onBack, onChangeStage }: LoomStageViewerProps) {
  const [svgText, setSvgText] = useState<string>("");
  const [pins, setPins] = useState<ParsedPin[]>([]);
  const [hoveredPin, setHoveredPin] = useState<ParsedPin | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    available: true,
    reserved: true,
    sold: true,
  });

  const isAmenities = stageId === "etapa_6";
  const svgUrl = isAmenities ? "" : (stageId === "etapa_1" ? "/loom/loom_stage_1.svg" : "/loom/loom_stage_2.svg");
  const bgImage = stageId === "etapa_1" ? "/loom/loom_stage_1_bg.webp" : (stageId === "etapa_2" ? "/loom/loom_stage_2_bg.webp" : "/loom/loom_stage_6_bg.webp");
  const stageName = stageId === "etapa_1" ? "Etapa 1" : (stageId === "etapa_2" ? "Etapa 2" : "Alma Beach");

  // Navegación de etapas activas
  const activeStages = ["etapa_1", "etapa_2", "etapa_6"];
  const currentStageIndex = activeStages.indexOf(stageId);
  const prevStageId = currentStageIndex > 0 ? activeStages[currentStageIndex - 1] : null;
  const nextStageId = currentStageIndex < activeStages.length - 1 ? activeStages[currentStageIndex + 1] : null;

  // Cargar y procesar el SVG de la etapa de forma síncrona en un solo paso para evitar bucles infinitos
  useEffect(() => {
    if (!svgUrl) {
      setSvgText("");
      setPins([]);
      return;
    }

    fetch(svgUrl)
      .then((res) => res.text())
      .then((text) => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "image/svg+xml");
          
          doc.documentElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
          const viewBoxAttr = doc.documentElement.getAttribute("viewBox") || "0 0 3840 2160";
          const viewBoxParts = viewBoxAttr.split(" ").map(Number);
          const viewBoxWidth = viewBoxParts[2] || 3840;
          const viewBoxHeight = viewBoxParts[3] || 2160;

          const circles = doc.querySelectorAll("circle");
          const finalPins: ParsedPin[] = [];
          const counters: Record<string, number> = {};

          circles.forEach((c) => {
            let parent: HTMLElement | null = c.parentElement;
            let manzana = "";
            let manzanaGroup: HTMLElement | null = null;

            while (parent) {
              const id = parent.getAttribute("id") || "";
              if (id.includes("MANZANA_A")) { manzana = "A"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_B")) { manzana = "B"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_C")) { manzana = "C"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_D")) { manzana = "D"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_E")) { manzana = "E"; manzanaGroup = parent; break; }
              parent = parent.parentElement;
            }

            if (manzana) {
              if (!counters[manzana]) counters[manzana] = 0;
              counters[manzana] += 1;
              const num = counters[manzana];
              const lotId = `${manzana}-${num}`;

              const cx = parseFloat(c.getAttribute("cx") || "0");
              const cy = parseFloat(c.getAttribute("cy") || "0");
              const xPercent = (cx / viewBoxWidth) * 100;
              const yPercent = (cy / viewBoxHeight) * 100;

              // Buscar datos del lote en el array del Sheets
              let lotData = lots.find((l) => l.id.toUpperCase() === lotId.toUpperCase());
              if (!lotData) {
                lotData = {
                  id: lotId,
                  rawId: lotId,
                  area: "250.00",
                  location: "MEDIANERO",
                  status: "available",
                  statusRaw: "DISPONIBLE",
                  totalPrice: "$250,000,000",
                  downPayment: "$50,000,000",
                  financing: "$3,650,000",
                  finalPayment: "$25,000,000",
                };
              }

              // Asignar ID al grupo padre de este lote en el SVG para el hover CSS
              const lotGroup = c.parentElement;
              let closestElement: Element | null = null;
              if (lotGroup) {
                lotGroup.setAttribute("id", `LOTGROUP_${lotId}`);
                lotGroup.setAttribute("class", "lot-group-interactive");

                // Encontrar y mover la geometría del lote (rect, path, polygon) más cercana a este grupo
                const shapesContainer = doc.getElementById(`LOTES_${manzana}`) || manzanaGroup;
                if (shapesContainer) {
                  let minDistance = Infinity;
                  closestElement = null;

                  const shapes = shapesContainer.querySelectorAll("rect, path, polygon");
                  shapes.forEach((shape) => {
                    // Ignorar formas que pertenecen a un grupo de pin (que contiene un círculo)
                    const pGroup = shape.closest("g");
                    if (pGroup && pGroup.querySelector("circle")) {
                      return;
                    }
                    let sx = 0, sy = 0;
                    const tagName = shape.tagName.toLowerCase();
                    if (tagName === "rect") {
                      const rx = parseFloat(shape.getAttribute("x") || "0");
                      const ry = parseFloat(shape.getAttribute("y") || "0");
                      const rw = parseFloat(shape.getAttribute("width") || "0");
                      const rh = parseFloat(shape.getAttribute("height") || "0");
                      sx = rx + rw / 2;
                      sy = ry + rh / 2;
                    } else if (tagName === "polygon") {
                      const pointsAttr = shape.getAttribute("points") || "";
                      const coords = pointsAttr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
                      if (coords.length >= 2) {
                        let sumX = 0, sumY = 0, count = 0;
                        for (let i = 0; i < coords.length; i += 2) {
                          sumX += coords[i];
                          sumY += coords[i+1];
                          count++;
                        }
                        sx = sumX / count;
                        sy = sumY / count;
                      } else {
                        return;
                      }
                    } else if (tagName === "path") {
                      const d = shape.getAttribute("d") || "";
                      const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || [];
                      if (coords.length >= 2) {
                        let minX = Infinity, maxX = -Infinity;
                        let minY = Infinity, maxY = -Infinity;
                        for (let i = 0; i < coords.length; i += 2) {
                          if (coords[i] !== undefined && coords[i+1] !== undefined) {
                            minX = Math.min(minX, coords[i]);
                            maxX = Math.max(maxX, coords[i]);
                            minY = Math.min(minY, coords[i+1]);
                            maxY = Math.max(maxY, coords[i+1]);
                          }
                        }
                        sx = (minX + maxX) / 2;
                        sy = (minY + maxY) / 2;
                      } else {
                        return;
                      }
                    }

                    const dist = Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2);
                    if (dist < minDistance) {
                      minDistance = dist;
                      closestElement = shape;
                    }
                  });

                  if (closestElement) {
                    // Mover la geometría al principio del grupo para que quede de fondo
                    lotGroup.insertBefore(closestElement, lotGroup.firstChild);
                  }
                }
                
                // Reemplazar el círculo original por nuestro texto y píldora glassmorphic
                const pinText = doc.createElementNS("http://www.w3.org/2000/svg", "text");
                pinText.setAttribute("x", cx.toString());
                pinText.setAttribute("y", cy.toString());
                pinText.setAttribute("text-anchor", "middle");
                pinText.setAttribute("dominant-baseline", "central");
                pinText.setAttribute("class", "svg-pin-text");
                pinText.setAttribute("id", `PIN_${lotId}`);
                pinText.setAttribute("font-size", "24");
                pinText.setAttribute("style", "transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;");
                pinText.textContent = lotId.replace("-", ""); // ej: C31

                const pinRect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
                pinRect.setAttribute("x", (cx - 55).toString());
                pinRect.setAttribute("y", (cy - 30).toString());
                pinRect.setAttribute("width", "110");
                pinRect.setAttribute("height", "60");
                pinRect.setAttribute("rx", "30");
                pinRect.setAttribute("class", "svg-pin-rect");
                pinRect.setAttribute("id", `PIN_RECT_${lotId}`);
                pinRect.setAttribute("style", "transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;");

                // Eliminar cualquier elemento vectorizado original (como números o formas de fondo) en el grupo del marcador,
                // pero conservando la forma del lote que acabamos de asociar (closestElement).
                const markerGroup = c.parentElement;
                if (markerGroup) {
                  Array.from(markerGroup.children).forEach((child) => {
                    if (child !== c && child !== closestElement) {
                      child.remove();
                    }
                  });
                }

                // Reemplazar la marca original c con la píldora y luego colocar el texto encima
                c.replaceWith(pinRect);
                pinRect.after(pinText);
              }

              finalPins.push({
                cx,
                cy,
                manzana,
                lotId,
                xPercent,
                yPercent,
                lotData,
              });
            }
          });

          // Serializar el SVG modificado
          const serializer = new XMLSerializer();
          const modifiedSvgText = serializer.serializeToString(doc);
          
          setSvgText(modifiedSvgText);
          setPins(finalPins);
        } catch (e) {
          console.error("Error al procesar el SVG de la etapa:", e);
        }
      })
      .catch((err) => console.error("Error al cargar SVG de la etapa:", err));
  }, [svgUrl, lots]);

  // Filtrar los pines de lotes activos (para la capa de tooltips/interacción)
  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      const status = p.lotData.status;
      if (status === "available" && !activeFilters.available) return false;
      if (status === "reserved" && !activeFilters.reserved) return false;
      if (status === "blocked" && !activeFilters.sold) return false;
      return true;
    });
  }, [pins, activeFilters]);

  // Estadísticas rápidas de la etapa
  const stats = useMemo(() => {
    const total = pins.length;
    const available = pins.filter((p) => p.lotData.status === "available").length;
    const reserved = pins.filter((p) => p.lotData.status === "reserved").length;
    const sold = pins.filter((p) => p.lotData.status === "blocked").length;
    return { total, available, reserved, sold };
  }, [pins]);

  // Generar reglas CSS dinámicas para pintar e interactuar con los lotes vectoriales del SVG
  const dynamicLotStyles = useMemo(() => {
    let styles = "";
    pins.forEach((pin) => {
      const lotId = pin.lotId;
      const status = pin.lotData.status;
      const isSelected = selectedLot?.id === lotId;
      
      let baseColor = "#10b981"; // available (Verde)
      let opacityDefault = "0.16";
      let opacityHover = "0.36";
      let strokeColorDefault = "rgba(16, 185, 129, 0.35)";
      let strokeColorHover = "rgba(16, 185, 129, 0.95)";
      let cursor = "pointer";

      let pinColor = "rgba(16, 185, 129, 0.95)"; // Verde
      if (status === "reserved") {
        baseColor = "#f59e0b"; // reserved (Naranja)
        opacityDefault = "0.16";
        opacityHover = "0.36";
        strokeColorDefault = "rgba(245, 158, 11, 0.35)";
        strokeColorHover = "rgba(245, 158, 11, 0.95)";
        pinColor = "rgba(245, 158, 11, 0.95)";
      } else if (status === "blocked") {
        baseColor = "#ef4444"; // sold (Rojo)
        opacityDefault = "0.20"; 
        opacityHover = "0.40";
        strokeColorDefault = "rgba(239, 68, 68, 0.38)";
        strokeColorHover = "rgba(239, 68, 68, 0.95)";
        pinColor = "rgba(239, 68, 68, 0.95)";
        cursor = "not-allowed";
      }

      // Si está seleccionado, forzar highlight activo
      if (isSelected) {
        opacityDefault = "0.35";
        strokeColorDefault = `${baseColor} !important`;
      }

      // Ocultar si está filtrado
      let pinDisplay = "block";
      if (status === "available" && !activeFilters.available) pinDisplay = "none";
      if (status === "reserved" && !activeFilters.reserved) pinDisplay = "none";
      if (status === "blocked" && !activeFilters.sold) pinDisplay = "none";

      styles += `
        /* Estado por defecto del lote: resaltado translúcido con su color de estado */
        g#LOTGROUP_${lotId} path,
        g#LOTGROUP_${lotId} polyline,
        g#LOTGROUP_${lotId} polygon,
        g#LOTGROUP_${lotId} rect:not(.svg-pin-rect) {
          fill: ${baseColor} !important;
          fill-opacity: ${opacityDefault} !important;
          stroke: ${strokeColorDefault} !important;
          stroke-width: ${isSelected ? '3.5px' : '1.5px'} !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          pointer-events: all !important;
          cursor: ${cursor} !important;
        }

        /* Hover sobre el lote: rellenar con color de estado (verde/rojo) */
        g#LOTGROUP_${lotId}:hover path,
        g#LOTGROUP_${lotId}:hover polyline,
        g#LOTGROUP_${lotId}:hover polygon,
        g#LOTGROUP_${lotId}:hover rect:not(.svg-pin-rect) {
          fill: ${baseColor} !important;
          fill-opacity: 0.35 !important;
          stroke: ${strokeColorHover} !important;
          stroke-width: 4px !important;
          cursor: ${cursor} !important;
          filter: drop-shadow(0 0 6px ${baseColor}) !important;
        }

        /* Estilos del rect de fondo glassmorphic (del pin de lote) */
        g#LOTGROUP_${lotId} rect.svg-pin-rect {
          display: ${pinDisplay} !important;
          fill: rgba(7, 12, 22, 0.65) !important;
          stroke: ${isSelected ? '#dbaa67' : 'rgba(255, 255, 255, 0.25)'} !important;
          stroke-width: ${isSelected ? '3px' : '1.5px'} !important;
          transform: ${isSelected ? 'scale(1.08)' : 'scale(1)'} !important;
          transform-origin: ${pin.cx}px ${pin.cy}px !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          pointer-events: none !important;
        }

        /* Hover sobre el lote agranda el rect de fondo y cambia el borde al color del estado */
        g#LOTGROUP_${lotId}:hover rect.svg-pin-rect {
          fill: rgba(7, 12, 22, 0.85) !important;
          stroke: ${baseColor} !important;
          stroke-width: 2.5px !important;
          transform: scale(1.08) !important;
        }

        /* Mostrar y animar texto vectorial inyectado (blanco, sin contorno para mejor contraste) */
        g#LOTGROUP_${lotId} text.svg-pin-text {
          display: ${pinDisplay} !important;
          font-size: ${isSelected ? '28px' : '24px'} !important;
          font-weight: 700 !important;
          fill: #ffffff !important;
          stroke: none !important;
          transform: ${isSelected ? 'scale(1.08)' : 'scale(1)'} !important;
          transform-origin: ${pin.cx}px ${pin.cy}px !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          pointer-events: none !important;
        }

        /* Hover sobre el lote agranda el número */
        g#LOTGROUP_${lotId}:hover text.svg-pin-text {
          font-size: 28px !important;
          font-weight: 800 !important;
          transform: scale(1.08) !important;
        }
      `;
    });
    return styles;
  }, [pins, selectedLot, activeFilters]);

  return (
    <div className="relative h-[100dvh] w-full flex flex-col bg-[#070c16] text-white select-none overflow-hidden">
      
      {/* Estilos dinámicos inyectados */}
      <style dangerouslySetInnerHTML={{ __html: dynamicLotStyles }} />

      {/* HUD Superior / Header de la Etapa */}
      <div className="relative z-20 w-full bg-gradient-to-b from-black/80 to-transparent pt-6 pb-4 px-6 max-h-[500px]:pt-2 max-h-[500px]:pb-1 max-h-[500px]:px-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-h-[500px]:gap-2 max-h-[500px]:flex-row max-h-[500px]:items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-full text-[9px] uppercase tracking-wider text-[#dbaa67] hover:text-white font-bold backdrop-blur-md transition-all duration-300 shadow-md cursor-pointer"
            title="Volver al Master Plan"
          >
            <svg className="w-3.5 h-3.5 text-[#dbaa67]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span className="hidden sm:inline">Master Plan</span>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5 max-h-[500px]:hidden">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#dbaa67] font-semibold">Loom Luxury Residence</span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{stageName}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-serif tracking-wide text-white uppercase max-h-[500px]:text-xs max-h-[500px]:font-sans max-h-[500px]:font-bold">{isAmenities ? "Club de Playa & Amenidades" : "MAPA DE DISPONIBILIDAD"}</h2>
          </div>
        </div>

        {/* Panel de Filtros / Resumen de Amenidades */}
        {isAmenities && (
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 px-4 py-2 rounded-lg text-xs font-semibold text-[#10b981] tracking-widest uppercase backdrop-blur-md flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
            Amenidades: 7
          </div>
        )}
      </div>

      {/* Área del Plano */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center p-2 sm:p-4 z-10 overflow-hidden">
        <div className="relative w-full h-full max-w-full max-h-full rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-black/40 flex items-center justify-center">
          {/* Ocultar textos nativos del SVG (evita números dobles al hacer zoom) */}
          <style dangerouslySetInnerHTML={{ __html: `
            svg text {
              display: none !important;
            }
          `}} />
          
          {/* Fondo de Render de la Etapa */}
          <img
            src={bgImage}
            alt={`Fondo ${stageName}`}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {isAmenities ? null : (
            <>
              {/* SVG Vectorial Overlay (Capa interactiva de lotes y trazados) */}
              {svgText && (
                <div
                  className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain z-10 pointer-events-auto"
                  dangerouslySetInnerHTML={{ __html: svgText }}
                  onMouseOver={(e) => {
                    const target = e.target as SVGElement;
                    const group = target.closest("g[id^='LOTGROUP_']");
                    if (group) {
                      const id = group.getAttribute("id")?.replace("LOTGROUP_", "");
                      const pin = pins.find((p) => p.lotId === id);
                      if (pin) setHoveredPin(pin);
                    }
                  }}
                  onMouseOut={() => {
                    setHoveredPin(null);
                  }}
                  onClick={(e) => {
                    const target = e.target as SVGElement;
                    const group = target.closest("g[id^='LOTGROUP_']");
                    if (group) {
                      const id = group.getAttribute("id")?.replace("LOTGROUP_", "");
                      const pin = pins.find((p) => p.lotId === id);
                      if (pin && pin.lotData.status !== "blocked") {
                        onSelectLot(pin.lotData);
                        
                        // Ocultar el tooltip flotante tras 3 segundos en móviles/tabletas
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          setTimeout(() => {
                            setHoveredPin((prev) => (prev?.lotId === id ? null : prev));
                          }, 3000);
                        }
                      }
                    }
                  }}
                />
              )}



              {/* Tooltip de Lote */}
              <AnimatePresence>
                {hoveredPin && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute z-50 pointer-events-none p-3 rounded-lg border border-[#dbaa67]/25 bg-[#070c16]/65 shadow-2xl shadow-black/90 backdrop-blur-xl text-[11px] text-white/90"
                    style={{
                      left: `${hoveredPin.xPercent}%`,
                      top: `${hoveredPin.yPercent - 8}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="font-bold text-center border-b border-white/10 pb-1 mb-1 tracking-wider">
                      LOTE {hoveredPin.lotId}
                    </div>
                    <div className="space-y-0.5 min-w-[110px]">
                      <p className="flex justify-between gap-4">
                        <span>Área:</span>
                        <span className="font-semibold text-white">{hoveredPin.lotData.area} m²</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Flecha Lateral Izquierda (Etapa Anterior) - Translúcida */}
          {prevStageId && onChangeStage && (
            <button
              onClick={() => onChangeStage(prevStageId)}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-full text-white/80 hover:text-white backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
              title="Etapa Anterior"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
          )}

          {/* Flecha Lateral Derecha (Etapa Siguiente) - Translúcida */}
          {nextStageId && onChangeStage && (
            <button
              onClick={() => onChangeStage(nextStageId)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-full text-white/80 hover:text-white backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
              title="Etapa Siguiente"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Leyenda de Brújula (Flotante a la Derecha) */}
      <div className="absolute bottom-7 right-6 z-20 hidden md:flex items-center gap-2 text-white/40 text-[9px] uppercase tracking-widest font-light bg-black/40 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
        <Compass className="h-3.5 w-3.5 text-[#dbaa67]" />
        Norte orientado hacia el mar (arriba)
      </div>

    </div>
  );
}
