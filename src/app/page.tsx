"use client";

import { useState, useEffect } from "react";
import { MapPin, Compass } from "lucide-react";
import MastterplanSelector from "@/components/MastterplanSelector";
import StageView from "@/components/StageView";
import styles from "./Hero.module.css";

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

export default function Home() {
  const [view, setView] = useState<"hero" | "map" | "stage">("hero");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  if (view === "stage" && selectedStage) {
    return <StageView stageId={selectedStage} onBack={() => setView("map")} />;
  }

  if (view === "map") {
    return (
      <MastterplanSelector 
        onSelectZone={(zoneId) => {
          setSelectedStage(zoneId);
          setView("stage");
        }} 
      />
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col text-white">
      <section className={styles.heroContainer}>
        {/* Video de Fondo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.backgroundVideo}
        >
          <source src="/showroom loop.mp4" type="video/mp4" />
        </video>

        {/* Overlay con Gradientes Premium */}
        <div className={styles.gradientOverlay}></div>

        {/* Logo Superior */}
        <div className={styles.logoContainer}>
          <img 
            src="/LOGO LUWANA BLANCO01.png" 
            alt="Luwana Alma Beach" 
            className={styles.logo}
            onError={(e) => {
               (e.target as HTMLImageElement).src = "/LOGO SVG.svg";
            }}
          />
        </div>

        {/* Estructura Izquierda / Derecha de Patrimofy */}
        <div className={styles.heroContent}>
          <div className={styles.leftColumn}>
            <h1 className={styles.heroTitle}>
              Exclusividad Inmobiliaria Frente al Mar Caribe
            </h1>
            <p className={styles.heroSubtitle}>
              Adquiere tu lote frente al mar en la zona con más desarrollo de Cartagena y construye tu Residencia Boutique con nuestros diseños de autor. Lujo para tu hogar y alta rentabilidad para tu negocio de rentas cortas.
            </p>
            
            <div className={styles.buttons}>
              <button 
                onClick={() => setView("map")}
                className={styles.primaryBtn}
                style={{ backgroundColor: "#CBAA85", color: "#000" }}
              >
                <Compass size={16} />
                Ingresa al Showroom
              </button>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.statsContainer}>
              <div className={styles.statBox}>
                <span className={styles.statValue}><AnimatedCounter endValue={122} /></span>
                <span className={styles.statLabel}>Villas Totales</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statBox}>
                <span className={styles.statValue}><AnimatedCounter endValue={31} /></span>
                <span className={styles.statLabel}>Disponibles</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>$<AnimatedCounter endValue={250} />M</span>
                <span className={styles.statLabel}>Inversión</span>
              </div>
            </div>
            <div className={styles.locationSmall}>
              <MapPin size={16} color="#CBAA85" /> Zona Norte, Cartagena
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
