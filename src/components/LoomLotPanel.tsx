"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Clock, AlertCircle, Phone, ArrowRight, Layout } from "lucide-react";
import { useState, useEffect } from "react";
import LoomReferralModal from "./LoomReferralModal";

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
  pricePerM2?: string;
  separation?: string;
}

interface LoomLotPanelProps {
  lot: Lot | null;
  onClose: () => void;
  onEnterShowroom: (lot: Lot) => void;
}

export default function LoomLotPanel({ lot, onClose, onEnterShowroom }: LoomLotPanelProps) {
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referrer, setReferrer] = useState<string | null>(null);

  // Leer referidor de sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setReferrer(sessionStorage.getItem("loom_ref"));
    }
  }, [lot]);

  if (!lot) return null;

  // Lógica del botón de separar lote (atribución)
  const handleSeparateClick = () => {
    if (referrer === "patrimofy") {
      window.open("https://www.patrimofy.com/es/loom#contacto", "_blank");
    } else if (referrer === "chichaus") {
      window.open("https://www.loomalmabeach.com/contacto/", "_blank");
    } else {
      // Si es orgánico, mostramos modal de selección
      setShowReferralModal(true);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "common" || lot.statusRaw === "AMENIDAD" || lot.id?.includes("PARQUE") || lot.id?.includes("PORTERIA")) {
      return (
        <div className="flex items-center gap-1 bg-[#B35F27]/15 text-[#B35F27] border border-[#B35F27]/40 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Amenidad / Zona Común
        </div>
      );
    }
    switch (status) {
      case "available":
        return (
          <div className="flex items-center gap-1 bg-[#699385]/20 text-[#699385] border border-[#699385]/40 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Disponible
          </div>
        );
      case "blocked":
        return (
          <div className="flex items-center gap-1 bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Bloqueado
          </div>
        );
      case "sold":
        return (
          <div className="flex items-center gap-1 bg-red-500/15 text-red-600 border border-red-500/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Vendido
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-black/10 text-[#0A0D0B]/50 border border-[#0A0D0B]/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {status.toUpperCase()}
          </div>
        );
    }
  };

  return (
    <>
      {/* Contenedor Principal (Panel Lateral) */}
      <motion.div
        initial={{ x: "100%", opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0.8 }}
        transition={{ type: "spring", damping: 25, stiffness: 150 }}
        className="fixed top-0 right-0 z-40 h-[100dvh] w-[80vw] max-md:landscape:w-[45vw] md:w-[22.5rem] lg:w-[26.25rem] bg-[#EDE7E0]/95 border-l border-[#0A0D0B]/15 shadow-2xl backdrop-blur-xl flex flex-col text-[#0A0D0B]"
      >
        {/* Cabecera del Panel */}
        <div className="p-3 sm:p-5 border-b border-[#0A0D0B]/10 flex justify-between items-center relative z-10 bg-[#EDE7E0]/70">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[#B35F27] font-bold block">Loom Luxury Residence</span>
              <h2 className="text-base sm:text-2xl font-serif text-[#0A0D0B] tracking-wide mt-0.5">
                {lot.status === "common" || lot.statusRaw === "AMENIDAD" || lot.id?.includes("PARQUE") || lot.id?.includes("PORTERIA") 
                  ? lot.rawId 
                  : `Lote ${lot.rawId}`}
              </h2>
            </div>
            {/* Badge de Estado Integrado en el Header */}
            <div>
              {getStatusBadge(lot.status)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 border border-[#0A0D0B]/10 hover:border-[#0A0D0B]/20 rounded-md transition-all duration-300 group cursor-pointer"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A0D0B]/70 group-hover:text-[#0A0D0B]" />
          </button>
        </div>

        {/* Cuerpo del Panel */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-4 relative z-10">
          
          {/* Cinta Compacta de Dimensiones */}
          <div className="grid grid-cols-2 bg-white/80 border border-[#0A0D0B]/10 p-2 sm:p-3 rounded-lg text-center items-center shadow-sm">
            <div className="border-r border-[#0A0D0B]/10 pr-2">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#0A0D0B]/50 block">Área Total</span>
              <span className="text-xs sm:text-base font-serif text-[#0A0D0B] font-semibold mt-0.5 block">
                {lot.area.includes("m²") || lot.area.includes("Común") ? lot.area : `${lot.area} m²`}
              </span>
            </div>
            <div className="pl-2">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#0A0D0B]/50 block">Ubicación</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#0A0D0B] mt-0.5 block">{lot.location || "MEDIANERO"}</span>
            </div>
          </div>

          {/* Sección Financiera solo para Lotes Disponibles y Reservados (Oculta para Bloqueados, Vendidos y Amenidades) */}
          {(lot.status === "available" || lot.status === "reserved") && !(lot.statusRaw === "AMENIDAD" || lot.id?.includes("PARQUE") || lot.id?.includes("PORTERIA") || lot.id?.includes("CLUB")) ? (
            <div className="bg-white/90 border border-[#B35F27]/25 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-sm">
              <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#B35F27] border-b border-[#B35F27]/20 pb-1 font-bold">
                Estructura Financiera (COP)
              </h3>
              
              <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#0A0D0B]/70">Precio Total:</span>
                  <span className="font-serif text-[#B35F27] text-xs sm:text-sm font-bold tracking-wide">
                    {lot.totalPrice || "Consultar"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#0A0D0B]/70">Valor M²:</span>
                  <span className="text-[#0A0D0B] font-semibold">{lot.pricePerM2 || "Consultar"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#0A0D0B]/70">Separación:</span>
                  <span className="text-[#0A0D0B] font-semibold flex items-center gap-1">
                    {lot.separation || "$10,000,000"} 
                    <span className="text-[7.5px] sm:text-[8.5px] text-[#B35F27] font-normal normal-case">
                      (hace parte de la inicial)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#0A0D0B]/70">Cuota Inicial (20%):</span>
                  <span className="text-[#0A0D0B] font-semibold">{lot.downPayment || "Consultar"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#0A0D0B]/70">Cuota Financiación (36 m.):</span>
                  <span className="text-[#0A0D0B] font-semibold">{lot.financing || "Consultar"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#0A0D0B]/70">Cuota Final (Saldo):</span>
                  <span className="text-[#0A0D0B] font-semibold">{lot.finalPayment || "Consultar"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/90 border border-[#B35F27]/25 rounded-lg p-3 sm:p-4 space-y-2 shadow-sm">
              <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#B35F27] border-b border-[#B35F27]/20 pb-1 font-bold">
                {lot.status === "blocked"
                  ? "Información de Reserva"
                  : lot.status === "sold"
                  ? "Estado del Lote"
                  : "Detalles de la Amenidad"}
              </h3>
              <p className="text-xs text-[#0A0D0B]/80 leading-relaxed font-sans pt-1">
                {lot.status === "blocked"
                  ? "Este lote se encuentra en estado de Reserva Administrativa / Bloqueado por la constructora."
                  : lot.status === "sold"
                  ? "Este lote ya ha sido adjudicado y vendido en su totalidad."
                  : "Espacio común equipado diseñado para el confort, esparcimiento y seguridad de todos los propietarios de Loom Luxury Residence."}
              </p>
            </div>
          )}

          {/* Alerta de Atribución */}
          {referrer && (
            <div className="bg-[#B35F27]/10 border border-[#B35F27]/30 rounded-lg p-2 text-[8px] sm:text-[10px] text-[#0A0D0B]/80 leading-relaxed uppercase tracking-wider text-center">
              Asesoría exclusiva comercializada por <strong className="text-[#0A0D0B]">{referrer === "patrimofy" ? "Patrimofy" : "Chichaus"}</strong>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-1 space-y-1.5">
            {lot.status === "common" || lot.statusRaw === "AMENIDAD" || lot.id?.includes("PARQUE") || lot.id?.includes("PORTERIA") ? (
              <div className="w-full py-2.5 sm:py-3 text-center text-[#B35F27] font-bold uppercase tracking-widest text-[9px] sm:text-[10px] border border-[#B35F27]/30 rounded bg-[#B35F27]/10 shadow-sm">
                Zona Común Equipada &bull; Proyecto Loom Luxury Residence
              </div>
            ) : lot.status === "sold" ? (
              <div className="w-full py-2.5 sm:py-3 text-center text-red-600 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] border border-red-500/30 rounded bg-red-500/10 shadow-sm">
                Lote Vendido &bull; No disponible para venta
              </div>
            ) : lot.status === "blocked" ? (
              <div className="w-full py-2.5 sm:py-3 text-center text-[#3b82f6] font-bold uppercase tracking-widest text-[9px] sm:text-[10px] border border-[#3b82f6]/30 rounded bg-[#3b82f6]/10 shadow-sm">
                Lote Bloqueado &bull; Reserva Administrativa
              </div>
            ) : (
              <>
                <button
                  onClick={() => onEnterShowroom(lot)}
                  className="w-full py-2.5 sm:py-3 bg-[#B35F27] hover:bg-[#964d1d] text-[#EDE7E0] font-semibold rounded-md uppercase tracking-[0.12em] sm:tracking-[0.15em] text-[10px] sm:text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-[#B35F27]/20 cursor-pointer"
                >
                  <Layout className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Ingresar al Showroom
                </button>
                <button
                  onClick={handleSeparateClick}
                  className="w-full py-2.5 sm:py-3 bg-white hover:bg-[#EDE7E0] border border-[#0A0D0B]/15 text-[#0A0D0B] font-semibold rounded-md uppercase tracking-[0.12em] sm:tracking-[0.15em] text-[10px] sm:text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#B35F27]" />
                  Separar Lote
                </button>
              </>
            )}
          </div>

        </div>
      </motion.div>

      {/* Modal de Selección de Inmobiliaria (Para visitas Orgánicas) */}
      <LoomReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        lotRawId={lot.rawId}
      />
    </>
  );
}
