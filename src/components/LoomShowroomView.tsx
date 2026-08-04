"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoomLotZoomCanvas from "./LoomLotZoomCanvas";

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

interface LoomShowroomViewProps {
  selectedLot: Lot;
  stageId: string;
  onBack: () => void;
}

export default function LoomShowroomView({ selectedLot, stageId, onBack }: LoomShowroomViewProps) {
  // Active Villa Model ("luxury" | "garden")
  const [selectedVilla, setSelectedVilla] = useState<"luxury" | "garden">("luxury");
  
  // Active Content Sub-tab ("gallery" | "axonometric" | "plans" | "elevations" | "tour360")
  const [activeTab, setActiveTab] = useState<"gallery" | "axonometric" | "plans" | "elevations" | "tour360">("gallery");

  // Fullscreen Lightbox Index State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Shared Photo Gallery (15 Renders HD)
  const sharedGallery = [
    {
      num: "01",
      title: "GALERIA 01 - FACHADA VISTA 1",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_01_fachada_vista_1.webp",
      description: "Vista frontal directa de dos residencias. Destaca el diseño modular con celosías de apariencia de madera en el nivel superior, que crean un sombreamiento natural; muros de acabado pétreo en la planta baja; vegetación abundante; y zonas de parqueo al frente.",
      isPlaceholder: false,
    },
    {
      num: "02",
      title: "GALERIA 02 - FACHADA VISTA 2",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_02_fachada_vista_2.webp",
      description: "Perspectiva frontal simétrica de tres módulos residenciales alineados. Se aprecian las cajas de celosía superior con elementos efecto madera para filtrar la luz natural, una cubierta vegetal que cae por los bordes, vegetación integrada y vehículos estacionados a nivel de calle.",
      isPlaceholder: false,
    },
    {
      num: "03",
      title: "GALERIA 03 - FACHADA VISTA 3",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_03_fachada_vista_3.webp",
      description: "Toma angular a nivel de peatón del conjunto residencial. Enfatiza la volumetría en voladizo, la textura de las celosías símil madera, que genera un sombreamiento natural, y la integración de la vegetación a lo largo del sendero vehicular.",
      isPlaceholder: false,
    },
    {
      num: "04",
      title: "GALERIA 04 - FACHADA VISTA 4",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_04_fachada_vista_4.webp",
      description: "Vista dinámica en perspectiva que muestra la continuidad de la fachada a lo largo de la calle. Resalta el juego de luces y sombras creado por los paneles con acabado tipo madera perforada bajo luz natural y el marco de vegetación circundante.",
      isPlaceholder: false,
    },
    {
      num: "05",
      title: "GALERIA 05 - FACHADA VISTA 5",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_05_fachada_vista_5.webp",
      description: "Enfoque desde un ángulo bajo que resalta la escala de las estructuras. Muestra en detalle la entrada peatonal con portones en estilo madera calada, los acabados pétreos y muros con cubierta vegetal integrados con la vegetación del entorno.",
      isPlaceholder: false,
    },
    {
      num: "06",
      title: "GALERIA 06 - FACHADA VISTA 6",
      category: "Detalle Celosía",
      src: "/loom/renders/luxury/galeria_06_fachada_vista_6.webp",
      description: "Detalle en primer plano de los paneles de celosía con textura tipo madera. Muestra el diseño calado geométrico que genera un elegante sombreamiento natural al filtrar la luz, complementado con una cubierta de vegetación colgante en la parte superior.",
      isPlaceholder: false,
    },
    {
      num: "07",
      title: "GALERIA 07 - HABITACIÓN VISTA 1",
      category: "Dormitorio Principal",
      src: "/loom/renders/luxury/galeria_07_habitacion_vista_1.webp",
      description: "Vista frontal simétrica del dormitorio principal. Resalta la cama con diseño aparente madera, mesas de noche a juego, luminarias tejidas suspendidas y el gran ventanal corredizo que aprovecha la luz natural e integra un patio privado con vegetación.",
      isPlaceholder: false,
    },
    {
      num: "08",
      title: "GALERIA 08 - HABITACIÓN VISTA 2",
      category: "Dormitorio Principal",
      src: "/loom/renders/luxury/galeria_08_habitacion_vista_2.webp",
      description: "Dormitorio principal de estilo biofílico e introspectivo. Cuenta con una cama de plataforma con acabado tipo madera, lámparas colgantes de fibra tejida, paredes de estuco cálido bajo iluminación natural y un gran ventanal de piso a techo con vista a un patio interior enriquecido con vegetación.",
      isPlaceholder: false,
    },
    {
      num: "09",
      title: "GALERIA 09 - SALA EXTERIOR",
      category: "Área Social Exterior",
      src: "/loom/renders/luxury/galeria_09_sala_exterior.webp",
      description: "Área social abierta que conecta el interior con la piscina. Incluye un espacio bajo techo que brinda un fresco sombreamiento natural, sala lounge, barra de bar, escalera flotante con peldaños de efecto madera, tumbonas sobre un deck al aire libre y abundante vegetación.",
      isPlaceholder: false,
    },
    {
      num: "10",
      title: "GALERIA 10 - FACHADA POSTERIOR",
      category: "Exterior Posterior",
      src: "/loom/renders/luxury/galeria_10_fachada_posterior.webp",
      description: "Vista trasera de dos niveles hacia la piscina privada y con proyección a la vista al mar Caribe. Muestra la amplia terraza cubierta del primer nivel, un balcón superior con barandilla de cristal adornado con cubierta de vegetación colgante y ventanales corredizos que maximizan la entrada de luz natural.",
      isPlaceholder: false,
    },
    {
      num: "11",
      title: "GALERIA 11 - SALA INTERIOR",
      category: "Interior Social",
      src: "/loom/renders/luxury/galeria_11_sala_interior.webp",
      description: "Espacio de sala interior orientado hacia el área social y la piscina. Cuenta con mobiliario en tonos neutros, alfombra tejida, puertas correderas de celosía con apariencia madera para proporcionar un agradable sombreamiento natural, luz natural y vistas a la vegetación.",
      isPlaceholder: false,
    },
    {
      num: "12",
      title: "GALERIA 12 - COCINA ALTILLO VISTA 1",
      category: "Interior Cocina",
      src: "/loom/renders/luxury/galeria_12_cocina_vista_1.webp",
      description: "Vista integral de la zona social de planta abierta. Integra una cocina con muebles de acabado tipo madera, iluminación artesanal, sala de estar aprovechando la luz natural, escalera flotante con vegetación en su base y amplias mamparas correderas hacia la terraza.",
      isPlaceholder: false,
    },
    {
      num: "13",
      title: "GALERIA 13 - BAÑO VISTA 1",
      category: "Interior Baño",
      src: "/loom/renders/luxury/galeria_13_bano_vista_1.webp",
      description: "Baño de diseño minimalista con muros y pisos de acabado pétreo. Incluye lavabo sobre encimera flotante símil madera, ducha con mampara de cristal transparente y grifería negra moderna junto a una ventana que aporta luz natural directa y vistas a la vegetación.",
      isPlaceholder: false,
    },
    {
      num: "14",
      title: "GALERIA 14 - BAÑO VISTA 2",
      category: "Interior Baño",
      src: "/loom/renders/luxury/galeria_14_bano_vista_2.webp",
      description: "Perspectiva alternativa del baño que resalta la amplitud del espacio. Destaca la combinación de acabados pétreos y detalles en tonos y textura tipo madera, la entrada de luz natural a la zona de ducha y detalles de integración de vegetación exterior.",
      isPlaceholder: false,
    },
    {
      num: "15",
      title: "GALERIA 15 - ALTILLO VISTA 1",
      category: "Rooftop Lounge",
      src: "/loom/renders/luxury/galeria_15_altillo_vista_1.webp",
      description: "Exclusiva terraza en el altillo con pérgola de apariencia madera ofreciendo sombreamiento natural. Cuenta con un área lounge, bancas integradas en acabado pétreo, bases efecto madera, jacuzzi elevable, vegetación integrada y una espectacular vista panorámica al mar Caribe.",
      isPlaceholder: false,
    },
  ];

  // Shared 3D Axonometrics (2 Renders HD)
  const sharedAxonometrics = [
    {
      num: "01",
      title: "Axonometría 3D - Isometría Nivel 1 & 2",
      category: "Axonometría 3D",
      src: "/loom/renders/axonometrics/axonometria_01.webp",
      description: "Vista isométrica 3D en perspectiva general que destaca la volumetría de la residencia, la integración del espejo de agua, áreas sociales en primer nivel y la celosía biofílica en niveles superiores.",
      isPlaceholder: false,
    },
    {
      num: "02",
      title: "Axonometría 3D - Isometría Rooftop & Altillo",
      category: "Axonometría 3D",
      src: "/loom/renders/axonometrics/axonometria_02.webp",
      description: "Desglose isométrico 3D de la cubierta y la zona del altillo lounge. Muestra la distribución de la pérgola en acabado madera, jacuzzi elevable y terraza panorámica.",
      isPlaceholder: false,
    },
  ];

  // Luxury Residence Architectural Plans (4 Levels)
  const luxuryPlans = [
    {
      num: "01",
      title: "Planta Arquitectónica - Nivel 1 (198.00 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_01.webp",
      specs: "Acceso, Parqueadero, Espejo de Agua, Alcoba, Baño, Cocina, Sala, Deck, Piscina",
      description: "Distribución completa del primer nivel. Incluye zona de estacionamiento frontal, vestíbulo de entrada con espejo de agua, amplia zona social integrada (sala y comedor), cocina tipo americana, deck exterior y piscina privada.",
      isPlaceholder: false,
    },
    {
      num: "02",
      title: "Planta Arquitectónica - Nivel 2 (76.04 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_02.webp",
      specs: "Escalera Interna, Alcobas Secundarias, Baños Privados, Balcones",
      description: "Distribución del segundo nivel. Alberga dormitorios secundarios con baños en suite y vestidores privados, aprovechando los ventanales hacia las fachadas principal y posterior.",
      isPlaceholder: false,
    },
    {
      num: "03",
      title: "Planta Arquitectónica - Nivel 3 - Altillo (79.13 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_03.webp",
      specs: "Habitación Master, Jacuzzi, Terraza Sunbed, Bar Exclusivo",
      description: "Planta del tercer nivel o altillo master suite. Espacio privado con habitación principal, jacuzzi hidromasaje exterior y terraza privada con vista al mar.",
      isPlaceholder: false,
    },
    {
      num: "04",
      title: "Planta de Cubierta",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_04_cubierta.webp",
      specs: "Pérgola, Cubiertas Vegetales, Colectores y Remates",
      description: "Planta superior de cubierta que muestra la disposición de pérgolas de sombreado biofílico, vegetación integrada en bordes y acabados arquitectónicos.",
      isPlaceholder: false,
    },
  ];

  // Garden Edition Architectural Plans (4 Levels)
  const gardenPlans = [
    {
      num: "01",
      title: "Planta Arquitectónica - Nivel 1 - Jardín Biofílico (150.00 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_01.webp",
      specs: "Acceso Peatonal, Parqueadero, Jardín Privado Extendido, Sala, Cocina, Ducha Externa",
      description: "Planta del primer nivel de la versión Garden Edition. Destaca la expansión de jardines interiores y patio privado envolvente con vegetación nativa.",
      isPlaceholder: false,
    },
    {
      num: "02",
      title: "Planta Arquitectónica - Nivel 2 (65.00 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_02.webp",
      specs: "Dormitorio de Huéspedes, Estudio/Estar, Baño Privado, Balcón Verde",
      description: "Distribución del segundo nivel optimizada para privacidad y frescura biofílica con vistas al jardín central.",
      isPlaceholder: false,
    },
    {
      num: "03",
      title: "Planta Arquitectónica - Nivel 3 (59.04 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_03.webp",
      specs: "Suite Principal, Vestidor, Baño Master, Terraza Biofílica",
      description: "Planta de la suite principal en el tercer nivel con balcón rodeado de paneles de madera perforada y jardineras integradas.",
      isPlaceholder: false,
    },
    {
      num: "04",
      title: "Planta de Cubierta",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_04_cubierta.webp",
      specs: "Pérgola de Sombra Natural, Cubierta Vegetal",
      description: "Planta de techos y cubiertas verdes para Garden Edition con aislamiento térmico natural.",
      isPlaceholder: false,
    },
  ];

  // Shared Architectural Elevations & Sections (4 Drawings)
  const sharedElevations = [
    {
      num: "01",
      title: "Alzado 01 - Fachada Principal (Vista Calle)",
      category: "Alzado / Elevación",
      src: "/loom/renders/elevations/alzado_01.webp",
      description: "Elevación arquitectónica de la fachada frontal. Detalla la altura total de los tres niveles, los paneles de celosía superior de apariencia madera, acabados de estuco y vegetación colgante.",
      isPlaceholder: false,
    },
    {
      num: "02",
      title: "Alzado 02 - Fachada Posterior (Vista Piscina)",
      category: "Alzado / Elevación",
      src: "/loom/renders/elevations/alzado_02.webp",
      description: "Elevación arquitectónica posterior orientada hacia la zona social y piscina privada. Muestra los ventanales correderos de piso a techo y balcones superiores.",
      isPlaceholder: false,
    },
    {
      num: "03",
      title: "Alzado 03 - Corte Longitudinal L1",
      category: "Corte Arquitectónico",
      src: "/loom/renders/elevations/alzado_03.webp",
      description: "Corte arquitectónico longitudinal que revela la circulación vertical (escalera flotante), alturas libres de entrepiso y la conexión fluida entre sala interior y deck de piscina.",
      isPlaceholder: false,
    },
    {
      num: "04",
      title: "Alzado 04 - Corte Transversal L2",
      category: "Corte Arquitectónico",
      src: "/loom/renders/elevations/alzado_04.webp",
      description: "Corte arquitectónico transversal mostrando el perfil estructural, el altillo master en nivel 3 y la integración con el patio exterior.",
      isPlaceholder: false,
    },
  ];

  const currentGallery = sharedGallery;
  const currentAxonometrics = sharedAxonometrics;
  const currentPlans = selectedVilla === "luxury" ? luxuryPlans : gardenPlans;
  const currentElevations = sharedElevations;

  // Obtenemos la lista activa según la pestaña seleccionada
  const getActiveMediaList = useCallback(() => {
    if (activeTab === "gallery") return currentGallery;
    if (activeTab === "axonometric") return currentAxonometrics;
    if (activeTab === "plans") return currentPlans;
    if (activeTab === "elevations") return currentElevations;
    return [];
  }, [activeTab, currentGallery, currentAxonometrics, currentPlans, currentElevations]);

  // 360 Tour Interactive Scenes (5 HD Scenarios extracted from QR codes)
  const tour360List = [
    { id: "fachada", label: "Fachada Principal", category: "Exterior", url: "https://kuula.co/share/collection/7TMZx?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "sala", label: "Sala & Comedor", category: "Interior Social", url: "https://kuula.co/share/collection/7TKQ2?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "habitacion", label: "Suite Principal", category: "Dormitorio Master", url: "https://kuula.co/share/collection/7TKzy?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "bano", label: "Baño Suite Master", category: "Interior Baño", url: "https://kuula.co/share/collection/7TndH?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "altillo", label: "Altillo & Rooftop", category: "Rooftop Lounge", url: "https://kuula.co/share/collection/7T6Y1?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
  ];

  const [active360Index, setActive360Index] = useState<number>(0);

  const activeMediaList = getActiveMediaList();

  const handlePrevImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || activeMediaList.length === 0) return null;
      return (prev - 1 + activeMediaList.length) % activeMediaList.length;
    });
  }, [activeMediaList.length]);

  const handleNextImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || activeMediaList.length === 0) return null;
      return (prev + 1) % activeMediaList.length;
    });
  }, [activeMediaList.length]);

  // Teclado: Flecha Izquierda, Flecha Derecha y Escape
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrevImage, handleNextImage]);

  const activeMedia = lightboxIndex !== null && activeMediaList[lightboxIndex] ? activeMediaList[lightboxIndex] : null;

  return (
    <div className="relative w-full min-h-screen bg-[#EDE7E0] text-[#0A0D0B] flex flex-col overflow-x-hidden font-sans select-none">
      
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EDE7E0] via-[#F5F1EC] to-[#EDE7E0]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B35F27]/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-4 bg-[#EDE7E0]/90 backdrop-blur-xl border-b border-[#0A0D0B]/10 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#B35F27] hover:bg-[#964d1d] active:scale-95 border border-[#B35F27] rounded-full text-xs font-bold text-[#EDE7E0] uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a la Etapa</span>
          </button>
          
          <div className="hidden sm:block h-6 w-[1px] bg-[#0A0D0B]/15" />

          <div>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#B35F27] font-semibold block font-sans">Loom Luxury Residence</span>
            <h1 className="text-sm sm:text-base font-serif font-bold text-[#0A0D0B] tracking-wide">
              Showroom Interactivo &bull; Lote <span className="text-[#B35F27]">{selectedLot.rawId}</span>
            </h1>
          </div>
        </div>

        {/* Lot Specs Pill Header */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3.5 py-1.5 bg-white/70 border border-[#0A0D0B]/10 rounded-full flex items-center gap-2 text-[#0A0D0B]/80 shadow-sm">
            <span>Área Lote:</span>
            <strong className="text-[#0A0D0B] font-semibold">{selectedLot.area} m²</strong>
          </div>
          <span className="px-3 py-1 bg-[#699385]/20 border border-[#699385]/40 text-[#699385] text-[10px] font-bold uppercase tracking-widest rounded-full">
            {selectedLot.statusRaw || "DISPONIBLE"}
          </span>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8 max-w-[3840px] mx-auto w-full">
        
        {/* Left Pane (7 cols on LG+): Villa Selector & Media Tabs */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Villa Model Selector Bar */}
          <div className="bg-white/80 border border-[#0A0D0B]/10 rounded-2xl p-2 backdrop-blur-md shadow-sm">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B35F27] font-bold block mb-2 px-3 pt-1">
              Seleccionar Modelo de Villa
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedVilla("luxury")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  selectedVilla === "luxury"
                    ? "bg-[#B35F27] border-[#B35F27] text-[#EDE7E0] shadow-lg shadow-[#B35F27]/20"
                    : "bg-[#EDE7E0]/60 border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                <span className="text-xs font-serif font-bold uppercase tracking-wider">Luxury Residence</span>
                <span className="text-[10px] mt-0.5 font-mono opacity-90">353.17 m² &bull; 3 Niveles</span>
              </button>

              <button
                onClick={() => setSelectedVilla("garden")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  selectedVilla === "garden"
                    ? "bg-[#B35F27] border-[#B35F27] text-[#EDE7E0] shadow-lg shadow-[#B35F27]/20"
                    : "bg-[#EDE7E0]/60 border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                <span className="text-xs font-serif font-bold uppercase tracking-wider">Garden Edition</span>
                <span className="text-[10px] mt-0.5 font-mono opacity-90">274.04 m² &bull; Jardín Biofílico</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex flex-wrap gap-2 border-b border-[#0A0D0B]/10 pb-3">
            {[
              { id: "gallery", label: "1. Galería de Fotos" },
              { id: "axonometric", label: "2. Axonometrías 3D" },
              { id: "plans", label: "3. Plantas Arquitectónicas" },
              { id: "elevations", label: "4. Alzados" },
              { id: "tour360", label: "5. Recorrido 360°" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#B35F27] text-[#EDE7E0] shadow-lg shadow-[#B35F27]/30"
                    : "bg-white/70 border border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Panel Viewer */}
          <div className="flex-1 min-h-[380px]">
            <AnimatePresence mode="wait">
              {/* TAB 1: GALERÍA */}
              {activeTab === "gallery" && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider">
                      Galería Fotográfica Renders HD &bull; {selectedVilla === "luxury" ? "Luxury Residence" : "Garden Edition"}
                    </h3>
                    <span className="text-[10px] text-[#B35F27] uppercase tracking-widest font-semibold">
                      {currentGallery.length} Renderings
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentGallery.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-xl overflow-hidden border border-[#0A0D0B]/10 bg-white/60 aspect-[4/3] cursor-pointer hover:border-[#B35F27] transition-all duration-300 shadow-sm"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        {item.isPlaceholder && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#B35F27] text-[#EDE7E0] text-[9px] font-bold uppercase tracking-wider rounded">
                            FALTANTE
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-[9px] uppercase tracking-widest text-[#EBD9AB] block font-mono">
                            {item.category}
                          </span>
                          <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: AXONOMETRÍAS */}
              {activeTab === "axonometric" && (
                <motion.div
                  key="axonometric"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider">
                      Axonometrías 3D Isométricas
                    </h3>
                    <span className="text-[10px] text-[#B35F27] uppercase tracking-widest font-semibold">
                      {currentAxonometrics.length} Diagramas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentAxonometrics.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-xl overflow-hidden border border-[#0A0D0B]/10 bg-white/80 p-4 cursor-pointer hover:border-[#B35F27] transition-all duration-300 flex flex-col justify-between shadow-sm"
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-[#EDE7E0] border border-[#0A0D0B]/10">
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#B35F27] font-mono block font-semibold">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-[#0A0D0B] mb-1">{item.title}</h4>
                          <p className="text-[10px] text-[#0A0D0B]/70 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PLANTAS ARQUITECTÓNICAS */}
              {activeTab === "plans" && (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider">
                      Plantas Arquitectónicas por Nivel &bull; {selectedVilla === "luxury" ? "Luxury Residence" : "Garden Edition"}
                    </h3>
                    <span className="text-[10px] text-[#B35F27] uppercase tracking-widest font-semibold">
                      {currentPlans.length} Plantas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentPlans.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-xl overflow-hidden border border-[#0A0D0B]/10 bg-white/80 p-4 cursor-pointer hover:border-[#B35F27] transition-all duration-300 flex flex-col justify-between shadow-sm"
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-white border border-[#0A0D0B]/10">
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#0A0D0B] mb-1">{item.title}</h4>
                          <p className="text-[10px] text-[#B35F27] font-mono leading-relaxed uppercase tracking-wider line-clamp-2">
                            {item.specs}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ALZADOS */}
              {activeTab === "elevations" && (
                <motion.div
                  key="elevations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-[#0A0D0B]/10 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider">
                      Alzados &amp; Cortes Arquitectónicos
                    </h3>
                    <span className="text-[10px] text-[#B35F27] uppercase tracking-widest font-semibold">
                      {currentElevations.length} Planos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentElevations.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-xl overflow-hidden border border-[#0A0D0B]/10 bg-white/80 p-4 cursor-pointer hover:border-[#B35F27] transition-all duration-300 flex flex-col justify-between shadow-sm"
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-white border border-[#0A0D0B]/10">
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#B35F27] font-mono block font-semibold">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-[#0A0D0B] mb-1">{item.title}</h4>
                          <p className="text-[10px] text-[#0A0D0B]/70 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 5: TOUR 360° MULTI-ESCENARIOS */}
              {activeTab === "tour360" && (
                <motion.div
                  key="tour360"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center border-b border-[#0A0D0B]/10 pb-3 gap-2">
                    <h3 className="text-sm font-serif font-bold text-[#0A0D0B] uppercase tracking-wider flex items-center gap-2">
                      <span>Recorridos Virtuales 360° Interactivos</span>
                      <span className="px-2 py-0.5 bg-[#699385]/20 border border-[#699385]/40 text-[#699385] text-[9px] font-mono rounded-full font-bold">5 ESCENARIOS HD</span>
                    </h3>
                  </div>

                  {/* 360 Sub-location selector pills */}
                  <div className="flex flex-wrap gap-2">
                    {tour360List.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setActive360Index(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          active360Index === idx
                            ? "bg-[#B35F27] text-[#EDE7E0] shadow-md shadow-[#B35F27]/20"
                            : "bg-white/80 border border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-[#0A0D0B] hover:text-[#EDE7E0]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Main 360 Viewport iframe */}
                  <div className="relative rounded-2xl overflow-hidden border border-[#0A0D0B]/10 bg-white/80 aspect-[16/10] sm:aspect-[16/9] min-h-[380px] shadow-lg">
                    <iframe
                      key={tour360List[active360Index].url}
                      src={tour360List[active360Index].url}
                      title={`Tour Virtual 360° ${tour360List[active360Index].label}`}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Pane (5 cols on LG+): Detailed Lot Specifications & Pricing Card */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B35F27] font-bold">
              Ficha Técnica del Lote
            </span>
            <span className="text-[10px] text-[#0A0D0B]/50 uppercase tracking-widest">
              Etapa {stageId}
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-[#0A0D0B]/10 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between gap-6">
            
            {/* Header Badge & Title */}
            <div className="flex justify-between items-start border-b border-[#0A0D0B]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B35F27] font-mono font-bold block">
                  Reserva Caribe &bull; Loom
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#0A0D0B] mt-0.5">
                  Lote {selectedLot.rawId}
                </h2>
              </div>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                selectedLot.statusRaw === "DISPONIBLE" || !selectedLot.statusRaw
                  ? "bg-[#699385]/15 text-[#699385] border-[#699385]/30"
                  : "bg-[#B35F27]/15 text-[#B35F27] border-[#B35F27]/30"
              }`}>
                {selectedLot.statusRaw || "DISPONIBLE"}
              </span>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#EDE7E0]/60 border border-[#0A0D0B]/10 rounded-xl p-3.5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-[#0A0D0B]/60 font-medium">Área Total</span>
                <span className="text-lg font-serif font-bold text-[#0A0D0B] mt-1">{selectedLot.area} m²</span>
              </div>
              <div className="bg-[#EDE7E0]/60 border border-[#0A0D0B]/10 rounded-xl p-3.5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-[#0A0D0B]/60 font-medium">Ubicación</span>
                <span className="text-sm font-semibold text-[#0A0D0B] mt-1 truncate">{selectedLot.location || `Etapa ${stageId}`}</span>
              </div>
            </div>

            {/* Financial Breakdown Card */}
            <div className="bg-[#0A0D0B] text-[#EDE7E0] rounded-xl p-4 sm:p-5 space-y-3 shadow-inner">
              <div className="flex justify-between items-baseline border-b border-white/10 pb-2.5">
                <span className="text-xs uppercase tracking-wider text-[#EBD9AB] font-mono">Valor Total Inversión</span>
                <span className="text-xl font-serif font-bold text-[#EDE7E0]">{selectedLot.totalPrice}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/50 block">Cuota Inicial</span>
                  <span className="font-semibold text-white/90">{selectedLot.downPayment}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/50 block">Financiación</span>
                  <span className="font-semibold text-white/90">{selectedLot.financing}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/50 block">Contraentrega</span>
                  <span className="font-semibold text-white/90">{selectedLot.finalPayment}</span>
                </div>
              </div>
            </div>

            {/* Villa Models Compatibility Banner */}
            <div className="border border-[#B35F27]/20 bg-[#B35F27]/5 rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#B35F27] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B35F27]" />
                Modelos de Villa Arquitectónica Aprobados
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-[#0A0D0B]/5">
                  <strong className="block font-serif text-[#0A0D0B]">Luxury Residence</strong>
                  <span className="text-[10px] text-[#0A0D0B]/60 font-mono">353.17 m² &bull; 3 Niveles</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-[#0A0D0B]/5">
                  <strong className="block font-serif text-[#0A0D0B]">Garden Edition</strong>
                  <span className="text-[10px] text-[#0A0D0B]/60 font-mono">274.04 m² &bull; Jardín Biofílico</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Fullscreen Lightbox Modal Slider */}
      <AnimatePresence>
        {activeMedia && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#EDE7E0]/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden"
          >
            {/* Lightbox Header */}
            <div className="flex justify-between items-center z-20 max-w-7xl mx-auto w-full border-b border-[#0A0D0B]/10 pb-2.5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B35F27] font-bold">
                  Showroom Visualizer &bull; {lightboxIndex + 1} de {activeMediaList.length}
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-[#B35F27]/15 border border-[#B35F27]/30 text-[#B35F27] text-[9px] font-bold rounded-full uppercase tracking-wider">
                  Navegación &lt; &gt;
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h3 className="text-xs sm:text-base font-serif font-bold text-[#0A0D0B] max-w-[280px] sm:max-w-md truncate">
                  {activeMedia.title}
                </h3>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 bg-white border border-[#0A0D0B]/15 hover:bg-[#B35F27] hover:text-[#EDE7E0] text-[#0A0D0B] rounded-full transition-all duration-300 cursor-pointer shadow-md active:scale-95"
                  title="Cerrar (Esc)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lightbox Main Image & Navigation Arrows */}
            <div className="relative flex-1 flex justify-center items-center my-1 sm:my-2 overflow-hidden w-full max-w-7xl mx-auto">

              {/* Previous Image Arrow Button */}
              {activeMediaList.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 z-30 p-2.5 sm:p-3.5 bg-white/90 hover:bg-[#B35F27] border border-[#0A0D0B]/15 hover:border-[#B35F27] text-[#0A0D0B] hover:text-[#EDE7E0] rounded-full transition-all duration-300 backdrop-blur-md shadow-xl active:scale-90 cursor-pointer group"
                  title="Anterior (Flecha Izquierda)"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Center Media Image & Description Box */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMedia.src}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center justify-center max-w-full max-h-full px-2"
                >
                  <img
                    src={activeMedia.src}
                    alt={activeMedia.title}
                    className="max-w-full max-h-[50vh] sm:max-h-[54vh] object-contain rounded-xl shadow-2xl border border-[#0A0D0B]/10 bg-white"
                  />
                  {(activeMedia as any).description && (
                    <div className="mt-2.5 max-w-3xl w-full px-4 py-2.5 bg-[#0A0D0B]/90 backdrop-blur-md text-[#EDE7E0] border border-white/10 rounded-xl text-xs sm:text-sm font-sans text-center leading-relaxed shadow-xl max-h-[16vh] overflow-y-auto overscroll-contain">
                      <span className="text-[9px] text-[#EBD9AB] uppercase tracking-widest font-mono block mb-0.5">
                        {(activeMedia as any).category || "Descripción Arquitectónica"}
                      </span>
                      {(activeMedia as any).description}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Next Image Arrow Button */}
              {activeMediaList.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 z-30 p-2.5 sm:p-3.5 bg-white/90 hover:bg-[#B35F27] border border-[#0A0D0B]/15 hover:border-[#B35F27] text-[#0A0D0B] hover:text-[#EDE7E0] rounded-full transition-all duration-300 backdrop-blur-md shadow-xl active:scale-90 cursor-pointer group"
                  title="Siguiente (Flecha Derecha)"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Lightbox Footer & Thumbnail Navigation Bar */}
            <div className="flex flex-col items-center gap-1.5 z-20 max-w-7xl mx-auto w-full border-t border-[#0A0D0B]/10 pt-2.5">
              {/* Thumbnail Strip */}
              {activeMediaList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 px-2">
                  {activeMediaList.map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative w-12 h-9 sm:w-16 sm:h-11 rounded-md overflow-hidden border transition-all duration-300 flex-shrink-0 cursor-pointer ${
                        idx === lightboxIndex
                          ? "border-[#B35F27] ring-2 ring-[#B35F27]/50 scale-105"
                          : "border-[#0A0D0B]/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={thumb.src} alt={thumb.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-center text-[10px] text-[#0A0D0B]/70 uppercase tracking-widest font-sans font-medium">
                Loom Luxury Residence &bull; Lote {selectedLot.rawId} ({selectedLot.area} m²) &bull; Navegue con las flechas o el teclado
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
