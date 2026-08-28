"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShieldCheck } from "lucide-react";

interface LuwanaReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotRawId?: string;
}

export default function LuwanaReferralModal({ isOpen, onClose, lotRawId }: LuwanaReferralModalProps) {
  if (!isOpen) return null;

  const selectAgency = (agency: "patrimofy" | "chichaus") => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("luwana_ref", agency);
      if (agency === "patrimofy") {
        window.open("https://patrimofy.com/es/luwana#contacto", "_blank");
      } else {
        window.open("https://chichaus.com/", "_blank");
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
          className="bg-[#EFE9E1] border border-[#A58E74]/40 p-6 sm:p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl relative text-[#152A2D]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#152A2D]/50 hover:text-[#152A2D] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A58E74]/15 border border-[#A58E74]/30 text-[#A58E74] text-[10px] font-bold uppercase tracking-widest rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Canales Autorizados</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-[#152A2D] font-bold">
              Selecciona tu Firma Asesora
            </h3>
            <p className="text-xs text-[#152A2D]/75 leading-relaxed font-sans">
              {lotRawId ? (
                <>
                  Para brindarte asesoría personalizada y directa en la separación del <strong>Lote {lotRawId}</strong>, por favor elige una de las 2 firmas autorizadas:
                </>
              ) : (
                <>
                  Para brindarte atención inmediata sobre el proyecto <strong>Luwana Beach Residence Cartagena</strong>, elige tu firma de preferencia entre los 2 canales autorizados:
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {/* Patrimofy */}
            <button
              onClick={() => selectAgency("patrimofy")}
              className="w-full py-3.5 bg-[#A58E74] hover:bg-[#8e785f] text-[#EFE9E1] font-bold rounded-xl uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#A58E74]/25 cursor-pointer hover:scale-[1.02]"
            >
              <span>Contactar con Patrimofy</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Chichaus */}
            <button
              onClick={() => selectAgency("chichaus")}
              className="w-full py-3.5 bg-white hover:bg-white/80 border border-[#152A2D]/15 text-[#152A2D] font-bold rounded-xl uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <span>Contactar con Chichaus</span>
              <ArrowRight className="h-4 w-4 text-[#A58E74]" />
            </button>
          </div>

          <div className="pt-2 border-t border-[#152A2D]/10 flex items-center justify-center gap-1.5 text-[9px] text-[#152A2D]/60 uppercase tracking-wider font-semibold">
            <ShieldCheck className="h-3 w-3 text-[#A58E74]" />
            <span>Patrimofy &amp; Chichaus &bull; Canales autorizados de comercialización</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
