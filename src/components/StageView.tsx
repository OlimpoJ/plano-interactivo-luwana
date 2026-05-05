import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SvgMap = memo(({ svgContent, liveLots, onLotClick, stageNumber }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    svg.setAttribute("preserveAspectRatio", "none");

    const embeddedImages = svg.querySelectorAll("image");
    embeddedImages.forEach((img) => img.remove());

    const allShapes = svg.querySelectorAll("path, polygon, rect, polyline, circle, ellipse, text, tspan");
    allShapes.forEach((shape) => {
      const el = shape as SVGElement;
      
      const lotIdRaw = el.getAttribute("id") || el.parentElement?.getAttribute("id") || "";
      const decodedIdRaw = lotIdRaw.replace(/_x([0-9a-fA-F]{2,})_/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
      
      const specialZones = ['ZONA_A', 'ZONA_B', 'ZONA_C', 'ZONA_D', 'ZONA_E', 'ZONA_F', 'ZONA_G', 'ZONA_H', 'SERVIDUMBRE', 'VÍA'];
      let isSpecialZone = false;
      let specialZoneId = "";
      const upperDecoded = decodedIdRaw.toUpperCase();
      const upperRawId = lotIdRaw.toUpperCase();
      
      for (const zone of specialZones) {
          if (upperDecoded.startsWith(zone.toUpperCase()) || upperRawId.startsWith(zone.toUpperCase())) {
              isSpecialZone = true;
              specialZoneId = zone;
              break;
          }
      }

      const matchDigits = decodedIdRaw.match(/\d+/);
      const lotNumStrRaw = matchDigits ? matchDigits[0] : '';
      const parsedLotNum = parseInt(lotNumStrRaw);
      
      // Ensure we ignore background elements but allow special zones
      if (!isSpecialZone && (!lotNumStrRaw || isNaN(parsedLotNum) || parsedLotNum > 500)) {
        el.style.pointerEvents = "none";
        return;
      }
      
      const lotData = isSpecialZone ? null : liveLots.find((l: any) => parseInt(l.id) === parsedLotNum);
      const status = isSpecialZone ? "common" : (lotData?.status || "available");

      let baseFill = "rgba(34, 197, 94, 0.35)";
      let baseStroke = "rgba(34, 197, 94, 0.8)";
      let hoverFill = "rgba(34, 197, 94, 0.6)";
      let hoverStroke = "#ffffff";
      
      if (status === "sold") {
        baseFill = "rgba(239, 68, 68, 0.35)";
        baseStroke = "rgba(239, 68, 68, 0.8)";
        hoverFill = "rgba(239, 68, 68, 0.6)";
        hoverStroke = "#ffffff";
      } else if (status === "reserved") {
        baseFill = "rgba(234, 179, 8, 0.35)";
        baseStroke = "rgba(234, 179, 8, 0.8)";
        hoverFill = "rgba(234, 179, 8, 0.6)";
        hoverStroke = "#ffffff";
      } else if (status === "common") {
        baseFill = "transparent"; // Transparente para dejar ver el fondo
        baseStroke = "rgba(255, 255, 255, 0.3)";
        hoverFill = "rgba(255, 255, 255, 0.15)"; // Efecto de cristal en hover
        hoverStroke = "#ffffff";
      }

      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('fill', baseFill, 'important');
      el.style.setProperty('stroke', baseStroke, 'important');
      el.style.setProperty('stroke-width', '1px', 'important');
      el.style.setProperty('cursor', 'pointer', 'important');
      el.style.setProperty('pointer-events', 'all', 'important');
      el.style.setProperty('transition', 'all 0.3s ease', 'important');

      const handleEnter = (e: Event) => {
        el.style.setProperty('fill', hoverFill, 'important');
        el.style.setProperty('stroke', hoverStroke, 'important');
        el.style.setProperty('stroke-width', '2px', 'important');
      };

      const handleLeave = () => {
        el.style.setProperty('fill', baseFill, 'important');
        el.style.setProperty('stroke', baseStroke, 'important');
        el.style.setProperty('stroke-width', '1px', 'important');
      };

      const handleClick = () => {
        if (isSpecialZone) {
            const nameMap: Record<string, string> = {
                'ZONA_A': 'Portería',
                'ZONA_B': 'Zona de Mascotas',
                'ZONA_C': 'Club House',
                'ZONA_D': 'Zona Deportiva',
                'ZONA_E': 'Corredor Playero',
                'ZONA_F': 'Club de Playa Luwana',
                'ZONA_G': 'Club de Playa Anaiwa',
                'ZONA_H': 'Alma Beach',
                'SERVIDUMBRE': 'Servidumbre',
                'VÍA': 'Vía Principal'
            };
            onLotClick({
                rawId: nameMap[specialZoneId] || specialZoneId,
                area: "N/A",
                statusRaw: "Zona Común",
                status: "common",
                pricePerM2: "N/A",
                totalPrice: "N/A",
                separation: "N/A",
                downPayment: "N/A",
                financing: "N/A"
            }, specialZoneId);
        } else {
            onLotClick(lotData, lotNumStrRaw);
        }
      };

      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
      el.addEventListener("click", handleClick);
      el.addEventListener("touchstart", handleEnter, { passive: true });
      el.addEventListener("touchend", handleLeave, { passive: true });

      (el as any).cleanup = () => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
        el.removeEventListener("click", handleClick);
        el.removeEventListener("touchstart", handleEnter);
        el.removeEventListener("touchend", handleLeave);
      };
    });

    return () => {
      allShapes.forEach((shape) => {
        const el = shape as any;
        if (el.cleanup) el.cleanup();
      });
    };
  }, [svgContent, liveLots, onLotClick]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black shadow-2xl rounded-xl sm:rounded-2xl"
    >
      <img
        src={`/LUWANA_${stageNumber}_bg.jpg`}
        alt={`Masterplan Luwana Etapa ${stageNumber}`}
        className="w-full h-auto block pointer-events-none"
      />
      {svgContent && (
        <div
          className="absolute inset-0 z-20 [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
});

export default function StageView({ stageId, onBack, onNext }: { stageId: string; onBack: () => void; onNext?: () => void }) {
  const [svgContent, setSvgContent] = useState("");
  const [liveLots, setLiveLots] = useState<any[]>([]);
  const [selectedLotData, setSelectedLotData] = useState<any | null>(null);

  const stageNumber = stageId.split('-')[1];

  let stageTitle = "";
  if (stageNumber === "1") stageTitle = "LOTES DEL 1 AL 60";
  else if (stageNumber === "2") stageTitle = "LOTES DEL 61 AL 122";
  else if (stageNumber === "3") stageTitle = "CLUB DE PLAYA Y AMENIDADES";

  useEffect(() => {
    fetch(`/LUWANA ${stageNumber}.svg`)
      .then((res) => res.text())
      .then((data) => setSvgContent(data))
      .catch((err) => console.error("Error loading SVG:", err));

    fetch('/api/lots')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.lots) {
          setLiveLots(data.lots);
        }
      })
      .catch(err => console.error("Error fetching live lots data:", err));
  }, [stageNumber]);

  const handleLotClick = useCallback((lotData: any, lotNumStrRaw: string) => {
    if (lotData) {
      setSelectedLotData(lotData);
    } else {
      setSelectedLotData({
        rawId: `Lote ${lotNumStrRaw}`,
        area: "TBD",
        statusRaw: "Disponible",
        status: "available",
        pricePerM2: "TBD",
        totalPrice: "TBD",
        separation: "TBD",
        downPayment: "TBD",
        financing: "TBD"
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-24 pb-0 px-0 bg-black">
      
      {/* Background blurred image for ambiance */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <img
          src={`/LUWANA_${stageNumber}_bg.jpg`}
          alt="Background blur"
          className="w-full h-full object-cover opacity-20 blur-xl scale-110 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />
      </div>

      <div className="text-center mb-6 sm:mb-8 relative z-10 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-3" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
          {stageTitle}
        </h1>
        <p className="text-[10px] sm:text-xs text-[#CBAA85] uppercase tracking-[0.2em] font-medium">
          Selecciona tu lote ideal
        </p>
      </div>

      <div className="relative z-10 w-[95%] sm:w-[80%] max-w-[1600px] mx-auto flex-grow bg-[#141b18] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10 overflow-hidden">
        
        {/* Top Left Navigation Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 text-[#CBAA85] hover:text-white transition-all bg-black/60 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-[#CBAA85]/40 hover:bg-[#CBAA85]/20 hover:border-[#CBAA85] text-xs sm:text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <ArrowLeft size={16} /> Volver a Vista General
        </button>

        {/* Top Right Navigation Button */}
        {onNext && (
          <button 
            onClick={onNext}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 text-[#CBAA85] hover:text-white transition-all bg-black/60 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-[#CBAA85]/40 hover:bg-[#CBAA85]/20 hover:border-[#CBAA85] text-xs sm:text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            Siguiente Etapa <ArrowRight size={16} />
          </button>
        )}

        <SvgMap 
          svgContent={svgContent} 
          liveLots={liveLots} 
          onLotClick={handleLotClick} 
          stageNumber={stageNumber} 
        />
      </div>

      {/* Lot Information Sidebar (Replaces Modal) */}
      <AnimatePresence>
        {selectedLotData && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] z-[100] bg-[#141b18]/95 backdrop-blur-xl border-l border-[#CBAA85]/30 p-6 sm:p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Decorative top gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CBAA85] to-transparent" />
            
            <div className="flex justify-between items-start mb-8 mt-4">
              <div>
                <h3 className="text-sm text-[#CBAA85] tracking-[0.2em] uppercase font-light mb-1">Información de Unidad</h3>
                <h2 className="text-4xl font-serif text-white">{selectedLotData.rawId}</h2>
              </div>
              
              {/* Status Badge */}
              <div className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase
                ${selectedLotData.status === 'available' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
                  selectedLotData.status === 'reserved' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' :
                  selectedLotData.status === 'common' ? 'bg-[#14b8a6]/10 border-[#14b8a6]/50 text-[#14b8a6]' :
                  'bg-red-500/10 border-red-500/50 text-red-400'
                }`}
              >
                {selectedLotData.statusRaw || selectedLotData.status}
              </div>
            </div>

            {selectedLotData.status !== 'common' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Área Total</p>
                    <p className="text-white font-medium text-lg">{selectedLotData.area} m²</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Ubicación</p>
                    <p className="text-white font-medium capitalize text-lg">{selectedLotData.location?.toLowerCase() || 'Medianero'}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-5 rounded-xl border border-[#CBAA85]/30 bg-gradient-to-br from-white/5 to-transparent">
                  <p className="text-[#CBAA85] text-xs uppercase tracking-wider mb-2">Valor Total</p>
                  <p className="text-3xl text-white font-serif">{selectedLotData.totalPrice || 'Por definir'}</p>
                  <p className="text-white/40 text-sm mt-2">Valor x m²: {selectedLotData.pricePerM2}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Separación</p>
                    <p className="text-white text-base font-medium">$ 5.000.000</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Cuota Inicial (20%)</p>
                    <p className="text-white text-base font-medium">{selectedLotData.downPayment}</p>
                  </div>
                </div>
                
                {selectedLotData.financing && selectedLotData.financing !== '' && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white/50 text-xs uppercase tracking-wider">Financiación (60%)</p>
                      <p className="text-white text-base font-medium">
                        {`$ ${(parseInt((selectedLotData.downPayment || '').replace(/[^\d]/g, ''), 10) * 3 || 0).toLocaleString('en-US')}`}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">36 Cuotas Mensuales de</p>
                      <p className="text-white/80 text-sm font-medium">{selectedLotData.financing}</p>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <p className="text-white/50 text-xs uppercase tracking-wider">Cuota Final (20%)</p>
                  <p className="text-white text-base font-medium">{selectedLotData.downPayment}</p>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 pb-8">
              {selectedLotData.status === 'available' && (
                <button 
                  onClick={() => {
                    if (window.top !== window.self) {
                      // Estamos dentro de un iframe
                      window.parent.postMessage({
                        type: 'LOT_SELECTED',
                        payload: {
                          lotId: selectedLotData.rawId,
                          price: selectedLotData.totalPrice
                        }
                      }, '*');
                    } else {
                      // No estamos en un iframe
                      window.location.href = "https://patrimofy.com/es/luwana#contacto";
                    }
                  }}
                  className="w-full py-4 px-4 rounded-full bg-[#CBAA85] hover:bg-[#b59573] text-black transition-colors text-base font-bold tracking-wide shadow-[0_0_20px_rgba(203,170,133,0.3)]"
                >
                  Me Interesa
                </button>
              )}
              <button 
                onClick={() => setSelectedLotData(null)}
                className="w-full py-4 px-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-base font-medium tracking-wide"
              >
                Cerrar Panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
