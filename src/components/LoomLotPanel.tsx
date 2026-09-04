"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Layout, 
  Calculator, 
  Ruler, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  Layers,
  Sparkles,
  MessageCircle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import LoomReferralModal from "./LoomReferralModal";
import { 
  initReferralTracking, 
  getActiveAdvisor, 
  buildLotWhatsAppUrl, 
  Advisor 
} from "@/lib/referralTracking";

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
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [financingMonths, setFinancingMonths] = useState<number>(36);

  // Lightbox Modal para el plano arquitectónico en alta resolución
  const [isPlanLightboxOpen, setIsPlanLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  const [assignedAdvisor, setAssignedAdvisor] = useState<Advisor | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const adv = initReferralTracking();
      if (adv) {
        setAssignedAdvisor(adv);
        setReferrer(adv.agency.toLowerCase());
      } else {
        const active = getActiveAdvisor();
        if (active) {
          setAssignedAdvisor(active);
          setReferrer(active.agency.toLowerCase());
        } else {
          const stored = sessionStorage.getItem("loom_ref");
          if (stored) {
            setReferrer(stored);
          } else if (window.location.hostname.includes("patrimofy.com")) {
            sessionStorage.setItem("loom_ref", "patrimofy");
            setReferrer("patrimofy");
          }
        }
      }
    }
  }, []);

  // Reset zoom y error cuando cambia el lote
  useEffect(() => {
    setLightboxZoom(1);
    setImgLoadError(false);
  }, [lot?.id]);

  // Manejador tecla Escape para cerrar Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPlanLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Notificar iframe parent si aplica
  useEffect(() => {
    if (typeof window !== "undefined" && lot && window.parent !== window) {
      window.parent.postMessage({
        type: 'LOT_SELECTED',
        payload: {
          lotId: lot.id,
          price: lot.totalPrice
        }
      }, '*');
    }
  }, [lot]);

  // Cálculos dinámicos del simulador de cuotas
  const parsedPriceNum = useMemo(() => {
    if (!lot?.totalPrice) return 0;
    const digits = lot.totalPrice.replace(/[^\d]/g, '');
    return parseInt(digits, 10) || 0;
  }, [lot]);

  const calculatedFinancing = useMemo(() => {
    if (!parsedPriceNum) return null;
    const downAmount = Math.round(parsedPriceNum * (downPaymentPct / 100));
    const finalAmount = Math.round(parsedPriceNum * 0.20);
    const financeTotal = parsedPriceNum - downAmount - finalAmount;
    const monthlyAmount = financeTotal > 0 ? Math.round(financeTotal / financingMonths) : 0;
    return {
      downAmount,
      finalAmount,
      financeTotal,
      monthlyAmount,
    };
  }, [parsedPriceNum, downPaymentPct, financingMonths]);

  // Desglose de Manzana y Número de Lote
  const lotDetails = useMemo(() => {
    if (!lot) return { block: "", number: "", isAmenity: true, imageSrc: "" };
    const isAmenity = lot.status === "common" || 
                      lot.statusRaw === "AMENIDAD" || 
                      lot.id?.includes("PARQUE") || 
                      lot.id?.includes("PORTERIA") || 
                      lot.id?.includes("CLUB");

    const identifier = lot.rawId || lot.id || "";
    const match = identifier.match(/([A-Za-z])-?(\d+)/);
    let block = "";
    let number = "";
    let imageSrc = "";

    if (match) {
      block = match[1].toUpperCase();
      number = match[2].padStart(2, '0');
      imageSrc = `/loom/lots/${block}-${number}.webp`;
    } else {
      imageSrc = `/loom/lots/${identifier}.webp`;
    }

    return { block, number, isAmenity, imageSrc };
  }, [lot]);

  if (!lot) return null;

  // Lógica del botón de separar lote (atribución y WhatsApp de asesor)
  const handleSeparateClick = () => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({
        type: 'LOT_SEPARATE_CLICKED',
        payload: {
          lotId: lot.rawId || lot.id,
          price: lot.totalPrice,
          advisor: assignedAdvisor?.slug || null,
        }
      }, '*');
      return;
    }

    const currentAdvisor = assignedAdvisor || getActiveAdvisor();

    // 1. Si hay un asesor asignado por link / cookie, abrir directo su WhatsApp
    if (currentAdvisor) {
      const waUrl = buildLotWhatsAppUrl(
        {
          id: lot.id,
          rawId: lot.rawId,
          price: lot.totalPrice,
          area: lot.area,
        },
        "LOOM Luxury Residence",
        currentAdvisor
      );
      window.open(waUrl, "_blank");
      return;
    }

    // 2. Si viene de una inmobiliaria general o dominio Patrimofy
    const currentRef = typeof window !== "undefined" 
      ? sessionStorage.getItem("loom_ref") || (window.location.hostname.includes("patrimofy.com") ? "patrimofy" : referrer) 
      : referrer;

    if (currentRef === "patrimofy" || (typeof window !== "undefined" && window.location.hostname.includes("patrimofy.com") && currentRef !== "chichaus")) {
      const waUrl = buildLotWhatsAppUrl(
        {
          id: lot.id,
          rawId: lot.rawId,
          price: lot.totalPrice,
          area: lot.area,
        },
        "LOOM Luxury Residence"
      );
      window.open(waUrl, "_blank");
    } else if (currentRef === "chichaus") {
      window.open("https://www.loomalmabeach.com/#contacto", "_blank");
    } else {
      setShowReferralModal(true);
    }
  };

  const getStatusBadge = (status: string) => {
    if (lotDetails.isAmenity) {
      return (
        <div className="flex items-center gap-1 bg-[#B35F27]/15 text-[#B35F27] border border-[#B35F27]/40 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Amenidad / Zona Común
        </div>
      );
    }
    switch (status) {
      case "available":
        return (
          <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-800 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
            Disponible
          </div>
        );
      case "blocked":
        return (
          <div className="flex items-center gap-1 bg-[#3b82f6]/15 text-[#1e40af] border border-[#3b82f6]/30 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
            Bloqueado
          </div>
        );
      case "sold":
        return (
          <div className="flex items-center gap-1 bg-red-500/15 text-red-700 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600" />
            Vendido
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-black/10 text-[#0A0D0B]/60 border border-[#0A0D0B]/10 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
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
        className="fixed top-0 right-0 z-40 h-[100dvh] w-[85vw] max-md:landscape:w-[48vw] md:w-[24rem] lg:w-[28rem] bg-[#EDE7E0]/95 border-l border-[#0A0D0B]/15 shadow-2xl backdrop-blur-xl flex flex-col text-[#0A0D0B] justify-between"
      >
        {/* Cabecera del Panel */}
        <div className="p-4 sm:p-5 border-b border-[#0A0D0B]/10 flex justify-between items-center relative z-10 bg-[#EDE7E0]/80">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[#B35F27] font-bold block">LOOM Luxury Residence</span>
              <h2 className="text-lg sm:text-2xl font-serif text-[#0A0D0B] font-bold tracking-wide mt-0.5">
                {lotDetails.isAmenity ? lot.rawId : `Lote ${lot.rawId}`}
              </h2>
            </div>
            <div>
              {getStatusBadge(lot.status)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 border border-[#0A0D0B]/10 hover:border-[#0A0D0B]/20 rounded-full transition-all duration-300 group cursor-pointer"
            title="Cerrar detalles del lote"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A0D0B]/70 group-hover:text-[#0A0D0B]" />
          </button>
        </div>

        {/* Cuerpo del Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 relative z-10">
          
          {/* Cinta Compacta de Dimensiones */}
          <div className="grid grid-cols-2 bg-white/80 border border-[#0A0D0B]/10 p-2.5 sm:p-3.5 rounded-xl text-center items-center shadow-sm">
            <div className="border-r border-[#0A0D0B]/10 pr-2">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#0A0D0B]/50 block font-bold">Área Total</span>
              <span className="text-xs sm:text-base font-serif text-[#0A0D0B] font-bold mt-0.5 block">
                {lot.area.includes("m²") || lot.area.includes("Común") ? lot.area : `${lot.area} m²`}
              </span>
            </div>
            <div className="pl-2">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#0A0D0B]/50 block font-bold">Tipología</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#0A0D0B] mt-0.5 block">
                {lot.location || "MEDIANERO"}
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 📐 SECCIÓN: PLANO ARQUITECTÓNICO & MEDIDAS INDIVIDUALES      */}
          {/* ============================================================ */}
          {!lotDetails.isAmenity && !imgLoadError && (
            <div className="bg-white/90 border border-[#B35F27]/25 rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#B35F27]">
                  <Ruler className="h-4 w-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0A0D0B]">
                    Plano & Medidas del Lote
                  </span>
                </div>
                {lotDetails.block && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#B35F27]/10 text-[#B35F27] border border-[#B35F27]/20 px-2 py-0.5 rounded-md">
                    Mz {lotDetails.block} &bull; Lote {lotDetails.number}
                  </span>
                )}
              </div>

              {/* Contenedor Interactivo de la Imagen del Lote */}
              <div 
                onClick={() => setIsPlanLightboxOpen(true)}
                className="relative w-full aspect-square bg-[#0A0D0B]/[0.03] rounded-xl overflow-hidden border border-[#0A0D0B]/10 cursor-pointer group shadow-inner flex items-center justify-center transition-all duration-300 hover:border-[#B35F27]/50"
              >
                <img
                  src={lotDetails.imageSrc}
                  alt={`Plano y medidas del Lote ${lot.rawId || lot.id}`}
                  className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  onError={() => setImgLoadError(true)}
                />

                {/* Overlay flotante al pasar el cursor */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-2.5">
                  <span className="text-white text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-md bg-black/50 px-2.5 py-1 rounded-full border border-white/20">
                    <Maximize2 className="h-3 w-3 text-[#EBD9AB]" />
                    Ampliar medidas (HD)
                  </span>
                  <span className="text-[9px] text-[#EBD9AB] font-mono font-bold bg-[#B35F27]/80 px-2 py-0.5 rounded">
                    1080p
                  </span>
                </div>

                {/* Botón de lupa permanente en esquina */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlanLightboxOpen(true);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-[#0A0D0B] shadow-md border border-[#0A0D0B]/10 hover:bg-[#B35F27] hover:text-white transition-colors duration-200"
                  title="Ver en pantalla completa"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Parámetros dimensionales y nota de cotas */}
              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] pt-0.5">
                <div className="bg-[#EDE7E0]/60 p-2 rounded-lg border border-[#0A0D0B]/5">
                  <span className="text-[8px] uppercase tracking-wider text-[#0A0D0B]/50 font-bold block">Área Registrada</span>
                  <span className="font-serif font-bold text-[#0A0D0B] text-xs block mt-0.5">
                    {lot.area.includes("m²") ? lot.area : `${lot.area} m²`}
                  </span>
                </div>
                <div className="bg-[#EDE7E0]/60 p-2 rounded-lg border border-[#0A0D0B]/5">
                  <span className="text-[8px] uppercase tracking-wider text-[#0A0D0B]/50 font-bold block">Tipología</span>
                  <span className="font-semibold text-[#0A0D0B] text-xs capitalize truncate block mt-0.5">
                    {lot.location || "Medianero"}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-[#0A0D0B]/60 leading-tight italic flex items-center gap-1.5 pt-0.5">
                <Info className="h-3 w-3 text-[#B35F27] shrink-0" />
                <span>Cotas perimetrales y linderos exactos en metros según plano arquitectónico.</span>
              </p>
            </div>
          )}

          {/* Sección Financiera solo para Lotes Disponibles y Reservados */}
          {(lot.status === "available" || lot.status === "reserved") && !lotDetails.isAmenity ? (
            <div className="space-y-3">
              {/* Tarjeta de Valor Total */}
              <div className="bg-[#0A0D0B] text-[#EDE7E0] rounded-2xl p-4 sm:p-5 shadow-md space-y-1">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#EBD9AB] font-mono block">
                  Valor Total de Inversión (COP)
                </span>
                <p className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                  {lot.totalPrice || "Consultar"}
                </p>
                {lot.pricePerM2 && (
                  <p className="text-white/50 text-[11px]">Valor por m²: {lot.pricePerM2}</p>
                )}
              </div>

              {/* Simulador Interactivo de Pagos en Obra */}
              {calculatedFinancing && (
                <div className="bg-white/90 border border-[#B35F27]/30 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[#B35F27] text-xs font-bold uppercase tracking-wider">
                    <Calculator size={14} />
                    <span>Simulador de Plan de Pagos</span>
                  </div>

                  {/* Slider Cuota Inicial */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#0A0D0B]/70">Cuota Inicial ({downPaymentPct}%):</span>
                      <span className="text-[#B35F27] font-bold">${calculatedFinancing.downAmount.toLocaleString("es-CO")}</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="50"
                      step="5"
                      value={downPaymentPct}
                      onChange={(e) => setDownPaymentPct(parseInt(e.target.value, 10))}
                      className="w-full accent-[#B35F27] cursor-pointer"
                    />
                  </div>

                  {/* Selector de Plazo */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#0A0D0B]/70">Plazo de Financiación:</span>
                      <span className="text-[#B35F27] font-bold">{financingMonths} meses</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {[12, 24, 36].map((m) => (
                        <button
                          key={m}
                          onClick={() => setFinancingMonths(m)}
                          className={`py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                            financingMonths === m
                              ? "bg-[#B35F27] text-white shadow-sm"
                              : "bg-[#EDE7E0]/80 text-[#0A0D0B]/70 hover:bg-white"
                          }`}
                        >
                          {m} meses
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resumen de Cuota Mensual Estimada */}
                  <div className="pt-2 border-t border-[#0A0D0B]/10 flex justify-between items-baseline">
                    <span className="text-xs text-[#0A0D0B]/70 font-semibold">Cuota Mensual ({financingMonths}x):</span>
                    <span className="text-base font-serif font-bold text-emerald-700">
                      ${calculatedFinancing.monthlyAmount.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/90 border border-[#B35F27]/25 rounded-xl p-4 space-y-2 shadow-sm">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#B35F27] border-b border-[#B35F27]/20 pb-1 font-bold">
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
          {assignedAdvisor ? (
            <div className="bg-[#B35F27]/15 border border-[#B35F27]/35 rounded-xl p-2.5 text-[10px] text-[#0A0D0B] leading-relaxed uppercase tracking-wider text-center font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <span>Tu Asesor: <strong>{assignedAdvisor.name}</strong> &bull; {assignedAdvisor.agency}</span>
            </div>
          ) : referrer ? (
            <div className="bg-[#B35F27]/10 border border-[#B35F27]/30 rounded-xl p-2.5 text-[9px] sm:text-[10px] text-[#0A0D0B]/80 leading-relaxed uppercase tracking-wider text-center font-medium">
              Asesoría comercializada por <strong className="text-[#0A0D0B] font-bold">{referrer === "patrimofy" ? "Patrimofy" : "Chichaus"}</strong>
            </div>
          ) : null}
        </div>

        {/* Botones de Acción Fijos Inferiores */}
        <div className="p-4 sm:p-5 border-t border-[#0A0D0B]/10 bg-[#EDE7E0] space-y-2">
          {lotDetails.isAmenity ? (
            <div className="w-full py-3 text-center text-[#B35F27] font-bold uppercase tracking-widest text-[10px] border border-[#B35F27]/30 rounded-xl bg-[#B35F27]/10 shadow-sm">
              Zona Común Equipada &bull; Proyecto Loom
            </div>
          ) : lot.status === "sold" ? (
            <div className="w-full py-3 text-center text-red-600 font-bold uppercase tracking-widest text-[10px] border border-red-500/30 rounded-xl bg-red-500/10 shadow-sm">
              Lote Vendido &bull; No disponible
            </div>
          ) : lot.status === "blocked" ? (
            <div className="w-full py-3 text-center text-blue-700 font-bold uppercase tracking-widest text-[10px] border border-blue-500/30 rounded-xl bg-blue-500/10 shadow-sm">
              Lote Bloqueado &bull; Reserva Administrativa
            </div>
          ) : (
            <>
              <button
                onClick={() => onEnterShowroom(lot)}
                className="w-full py-3.5 bg-[#B35F27] hover:bg-[#964d1d] text-white font-bold rounded-xl uppercase tracking-[0.15em] text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#B35F27]/25 cursor-pointer hover:scale-[1.01]"
              >
                <Layout className="h-4 w-4" />
                <span>Ingresar al Showroom</span>
              </button>
              <button
                onClick={handleSeparateClick}
                className="w-full py-3 bg-white hover:bg-white/80 border border-[#0A0D0B]/15 text-[#0A0D0B] font-bold rounded-xl uppercase tracking-[0.15em] text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {assignedAdvisor ? <MessageCircle className="h-4 w-4 text-[#25D366]" /> : <Phone className="h-4 w-4 text-[#B35F27]" />}
                <span>{assignedAdvisor ? `Separar por WhatsApp (${assignedAdvisor.name.split(" ")[0]})` : "Separar Lote"}</span>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 🔍 LIGHTBOX MODAL: PLANO Y MEDIDAS EN ALTA RESOLUCIÓN        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isPlanLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0D0B]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
            onClick={() => setIsPlanLightboxOpen(false)}
          >
            {/* Header del Lightbox */}
            <div 
              className="flex justify-between items-center w-full max-w-6xl mx-auto z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#B35F27]/20 border border-[#B35F27]/40 text-[#EBD9AB]">
                  <Ruler className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#EBD9AB] font-mono font-bold block">
                    LOOM LUXURY RESIDENCE &bull; PLANO TÉCNICO OFICIAL
                  </span>
                  <h3 className="text-base sm:text-xl font-serif font-bold text-white tracking-wide">
                    Lote <span className="text-[#B35F27]">{lot.rawId || lot.id}</span> &bull; {lot.area.includes("m²") ? lot.area : `${lot.area} m²`}
                  </h3>
                </div>
              </div>

              {/* Botones de Control de Zoom & Cerrar */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/15">
                  <button
                    onClick={() => setLightboxZoom(prev => Math.max(0.75, prev - 0.25))}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                    title="Reducir zoom"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-[#EBD9AB] px-2">
                    {Math.round(lightboxZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setLightboxZoom(prev => Math.min(3, prev + 0.25))}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                    title="Aumentar zoom"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLightboxZoom(1)}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
                    title="Restablecer zoom"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setIsPlanLightboxOpen(false)}
                  className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-[#B35F27] border border-white/20 text-white transition-all cursor-pointer"
                  title="Cerrar (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenedor Central de la Imagen con Zoom */}
            <div 
              className="flex-1 flex items-center justify-center overflow-hidden my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: lightboxZoom }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="max-w-4xl max-h-[75vh] p-2 bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex items-center justify-center"
              >
                <img
                  src={lotDetails.imageSrc}
                  alt={`Plano Lote ${lot.rawId}`}
                  className="max-w-full max-h-[70vh] object-contain select-none"
                />
              </motion.div>
            </div>

            {/* Footer Informativo del Lightbox */}
            <div 
              className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-white/70 text-xs z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#B35F27]/20 border border-[#B35F27]/40 text-[#EBD9AB] font-bold text-[10px] uppercase">
                  Tipología: {lot.location || "Medianero"}
                </span>
                <span className="text-[11px] text-white/80">
                  Medidas de linderos, fondos y frentes expresadas en metros lineales (m).
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/50">
                Presiona Esc para cerrar
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Selección de Inmobiliaria */}
      <LoomReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        lotRawId={lot.rawId}
      />
    </>
  );
}
