"use client";

import { useEffect, useRef, useState } from "react";
import type { Lot } from "@/data/lots";
import { STATUS_CONFIG } from "@/data/lots";

interface InteractiveSVGMapProps {
    svgUrl: string;
    lots: Lot[];
    selectedLot: Lot | null;
    onSelectLot: (lot: Lot) => void;
}

export default function InteractiveSVGMap({ svgUrl, lots, selectedLot, onSelectLot }: InteractiveSVGMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>("");

    useEffect(() => {
        fetch(svgUrl)
            .then(res => res.text())
            .then(text => setSvgContent(text))
            .catch(err => console.error("Error loading SVG:", err));
    }, [svgUrl]);

    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        const handlePolygonClick = (e: MouseEvent) => {
            const target = e.currentTarget as SVGElement;
            const loteId = target.getAttribute('data-lote');
            if (loteId) {
                const clickedLot = lots.find(l => l.id === loteId);
                if (clickedLot) {
                    onSelectLot(clickedLot);
                }
            }
        };

        const handlePolygonHover = (e: MouseEvent) => {
            const target = e.currentTarget as SVGElement;
            const loteId = target.getAttribute('data-lote');
            if (loteId) {
                target.style.opacity = '1';
                target.style.filter = 'drop-shadow(0px 0px 8px rgba(255,255,255,0.8))';
                target.style.cursor = 'pointer';
            }
        };

        const handlePolygonLeave = (e: MouseEvent) => {
            const target = e.currentTarget as SVGElement;
            const loteId = target.getAttribute('data-lote');
            const isSelected = selectedLot?.id === loteId;
            if (loteId) {
                target.style.opacity = isSelected ? '1' : '0.6';
                target.style.filter = isSelected ? 'drop-shadow(0px 0px 10px rgba(255,255,255,0.9))' : 'none';
            }
        };

        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
            // Apply styles to all interactive polygons
            const interactivePolygons = svgElement.querySelectorAll('[data-lote]');
            interactivePolygons.forEach(poly => {
                const loteId = poly.getAttribute('data-lote');
                const lotData = lots.find(l => l.id === loteId);
                const isSelected = selectedLot && selectedLot.id === loteId;

                const svgPoly = poly as SVGElement;
                svgPoly.style.fill = lotData ? STATUS_CONFIG[lotData.status].color : '#cccccc';
                svgPoly.style.opacity = isSelected ? '1' : '0.6';
                svgPoly.style.transition = 'all 0.3s ease';
                svgPoly.style.filter = isSelected ? 'drop-shadow(0px 0px 10px rgba(255,255,255,0.9))' : 'none';

                if (isSelected) {
                    svgPoly.style.stroke = '#fff';
                    svgPoly.style.strokeWidth = '2px';
                } else {
                    svgPoly.style.stroke = 'transparent';
                    svgPoly.style.strokeWidth = '0';
                }

                svgPoly.addEventListener('click', handlePolygonClick as EventListener);
                svgPoly.addEventListener('mouseenter', handlePolygonHover as EventListener);
                svgPoly.addEventListener('mouseleave', handlePolygonLeave as EventListener);
            });

            return () => {
                interactivePolygons.forEach(poly => {
                    poly.removeEventListener('click', handlePolygonClick as EventListener);
                    poly.removeEventListener('mouseenter', handlePolygonHover as EventListener);
                    poly.removeEventListener('mouseleave', handlePolygonLeave as EventListener);
                });
            }
        }
    }, [svgContent, lots, selectedLot, onSelectLot]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center [&>svg]:w-[90%] [&>svg]:h-[90%] [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
