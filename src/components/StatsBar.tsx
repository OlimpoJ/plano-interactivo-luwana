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
    viewType?: "global" | "zonal";
}

export default function StatsBar({ total, available, reserved, sold, activeFilter, onFilterChange, viewType = "zonal" }: StatsBarProps) {
    const stats = [
        { key: "all" as const, label: "Todos", value: total, icon: <LayoutGrid size={14} />, color: "var(--color-accent)" },
        { key: "available" as const, label: "Disponibles", value: available, icon: <CheckCircle size={14} />, color: STATUS_CONFIG.available.color },
        { key: "reserved" as const, label: "Reservados", value: reserved, icon: <Clock size={14} />, color: STATUS_CONFIG.reserved.color },
        { key: "sold" as const, label: "Vendidos", value: sold, icon: <XCircle size={14} />, color: STATUS_CONFIG.sold.color },
    ];

    if (viewType === "global") {
        const salesPercentage = total > 0 ? Math.round((sold / total) * 100) : 0;
        return (
            <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] tracking-widest text-white/50 uppercase">Total Lotes Proyecto</p>
                    <p className="font-serif text-xl text-[var(--color-accent-light)] flex items-center gap-2">
                        <LayoutGrid size={16} className="text-[var(--color-accent)]" /> 
                        {total} Lotes
                    </p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] tracking-widest text-white/50 uppercase">Lotes Vendidos</p>
                    <p className="font-serif text-xl text-white flex items-center gap-2">
                         <XCircle size={16} className="text-white/60" /> 
                        {sold} Lotes
                    </p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col gap-1 flex-1 max-w-[300px]">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] tracking-widest text-[var(--color-accent)] uppercase">Porcentaje de Avance</p>
                        <p className="text-[10px] tracking-widest text-[var(--color-accent-light)] uppercase font-bold">{salesPercentage}%</p>
                    </div>
                    <div className="w-full h-2 bg-white/5 mt-1 overflow-hidden relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${salesPercentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute top-0 left-0 h-full bg-[var(--color-accent)]" 
                            style={{ boxShadow: "0 0 10px rgba(212, 175, 55, 0.5)" }}
                        />
                    </div>
                </div>
            </div>
        );
    }

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
