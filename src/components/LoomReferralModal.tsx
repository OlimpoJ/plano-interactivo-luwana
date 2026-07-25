"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShieldCheck } from "lucide-react";

interface LoomReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotRawId?: string;
}

export default function LoomReferralModal({ isOpen, onClose, lotRawId }: LoomReferralModalProps) {
  if (!isOpen) return null;

  const selectAgency = (agency: "patrimofy" | "chichaus") => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("loom_ref", agency);
      if (agency === "patrimofy") {
        window.open("https://www.patrimofy.com/es/loom#contacto", "_blank");
      } else {
        window.open("https://www.loomalmabeach.com/contacto/", "_blank");
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-[#EDE7E0] border border-[#B35F27]/40 p-6 sm:p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl relative text-[#0A0D0B]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#0A0D0B]/50 hover:text-[#0A0D0B] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B35F27] font-bold block">
              Asesoría Comercial &bull; LOOM Luxury Residence
            </span>
            <h3 className="text-xl sm:text-2xl font-serif text-[#0A0D0B] font-bold">
              Selecciona tu Firma Asesora
            </h3>
            <p className="text-xs text-[#0A0D0B]/75 leading-relaxed font-sans">
              {lotRawId ? (
                <>
                  Para brindarte asesoría personalizada en la separación del <strong>Lote {lotRawId}</strong>, por favor elige una de nuestras firmas autorizadas:
                </>
              ) : (
                <>
                  Para brindarte atención inmediata y personalizada sobre el proyecto <strong>LOOM Luxury Residence Cartagena</strong>, elige tu firma asesora de preferencia:
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 pt-2">
            {/* Patrimofy (Opción Principal Destacada) */}
            <div className="space-y-1">
              <button
                onClick={() => selectAgency("patrimofy")}
                className="w-full py-3.5 bg-[#B35F27] hover:bg-[#964d1d] text-[#EDE7E0] font-bold rounded-xl uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#B35F27]/25 cursor-pointer hover:scale-[1.02]"
              >
                <span>Contactar con Patrimofy</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-center gap-1 text-[9px] text-[#B35F27] font-semibold uppercase tracking-wider pt-0.5">
                <ShieldCheck className="h-3 w-3" /> Firma Comercializadora Oficial
              </div>
            </div>

            {/* Chichaus */}
            <button
              onClick={() => selectAgency("chichaus")}
              className="w-full py-3.5 bg-white hover:bg-white/80 border border-[#0A0D0B]/15 text-[#0A0D0B] font-bold rounded-xl uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <span>Contactar con Chichaus</span>
              <ArrowRight className="h-4 w-4 text-[#B35F27]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
