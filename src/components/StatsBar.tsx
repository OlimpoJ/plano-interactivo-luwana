"use client";

import { motion } from "framer-motion";
import { LayoutGrid, CheckCircle, Clock, XCircle } from "lucide-react";
import type { LotStatus } from "@/data/lots";
import { STATUS_CONFIG } from "@/data/lots";

interface StatsBarProps {
    total: number;
    available: number;
    reserved: number;
    sold: number;
    activeFilter: LotStatus | "all";
    onFilterChange: (f: LotStatus | "all") => void;
}

export default function StatsBar({ total, available, reserved, sold, activeFilter, onFilterChange }: StatsBarProps) {
    const stats = [
        { key: "all" as const, label: "Todos", value: total, icon: <LayoutGrid size={14} />, color: "#D4AF37" },
        { key: "available" as const, label: "Disponibles", value: available, icon: <CheckCircle size={14} />, color: STATUS_CONFIG.available.color },
        { key: "reserved" as const, label: "Reservados", value: reserved, icon: <Clock size={14} />, color: STATUS_CONFIG.reserved.color },
        { key: "sold" as const, label: "Vendidos", value: sold, icon: <XCircle size={14} />, color: STATUS_CONFIG.sold.color },
    ];

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {stats.map((s) => {
                const isActive = activeFilter === s.key;
                return (
                    <motion.button
                        key={s.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onFilterChange(s.key)}
                        className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-widest uppercase font-semibold transition-all relative overflow-hidden shimmer"
                        style={{
                            border: isActive ? `1px solid ${s.color}60` : "1px solid rgba(255,255,255,0.05)",
                            color: isActive ? s.color : "rgba(255,255,255,0.6)",
                            background: isActive ? `${s.color}10` : "rgba(255,255,255,0.02)",
                            boxShadow: isActive ? `0 0 15px ${s.color}15` : "none",
                        }}
                    >
                        <span style={{ color: isActive ? s.color : "rgba(255,255,255,0.4)" }}>{s.icon}</span>
                        <span>{s.value} {s.label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
