"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lot, LotStatus } from "@/data/lots";
import { STATUS_CONFIG } from "@/data/lots";

interface InteractiveSVGMapProps {
    svgUrl: string;
    bgImage?: string;
    lots: Lot[];
    selectedLot: Lot | null;
    onSelectLot: (lot: Lot) => void;
}

// Decode Adobe Illustrator encoded IDs: _x30_1 -> "01", _x33_5 -> "35"
// Pattern: _xHH_ where HH is the hex ASCII code of a character
function decodeIllustratorId(id: string): string {
    return id.replace(/_x([0-9A-Fa-f]{2})_/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}

// Convert decoded SVG number "01" -> sheet ID "A-01"
// Luwana uses A- prefix for all lots (A-01 to A-122)
function svgNumToSheetId(num: string): string {
    const n = parseInt(num, 10);
    if (isNaN(n)) return '';
    return `A-${String(n).padStart(2, '0')}`;
}

const SKIP_IDS = new Set(['MAR_CARIBE', 'Numeración']);

// Check if an SVG element ID corresponds to a lot
function getLotIdFromSvgId(rawId: string): string | null {
    if (!rawId) return null;
    // Skip known non-lot IDs
    if (SKIP_IDS.has(rawId)) return null;
    const decoded = decodeIllustratorId(rawId);
    
    // Nombres de zonas especiales
    const specialZones = ['ZONA_A', 'ZONA_B', 'ZONA_C', 'ZONA_D', 'ZONA_E', 'ZONA_F', 'ZONA_G', 'ZONA_H', 'SERVIDUMBRE', 'VÍA'];
    
    const upperDecoded = decoded.toUpperCase();
    const upperRawId = rawId.toUpperCase();

    // Check if the raw or decoded ID starts with any of the special zones
    // This handles cases where Illustrator exports 'ZONA_B_00000...'
    for (const zone of specialZones) {
        if (upperDecoded.startsWith(zone.toUpperCase()) || upperRawId.startsWith(zone.toUpperCase())) {
            return zone; // Return the canonical zone ID
        }
    }

    // Must decode to a valid number (1-999)
    if (/^\d+$/.test(decoded)) {
        return svgNumToSheetId(decoded);
    }
    return null;
}

export default function InteractiveSVGMap({ svgUrl, bgImage, lots, selectedLot, onSelectLot }: InteractiveSVGMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>("");

    // Build lookup map — updates whenever live lots data changes
    const lotMap = useMemo(
        () => new Map(lots.map(l => [l.id.trim().toUpperCase(), l])),
        [lots]
    );

    useEffect(() => {
        fetch(svgUrl)
            .then(res => res.text())
            .then(text => setSvgContent(text))
            .catch(err => console.error("Error loading SVG:", err));
    }, [svgUrl]);

    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        console.log(`[SVGMap] Applying colors: ${lotMap.size} lots, svgUrl: ${svgUrl}`);

        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) return;

        // Collect all polyline and path elements that represent lots
        const allShapes = svgElement.querySelectorAll('polyline, polygon, path[id], rect[id]');

        const clickedHandlers = new Map<Element, (e: MouseEvent) => void>();
        const hoverHandlers = new Map<Element, (e: MouseEvent) => void>();
        const leaveHandlers = new Map<Element, (e: MouseEvent) => void>();

        allShapes.forEach(shape => {
            const rawId = shape.getAttribute('id') || '';
            const sheetId = getLotIdFromSvgId(rawId);
            if (!sheetId) return; // Not a lot shape

            // Try to find matching lot in live data
            const lotData = lotMap.get(sheetId.toUpperCase()) || lotMap.get(sheetId);

            // Assign status color based on live data
            let status: 'available' | 'reserved' | 'sold' | 'blocked' | 'common' = 'available';
            if (lotData) {
                status = lotData.status;
            } else {
                const specialZones = ['ZONA_A', 'ZONA_B', 'ZONA_C', 'ZONA_D', 'ZONA_E', 'ZONA_F', 'ZONA_G', 'ZONA_H', 'SERVIDUMBRE', 'VÍA'];
                if (specialZones.includes(sheetId)) {
                    status = 'common';
                }
            }

            const isSelected = selectedLot?.id === sheetId;

            if (status === 'common') {
                console.log(`[DEBUG] Found special zone: ${rawId} -> mapped to ${sheetId}`);
            }

            const svgShape = shape as SVGElement;
            const safeStatus = (['available', 'reserved', 'sold', 'common'] as const).includes(status as any)
                ? (status as 'available' | 'reserved' | 'sold' | 'common')
                : 'sold';
            
            // Apply styles with !important to override any SVG-level CSS classes or inline styles
            svgShape.style.setProperty('fill', STATUS_CONFIG[safeStatus].color, 'important');
            svgShape.style.setProperty('fill-opacity', isSelected ? '1' : '0.65', 'important');
            svgShape.style.setProperty('transition', 'all 0.25s ease', 'important');
            svgShape.style.setProperty('cursor', 'pointer', 'important');
            svgShape.style.setProperty('stroke', isSelected ? '#fff' : 'rgba(255,255,255,0.3)', 'important');
            svgShape.style.setProperty('stroke-width', isSelected ? '3px' : '1px', 'important');
            svgShape.style.setProperty('pointer-events', 'all', 'important'); // Force clickability

            if (isSelected) {
                svgShape.style.setProperty('filter', 'drop-shadow(0px 0px 10px rgba(255,255,255,0.9))', 'important');
            } else {
                svgShape.style.removeProperty('filter');
            }

            // Store sheetId on the element for event handlers
            svgShape.dataset.sheetId = sheetId;

            const handleClick = (e: MouseEvent) => {
                e.stopPropagation();
                const id = (e.currentTarget as SVGElement).dataset.sheetId;
                if (!id) return;
                
                let clickedLot = lotMap.get(id.toUpperCase()) || lotMap.get(id);
                if (!clickedLot) {
                    const specialZoneNames: Record<string, string> = {
                        'ZONA_A': 'Portería',
                        'ZONA_B': 'Zona de Mascotas',
                        'ZONA_C': 'Club House',
                        'ZONA_D': 'Zona Deportiva',
                        'ZONA_E': 'Corredor Playero',
                        'ZONA_F': 'Club de Playa Luwana',
                        'ZONA_G': 'Club de Playa Anaiwa',
                        'ZONA_H': 'Alma Beach',
                        'SERVIDUMBRE': 'Servidumbre',
                        'VÍA': 'Calle Principal de Luwana'
                    };

                    if (specialZoneNames[id]) {
                        clickedLot = {
                            id,
                            name: specialZoneNames[id],
                            area: 0,
                            price: 0,
                            status: 'common',
                            description: 'Zona común del proyecto.',
                            features: [],
                            zoneId: 'zona-comun',
                        } as Lot;
                    } else {
                        // Create a fallback lot from the sheet ID
                        const num = parseInt(id.replace('A-', ''), 10);
                        clickedLot = {
                            id,
                            name: `Lote ${id}`,
                            area: 300,
                            price: 0,
                            status: 'available',
                            description: 'Lote disponible. Consulta disponibilidad.',
                            features: [],
                            zoneId: 'zona-1',
                        } as Lot;
                    }
                }
                onSelectLot(clickedLot);
            };

            const handleHover = (e: MouseEvent) => {
                const el = e.currentTarget as SVGElement;
                el.style.setProperty('fill-opacity', '1', 'important');
                el.style.setProperty('stroke', '#fff', 'important');
                el.style.setProperty('stroke-width', '2px', 'important');
                el.style.setProperty('filter', 'drop-shadow(0px 0px 6px rgba(255,255,255,0.7))', 'important');
            };

            const handleLeave = (e: MouseEvent) => {
                const el = e.currentTarget as SVGElement;
                const id = el.dataset.sheetId;
                const isSel = selectedLot?.id === id;
                el.style.setProperty('fill-opacity', isSel ? '1' : '0.65', 'important');
                el.style.setProperty('stroke', isSel ? '#fff' : 'rgba(255,255,255,0.3)', 'important');
                el.style.setProperty('stroke-width', isSel ? '3px' : '1px', 'important');
                if (isSel) {
                    el.style.setProperty('filter', 'drop-shadow(0px 0px 10px rgba(255,255,255,0.9))', 'important');
                } else {
                    el.style.removeProperty('filter');
                }
            };

            svgShape.addEventListener('click', handleClick as EventListener);
            svgShape.addEventListener('mouseenter', handleHover as EventListener);
            svgShape.addEventListener('mouseleave', handleLeave as EventListener);

            clickedHandlers.set(shape, handleClick as (e: MouseEvent) => void);
            hoverHandlers.set(shape, handleHover as (e: MouseEvent) => void);
            leaveHandlers.set(shape, handleLeave as (e: MouseEvent) => void);
        });

        return () => {
            allShapes.forEach(shape => {
                const click = clickedHandlers.get(shape);
                const hover = hoverHandlers.get(shape);
                const leave = leaveHandlers.get(shape);
                if (click) shape.removeEventListener('click', click as EventListener);
                if (hover) shape.removeEventListener('mouseenter', hover as EventListener);
                if (leave) shape.removeEventListener('mouseleave', leave as EventListener);
            });
        };
    }, [svgContent, lots, selectedLot, onSelectLot, lotMap]);


    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background image for this zone */}
            {bgImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={bgImage}
                    alt="Zone background"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    style={{ filter: "brightness(0.75)" }}
                />
            )}
            {/* SVG lot overlay */}
            <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        </div>
    );
}
