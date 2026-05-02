"use client";

import { useRef, useState, useCallback } from "react";
import type { Lot } from "@/data/lots";
import { STATUS_CONFIG } from "@/data/lots";
import { motion } from "framer-motion";

interface MasterplanMapProps {
    lots: Lot[];
    selectedLot: Lot | null;
    onSelectLot: (lot: Lot) => void;
}

export default function MasterplanMap({ lots, selectedLot, onSelectLot }: MasterplanMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Tooltip state
    const [tooltip, setTooltip] = useState<{ x: number; y: number; lot: Lot } | null>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGPolygonElement>, lot: Lot) => {
        const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            lot,
        });
    }, []);

    return (
        <div className="relative w-full h-full">
            {/* The masterplan image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/Vista Áerea.jpg"
                alt="Masterplan Luwana Alma Beach"
                className="w-full h-full object-cover"
                draggable={false}
            />

            {/* SVG overlay */}
            <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ pointerEvents: "all" }}
            >
                {lots.map((lot) => {
                    if (!lot.points) return null;
                    const status = STATUS_CONFIG[lot.status];
                    const isSelected = selectedLot?.id === lot.id;
                    const isHovered = hoveredId === lot.id;

                    return (
                        <polygon
                            key={lot.id}
                            points={lot.points}
                            fill={status.color}
                            fillOpacity={isSelected ? 0.8 : isHovered ? 0.75 : lot.status === "available" ? 0.55 : 0.65}
                            stroke={isSelected ? "#fff" : status.color}
                            strokeWidth={isSelected ? "0.4" : "0.2"}
                            strokeOpacity={isSelected ? 1 : 0.8}
                            className={`lot-polygon ${isSelected ? "selected" : ""} ${lot.status === "available" && !isSelected ? "lot-available-pulse" : ""}`}
                            style={{
                                cursor: "pointer",
                                filter: isSelected ? `drop-shadow(0 0 6px ${status.color})` : isHovered ? `drop-shadow(0 0 4px ${status.color})` : "none",
                                transition: "fill-opacity 0.2s, filter 0.2s",
                            }}
                            onClick={() => onSelectLot(lot)}
                            onMouseEnter={() => setHoveredId(lot.id)}
                            onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
                            onMouseMove={(e) => handleMouseMove(e, lot)}
                        />
                    );
                })}

                {/* Lot labels */}
                {lots.map((lot) => {
                    if (!lot.points) return null;
                    // Calculate centroid
                    const pts = lot.points.split(" ").map(p => {
                        const [x, y] = p.split(",").map(Number);
                        return { x, y };
                    });
                    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
                    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
                    const isSelected = selectedLot?.id === lot.id;

                    return (
                        <text
                            key={`label-${lot.id}`}
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={isSelected ? "2.2" : "1.8"}
                            fontWeight="bold"
                            fill="white"
                            fillOpacity={0.95}
                            style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.9)", userSelect: "none" }}
                        >
                            {lot.id}
                        </text>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute z-20 pointer-events-none glass rounded-lg px-3 py-2 text-xs"
                    style={{
                        left: tooltip.x + 12,
                        top: tooltip.y - 40,
                        maxWidth: 180,
                        border: `1px solid ${STATUS_CONFIG[tooltip.lot.status].color}40`,
                    }}
                >
                    <p className="font-bold text-white">{tooltip.lot.id}</p>
                    <p className="text-white/70 mt-0.5">{tooltip.lot.area}m² · {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(tooltip.lot.price)}</p>
                    <span
                        className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: STATUS_CONFIG[tooltip.lot.status].color, backgroundColor: STATUS_CONFIG[tooltip.lot.status].color + "20" }}
                    >
                        {STATUS_CONFIG[tooltip.lot.status].label}
                    </span>
                </motion.div>
            )}
        </div>
    );
}
