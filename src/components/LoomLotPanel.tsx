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
          <div className="flex items-center gap-1 bg-[#699385]/20 text-[#699385] border border-[#699385]/40 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Disponible
          </div>
        );
      case "reserved":
        return (
          <div className="flex items-center gap-1 bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
            Reservado
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-white/10 text-white/50 border border-white/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
        className="fixed top-0 right-0 z-40 h-[100dvh] w-[80vw] max-md:landscape:w-[45vw] md:w-[22.5rem] lg:w-[26.25rem] bg-[#EDE7E0]/95 border-l border-[#0A0D0B]/15 shadow-2xl backdrop-blur-xl flex flex-col text-[#0A0D0B]"
      >
        {/* Cabecera del Panel */}
        <div className="p-3 sm:p-5 border-b border-[#0A0D0B]/10 flex justify-between items-center relative z-10 bg-[#EDE7E0]/70">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[#B35F27] font-bold block">Loom Residence</span>
              <h2 className="text-base sm:text-2xl font-serif text-[#0A0D0B] tracking-wide mt-0.5">Lote {lot.rawId}</h2>
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
              <span className="text-xs sm:text-base font-serif text-[#0A0D0B] font-semibold mt-0.5 block">{lot.area} m²</span>
            </div>
            <div className="pl-2">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#0A0D0B]/50 block">Ubicación</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#0A0D0B] mt-0.5 block">{lot.location || "MEDIANERO"}</span>
            </div>
          </div>

          {/* Sección Financiera (Branding Premium de Loom) */}
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

          {/* Alerta de Atribución */}
          {referrer && (
            <div className="bg-[#B35F27]/10 border border-[#B35F27]/30 rounded-lg p-2 text-[8px] sm:text-[10px] text-[#0A0D0B]/80 leading-relaxed uppercase tracking-wider text-center">
              Asesoría exclusiva comercializada por <strong className="text-[#0A0D0B]">{referrer === "patrimofy" ? "Patrimofy" : "Chichaus"}</strong>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-1 space-y-1.5">
            {lot.status !== "sold" ? (
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
            ) : (
              <div className="w-full py-2.5 sm:py-3 text-center text-[#0A0D0B]/40 uppercase tracking-widest text-[9px] sm:text-[10px] border border-[#0A0D0B]/10 rounded bg-black/5">
                Lote no disponible
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Modal de Selección de Inmobiliaria (Para visitas Orgánicas) */}
      <AnimatePresence>
        {showReferralModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#EDE7E0] border border-[#B35F27]/40 p-6 sm:p-8 rounded-xl max-w-md w-full text-center space-y-6 shadow-2xl relative text-[#0A0D0B]"
            >
              <button
                onClick={() => setShowReferralModal(false)}
                className="absolute top-4 right-4 p-1 text-[#0A0D0B]/50 hover:text-[#0A0D0B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B35F27] font-bold block">
                  Loom Residence
                </span>
                <h3 className="text-xl font-serif text-[#0A0D0B] font-bold">
                  Selecciona tu Agencia Preferida
                </h3>
                <p className="text-xs text-[#0A0D0B]/70 leading-relaxed">
                  Para brindarte una atención personalizada para el <strong>Lote {lot.rawId}</strong>, por favor elige una de nuestras firmas comercializadoras autorizadas:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={() => selectAgency("patrimofy")}
                  className="w-full py-3 bg-[#B35F27] hover:bg-[#964d1d] text-[#EDE7E0] font-bold rounded-lg uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#B35F27]/20 cursor-pointer"
                >
                  Contactar con Patrimofy
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => selectAgency("chichaus")}
                  className="w-full py-3 bg-white hover:bg-white/80 border border-[#0A0D0B]/15 text-[#0A0D0B] font-bold rounded-lg uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  Contactar con Chichaus
                  <ArrowRight className="h-4 w-4 text-[#B35F27]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
