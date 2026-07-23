"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

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

interface LoomLotZoomCanvasProps {
  stageId: string;
  selectedLot: Lot;
  className?: string;
}

export default function LoomLotZoomCanvas({ stageId, selectedLot, className = "" }: LoomLotZoomCanvasProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background image per stage
  const stageImages: Record<string, string> = {
    etapa_1: "/loom/loom_stage_1_bg.webp",
    etapa_2: "/loom/loom_stage_2_bg.webp",
    etapa_6: "/loom/loom_stage_6_bg.webp",
  };

  const svgUrls: Record<string, string> = {
    etapa_1: "/loom/loom_stage_1.svg",
    etapa_2: "/loom/loom_stage_2.svg",
  };

  const bgImage = stageImages[stageId] || "/loom/loom_stage_1_bg.webp";
  const svgUrl = svgUrls[stageId] || "/loom/loom_stage_1.svg";

  useEffect(() => {
    fetch(svgUrl)
      .then((res) => res.text())
      .then((text) => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "image/svg+xml");
          const viewBoxAttr = doc.documentElement.getAttribute("viewBox") || "0 0 3840 2160";
          const [vbX, vbY, vbW, vbH] = viewBoxAttr.split(" ").map(Number);

          const lotIdClean = selectedLot.id.toUpperCase();
          const circleElements = Array.from(doc.querySelectorAll("circle"));

          let targetCx = (vbW || 3840) / 2;
          let targetCy = (vbH || 2160) / 2;
          let foundTarget = false;

          // Search circles to find exact lot centroid
          circleElements.forEach((c) => {
            let parent = c.parentElement;
            let manzana = "";
            while (parent) {
              const id = parent.getAttribute("id") || "";
              if (id.includes("MANZANA_A")) manzana = "A";
              else if (id.includes("MANZANA_B")) manzana = "B";
              else if (id.includes("MANZANA_C")) manzana = "C";
              parent = parent.parentElement;
            }

            const cx = parseFloat(c.getAttribute("cx") || "0");
            const cy = parseFloat(c.getAttribute("cy") || "0");
            
            // Check if circle is in the same area / matching lot ID
            const textNumMatch = c.parentElement?.textContent?.replace(/\D/g, "");
            if (manzana && textNumMatch) {
              const checkId = `${manzana}-${textNumMatch}`.toUpperCase();
              if (checkId === lotIdClean) {
                targetCx = cx;
                targetCy = cy;
                foundTarget = true;
              }
            }
          });

          // Fallback centroid heuristic if exact circle match wasn't found
          if (!foundTarget) {
            const letter = selectedLot.id.charAt(0).toUpperCase();
            if (letter === "A") { targetCx = 750; targetCy = 1500; }
            else if (letter === "B") { targetCx = 1200; targetCy = 1400; }
            else if (letter === "C") { targetCx = 1800; targetCy = 1400; }
          }

          // Calculate tight zoomed viewBox centered on selected lot (~800x500 box)
          const zoomWidth = 850;
          const zoomHeight = 550;
          const newVbX = Math.max(0, targetCx - zoomWidth / 2);
          const newVbY = Math.max(0, targetCy - zoomHeight / 2);

          doc.documentElement.setAttribute("viewBox", `${newVbX} ${newVbY} ${zoomWidth} ${zoomHeight}`);
          doc.documentElement.setAttribute("preserveAspectRatio", "xMidYMid meet");

          // Styling: highlight all shapes except current lot
          const serializer = new XMLSerializer();
          setSvgContent(serializer.serializeToString(doc));
        } catch (err) {
          console.error("Error setting up zoomed lot canvas:", err);
        }
      })
      .catch((err) => console.error("Error loading SVG for lot zoom:", err));
  }, [svgUrl, selectedLot]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#051415] border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${
        isMaximized ? "fixed inset-0 z-50 rounded-none border-none" : "w-full h-full min-h-[380px] lg:min-h-[480px]"
      } ${className}`}
    >
      {/* Background render image */}
      <div
        className="w-full h-full relative transition-transform duration-500 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <img
          src={bgImage}
          alt={`Vista enfocada ${selectedLot.rawId}`}
          className="absolute inset-0 w-full h-full object-cover opacity-85 select-none pointer-events-none"
        />

        {/* Dynamic Vector Overlay */}
        {svgContent && (
          <div
            className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover pointer-events-none opacity-90 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Glassmorphic Header Ribbon sobre el mapa */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#070c16]/80 border border-[#dbaa67]/30 rounded-full backdrop-blur-md shadow-lg">
          <span className="h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            LOTE <span className="text-[#dbaa67]">{selectedLot.rawId}</span>
          </span>
          <span className="h-3 w-[1px] bg-white/20" />
          <span className="text-[11px] font-semibold text-white/70">
            {selectedLot.area} m²
          </span>
        </div>

        {/* Badge Disponibilidad */}
        <span className="hidden sm:inline-block px-3 py-1 bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
          {selectedLot.statusRaw || "DISPONIBLE"}
        </span>
      </div>

      {/* Floating Interactive Controls (Zoom +, Zoom -, Reset, Maximize) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-[#070c16]/85 border border-white/15 rounded-full backdrop-blur-md shadow-2xl pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-white/10 active:scale-95 text-white/80 hover:text-white rounded-full transition-all"
          title="Acercar (+)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-white/10 active:scale-95 text-white/80 hover:text-white rounded-full transition-all"
          title="Alejar (-)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleResetZoom}
          className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#dbaa67] hover:bg-white/10 rounded-full transition-all"
          title="Restablecer vista"
        >
          RESET
        </button>
        <span className="h-4 w-[1px] bg-white/20 mx-0.5" />
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="p-2 hover:bg-white/10 active:scale-95 text-white/80 hover:text-white rounded-full transition-all"
          title={isMaximized ? "Restaurar tamaño" : "Pantalla completa"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMaximized ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 5l5 5m0 0l-5 0m5 0l0-5" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
