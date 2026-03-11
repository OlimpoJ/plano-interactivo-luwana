"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Zone {
    id: string;
    name: string;
    points: string; // Polygon points in percentages
    cx: string; // Center X for label
    cy: string; // Center Y for label
}

const ZONES: Zone[] = [
    { id: "zona-1", name: "Zona 1", points: "0,0 50,0 50,50 0,50", cx: "25", cy: "25" },
    { id: "zona-2", name: "Zona 2", points: "50,0 100,0 100,50 50,50", cx: "75", cy: "25" },
    { id: "zona-3", name: "Zona 3", points: "0,50 50,50 50,100 0,100", cx: "25", cy: "75" },
    { id: "zona-4", name: "Zona 4", points: "50,50 100,50 100,100 50,100", cx: "75", cy: "75" }
];

interface MasterplanMapZonesProps {
    onSelectZone: (zoneId: string) => void;
}

export default function MasterplanMapZones({ onSelectZone }: MasterplanMapZonesProps) {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full cursor-crosshair">
            {/* Background image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/Vista Áerea.jpg"
                alt="Masterplan Luwana Alma Beach Zonas"
                className="w-full h-full object-cover"
                draggable={false}
            />

            {/* SVG overlay for interactive zones */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ pointerEvents: "all" }}
            >
                {ZONES.map((zone) => {
                    const isHovered = hoveredZone === zone.id;

                    return (
                        <g key={zone.id}>
                            {/* Hotspot polygon */}
                            <polygon
                                points={zone.points}
                                fill="var(--color-accent)"
                                fillOpacity={isHovered ? 0.3 : 0}
                                stroke={isHovered ? "var(--color-accent)" : "rgba(255,255,255,0.2)"}
                                strokeWidth="0.2"
                                style={{
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    filter: isHovered ? "drop-shadow(0 0 8px rgba(212,175,55,0.5))" : "none"
                                }}
                                onClick={() => onSelectZone(zone.id)}
                                onMouseEnter={() => setHoveredZone(zone.id)}
                                onMouseLeave={() => setHoveredZone(null)}
                            />

                            {/* Label that shows on hover */}
                            <motion.text
                                x={zone.cx}
                                y={zone.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="4"
                                fontWeight="bold"
                                fill="white"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: isHovered ? 1 : 0.6,
                                    scale: isHovered ? 1.1 : 1
                                }}
                                style={{
                                    pointerEvents: "none",
                                    textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                                    userSelect: "none"
                                }}
                            >
                                {zone.name}
                            </motion.text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
