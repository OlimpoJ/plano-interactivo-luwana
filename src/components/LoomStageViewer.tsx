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
  
  if (tagName === "polygon" || tagName === "polyline") {
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState({
    available: true,
    reserved: true,
    blocked: true,
    sold: true,
  });

  const hasAutoSelectedRef = useRef<boolean>(false);

  // Deep linking: auto-seleccionar lote si viene en ?lot= en URL (solo una vez al cargar)
  useEffect(() => {
    if (typeof window !== "undefined" && pins.length > 0 && !hasAutoSelectedRef.current) {
      const params = new URLSearchParams(window.location.search);
      const lotParam = params.get("lot");
      if (lotParam) {
        const found = pins.find(
          (p) =>
            p.lotId.toUpperCase() === lotParam.toUpperCase() ||
            p.lotData.rawId.toUpperCase() === lotParam.toUpperCase()
        );
        if (found) {
          hasAutoSelectedRef.current = true;
          onSelectLot(found.lotData);
        }
      }
    }
  }, [pins, onSelectLot]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return pins.filter(
      (p) =>
        p.lotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lotData.rawId.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, pins]);

  const STAGE_CONFIGS: Record<string, { name: string; svgUrl: string; bgImage: string }> = {
    etapa_1: { name: "Etapa 1", svgUrl: "/loom/loom_stage_1.svg", bgImage: "/loom/loom_stage_1_bg.webp" },
    etapa_2: { name: "Etapa 2", svgUrl: "/loom/loom_stage_2.svg", bgImage: "/loom/loom_stage_2_bg.webp" },
    etapa_3: { name: "Etapa 3", svgUrl: "/loom/loom_stage_3.svg", bgImage: "/loom/loom_stage_3_bg.webp" },
    etapa_4: { name: "Etapa 4", svgUrl: "/loom/loom_stage_4.svg", bgImage: "/loom/loom_stage_4_bg.webp" },
    etapa_5: { name: "Etapa 5", svgUrl: "/loom/loom_stage_5.svg", bgImage: "/loom/loom_stage_5_bg.webp" },
    etapa_6: { name: "Alma Beach", svgUrl: "", bgImage: "/loom/loom_stage_6_bg.webp" },
  };

  const currentConfig = STAGE_CONFIGS[stageId] || STAGE_CONFIGS["etapa_1"];
  const isAmenities = stageId === "etapa_6";
  const containerWidthClass = selectedLot 
    ? "w-full max-md:landscape:w-[55vw]" 
    : "w-full";
  const svgUrl = currentConfig.svgUrl;
  const bgImage = currentConfig.bgImage;
  const stageName = currentConfig.name;

  // Navegación de etapas activas (Etapas 1 a 5 y Alma Beach)
  const activeStages = ["etapa_1", "etapa_2", "etapa_3", "etapa_4", "etapa_5", "etapa_6"];
  const currentStageIndex = activeStages.indexOf(stageId);
  const prevStageId = currentStageIndex > 0 ? activeStages[currentStageIndex - 1] : null;
  const nextStageId = currentStageIndex < activeStages.length - 1 ? activeStages[currentStageIndex + 1] : null;

  // Cache en memoria RAM para cargar todas las etapas instantáneamente (0ms de retraso)
  const svgCacheRef = useRef<Record<string, { svgText: string; pins: ParsedPin[] }>>({});

  // Pre-cargar todas las imágenes WebP y SVGs de todas las etapas en segundo plano al montar el componente
  useEffect(() => {
    activeStages.forEach((stId) => {
      const cfg = STAGE_CONFIGS[stId];
      if (cfg) {
        // Pre-cargar imagen de fondo WebP en la caché del navegador
        const img = new Image();
        img.src = cfg.bgImage;

        // Pre-cargar SVG de la etapa en caché de memoria
        if (cfg.svgUrl && !svgCacheRef.current[cfg.svgUrl]) {
          fetch(cfg.svgUrl)
            .then((res) => res.text())
            .catch(() => {});
        }
      }
    });
  }, []);

  // Cargar y procesar el SVG de la etapa
  useEffect(() => {
    if (!svgUrl) {
      queueMicrotask(() => {
        setSvgText("");
        setPins([]);
      });
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

          const interactiveContainer = doc.querySelector("#INTERACTIVE_LOT_GROUPS");
          const circleElements = Array.from(
            interactiveContainer ? interactiveContainer.querySelectorAll("circle") : doc.querySelectorAll("circle")
          );
          const parsedCircles = circleElements.map((c) => {
            let parent: HTMLElement | null = c.parentElement;
            let manzana = "";
            let manzanaGroup: HTMLElement | null = null;

            while (parent) {
              const id = (parent.getAttribute("id") || "").toUpperCase();
              if (id.includes("PORTERIA") || id.includes("PORTERÍA")) { manzana = "PORTERIA"; manzanaGroup = parent; break; }
              if (id.includes("PARQUE_1")) { manzana = "PARQUE_1"; manzanaGroup = parent; break; }
              if (id.includes("PARQUE_2")) { manzana = "PARQUE_2"; manzanaGroup = parent; break; }
              if (id.includes("PARQUE")) { manzana = "PARQUE"; manzanaGroup = parent; break; }
              if (id.includes("CLUB") || id.includes("HOUSE") || id.includes("CASA_CLUB")) { manzana = "CLUB_HOUSE"; manzanaGroup = parent; break; }
              
              const mzMatch = id.match(/(?:MANZANA|MANZONA|LOTES|TEXTOS|LOTGROUP)_?([A-L])/i);
              if (mzMatch) {
                manzana = mzMatch[1].toUpperCase();
                manzanaGroup = parent;
                break;
              }
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
              const dataLot = c.getAttribute("data-lot") || circleParent.getAttribute("data-lot") || circleParent.getAttribute("id") || "";
              let decodedNum: number | null = null;

              const idNumMatch = dataLot.match(/(?:[A-L]|g)[-_]?(\d+)/i);
              if (idNumMatch) {
                decodedNum = parseInt(idNumMatch[1], 10);
              } else {
                decodedNum = decodeSvgNumber(circleParent);
              }

              let num = 0;
              if (decodedNum !== null && decodedNum > 0) {
                num = decodedNum;
              } else {
                if (!counters[manzana]) counters[manzana] = 0;
                counters[manzana] += 1;
                num = counters[manzana];
              }

              let lotId = `${manzana}-${num}`;
              if (manzana === "PORTERIA") lotId = "PORTERIA";
              if (manzana === "PARQUE_1") lotId = "PARQUE_1";
              if (manzana === "PARQUE_2") lotId = "PARQUE_2";
              if (manzana === "CLUB_HOUSE") lotId = "CLUB_HOUSE";

              const xPercent = (cx / viewBoxWidth) * 100;
              const yPercent = (cy / viewBoxHeight) * 100;

              let lotData = lots.find((l) => l.id.toUpperCase() === lotId.toUpperCase());
              if (!lotData) {
                if (lotId === "PORTERIA") {
                  lotData = {
                    id: "PORTERIA",
                    rawId: "Portería",
                    area: "Área Común",
                    location: "Acceso Principal 24/7",
                    status: "common",
                    statusRaw: "AMENIDAD",
                    totalPrice: "Área Común",
                    downPayment: "-",
                    financing: "-",
                    finalPayment: "-",
                  };
                } else if (lotId.includes("PARQUE")) {
                  const pNum = lotId === "PARQUE_1" ? "1" : "2";
                  lotData = {
                    id: lotId,
                    rawId: `Parque ${pNum}`,
                    area: "686 m²",
                    location: "Zona Verde & Senderos",
                    status: "common",
                    statusRaw: "AMENIDAD",
                    totalPrice: "Área Común",
                    downPayment: "-",
                    financing: "-",
                    finalPayment: "-",
                  };
                } else if (lotId.includes("CLUB") || lotId.includes("HOUSE") || lotId === "CLUB_HOUSE") {
                  lotData = {
                    id: "CLUB_HOUSE",
                    rawId: "Club House",
                    area: "Área Social",
                    location: "Zona de Piscinas, Canchas & Beach Club",
                    status: "common",
                    statusRaw: "AMENIDAD",
                    totalPrice: "Área Común",
                    downPayment: "-",
                    financing: "-",
                    finalPayment: "-",
                  };
                } else {
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
              }

              let lotGroup: HTMLElement = c.parentElement as HTMLElement;
              if (lotGroup.querySelectorAll("circle").length > 1) {
                const newG = doc.createElementNS("http://www.w3.org/2000/svg", "g") as unknown as HTMLElement;
                c.parentElement.insertBefore(newG, c);
                newG.appendChild(c);
                lotGroup = newG;
              }
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

          // 2. Recolectar todas las formas geométricas candidatas para lotes y amenidades
          const candidateShapes: { element: Element; centroid: { x: number; y: number } }[] = [];
          const allShapes = doc.querySelectorAll("rect, path, polygon, polyline");

          allShapes.forEach((shape) => {
            const pGroup = shape.closest("g");
            const pGroupId = (pGroup?.getAttribute("id") || "").toUpperCase();
            if (pGroupId.includes("TEXTOS") || pGroupId.includes("TEXTO")) {
              return;
            }
            if (pGroup && pGroup.querySelector("circle") && pGroup.children.length === 1) {
              return;
            }
            const shapeClass = shape.getAttribute("class") || "";
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
            
            // Si el grupo del lote ya tiene su polígono oficial pre-construido (.lot-polygon), NO insertar una segunda forma duplicada
            const existingPolygon = pair.circle.lotGroup.querySelector(".lot-polygon");
            if (existingPolygon) {
              assignedLotShapes.set(pair.circle.lotGroup, existingPolygon);
            } else {
              assignedLotShapes.set(pair.circle.lotGroup, pair.shape);
              pair.circle.lotGroup.insertBefore(pair.shape, pair.circle.lotGroup.firstChild);
            }
          });

          // Crear una capa dedicada al final del SVG para TODOS los pines (para que SIEMPRE queden por encima de cualquier polígono/hover)
          let pinsLayer = doc.querySelector("#ALL_PINS_LAYER");
          if (!pinsLayer) {
            pinsLayer = doc.createElementNS("http://www.w3.org/2000/svg", "g");
            pinsLayer.setAttribute("id", "ALL_PINS_LAYER");
            pinsLayer.setAttribute("style", "pointer-events: none;");
            doc.querySelector("svg")?.appendChild(pinsLayer);
          }

          // 5. Inyectar pins visuales glassmorphic en la capa superior #ALL_PINS_LAYER
          circleItems.forEach((item) => {
            const { cx, cy, lotId, lotGroup, element: c } = item;

            // Garantizar que el grupo del lote tenga ÚNICAMENTE 1 polígono de contorno (eliminando formas duplicadas)
            const lotShapes = Array.from(lotGroup.children).filter((child) => {
              const tag = child.tagName.toLowerCase();
              return ["path", "polygon", "rect", "polyline"].includes(tag) && !(child as Element).classList.contains("svg-pin-rect");
            });

            if (lotShapes.length > 1) {
              // Conservar el primer polígono oficial y eliminar cualquier forma duplicada
              lotShapes.slice(1).forEach((extra) => extra.remove());
            }

            c.remove(); // Remover el círculo original para reemplazarlo por la cápsula en la capa superior

            let displayLabel = lotId.replace("-", "");
            if (lotId === "PORTERIA") displayLabel = "PORTERÍA";
            if (lotId === "PARQUE_1") displayLabel = "PARQUE 1";
            if (lotId === "PARQUE_2") displayLabel = "PARQUE 2";
            if (lotId === "CLUB_HOUSE" || lotId.includes("CLUB")) displayLabel = "CLUB HOUSE";

            const isLongLabel = displayLabel.length > 5;
            const fontSize = isLongLabel ? "22" : "28";
            const badgeWidth = isLongLabel ? Math.max(170, displayLabel.length * 18 + 36) : 115;

            const pinGroup = doc.createElementNS("http://www.w3.org/2000/svg", "g");
            pinGroup.setAttribute("id", `PINGROUP_${lotId}`);
            pinGroup.setAttribute("class", "svg-pin-group");
            pinGroup.setAttribute("style", "pointer-events: none;");

            const pinText = doc.createElementNS("http://www.w3.org/2000/svg", "text");
            pinText.setAttribute("x", cx.toString());
            pinText.setAttribute("y", cy.toString());
            pinText.setAttribute("text-anchor", "middle");
            pinText.setAttribute("dominant-baseline", "central");
            pinText.setAttribute("class", "svg-pin-text");
            pinText.setAttribute("id", `PIN_${lotId}`);
            pinText.setAttribute("font-size", fontSize);
            pinText.setAttribute("font-weight", "800");
            pinText.setAttribute("style", "transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;");
            pinText.textContent = displayLabel;

            const pinRect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
            pinRect.setAttribute("x", (cx - badgeWidth / 2).toString());
            pinRect.setAttribute("y", (cy - 33).toString());
            pinRect.setAttribute("width", badgeWidth.toString());
            pinRect.setAttribute("height", "66");
            pinRect.setAttribute("rx", "33");
            pinRect.setAttribute("class", "svg-pin-rect");
            pinRect.setAttribute("id", `PIN_RECT_${lotId}`);
            pinRect.setAttribute("style", "transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;");

            pinGroup.appendChild(pinRect);
            pinGroup.appendChild(pinText);
            pinsLayer?.appendChild(pinGroup);
          });

          // Serializar el SVG modificado
          const serializer = new XMLSerializer();
          let modifiedSvgText = serializer.serializeToString(doc);
          
          // Eliminar la declaración XML y prefijos ns0: para evitar que el parser HTML5 rompa el SVG
          modifiedSvgText = modifiedSvgText
            .replace(/<\?xml[^>]*\?>/gi, "")
            .replace(/ns0:/g, "")
            .replace(/:ns0/g, "")
            .replace(/xmlns:ns0="[^"]*"/g, "")
            .trim();
          
          // Guardar en la caché en RAM para que el cambio entre etapas sea 100% instantáneo (0ms)
          svgCacheRef.current[svgUrl] = { svgText: modifiedSvgText, pins: finalPins };

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

  // Generar reglas CSS dinámicas por cada lote usando selectores de atributos ultra-robustos
  const dynamicLotStyles = useMemo(() => {
    return pins
      .map((pin) => {
        const lotId = pin.lotId;
        const status = pin.lotData.status;
        const isSelected = selectedLot?.id === lotId;
        const isHovered = hoveredPin?.lotId === lotId;
        const isAmenity =
          lotId === "PORTERIA" ||
          lotId === "PARQUE_1" ||
          lotId === "PARQUE_2" ||
          lotId.includes("PARQUE") ||
          lotId.includes("PORTERIA") ||
          status === "common";

        const isFilteredOut =
          !isAmenity &&
          ((status === "available" && !activeFilters.available) ||
            (status === "reserved" && !activeFilters.reserved) ||
            (status === "blocked" && !activeFilters.blocked) ||
            (status === "sold" && !activeFilters.sold));

        if (isFilteredOut) {
          return `
            g[id="LOTGROUP_${lotId}"], g[id="PINGROUP_${lotId}"] {
              display: none !important;
            }
          `;
        }

        let baseColor = "#10b981"; // Verde para disponibles
        let strokeColorHover = "#059669";
        let cursor = "pointer";

        if (isAmenity) {
          baseColor = "#B35F27"; // Cobre Terracota para Amenidades
          strokeColorHover = "#8D4619";
          cursor = "pointer"; // Seleccionable con puntero de mano
        } else if (status === "reserved") {
          baseColor = "#f59e0b"; // Naranja para Reservados
          strokeColorHover = "#d97706";
          cursor = "pointer";
        } else if (status === "blocked") {
          baseColor = "#3b82f6"; // Azul Cobalto para Bloqueados
          strokeColorHover = "#2563eb";
          cursor = "not-allowed";
        } else if (status === "sold") {
          baseColor = "#ef4444"; // Rojo para Vendidos
          strokeColorHover = "#dc2626";
          cursor = "not-allowed";
        }

        const pinDisplay = "block";
        const pinScale = isHovered || isSelected ? 'scale(1.12)' : 'scale(1)';
        const pinFill = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.96)';
        const pinStroke = isHovered ? baseColor : (isSelected ? '#B35F27' : 'rgba(10, 13, 11, 0.35)');
        const pinStrokeWidth = isHovered ? '3px' : (isSelected ? '3.5px' : '1.8px');

        const polyFillOpacity = isHovered ? '0.45' : (isAmenity ? '0.35' : '0.22');
        const polyStroke = isHovered ? strokeColorHover : baseColor;
        const polyStrokeWidth = isHovered ? '3.5px' : '2px';

        return `
        /* Polígono del lote o amenidad (capa inferior): controlado de forma única por estado JS */
        g[id="LOTGROUP_${lotId}"] path,
        g[id="LOTGROUP_${lotId}"] polyline,
        g[id="LOTGROUP_${lotId}"] polygon,
        g[id="LOTGROUP_${lotId}"] rect:not(.svg-pin-rect) {
          fill: ${baseColor} !important;
          fill-opacity: ${polyFillOpacity} !important;
          stroke: ${polyStroke} !important;
          stroke-width: ${polyStrokeWidth} !important;
          transition: all 0.25s ease !important;
          cursor: ${cursor} !important;
          ${isHovered ? `filter: drop-shadow(0 0 6px ${baseColor}) !important;` : ''}
        }

        /* Ocultar círculo nativo de Illustrator */
        g[id="LOTGROUP_${lotId}"] circle.st2,
        g[id="LOTGROUP_${lotId}"] circle {
          display: none !important;
        }

        /* Ocultar capas estáticas de texto del SVG nativo */
        g[id="LOTGROUP_${lotId}"] text:not(.svg-pin-text) {
          display: none !important;
        }

        /* Estilos del rect de fondo (pin de lote) en la capa superior #ALL_PINS_LAYER */
        g[id="PINGROUP_${lotId}"] rect.svg-pin-rect {
          display: ${pinDisplay} !important;
          fill: ${pinFill} !important;
          stroke: ${pinStroke} !important;
          stroke-width: ${pinStrokeWidth} !important;
          transform: ${pinScale} !important;
          transform-origin: ${pin.cx}px ${pin.cy}px !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          pointer-events: none !important;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.18)) !important;
        }

        /* Texto vectorial inyectado (número / nombre) en la capa superior #ALL_PINS_LAYER */
        g[id="PINGROUP_${lotId}"] text.svg-pin-text {
          display: ${pinDisplay} !important;
          font-size: ${isSelected || isHovered ? '28px' : '26px'} !important;
          font-weight: ${isSelected || isHovered ? '900' : '800'} !important;
          fill: #0A0D0B !important;
          stroke: #FFFFFF !important;
          stroke-width: 1.5px !important;
          paint-order: stroke fill !important;
          transform: ${pinScale} !important;
          transform-origin: ${pin.cx}px ${pin.cy}px !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          pointer-events: none !important;
        }
      `;
      })
      .join("");
  }, [pins, selectedLot, activeFilters, hoveredPin]);

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

      {/* Barra Superior Flotante de Controles (Master Plan + Búsqueda Rápida de Lotes) */}
      <div className="absolute top-4 left-16 sm:left-18 z-30 flex items-center gap-2 pointer-events-auto">
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

        {/* Buscador Rápido de Lote */}
        {!isAmenities && (
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-[#0A0D0B]/15 rounded-full shadow-md backdrop-blur-md">
              <svg className="w-3 h-3 text-[#B35F27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar lote (ej: B-22)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[10px] text-[#0A0D0B] placeholder-[#0A0D0B]/40 focus:outline-none w-24 sm:w-36 font-semibold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#0A0D0B]/40 hover:text-[#0A0D0B] text-xs">
                  &times;
                </button>
              )}
            </div>

            {/* Resultados de Búsqueda */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-[#EDE7E0] border border-[#B35F27]/30 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                {searchResults.map((pin) => (
                  <button
                    key={pin.lotId}
                    onClick={() => {
                      onSelectLot(pin.lotData);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-white text-left transition-colors text-[11px]"
                  >
                    <span className="font-serif font-bold text-[#0A0D0B]">{pin.lotId}</span>
                    <span className="text-[8px] uppercase font-bold text-[#B35F27] bg-[#B35F27]/10 px-1.5 py-0.5 rounded">
                      {pin.lotData.statusRaw || pin.lotData.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel de Filtros / Resumen de Amenidades Flotante */}
      {isAmenities && (
        <div className="absolute top-4 right-16 z-30 pointer-events-auto bg-[#699385]/20 border border-[#699385]/40 px-3 py-1.5 rounded-full text-[9px] font-semibold text-[#699385] tracking-widest uppercase backdrop-blur-md flex items-center gap-2 shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#699385] animate-pulse"></span>
          Amenidades: 7
        </div>
      )}

      {/* Área del Plano */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-10">
          {/* Ocultar textos nativos y líneas perimetrales CAD fuera de los lotes SOLO en el SVG del mapa */}
          <style dangerouslySetInnerHTML={{ __html: `
            .loom-stage-map-svg svg text:not(.svg-pin-text) {
              display: none !important;
            }

            /* Ocultar polígonos y líneas perimetrales (CAD/Illustrator) que no corresponden a lotes en el mapa */
            .loom-stage-map-svg svg path:not(g[id^='LOTGROUP_'] *),
            .loom-stage-map-svg svg polyline:not(g[id^='LOTGROUP_'] *),
            .loom-stage-map-svg svg polygon:not(g[id^='LOTGROUP_'] *),
            .loom-stage-map-svg svg line:not(g[id^='LOTGROUP_'] *) {
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
                      if (pin) {
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
                      {hoveredPin.lotId === "PORTERIA" || hoveredPin.lotData.rawId.toLowerCase().includes("porteria")
                        ? "PORTERÍA"
                        : hoveredPin.lotId === "PARQUE_1"
                        ? "PARQUE 1"
                        : hoveredPin.lotId === "PARQUE_2"
                        ? "PARQUE 2"
                        : hoveredPin.lotId.includes("PARQUE")
                        ? hoveredPin.lotData.rawId.replace("_", " ").toUpperCase()
                        : `LOTE ${hoveredPin.lotData.rawId}`}
                    </div>
                    <div className="space-y-0.5 min-w-[110px]">
                      <p className="flex justify-between gap-4">
                        <span className="text-[#0A0D0B]/60">Área:</span>
                        <span className="font-semibold">
                          {hoveredPin.lotData.area.includes("m²") || hoveredPin.lotData.area.includes("Común")
                            ? hoveredPin.lotData.area
                            : `${hoveredPin.lotData.area} m²`}
                        </span>
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
      <div className="absolute bottom-7 right-6 z-20 hidden md:flex items-center gap-2 text-[#0A0D0B]/70 text-[9px] uppercase tracking-widest font-semibold bg-[#EDE7E0]/90 border border-[#0A0D0B]/10 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
        <Compass className="h-3.5 w-3.5 text-[#B35F27] rotate-[45deg]" />
        Norte orientado hacia el mar (Derecha / Playa)
      </div>

    </div>
  );
}
