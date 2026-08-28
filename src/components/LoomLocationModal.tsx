"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, MapPin, Navigation, Compass, ExternalLink, ShieldCheck, Layers } from "lucide-react";

interface LoomLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoomLocationModal({ isOpen, onClose }: LoomLocationModalProps) {
  if (!isOpen) return null;

  const googleEarthUrl =
    "https://earth.google.com/web/data=MkEKPwo9CiExbE1aeDl6Vk5rYndUb1dpYWwwLVhJamxMODMxc3B4OEQSFgoUMDNFQTM4NEM1ODMzN0Y4OTc0RDQgAUICCABKCAjP6ISsBBAB";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-4xl max-h-[92vh] bg-[#EDE7E0] text-[#0A0D0B] rounded-2xl shadow-2xl border border-[#0A0D0B]/15 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-[#0A0D0B]/10 flex justify-between items-center bg-[#EDE7E0]/90">
            <div>
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#B35F27] block">
                Ubicación Estratégica &bull; Cartagena de Indias
              </span>
              <h2 className="text-lg sm:text-2xl font-serif font-semibold text-[#0A0D0B] mt-0.5">
                LOOM Luxury Residence by Alma Beach
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 border border-[#0A0D0B]/10 transition-all duration-300 group cursor-pointer"
            >
              <X className="h-5 w-5 text-[#0A0D0B]/70 group-hover:text-[#0A0D0B]" />
            </button>
          </div>

          {/* Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
            
            {/* Banner de Google Earth 3D */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#0A0D0B] via-[#151c17] to-[#0A0D0B] p-6 sm:p-8 text-[#EDE7E0] shadow-xl border border-[#B35F27]/35 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 max-w-lg text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B35F27]/25 border border-[#B35F27]/45 text-[#EDE7E0] text-xs font-semibold uppercase tracking-wider">
                  <Globe className="h-3.5 w-3.5 text-[#B35F27] animate-spin-slow" />
                  Visualización Tridimensional 3D
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#EDE7E0]">
                  Recorrido Satelital en Google Earth
                </h3>
                <p className="text-xs sm:text-sm text-[#EDE7E0]/80 leading-relaxed font-sans">
                  Acceda a la topografía interactiva en 3D, coordenadas geográficas reales y vuelo envolvente del macroproyecto Alma Beach.
                </p>
              </div>

              <a
                href={googleEarthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#B35F27] hover:bg-[#964d1d] text-[#EDE7E0] font-semibold rounded-lg text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-[#B35F27]/30 hover:scale-[1.02] shrink-0 cursor-pointer"
              >
                <span>Explorar en Google Earth 3D</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Previsualización de Mapa Satelital Híbrido (Google Satellite Mode) */}
            <div className="w-full h-72 sm:h-96 rounded-xl overflow-hidden border border-[#0A0D0B]/20 shadow-lg relative bg-[#111]">
              <iframe
                title="Ubicación Satelital Loom Residence Cartagena"
                src="https://maps.google.com/maps?q=10.5186,-75.4851&t=h&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 contrast-[1.05] brightness-95 hover:contrast-100 hover:brightness-100 transition-all duration-500"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              {/* Overlay de información sobre el mapa satelital */}
              <div className="absolute top-3 left-3 bg-[#0A0D0B]/85 text-[#EDE7E0] backdrop-blur-md border border-[#B35F27]/40 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-[#B35F27]" />
                <span>Vista Satelital 3D &bull; Cartagena de Indias (Manzanillo / Zona Norte)</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-[#EDE7E0]/90 backdrop-blur-md border border-[#0A0D0B]/15 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#B35F27] uppercase tracking-widest shadow-sm">
                LOOM Luxury Residence
              </div>
            </div>

            {/* Tarjetas Informativas de Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white/80 border border-[#0A0D0B]/10 p-5 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-[#B35F27] font-bold text-xs uppercase tracking-wider">
                  <MapPin className="h-4 w-4" />
                  Localización Exacta
                </div>
                <h4 className="font-serif font-semibold text-base text-[#0A0D0B]">Cartagena de Indias, Colombia</h4>
                <p className="text-xs text-[#0A0D0B]/75 leading-relaxed">
                  Ubicado en el nodo de mayor desarrollo y valorización de Cartagena, integrando la tranquilidad del Caribe con conectividad urbana de primer nivel.
                </p>
              </div>

              <div className="bg-white/80 border border-[#0A0D0B]/10 p-5 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-[#B35F27] font-bold text-xs uppercase tracking-wider">
                  <Navigation className="h-4 w-4" />
                  Vías de Acceso Principales
                </div>
                <h4 className="font-serif font-semibold text-base text-[#0A0D0B]">Conexión Vía al Mar & Anillo Vial</h4>
                <p className="text-xs text-[#0A0D0B]/75 leading-relaxed">
                  Acceso directo por arterias de doble calzada que conectan en minutos con el Aeropuerto Internacional Rafael Núñez y el Centro Histórico.
                </p>
              </div>

              <div className="bg-white/80 border border-[#0A0D0B]/10 p-5 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-[#B35F27] font-bold text-xs uppercase tracking-wider">
                  <Compass className="h-4 w-4" />
                  Entorno & Puntos de Interés
                </div>
                <h4 className="font-serif font-semibold text-base text-[#0A0D0B]">Alma Beach Club & Marinas</h4>
                <p className="text-xs text-[#0A0D0B]/75 leading-relaxed">
                  Acceso directo al exclusivo ecosistema de playa, clubes náuticos, restaurantes de alta gastronomía y áreas de preservación natural.
                </p>
              </div>

              <div className="bg-white/80 border border-[#0A0D0B]/10 p-5 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-[#B35F27] font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  Desarrollo & Contexto Urbano
                </div>
                <h4 className="font-serif font-semibold text-base text-[#0A0D0B]">Ecosistema Residencial Premium</h4>
                <p className="text-xs text-[#0A0D0B]/75 leading-relaxed">
                  Urbanismo planeado con infraestructura subterránea, áreas verdes conservadas y proyección de apreciación constante.
                </p>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="px-5 py-4 sm:px-8 border-t border-[#0A0D0B]/10 bg-[#EDE7E0] flex justify-between items-center">
            <span className="text-[10px] text-[#0A0D0B]/50 uppercase tracking-widest hidden sm:inline">
              {"Coordenadas: 10°31'07.0\"N 75°29'06.4\"W"}
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#0A0D0B] hover:bg-[#1a221d] text-[#EDE7E0] text-xs uppercase font-semibold tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Cerrar Ubicación
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
