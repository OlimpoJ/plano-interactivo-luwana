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

function decodeSvgNumber(g: HTMLElement): number | null {
  const paths = Array.from(g.querySelectorAll("path"));
  if (paths.length === 0) return null;
  
  let numberStr = "";
  
  paths.forEach((p) => {
    const d = p.getAttribute("d") || "";
    // Strip all whitespace
    const noWhitespace = d.replace(/\s+/g, '');
    // Remove absolute M starting coordinates
    const clean = noWhitespace.replace(/^M\s*[-+]?[0-9]*\.?[0-9]+[\s,]+[-+]?[0-9]*\.?[0-9]+/i, '').trim();
    
    const len = clean.length;
    const cmds = clean.split(/[a-df-z]/i).length;
    const startsWith = clean.substring(0, 5).toLowerCase();

    let digit = "";
    if ((cmds === 20 || cmds === 21) && startsWith.startsWith("c-")) digit = "0";
    else if ((cmds === 11 || cmds === 12) && startsWith.startsWith("h-")) digit = "1";
    else if ((cmds === 31 || cmds === 32) && startsWith.startsWith("v-")) digit = "2";
    else if ((cmds === 32 || cmds === 33) && startsWith.startsWith("l0")) digit = "3";
    else if (cmds === 24 && startsWith.startsWith("v")) digit = "4";
    else if (cmds === 24 && startsWith.startsWith("l")) digit = "5";
    else if (cmds === 34 && startsWith.startsWith("c")) digit = "6";
    else if (cmds === 11 && startsWith.startsWith("c-")) digit = "7";
    else if (cmds === 38 && startsWith.startsWith("c0")) digit = "8";
    else if (cmds === 30 && startsWith.startsWith("c0")) digit = "9";
    
    if (digit) {
      numberStr += digit;
    }
  });
  
  if (!numberStr) return null;
  
  // Clean leading 0
  if (numberStr.startsWith("0") && numberStr.length > 1) {
    numberStr = numberStr.substring(1);
  }
  
  const parsed = parseInt(numberStr, 10);
  return isNaN(parsed) ? null : parsed;
}

