"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, DollarSign, Ruler, Star, Phone, MessageCircle } from "lucide-react";
import type { Lot } from "@/data/lots";
import { STATUS_CONFIG } from "@/data/lots";

interface LotPanelProps {
    lot: Lot | null;
    onClose: () => void;
    viewMode: "topdown" | "3d" | "topdown-villa1" | "3d-villa1" | "topdown-villa2" | "3d-villa2";
    setViewMode: (mode: "topdown" | "3d" | "topdown-villa1" | "3d-villa1" | "topdown-villa2" | "3d-villa2") => void;
}

export default function LotPanel({ lot, onClose, viewMode, setViewMode }: LotPanelProps) {
    if (!lot) return null;

    const status = STATUS_CONFIG[lot.status];

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);

    return (
        <AnimatePresence>
            <motion.div
                key={lot.id}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 h-full w-full z-30 flex flex-col bg-[var(--color-bg)]/95 backdrop-blur-3xl overflow-y-auto"
                style={{ borderLeft: "1px solid rgba(212, 175, 55, 0.15)" }}
            >
                {/* Header */}
                <div className="relative p-8 pb-6 border-b border-white/5">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/40 hover:text-[var(--color-accent)] transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>

                    {/* Status badge */}
                    <span
                        className="inline-flex items-center gap-2 px-3 py-1 text-[10px] tracking-widest uppercase font-semibold mb-4 bg-transparent"
                        style={{ color: status.color, border: `1px solid ${status.color}40` }}
                    >
                        <span className="w-1.5 h-1.5" style={{ backgroundColor: status.color }} />
                        {status.label}
                    </span>

                    <h2 className="text-3xl font-serif text-[var(--color-accent-light)] leading-tight mb-2 tracking-wide">{lot.name}</h2>

                    <div className="flex items-center gap-2 mt-2 text-[var(--color-accent)] text-xs tracking-widest uppercase">
                        <MapPin size={12} />
                        <span>Barú, Cartagena de Indias</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="mx-8 my-6 grid grid-cols-2 gap-4">
                    <div className="border border-white/5 p-4 text-center group hover:border-[var(--color-accent)]/30 transition-colors">
                        <div className="flex items-center justify-center gap-1 text-[var(--color-accent)] mb-2">
                            <Ruler size={14} strokeWidth={1.5} />
                        </div>
                        <p className="text-2xl font-serif text-[var(--color-accent-light)]">{lot.area}</p>
                        <p className="text-[10px] tracking-widest uppercase text-white/40 mt-1">m² de área</p>
                    </div>
                    <div className="border border-white/5 p-4 text-center group hover:border-[var(--color-accent)]/30 transition-colors">
                        <div className="flex items-center justify-center gap-1 text-[var(--color-accent)] mb-2">
                            <DollarSign size={14} strokeWidth={1.5} />
                        </div>
                        <p className="text-2xl font-serif text-[var(--color-accent-light)]">{formatPrice(lot.price)}</p>
                        <p className="text-[10px] tracking-widest uppercase text-white/40 mt-1">precio base</p>
                    </div>
                </div>

                {/* Price per m² */}
                <div className="mx-8 mb-8 border-t border-b border-white/5 py-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] tracking-widest uppercase text-white/40">Precio por m²</span>
                        <span className="font-serif text-lg text-[var(--color-accent)]">{formatPrice(Math.round(lot.price / lot.area))}</span>
                    </div>
                </div>

                {/* Description */}
                <div className="mx-8 mb-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] mb-3">Descripción de la Villa</h3>
                    <p className="text-sm text-white/60 leading-relaxed font-light text-justify">{lot.description}</p>
                </div>

                {/* Multimedia Navigation */}
                <div className="mx-8 mb-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] mb-4">Experiencia Interactiva</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                            onClick={() => setViewMode("topdown")}
                            className={`p-3 text-center border text-[10px] uppercase tracking-widest transition-all ${viewMode === "topdown" ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent-light)]" : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"}`}
                        >
                            Plano 2D
                        </button>
                        <button
                            onClick={() => setViewMode("3d-villa1")}
                            className={`p-3 text-center border text-[10px] uppercase tracking-widest transition-all ${viewMode === "3d-villa1" ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent-light)]" : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"}`}
                        >
                            Modelo 3D
                        </button>
                         <button
                            className="p-3 text-center border border-white/10 text-white/50 text-[10px] uppercase tracking-widest transition-all hover:border-white/30 hover:text-white"
                            onClick={() => alert("Módulo de fotos en desarrollo")}
                        >
                            Fotos
                        </button>
                        <button
                            className="p-3 text-center border border-white/10 text-white/50 text-[10px] uppercase tracking-widest transition-all hover:border-white/30 hover:text-white"
                            onClick={() => alert("Módulo de video virtual en desarrollo")}
                        >
                            Video
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="mx-8 mb-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] mb-4">Amenidades Exclusivas</h3>
                    <div className="flex flex-col gap-3">
                        {lot.features.map((f) => (
                            <div
                                key={f}
                                className="flex items-start gap-3 border-b border-white/5 pb-2 last:border-0"
                            >
                                <Star size={12} className="text-[var(--color-accent)] mt-0.5" strokeWidth={1.5} />
                                <span className="text-xs tracking-wide text-white/70 uppercase">
                                    {f}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ROI projection teaser */}
                {lot.status === "available" && (
                    <div className="mx-8 mb-8 p-6 bg-[var(--color-bg-light)] border border-[var(--color-accent)]/20 relative overflow-hidden group hover:border-[var(--color-accent)]/40 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]" />
                        <p className="text-[10px] tracking-widest uppercase text-[var(--color-accent)] mb-2">Proyección Rentabilidad</p>
                        <p className="font-serif text-white/80 text-lg mb-1">
                            Renta corta: <strong className="text-[var(--color-accent-light)] ml-1">{formatPrice(Math.round(lot.price * 0.12 / 12))}/mes</strong>
                        </p>
                        <p className="text-[10px] tracking-widest uppercase text-white/40 mt-2">~12% Retorno Anual Estimado</p>
                    </div>
                )}

                {/* CTA Buttons */}
                {lot.status === "available" && (
                    <div className="px-8 pb-8 pt-4 flex flex-col gap-4 mt-auto bg-[var(--color-bg)] sticky bottom-0 border-t border-white/5">
                        <button
                            className="w-full py-4 bg-[var(--color-accent)] text-black text-[10px] tracking-widest font-bold uppercase transition-all hover:bg-[var(--color-accent-light)] border border-[var(--color-accent)]"
                        >
                            Reservar Esta Propiedad
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3 border border-white/20 text-[var(--color-accent-light)] text-[10px] tracking-widest uppercase hover:bg-white/5 hover:border-[var(--color-accent)] transition-all">
                                <Phone size={12} className="text-[var(--color-accent)]" /> Llamar
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-white/20 text-[var(--color-accent-light)] text-[10px] tracking-widest uppercase hover:bg-white/5 hover:border-[#25D366] transition-all">
                                <MessageCircle size={12} className="text-[#25D366]" /> WhatsApp
                            </button>
                        </div>
                    </div>
                )}
                {lot.status === "reserved" && (
                    <div className="mx-8 mb-8 mt-auto">
                        <div className="p-6 border border-[#b45309]/30 bg-[var(--color-bg-light)] text-center">
                            <p className="text-[#b45309] tracking-widest uppercase text-[10px] font-bold">Reserva Activa</p>
                            <p className="text-white/40 text-xs mt-2 font-light">Contáctanos para ver villas similares</p>
                        </div>
                        <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-white/20 text-[var(--color-accent-light)] text-[10px] tracking-widest uppercase hover:bg-white/5 hover:border-[var(--color-accent)] transition-all">
                            Hablar con Asesor
                        </button>
                    </div>
                )}
                {lot.status === "sold" && (
                    <div className="mx-8 mb-8 mt-auto">
                        <div className="p-6 border border-[#b91c1c]/30 bg-[var(--color-bg-light)] text-center">
                            <p className="text-[#b91c1c] tracking-widest uppercase text-[10px] font-bold">Propiedad Vendida</p>
                            <p className="text-white/40 text-xs mt-2 font-light">Explora otras opciones disponibles</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
