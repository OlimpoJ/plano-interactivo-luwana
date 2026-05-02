"use client";

import { useEffect, useRef, useState } from "react";
import type { Lot } from "@/data/lots";
import { STATUS_CONFIG } from "@/data/lots";
import { motion, AnimatePresence } from "framer-motion";

interface InteractiveSVGMapProps {
    svgUrl: string;
    lots: Lot[];
    selectedLot: Lot | null;
    onSelectLot: (lot: Lot) => void;
}

const decodeIllustratorId = (id: string) => {
    if (!id) return '';
    try {
        let decoded = id.replace(/_x([0-9A-Fa-f]{2})_/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
        decoded = decoded.replace(/_\d{5,}.*$/, '');
        return decoded.replace(/_$/, '');
    } catch(e) {
        return id;
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price);
};

export default function InteractiveSVGMap({ svgUrl, lots, selectedLot, onSelectLot }: InteractiveSVGMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>("");
    const [mounted, setMounted] = useState(false);
    
    // Tooltip States
    const [hoveredLotInfo, setHoveredLotInfo] = useState<Lot | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        fetch(svgUrl)
            .then(res => res.text())
            .then(text => {
                let processedText = text;
                if (processedText.includes('viewBox="0 0 3840 2160"')) {
                    processedText = processedText.replace(/viewBox="0 0 3840 2160"/g, 'viewBox="0 600 3840 960"');
                }
                setSvgContent(processedText);
            })
            .catch(err => console.error("Error loading SVG:", err));
    }, [svgUrl, mounted]);

    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        const handlePolygonClick = (e: Event) => {
            const target = e.currentTarget as SVGElement;
            const loteIdRaw = target.getAttribute('data-mock-mapped') || target.getAttribute('data-lote') || target.getAttribute('id') || '';
            const decodedId = decodeIllustratorId(loteIdRaw);
            const isZona = decodedId.toUpperCase().includes('ZONA') || decodedId.toUpperCase().includes('VÍA') || decodedId.toUpperCase().includes('SERVIDUMBRE');
            
            if (isZona && svgUrl.includes('GENERAL')) {
                onSelectLot({ id: decodedId, name: decodedId, area: 0, price: 0, status: "available", description: "", features: [], zoneId: "", points: "" } as any);
                return;
            }

            if (isZona) {
                onSelectLot({ id: decodedId, name: decodedId.replace(/_/g, ' '), area: 0, price: 0, status: "available", description: "Información de la zona", features: [], zoneId: "", points: "" } as any);
                return;
            }

            if (decodedId) {
                const loteId = decodedId.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
                const lotData = lots.find(l => 
                    l.id.toUpperCase() === loteId || 
                    loteId.includes(l.id.toUpperCase()) ||
                    l.id.toUpperCase().includes(loteId.replace('LOTE', ''))
                );
                
                if (lotData) {
                    onSelectLot(lotData);
                } else {
                    onSelectLot({ id: decodedId, name: `Lote ${decodedId}`, area: 0, price: 0, status: 'available', description: "Lote disponible para consultar.", features: [], zoneId: "", points: "" } as any);
                }
            }
        };

        const handlePolygonHover = (e: MouseEvent) => {
            const target = e.currentTarget as SVGElement;
            const loteIdRaw = target.getAttribute('data-mock-mapped') || target.getAttribute('data-lote') || target.getAttribute('id') || '';
            const decodedId = decodeIllustratorId(loteIdRaw);
            
            setMousePos({ x: e.clientX, y: e.clientY });

            if (decodedId) {
                const isZona = decodedId.toUpperCase().includes('ZONA') || decodedId.toUpperCase().includes('VÍA') || decodedId.toUpperCase().includes('SERVIDUMBRE');
                
                target.style.opacity = '1';
                target.style.filter = 'drop-shadow(0px 0px 12px rgba(255,255,255,0.9))';
                target.style.cursor = 'pointer';
                
                if (isZona) {
                    target.style.fill = 'rgba(255, 255, 255, 0.15)'; 
                    target.style.stroke = 'var(--color-accent)';
                    target.style.strokeWidth = '3px';
                    target.style.transition = 'all 0.3s ease-in-out';
                } else {
                    target.style.transform = 'translateY(-2px)';
                    target.style.transition = 'all 0.2s cubic-bezier(0.2, 0, 0, 1)';
                    const loteId = decodedId.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
                    let lotData = lots.find(l => 
                        l.id.toUpperCase() === loteId || 
                        loteId.includes(l.id.toUpperCase()) ||
                        l.id.toUpperCase().includes(loteId.replace('LOTE', ''))
                    );
                    
                    if (!lotData && svgUrl.includes('SHOW ROOM LUWANA')) {
                       const index = parseInt(loteId.replace(/\D/g, '')) - 1;
                       if (!isNaN(index) && lots[index]) lotData = lots[index];
                    }

                    if (lotData) {
                        setHoveredLotInfo(lotData);
                    } else {
                        setHoveredLotInfo({ id: decodedId, name: `Lote ${decodedId}`, area: 0, price: 0, status: 'available', description: "", features: [], zoneId: "", points: "" } as any);
                    }
                }
            }
        };

        const handlePolygonMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        const handlePolygonLeave = (e: MouseEvent) => {
            const target = e.currentTarget as SVGElement;
            const loteIdRaw = target.getAttribute('data-mock-mapped') || target.getAttribute('data-lote') || target.getAttribute('id') || '';
            const decodedId = decodeIllustratorId(loteIdRaw);
            
            setHoveredLotInfo(null);

            if (decodedId) {
                const isZona = decodedId.toUpperCase().includes('ZONA') || decodedId.toUpperCase().includes('VÍA') || decodedId.toUpperCase().includes('SERVIDUMBRE');
                
                if (isZona) {
                    target.style.fill = 'transparent';
                    target.style.stroke = 'transparent';
                    target.style.strokeWidth = '0';
                    target.style.opacity = '0';
                    target.style.filter = 'none';
                    return;
                }

                target.style.transform = 'translateY(0)';
                
                const loteId = decodedId.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
                const isSelected = selectedLot && (
                    selectedLot.id.toUpperCase() === loteId || 
                    loteId.includes(selectedLot.id.toUpperCase())
                );
                
                target.style.opacity = isSelected ? '1' : '0.6';
                target.style.filter = isSelected ? 'drop-shadow(0px 0px 10px rgba(255,255,255,0.9))' : 'none';
            }
        };

        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
            svgElement.style.animation = 'svgFadeIn 1s ease-out forwards';
            const allElements = Array.from(svgElement.querySelectorAll('[id], [data-lote]'));
            const interactivePolygons = allElements.filter(el => {
                const idRaw = el.getAttribute('data-lote') || el.getAttribute('id') || '';
                const id = decodeIllustratorId(idRaw).toUpperCase();
                const cleanId = id.replace(/[^A-Z0-9-]/g, '');
                
                if ((cleanId === 'ZONA1' || cleanId === 'ZONA2' || cleanId === 'ZONA3') && !svgUrl.includes('GENERAL')) {
                    return false;
                }

                return id.includes('LOTE') || 
                       id.includes('PARTE') ||
                       id.includes('ZONA') ||
                       id.includes('VÍA') ||
                       id.includes('SERVIDUMBRE') ||
                       /^\d+$/.test(cleanId) ||
                       /^A-\d+$/.test(cleanId) ||
                       /^[A-Z]-\d+$/.test(cleanId);
            });

            Array.from(svgElement.querySelectorAll('*')).forEach(el => {
                (el as SVGElement).style.pointerEvents = 'none';
                (el as SVGElement).style.transition = 'opacity 0.5s ease-in';
            });

            interactivePolygons.forEach(poly => {
                const loteIdRaw = poly.getAttribute('data-lote') || poly.getAttribute('id') || '';
                const decodedId = decodeIllustratorId(loteIdRaw);
                const loteId = decodedId.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
                
                let lotData = lots.find(l => 
                    l.id.toUpperCase() === loteId || 
                    loteId.includes(l.id.toUpperCase()) || 
                    l.id.toUpperCase().includes(loteId.replace('LOTE', ''))
                );

                if (!lotData && svgUrl.includes('SHOW ROOM LUWANA')) {
                   const index = parseInt(loteId.replace(/\D/g, '')) - 1;
                   if (!isNaN(index) && lots[index]) {
                       lotData = lots[index];
                       poly.setAttribute('data-mock-mapped', lotData.id);
                   }
                }

                const isSelected = selectedLot && (
                    selectedLot.id.toUpperCase() === loteId || 
                    loteId.includes(selectedLot.id.toUpperCase()) ||
                    selectedLot.id.toUpperCase() === decodedId.toUpperCase()
                );
                const status = lotData ? lotData.status : "available"; 
                const isZona = decodedId.toUpperCase().includes('ZONA') || decodedId.toUpperCase().includes('VÍA') || decodedId.toUpperCase().includes('SERVIDUMBRE');

                const svgPoly = poly as SVGElement;
                svgPoly.style.pointerEvents = 'all';

                if (!isZona) {
                    svgPoly.style.fill = STATUS_CONFIG[status] ? STATUS_CONFIG[status].color : '#fff';
                    svgPoly.style.opacity = isSelected ? '1' : '0.6';
                } else {
                    svgPoly.style.fill = 'transparent';
                    svgPoly.style.opacity = '0';
                }
                
                svgPoly.style.transition = 'all 0.35s cubic-bezier(0.2, 0, 0, 1)';
                svgPoly.style.filter = isSelected && !isZona ? 'drop-shadow(0px 0px 10px rgba(255,255,255,0.9))' : 'none';

                if (isSelected && !isZona) {
                    svgPoly.style.stroke = '#fff';
                    svgPoly.style.strokeWidth = '3px';
                } else {
                    svgPoly.style.stroke = 'rgba(255,255,255,0.3)';
                    svgPoly.style.strokeWidth = '0.5px';
                }

                svgPoly.addEventListener('click', handlePolygonClick as EventListener);
                svgPoly.addEventListener('mouseenter', handlePolygonHover as EventListener);
                svgPoly.addEventListener('mousemove', handlePolygonMove as EventListener);
                svgPoly.addEventListener('mouseleave', handlePolygonLeave as EventListener);
            });

            return () => {
                interactivePolygons.forEach(poly => {
                    poly.removeEventListener('click', handlePolygonClick as EventListener);
                    poly.removeEventListener('mouseenter', handlePolygonHover as EventListener);
                    poly.removeEventListener('mousemove', handlePolygonMove as EventListener);
                    poly.removeEventListener('mouseleave', handlePolygonLeave as EventListener);
                });
            }
        }
    }, [svgContent, lots, selectedLot, onSelectLot, svgUrl]);

    if (!mounted) return <div className="w-full h-full flex items-center justify-center animate-pulse bg-white/5 rounded-3xl" />;

    return (
        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center relative overscroll-none touch-none">
            {/* Styles for entry animation */}
            <style jsx global>{`
                @keyframes svgFadeIn {
                    0% { opacity: 0; transform: scale(0.98) translateY(20px); filter: blur(4px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
                }
            `}</style>

            <AnimatePresence>
                {hoveredLotInfo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: mousePos.x + 15,
                            top: mousePos.y - 40,
                            x: "-0%", 
                            y: "-100%"
                        }}
                    >
                        <div className="glass px-4 py-3 rounded-2xl shadow-2xl border border-[var(--color-accent)]/30 backdrop-blur-xl bg-black/70 flex flex-col gap-1 min-w-[140px]">
                            <div className="flex items-center justify-between gap-4 mb-1">
                                <span className="text-white font-serif tracking-widest text-sm uppercase">{hoveredLotInfo.name}</span>
                                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: STATUS_CONFIG[hoveredLotInfo.status]?.color || '#fff' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-white/70 uppercase tracking-widest">
                                <span>Área:</span>
                                <span className="font-medium text-white">{hoveredLotInfo.area > 0 ? `${hoveredLotInfo.area} m²` : '---'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-[var(--color-accent)] uppercase tracking-widest mt-1">
                                <span>{hoveredLotInfo.status === 'sold' ? 'VENDIDO' : hoveredLotInfo.status === 'reserved' ? 'RESERVADO' : 'Inversión:'}</span>
                                {hoveredLotInfo.status === 'available' && <span className="font-semibold text-[var(--color-accent-light)]">{formatPrice(hoveredLotInfo.price)}</span>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                ref={containerRef}
                suppressHydrationWarning
                className="relative w-full max-w-[1600px] h-full flex flex-col items-center justify-center transition-shadow duration-500 hover:shadow-[0_15px_80px_rgba(212,175,55,0.15)] overflow-hidden rounded-[2rem] border border-[rgba(212,175,55,0.1)] p-2 md:p-4 bg-black/20"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        </div>
    );
}