function getShapeCentroid(shape: Element): { x: number; y: number } | null {
  const tagName = shape.tagName.toLowerCase();
  
  if (tagName === "rect") {
    const rx = parseFloat(shape.getAttribute("x") || "0");
    const ry = parseFloat(shape.getAttribute("y") || "0");
    const rw = parseFloat(shape.getAttribute("width") || "0");
    const rh = parseFloat(shape.getAttribute("height") || "0");
    let cx = rx + rw / 2;
    let cy = ry + rh / 2;

    const transform = shape.getAttribute("transform") || "";
    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
      const [a, b, c, d, e, f] = matrixMatch[1].split(/[\s,]+/).map(Number);
      if (!isNaN(a) && !isNaN(f)) {
        cx = a * cx + c * cy + e;
        cy = b * cx + d * cy + f;
      }
    }
    return { x: cx, y: cy };
  }
  
  if (tagName === "polygon") {
    const pointsAttr = shape.getAttribute("points") || "";
    const coords = pointsAttr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (coords.length < 2) return null;
    let sumX = 0, sumY = 0, count = 0;
    for (let i = 0; i < coords.length; i += 2) {
      if (coords[i] !== undefined && coords[i+1] !== undefined) {
        sumX += coords[i];
        sumY += coords[i+1];
        count++;
      }
    }
    return count > 0 ? { x: sumX / count, y: sumY / count } : null;
  }
  
  if (tagName === "path") {
    const d = shape.getAttribute("d") || "";
    const absCoords: { x: number; y: number }[] = [];
    const cmdRegex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
    let cmdMatch: RegExpExecArray | null;
    let currX = 0, currY = 0;
    
    while ((cmdMatch = cmdRegex.exec(d)) !== null) {
      const cmd = cmdMatch[1];
      const nums = cmdMatch[2].trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      
      if (cmd === 'M' || cmd === 'L') {
        for (let i = 0; i < nums.length; i += 2) {
          if (nums[i] !== undefined && nums[i+1] !== undefined) {
            currX = nums[i]; currY = nums[i+1];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'm' || cmd === 'l') {
        for (let i = 0; i < nums.length; i += 2) {
          if (nums[i] !== undefined && nums[i+1] !== undefined) {
            currX += nums[i]; currY += nums[i+1];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'H') {
        if (nums[0] !== undefined) { currX = nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'h') {
        if (nums[0] !== undefined) { currX += nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'V') {
        if (nums[0] !== undefined) { currY = nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'v') {
        if (nums[0] !== undefined) { currY += nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'C') {
        for (let i = 0; i < nums.length; i += 6) {
          if (nums[i+4] !== undefined && nums[i+5] !== undefined) {
            currX = nums[i+4]; currY = nums[i+5];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'c') {
        for (let i = 0; i < nums.length; i += 6) {
          if (nums[i+4] !== undefined && nums[i+5] !== undefined) {
            currX += nums[i+4]; currY += nums[i+5];
            absCoords.push({ x: currX, y: currY });
          }
        }
      }
    }
    
    if (absCoords.length === 0) return null;
    let sumX = 0, sumY = 0;
    absCoords.forEach((pt) => { sumX += pt.x; sumY += pt.y; });
    return { x: sumX / absCoords.length, y: sumY / absCoords.length };
  }
  
  return null;
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
  const containerWidthClass = selectedLot 
    ? "w-full max-md:landscape:w-[55vw]" 
    : "w-full";
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

          const circleElements = Array.from(doc.querySelectorAll("circle"));
          const parsedCircles = circleElements.map((c) => {
            let parent: HTMLElement | null = c.parentElement;
            let manzana = "";
            let manzanaGroup: HTMLElement | null = null;

            while (parent) {
              const id = parent.getAttribute("id") || "";
              if (id.includes("MANZANA_A") || id.includes("MANZONA_A")) { manzana = "A"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_B") || id.includes("MANZONA_B")) { manzana = "B"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_C") || id.includes("MANZONA_C")) { manzana = "C"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_D") || id.includes("MANZONA_D")) { manzana = "D"; manzanaGroup = parent; break; }
              if (id.includes("MANZANA_E") || id.includes("MANZONA_E")) { manzana = "E"; manzanaGroup = parent; break; }
              parent = parent.parentElement;
            }
            const cx = parseFloat(c.getAttribute("cx") || "0");
            const cy = parseFloat(c.getAttribute("cy") || "0");
            return { element: c, manzana, manzanaGroup, cx, cy };
          });

          const finalPins: ParsedPin[] = [];
          const counters: Record<string, number> = {};

          interface CircleItem {
            element: Element;
            manzana: string;
            manzanaGroup: HTMLElement | null;
            cx: number;
            cy: number;
            lotId: string;
            xPercent: number;
            yPercent: number;
            lotData: Lot;
            lotGroup: HTMLElement;
          }

          const circleItems: CircleItem[] = [];

          parsedCircles.forEach((sc) => {
            const c = sc.element;
            const manzana = sc.manzana;
            const manzanaGroup = sc.manzanaGroup;
            const cx = sc.cx;
            const cy = sc.cy;

            if (manzana && c.parentElement) {
              const circleParent = c.parentElement;
              let decodedNum: number | null = decodeSvgNumber(circleParent);

              let num = 0;
              if (decodedNum !== null) {
                num = decodedNum;
              } else {
                if (!counters[manzana]) counters[manzana] = 0;
                counters[manzana] += 1;
                num = counters[manzana];
              }

              const lotId = `${manzana}-${num}`;
              const xPercent = (cx / viewBoxWidth) * 100;
              const yPercent = (cy / viewBoxHeight) * 100;

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

              const lotGroup = c.parentElement;
              lotGroup.setAttribute("id", `LOTGROUP_${lotId}`);
              lotGroup.setAttribute("class", "lot-group-interactive");

              circleItems.push({
                element: c,
                manzana,
                manzanaGroup,
                cx,
                cy,
                lotId,
                xPercent,
                yPercent,
                lotData,
                lotGroup,
              });

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

          // 2. Recolectar todas las formas geométricas candidatas para lotes
          const candidateShapes: { element: Element; centroid: { x: number; y: number } }[] = [];
          const allShapes = doc.querySelectorAll("rect, path, polygon");

          allShapes.forEach((shape) => {
            const pGroup = shape.closest("g");
            if (pGroup && (pGroup.querySelector("circle") || pGroup.parentElement?.querySelector("circle"))) {
              return;
            }
            const shapeClass = shape.getAttribute("class") || "";
            if (shape.tagName.toLowerCase() === "path" && !shapeClass) {
              return;
            }
            if (shapeClass.includes("st2") || shapeClass.includes("svg-pin")) {
              return;
            }
            const centroid = getShapeCentroid(shape);
            if (centroid) {
              candidateShapes.push({ element: shape, centroid });
            }
          });

          // 3. Crear todas las parejas posibles (Círculo, Forma) con su distancia
          interface Pair {
            circle: CircleItem;
            shape: Element;
            dist: number;
          }
          const allPairs: Pair[] = [];

          circleItems.forEach((c) => {
            candidateShapes.forEach((s) => {
              const dist = Math.sqrt((s.centroid.x - c.cx) ** 2 + (s.centroid.y - c.cy) ** 2);
              if (dist < 450) {
                allPairs.push({ circle: c, shape: s.element, dist });
              }
            });
          });

          // Sort por distancia de menor a mayor
          allPairs.sort((a, b) => a.dist - b.dist);

          // 4. Asignación global voraz 1 a 1 de mínima distancia
          const assignedCircleLotIds = new Set<string>();
          const assignedShapeElements = new Set<Element>();
          const assignedLotShapes = new Map<HTMLElement, Element>();

          allPairs.forEach((pair) => {
            if (assignedCircleLotIds.has(pair.circle.lotId) || assignedShapeElements.has(pair.shape)) {
              return;
            }
            assignedCircleLotIds.add(pair.circle.lotId);
            assignedShapeElements.add(pair.shape);
            assignedLotShapes.set(pair.circle.lotGroup, pair.shape);
            
            // Mover la geometría al principio del grupo del lote asignado
            pair.circle.lotGroup.insertBefore(pair.shape, pair.circle.lotGroup.firstChild);
          });

          // 5. Inyectar pins visuales glassmorphic en cada grupo de lote y limpiar números vectoriales obsoletos
          circleItems.forEach((item) => {
            const { cx, cy, lotId, lotGroup, element: c } = item;

            const assignedShape = assignedLotShapes.get(lotGroup);

            // Eliminar cualquier número o trazo vectorial nativo del marcador dentro de lotGroup,
            // dejando ÚNICAMENTE la forma del lote que acabamos de asociar.
            Array.from(lotGroup.children).forEach((child) => {
              if (child !== c && child !== assignedShape) {
                child.remove();
              }
            });

            const pinText = doc.createElementNS("http://www.w3.org/2000/svg", "text");
            pinText.setAttribute("x", cx.toString());
            pinText.setAttribute("y", cy.toString());
            pinText.setAttribute("text-anchor", "middle");
            pinText.setAttribute("dominant-baseline", "central");
            pinText.setAttribute("class", "svg-pin-text");
            pinText.setAttribute("id", `PIN_${lotId}`);
            pinText.setAttribute("font-size", "24");
            pinText.setAttribute("style", "transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;");
            pinText.textContent = lotId.replace("-", "");

            const pinRect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
            pinRect.setAttribute("x", (cx - 55).toString());
            pinRect.setAttribute("y", (cy - 30).toString());
            pinRect.setAttribute("width", "110");
            pinRect.setAttribute("height", "60");
            pinRect.setAttribute("rx", "30");
            pinRect.setAttribute("class", "svg-pin-rect");
            pinRect.setAttribute("id", `PIN_RECT_${lotId}`);
            pinRect.setAttribute("style", "transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;");

            c.replaceWith(pinRect);
            pinRect.after(pinText);
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
          fill: rgba(237, 231, 224, 0.92) !important;
          stroke: ${isSelected ? '#B35F27' : 'rgba(10, 13, 11, 0.25)'} !important;
          stroke-width: ${isSelected ? '3px' : '1.5px'} !important;
          transform: ${isSelected ? 'scale(1.08)' : 'scale(1)'} !important;
          transform-origin: ${pin.cx}px ${pin.cy}px !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          pointer-events: none !important;
        }

        /* Hover sobre el lote agranda el rect de fondo y cambia el borde al color del estado */
        g#LOTGROUP_${lotId}:hover rect.svg-pin-rect {
          fill: rgba(237, 231, 224, 0.98) !important;
          stroke: ${baseColor} !important;
          stroke-width: 2.5px !important;
          transform: scale(1.08) !important;
        }

        /* Mostrar y animar texto vectorial inyectado */
        g#LOTGROUP_${lotId} text.svg-pin-text {
          display: ${pinDisplay} !important;
          font-size: ${isSelected ? '28px' : '24px'} !important;
          font-weight: 700 !important;
          fill: #0A0D0B !important;
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
    <div className={`relative h-[100dvh] ${containerWidthClass} bg-[#EDE7E0] text-[#0A0D0B] select-none overflow-hidden transition-all duration-500 ease-in-out`}>
      
      {/* Estilos dinámicos inyectados */}
      <style dangerouslySetInnerHTML={{ __html: dynamicLotStyles }} />

      {/* Fondo difuminado esmerilado */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={bgImage}
          alt="Blur background"
          className="w-full h-full object-cover opacity-25 blur-3xl scale-110 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#EDE7E0]/80 via-[#F5F1EC]/60 to-[#EDE7E0]/80 pointer-events-none" />
      </div>

      {/* Botón Flotante Master Plan (Sobre la imagen) */}
      <div className="absolute top-4 left-4 z-30 pointer-events-auto">
        <button 
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#B35F27] hover:bg-[#964d1d] active:scale-95 border border-[#B35F27] rounded-full text-[9px] uppercase tracking-wider text-[#EDE7E0] font-bold backdrop-blur-md transition-all duration-300 shadow-md cursor-pointer"
          title="Volver al Master Plan"
        >
          <svg className="w-3.5 h-3.5 text-[#EDE7E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span className="hidden sm:inline">Master Plan</span>
        </button>
      </div>

      {/* Panel de Filtros / Resumen de Amenidades Flotante */}
      {isAmenities && (
        <div className="absolute top-4 right-4 z-30 pointer-events-auto bg-[#699385]/20 border border-[#699385]/40 px-3 py-1.5 rounded-full text-[9px] font-semibold text-[#699385] tracking-widest uppercase backdrop-blur-md flex items-center gap-2 shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#699385] animate-pulse"></span>
          Amenidades: 7
        </div>
      )}

      {/* Área del Plano */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-10">
          {/* Ocultar textos nativos y líneas perimetrales CAD fuera de los lotes SOLO en el SVG del mapa */}
          <style dangerouslySetInnerHTML={{ __html: `
            .loom-stage-map-svg svg text {
              display: none !important;
            }

            /* Ocultar polígonos y líneas perimetrales (CAD/Illustrator) que no corresponden a lotes en el mapa */
            .loom-stage-map-svg svg path:not(g[id^='LOTGROUP_'] *),
            .loom-stage-map-svg svg polyline:not(g[id^='LOTGROUP_'] *),
            .loom-stage-map-svg svg polygon:not(g[id^='LOTGROUP_'] *),
            .loom-stage-map-svg svg line:not(g[id^='LOTGROUP_'] *),
            .loom-stage-map-svg svg rect:not(g[id^='LOTGROUP_'] *) {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              stroke: transparent !important;
            }
          `}} />

          {/* Wrapper del Mapa: Ocupa toda la pantalla y contiene el render y hitboxes */}
          <div className="w-full h-full relative">
            
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
                    className="loom-stage-map-svg absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain z-10 pointer-events-auto"
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
                    className="absolute z-50 pointer-events-none p-3 rounded-lg border border-[#B35F27]/30 bg-[#EDE7E0]/95 shadow-xl backdrop-blur-xl text-[11px] text-[#0A0D0B]"
                    style={{
                      left: `${hoveredPin.xPercent}%`,
                      top: `${hoveredPin.yPercent - 8}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="font-bold text-center border-b border-[#0A0D0B]/10 pb-1 mb-1 tracking-wider text-[#B35F27]">
                      LOTE {hoveredPin.lotId}
                    </div>
                    <div className="space-y-0.5 min-w-[110px]">
                      <p className="flex justify-between gap-4">
                        <span>Área:</span>
                        <span className="font-semibold text-[#0A0D0B]">{hoveredPin.lotData.area} m²</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          </div>

          {/* Flecha Lateral Izquierda (Etapa Anterior) */}
          {prevStageId && onChangeStage && (
            <button
              onClick={() => onChangeStage(prevStageId)}
              className="group absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 bg-[#EDE7E0] hover:bg-[#B35F27] active:scale-95 border border-[#0A0D0B]/20 rounded-full text-[#0A0D0B] hover:text-[#EDE7E0] backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer"
              title="Etapa Anterior"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-[#0A0D0B] group-hover:stroke-[#EDE7E0] transition-colors" fill="none" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
          )}

          {/* Flecha Lateral Derecha (Etapa Siguiente) */}
          {nextStageId && onChangeStage && (
            <button
              onClick={() => onChangeStage(nextStageId)}
              className="group absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 bg-[#EDE7E0] hover:bg-[#B35F27] active:scale-95 border border-[#0A0D0B]/20 rounded-full text-[#0A0D0B] hover:text-[#EDE7E0] backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer"
              title="Etapa Siguiente"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-[#0A0D0B] group-hover:stroke-[#EDE7E0] transition-colors" fill="none" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          )}
        </div>

      {/* Leyenda de Brújula (Flotante a la Derecha) */}
      <div className="absolute bottom-7 right-6 z-20 hidden md:flex items-center gap-2 text-[#0A0D0B]/70 text-[9px] uppercase tracking-widest font-semibold bg-[#EDE7E0]/90 border border-[#0A0D0B]/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
        <Compass className="h-3.5 w-3.5 text-[#B35F27]" />
        Norte orientado hacia el mar (arriba)
      </div>

    </div>
  );
}
