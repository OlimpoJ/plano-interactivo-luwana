"use client";
import { useState, useEffect } from "react";
import styles from "./Loom.module.css";
import LoomMasterplanSelector from "@/components/LoomMasterplanSelector";
import LoomStageViewer from "@/components/LoomStageViewer";
import LoomLotPanel from "@/components/LoomLotPanel";
import LoomShowroomView from "@/components/LoomShowroomView";
import LoomOrientationWrapper from "@/components/LoomOrientationWrapper";
import LoomSideMenu from "@/components/LoomSideMenu";
import LoomLocationModal from "@/components/LoomLocationModal";
import LoomReferralModal from "@/components/LoomReferralModal";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, Maximize2, Minimize2, ArrowLeft } from "lucide-react";

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

function AnimatedCounter({ endValue, duration = 2000 }: { endValue: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (endValue === 0) return;
    let startTime: number;
    let animationFrameId: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = time - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      const easeOut = progressRatio === 1 ? 1 : 1 - Math.pow(2, -10 * progressRatio);
      
      setCount(Math.floor(easeOut * endValue));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  return <>{count}</>;
}

export default function LoomShowroom() {
  const [view, setView] = useState<"hero" | "map" | "stage" | "showroom">("hero");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [stats, setStats] = useState({
    total: 326,
    sold: 26,
    available: 300
  });

  // Check embed & deep linking parameters from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stageParam = params.get("stage");
      const lotParam = params.get("lot");
      
      if (stageParam) {
        let normalizedStage = stageParam.toLowerCase();
        if (!normalizedStage.startsWith("etapa_")) {
          normalizedStage = `etapa_${normalizedStage}`;
        }
        queueMicrotask(() => {
          setSelectedStage(normalizedStage);
          setView("stage");
        });
      } else if (lotParam) {
        queueMicrotask(() => {
          setView("stage");
        });
      } else if (params.get("embed") === "true" || params.get("view") === "map") {
        queueMicrotask(() => {
          setView("map");
        });
      }
    }
  }, []);

  // Global Overlay UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Pantalla Completa
  const toggleFullscreen = () => {
    if (typeof window === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error al activar pantalla completa:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch((err) => {
          console.error("Error al salir de pantalla completa:", err);
        });
      }
    }
  };

  // Listener para sync de cambios de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Guardar y leer el parámetro de referido ?ref= de la URL
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        sessionStorage.setItem("loom_ref", ref.toLowerCase());
        setReferrer(ref.toLowerCase());
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
  }, []);

  // Cargar lotes y estadísticas
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/lots?project=loom');
        const data = await response.json();
        
        if (data.success && data.lots) {
          setLots(data.lots);
          const total = data.lots.length;
          const available = data.lots.filter((l: { status: string }) => l.status === 'available').length;
          const sold = data.lots.filter((l: { status: string }) => l.status === 'sold').length;

          setStats({
            total: total > 0 ? total : 326,
            sold: total > 0 ? sold : 26,
            available: total > 0 ? available : 300
          });
        }
      } catch (error) {
        console.error("Error fetching live stats for Loom:", error);
      }
    }
    fetchStats();
  }, []);

  const handleOpenContact = () => {
    const currentRef = typeof window !== "undefined"
      ? sessionStorage.getItem("loom_ref") || (window.location.hostname.includes("patrimofy.com") ? "patrimofy" : referrer)
      : referrer;

    if (currentRef === "patrimofy" || (typeof window !== "undefined" && window.location.hostname.includes("patrimofy.com") && currentRef !== "chichaus")) {
      window.open("https://www.patrimofy.com/es/loom#contacto", "_blank");
    } else if (currentRef === "chichaus") {
      window.open("https://www.loomalmabeach.com/#contacto", "_blank");
    } else {
      setIsReferralModalOpen(true);
    }
  };

  const handleCloseLotPanel = () => {
    setSelectedLot(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("lot")) {
        url.searchParams.delete("lot");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  };

  const handleNavigateToShowroom = () => {
    if (!selectedLot) {
      const sampleLot = lots.find((l) => l.status === "available") || {
        id: "B-22",
        rawId: "B-22",
        area: "252.79",
        location: "ESQUINERO",
        status: "available",
        statusRaw: "DISPONIBLE",
        totalPrice: "$267,957,400",
        downPayment: "$53,591,480",
        financing: "$3,907,712",
        finalPayment: "$26,795,740",
      };
      setSelectedLot(sampleLot as Lot);
    }
    setView("showroom");
  };

  return (
    <LoomOrientationWrapper>
      
      {/* Controles Flotantes Globales (Menú Hamburguesa & Regresar al Master Plan en Hero) */}
      <div className="fixed top-4 left-4 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2.5 sm:p-3 rounded-full bg-[#EDE7E0]/90 text-[#0A0D0B] border border-[#0A0D0B]/15 shadow-xl backdrop-blur-md hover:bg-[#EDE7E0] hover:text-[#B35F27] transition-all duration-300 group cursor-pointer"
          title="Menú de Navegación"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
        </button>

        {view === "hero" && (
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EDE7E0]/90 text-[#0A0D0B] border border-[#0A0D0B]/15 shadow-xl backdrop-blur-md hover:bg-[#EDE7E0] hover:text-[#B35F27] text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg"
          >
            <ArrowLeft size={14} />
            <span>Regresar al Master Plan</span>
          </Link>
        )}
      </div>

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={toggleFullscreen}
          className="p-2.5 sm:p-3 rounded-full bg-[#EDE7E0]/90 text-[#0A0D0B] border border-[#0A0D0B]/15 shadow-xl backdrop-blur-md hover:bg-[#EDE7E0] hover:text-[#B35F27] transition-all duration-300 group cursor-pointer"
          title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
          ) : (
            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Menú Lateral Desplegable */}
      <LoomSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigateToIntro={() => setView("hero")}
        onNavigateToMasterplan={() => setView("map")}
        onNavigateToShowroom={handleNavigateToShowroom}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenContact={handleOpenContact}
      />

      {/* Modal de Ubicación (Google Earth & Cartagena) */}
      <LoomLocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      {/* Modal de Selección de Firma Comercializadora */}
      <LoomReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
      />

      {/* Vistas Principales del Showroom */}
      {view === "showroom" && selectedLot ? (
        /* Vista del Showroom Interactivo de la Villa */
        <LoomShowroomView
          selectedLot={selectedLot}
          stageId={selectedStage || "etapa_1"}
          onBack={() => setView("stage")}
        />
      ) : view === "stage" && selectedStage ? (
        /* Vista de Lotes por Etapa */
        <div className="relative w-full min-h-screen bg-[#070c16] overflow-hidden flex flex-col">
          <LoomStageViewer
            stageId={selectedStage}
            lots={lots}
            selectedLot={selectedLot}
            onSelectLot={(lot) => setSelectedLot(lot)}
            onBack={() => {
              setView("map");
              setSelectedLot(null);
            }}
            onChangeStage={(newStageId) => {
              setSelectedStage(newStageId);
              setSelectedLot(null);
            }}
          />

          {/* Panel Lateral con transición Framer Motion */}
          <AnimatePresence>
            {selectedLot && (
              <LoomLotPanel
                lot={selectedLot}
                onClose={handleCloseLotPanel}
                onEnterShowroom={(lot) => setView("showroom")}
              />
            )}
          </AnimatePresence>
        </div>
      ) : view === "map" ? (
        /* Vista de Plano de Urbanismo (Master Plan) */
        <LoomMasterplanSelector
          lots={lots}
          onSelectStage={(stageId) => {
            setSelectedStage(stageId);
            setView("stage");
          }}
          onBack={() => setView("hero")}
        />
      ) : (
        /* Pantalla Hero de Entrada */
        <main className="loom-theme relative w-full min-h-screen bg-black overflow-hidden flex flex-col text-white select-none">
          <section className={styles.heroContainer}>
            {/* Video de Fondo de Loom */}
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/loom/hero_poster_loom.webp"
              className={styles.backgroundVideo}
            >
              <source src="https://pub-4740e3c376864a1b9b475fcaa0294417.r2.dev/VHEROLOOMV2.mp4" type="video/mp4" />
            </video>

            {/* Overlay con Gradientes Premium */}
            <div className={styles.gradientOverlay}></div>

            <div className={styles.heroContentCentrado}>
              {/* Logo de Loom en el Centro */}
              <div className={styles.centerLogoContainer}>
                <img 
                  src="/loom/logo_loom.png" 
                  alt="Loom Luxury Residence" 
                  className={styles.logoCentrado}
                />
              </div>

              {/* Estadísticas de Disponibilidad (Visibles en Celular Vertical / Ocultas en Celular Horizontal por Altura Reducida) */}
              <div className={`flex gap-2 sm:gap-4 justify-center my-3 sm:my-6 text-center relative z-10 px-2 ${styles.heroStatsContainer}`}>
                {/* Lotes Totales */}
                <div className="px-2.5 py-1.5 sm:px-6 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/35 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 flex-1 sm:flex-initial min-w-[75px] sm:min-w-[125px]">
                  <span className="text-[#F3E5AB] font-bold text-sm sm:text-2xl md:text-3xl block font-serif tracking-wider [text-shadow:_0_1.5px_6px_rgba(0,0,0,0.9)]">
                    <AnimatedCounter endValue={stats.total} />
                  </span>
                  <span className="text-white font-bold text-[7px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.15em] block mt-0.5 [text-shadow:_0_1px_3px_rgba(0,0,0,0.9)]">
                    Lotes Totales
                  </span>
                </div>

                {/* Disponibles */}
                <div className="px-2.5 py-1.5 sm:px-6 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-[#7EF3D0]/60 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 flex-1 sm:flex-initial min-w-[75px] sm:min-w-[125px]">
                  <span className="text-[#7EF3D0] font-bold text-sm sm:text-2xl md:text-3xl block font-serif tracking-wider [text-shadow:_0_1.5px_6px_rgba(0,0,0,0.9)]">
                    <AnimatedCounter endValue={stats.available} />
                  </span>
                  <span className="text-[#7EF3D0] font-bold text-[7px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.15em] block mt-0.5 [text-shadow:_0_1px_3px_rgba(0,0,0,0.9)]">
                    Disponibles
                  </span>
                </div>

                {/* Vendidos */}
                <div className="px-2.5 py-1.5 sm:px-6 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/35 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 flex-1 sm:flex-initial min-w-[75px] sm:min-w-[125px]">
                  <span className="text-white font-bold text-sm sm:text-2xl md:text-3xl block font-serif tracking-wider [text-shadow:_0_1.5px_6px_rgba(0,0,0,0.9)]">
                    <AnimatedCounter endValue={stats.sold} />
                  </span>
                  <span className="text-white/90 font-bold text-[7px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.15em] block mt-0.5 [text-shadow:_0_1px_3px_rgba(0,0,0,0.9)]">
                    Vendidos
                  </span>
                </div>
              </div>

              {/* Botón de Entrar Centrado (Estilo Glassmorphism de Loom) */}
              <button 
                onClick={() => setView("map")}
                className={styles.entrarBtn}
              >
                Ingresar al Showroom
              </button>
            </div>
          </section>
        </main>
      )}
    </LoomOrientationWrapper>
  );
}
