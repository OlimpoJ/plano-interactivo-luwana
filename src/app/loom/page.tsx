"use client";
import { useState, useEffect } from "react";
import styles from "./Loom.module.css";
import LoomMasterplanSelector from "@/components/LoomMasterplanSelector";
import LoomStageViewer from "@/components/LoomStageViewer";
import LoomLotPanel from "@/components/LoomLotPanel";
import LoomShowroomView from "@/components/LoomShowroomView";
import LoomOrientationWrapper from "@/components/LoomOrientationWrapper";
import { AnimatePresence } from "framer-motion";

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
    total: 247,
    sold: 160,
    available: 87
  });

  // Guardar el parámetro de referido ?ref= de la URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        sessionStorage.setItem("loom_ref", ref.toLowerCase());
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
          const available = data.lots.filter((l: any) => l.status === 'available').length;
          const sold = total - available;

          setStats({
            total: total > 0 ? total : 247,
            sold: total > 0 ? sold : 160,
            available: total > 0 ? available : 87
          });
        }
      } catch (error) {
        console.error("Error fetching live stats for Loom:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <LoomOrientationWrapper>
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
                onClose={() => setSelectedLot(null)}
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

              {/* Estadísticas de Disponibilidad */}
              <div className="flex gap-8 justify-center my-6 text-center text-xs tracking-[0.2em] uppercase font-light relative z-10">
                <div>
                  <span className="text-[#EBD9AB] font-semibold text-lg sm:text-2xl block mb-1">
                    <AnimatedCounter endValue={stats.total} />
                  </span>
                  <span className="text-white/40 text-[9px]">Lotes Totales</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 self-center"></div>
                <div>
                  <span className="text-[#699385] font-semibold text-lg sm:text-2xl block mb-1">
                    <AnimatedCounter endValue={stats.available} />
                  </span>
                  <span className="text-white/40 text-[9px]">Disponibles</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 self-center"></div>
                <div>
                  <span className="text-white/70 font-semibold text-lg sm:text-2xl block mb-1">
                    <AnimatedCounter endValue={stats.sold} />
                  </span>
                  <span className="text-white/40 text-[9px]">Vendidos</span>
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
