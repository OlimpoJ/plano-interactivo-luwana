"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Clock, AlertCircle, Phone, ArrowRight, Layout } from "lucide-react";
import { useState, useEffect } from "react";

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
      window.open(`https://wa.me/573008146747?text=Hola%20Patrimofy,%20deseo%20separar%20el%20lote%20${lot.rawId}%20de%20Loom%20Luxury%20Residence.%20¿Me%20pueden%20asesorar?`, "_blank");
    } else if (referrer === "chichaus") {
      window.open(`https://wa.me/573002621008?text=Hola%20Chichaus,%20deseo%20separar%20el%20lote%20${lot.rawId}%20de%20Loom%20Luxury%20Residence.%20¿Me%20pueden%20asesorar?`, "_blank");
    } else {
      // Si es orgánico, mostramos modal de selección
      setShowReferralModal(true);
    }
  };

  const selectAgency = (agency: "patrimofy" | "chichaus") => {
    sessionStorage.setItem("loom_ref", agency);
    setReferrer(agency);
    setShowReferralModal(false);
    
    const phone = agency === "patrimofy" ? "573008146747" : "573002621008";
    const agencyName = agency === "patrimofy" ? "Patrimofy" : "Chichaus";
    
    window.open(`https://wa.me/${phone}?text=Hola%20${agencyName},%20deseo%20separar%20el%20lote%20${lot.rawId}%20de%20Loom%20Luxury%20Residence.%20¿Me%20pueden%20asesorar?`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <div className="flex items-center gap-1.5 bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <CheckCircle className="h-3.5 w-3.5" />
            Disponible
          </div>
        );
      case "reserved":
        return (
          <div className="flex items-center gap-1.5 bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            Reservado
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 bg-white/10 text-white/50 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="h-3.5 w-3.5" />
            Vendido
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
        className="fixed top-0 right-0 z-40 h-screen w-full sm:w-[420px] bg-[#0c1524]/90 border-l border-[#dbaa67]/30 shadow-2xl backdrop-blur-md flex flex-col text-white"
      >
        {/* Cabecera del Panel */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#dbaa67] font-semibold">Loom Residence</span>
            <h2 className="text-2xl font-serif text-white tracking-wide mt-0.5">Lote {lot.rawId}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-md transition-all duration-300 group"
          >
            <X className="h-5 w-5 text-white/70 group-hover:text-white" />
          </button>
        </div>

        {/* Cuerpo del Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          
          {/* Ficha de Estado */}
          <div className="flex justify-between items-center bg-black/30 border border-white/5 p-4 rounded-lg">
            <span className="text-xs uppercase tracking-widest text-white/50">Estado Lote</span>
            {getStatusBadge(lot.status)}
          </div>

          {/* Detalles de Dimensiones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 border border-white/5 p-4 rounded-lg text-center">
              <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-1">Área Total</span>
              <span className="text-lg font-serif text-white font-semibold">{lot.area} m²</span>
            </div>
            <div className="bg-black/20 border border-white/5 p-4 rounded-lg text-center">
              <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-1">Ubicación</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-white mt-1.5 block">{lot.location || "MEDIANERO"}</span>
            </div>
          </div>

          {/* Sección Financiera (Branding Premium de Loom) */}
          <div className="bg-black/35 border border-[#dbaa67]/15 rounded-lg p-5 space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#dbaa67] border-b border-[#dbaa67]/10 pb-2 font-semibold">
              Estructura Financiera (COP)
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Precio Total:</span>
                <span className="font-serif text-white text-base font-semibold tracking-wide">
                  {lot.totalPrice || "Consultar"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Cuota Inicial (20%):</span>
                <span className="text-white font-medium">{lot.downPayment || "Consultar"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Cuota Financiación (36 meses):</span>
                <span className="text-white font-medium">{lot.financing || "Consultar"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Cuota Final (Saldo):</span>
                <span className="text-white font-medium">{lot.finalPayment || "Consultar"}</span>
              </div>
            </div>
          </div>

          {/* Alerta de Atribución */}
          {referrer && (
            <div className="bg-[#dbaa67]/10 border border-[#dbaa67]/30 rounded-lg p-3.5 text-[10px] text-white/70 leading-relaxed uppercase tracking-wider text-center">
              Asesoría exclusiva comercializada por <strong className="text-white">{referrer === "patrimofy" ? "Patrimofy" : "Chichaus"}</strong>
            </div>
          )}

        </div>

        {/* Acciones del Panel */}
        <div className="p-6 border-t border-white/10 space-y-3 bg-[#070c16]/50 relative z-10">
          {lot.status !== "sold" ? (
            <>
              {/* Botón de Showroom (Cargar plantas y Kuula) */}
              <button
                onClick={() => onEnterShowroom(lot)}
                className="w-full py-3 bg-[#dbaa67] hover:bg-[#cba875] text-[#070c16] hover:text-black font-semibold rounded-md uppercase tracking-[0.15em] text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#dbaa67]/10"
              >
                <Layout className="h-4.5 w-4.5" />
                Ingresar al Showroom
              </button>

              {/* Botón de Contacto */}
              <button
                onClick={handleSeparateClick}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-md uppercase tracking-[0.15em] text-xs transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4 text-[#dbaa67]" />
                Separar Lote
              </button>
            </>
          ) : (
            <div className="w-full py-3 text-center text-white/40 uppercase tracking-widest text-[10px] border border-white/5 rounded bg-white/5">
              Lote no disponible
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal de Selección de Inmobiliaria (Para visitas Orgánicas) */}
      <AnimatePresence>
        {showReferralModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c1524] border border-[#dbaa67]/40 p-6 sm:p-8 rounded-xl max-w-md w-full text-center space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowReferralModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#dbaa67] font-semibold">Proceso de Separación</span>
                <h3 className="text-xl sm:text-2xl font-serif text-white tracking-wide mt-1">¿Cómo deseas ser atendido?</h3>
                <p className="text-xs text-white/50 mt-2 leading-relaxed">
                  Loom Luxury Residence es comercializado exclusivamente a través de nuestras inmobiliarias autorizadas. Selecciona tu opción preferida para iniciar el contacto por WhatsApp:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {/* Opción Patrimofy */}
                <button
                  onClick={() => selectAgency("patrimofy")}
                  className="flex justify-between items-center p-4 bg-black/40 hover:bg-[#dbaa67]/10 border border-white/10 hover:border-[#dbaa67]/50 rounded-lg group transition-all duration-300"
                >
                  <div className="text-left">
                    <span className="text-sm font-semibold tracking-wide text-white block">Asesores Patrimofy</span>
                    <span className="text-[10px] text-white/40 block mt-0.5">Atención VIP en línea</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-[#dbaa67] transition-all transform group-hover:translate-x-1" />
                </button>

                {/* Opción Chichaus */}
                <button
                  onClick={() => selectAgency("chichaus")}
                  className="flex justify-between items-center p-4 bg-black/40 hover:bg-[#dbaa67]/10 border border-white/10 hover:border-[#dbaa67]/50 rounded-lg group transition-all duration-300"
                >
                  <div className="text-left">
                    <span className="text-sm font-semibold tracking-wide text-white block">Asesores Chichaus</span>
                    <span className="text-[10px] text-white/40 block mt-0.5">Asesoría comercial personalizada</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-[#dbaa67] transition-all transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
