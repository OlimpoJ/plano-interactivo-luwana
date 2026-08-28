"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle, 
  Maximize2, 
  MapPin, 
  Layers, 
  Image as ImageIcon, 
  Compass, 
  Eye, 
  Phone,
  Info,
  Building2,
  Sparkles
} from "lucide-react";
import LoomLotZoomCanvas from "./LoomLotZoomCanvas";
import LoomReferralModal from "./LoomReferralModal";

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
  // Panel lateral expandido/colapsado
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  // Modelo de Villa activo ("luxury" | "garden")
  const [selectedVilla, setSelectedVilla] = useState<"luxury" | "garden">("luxury");
  
  // Pestaña activa ("gallery" | "axonometric" | "plans" | "elevations" | "tour360")
  const [activeTab, setActiveTab] = useState<"gallery" | "axonometric" | "plans" | "elevations" | "tour360">("gallery");

  // Índice de elemento activo en la pestaña actual (para el Visor Principal)
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Modal de vista previa del plano de ubicación mini-mapa
  const [showMiniMapModal, setShowMiniMapModal] = useState<boolean>(false);

  // Lightbox a pantalla completa real
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  // Modal de selección de inmobiliaria / asesoría comercial
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);

  // Referidor para atribución
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

  // Galería de Fotos Compartida (15 Renders HD)
  const sharedGallery = [
    {
      num: "01",
      title: "GALERIA 01 - FACHADA VISTA 1",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_01_fachada_vista_1.webp",
      description: "Vista frontal directa de dos residencias. Destaca el diseño modular con celosías de apariencia de madera en el nivel superior, que crean un sombreamiento natural; muros de acabado pétreo en la planta baja; vegetación abundante; y zonas de parqueo al frente.",
    },
    {
      num: "02",
      title: "GALERIA 02 - FACHADA VISTA 2",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_02_fachada_vista_2.webp",
      description: "Perspectiva frontal simétrica de tres módulos residenciales alineados. Se aprecian las cajas de celosía superior con elementos efecto madera para filtrar la luz natural, una cubierta vegetal que cae por los bordes, vegetación integrada y vehículos estacionados a nivel de calle.",
    },
    {
      num: "03",
      title: "GALERIA 03 - FACHADA VISTA 3",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_03_fachada_vista_3.webp",
      description: "Toma angular a nivel de peatón del conjunto residencial. Enfatiza la volumetría en voladizo, la textura de las celosías símil madera, que genera un sombreamiento natural, y la integración de la vegetación a lo largo del sendero vehicular.",
    },
    {
      num: "04",
      title: "GALERIA 04 - FACHADA VISTA 4",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_04_fachada_vista_4.webp",
      description: "Vista dinámica en perspectiva que muestra la continuidad de la fachada a lo largo de la calle. Resalta el juego de luces y sombras creado por los paneles con acabado tipo madera perforada bajo luz natural y el marco de vegetación circundante.",
    },
    {
      num: "05",
      title: "GALERIA 05 - FACHADA VISTA 5",
      category: "Exterior",
      src: "/loom/renders/luxury/galeria_05_fachada_vista_5.webp",
      description: "Enfoque desde un ángulo bajo que resalta la escala de las estructuras. Muestra en detalle la entrada peatonal con portones en estilo madera calada, los acabados pétreos y muros con cubierta vegetal integrados con la vegetación del entorno.",
    },
    {
      num: "06",
      title: "GALERIA 06 - FACHADA VISTA 6",
      category: "Detalle Celosía",
      src: "/loom/renders/luxury/galeria_06_fachada_vista_6.webp",
      description: "Detalle en primer plano de los paneles de celosía con textura tipo madera. Muestra el diseño calado geométrico que genera un elegante sombreamiento natural al filtrar la luz, complementado con una cubierta de vegetación colgante en la parte superior.",
    },
    {
      num: "07",
      title: "GALERIA 07 - HABITACIÓN VISTA 1",
      category: "Dormitorio Principal",
      src: "/loom/renders/luxury/galeria_07_habitacion_vista_1.webp",
      description: "Vista frontal simétrica del dormitorio principal. Resalta la cama con diseño aparente madera, mesas de noche a juego, luminarias tejidas suspendidas y el gran ventanal corredizo que aprovecha la luz natural e integra un patio privado con vegetación.",
    },
    {
      num: "08",
      title: "GALERIA 08 - HABITACIÓN VISTA 2",
      category: "Dormitorio Principal",
      src: "/loom/renders/luxury/galeria_08_habitacion_vista_2.webp",
      description: "Dormitorio principal de estilo biofílico e introspectivo. Cuenta con una cama de plataforma con acabado tipo madera, lámparas colgantes de fibra tejida, paredes de estuco cálido bajo iluminación natural y un gran ventanal de piso a techo con vista a un patio interior enriquecido con vegetación.",
    },
    {
      num: "09",
      title: "GALERIA 09 - SALA EXTERIOR",
      category: "Área Social Exterior",
      src: "/loom/renders/luxury/galeria_09_sala_exterior.webp",
      description: "Área social abierta que conecta el interior con la piscina. Incluye un espacio bajo techo que brinda un fresco sombreamiento natural, sala lounge, barra de bar, escalera flotante con peldaños de efecto madera, tumbonas sobre un deck al aire libre y abundante vegetación.",
    },
    {
      num: "10",
      title: "GALERIA 10 - FACHADA POSTERIOR",
      category: "Exterior Posterior",
      src: "/loom/renders/luxury/galeria_10_fachada_posterior.webp",
      description: "Vista trasera de dos niveles hacia la piscina privada y con proyección a la vista al mar Caribe. Muestra la amplia terraza cubierta del primer nivel, un balcón superior con barandilla de cristal adornado con cubierta de vegetación colgante y ventanales corredizos que maximizan la entrada de luz natural.",
    },
    {
      num: "11",
      title: "GALERIA 11 - SALA INTERIOR",
      category: "Interior Social",
      src: "/loom/renders/luxury/galeria_11_sala_interior.webp",
      description: "Espacio de sala interior orientado hacia el área social y la piscina. Cuenta con mobiliario en tonos neutros, alfombra tejida, puertas correderas de celosía con apariencia madera para proporcionar un agradable sombreamiento natural, luz natural y vistas a la vegetación.",
    },
    {
      num: "12",
      title: "GALERIA 12 - COCINA ALTILLO VISTA 1",
      category: "Interior Cocina",
      src: "/loom/renders/luxury/galeria_12_cocina_vista_1.webp",
      description: "Vista integral de la zona social de planta abierta. Integra una cocina con muebles de acabado tipo madera, iluminación artesanal, sala de estar aprovechando la luz natural, escalera flotante con vegetación en su base y amplias mamparas correderas hacia la terraza.",
    },
    {
      num: "13",
      title: "GALERIA 13 - BAÑO VISTA 1",
      category: "Interior Baño",
      src: "/loom/renders/luxury/galeria_13_bano_vista_1.webp",
      description: "Baño de diseño minimalista con muros y pisos de acabado pétreo. Incluye lavabo sobre encimera flotante símil madera, ducha con mampara de cristal transparente y grifería negra moderna junto a una ventana que aporta luz natural directa y vistas a la vegetación.",
    },
    {
      num: "14",
      title: "GALERIA 14 - BAÑO VISTA 2",
      category: "Interior Baño",
      src: "/loom/renders/luxury/galeria_14_bano_vista_2.webp",
      description: "Perspectiva alternativa del baño que resalta la amplitud del espacio. Destaca la combinación de acabados pétreos y detalles en tonos y textura tipo madera, la entrada de luz natural a la zona de ducha y detalles de integración de vegetación exterior.",
    },
    {
      num: "15",
      title: "GALERIA 15 - ALTILLO VISTA 1",
      category: "Rooftop Lounge",
      src: "/loom/renders/luxury/galeria_15_altillo_vista_1.webp",
      description: "Exclusiva terraza en el altillo con pérgola de apariencia madera ofreciendo sombreamiento natural. Cuenta con un área lounge, bancas integradas en acabado pétreo, bases efecto madera, jacuzzi elevable, vegetación integrada y una espectacular vista panorámica al mar Caribe.",
    },
  ];

  // Axonometrías 3D Compartidas
  const sharedAxonometrics = [
    {
      num: "01",
      title: "Axonometría 3D - Isometría Nivel 1 & 2",
      category: "Axonometría 3D",
      src: "/loom/renders/axonometrics/axonometria_01.webp",
      description: "Vista isométrica 3D en perspectiva general que destaca la volumetría de la residencia, la integración del espejo de agua, áreas sociales en primer nivel y la celosía biofílica en niveles superiores.",
    },
    {
      num: "02",
      title: "Axonometría 3D - Isometría Rooftop & Altillo",
      category: "Axonometría 3D",
      src: "/loom/renders/axonometrics/axonometria_02.webp",
      description: "Desglose isométrico 3D de la cubierta y la zona del altillo lounge. Muestra la distribución de la pérgola en acabado madera, jacuzzi elevable y terraza panorámica.",
    },
  ];

  // Plantas Arquitectónicas Luxury
  const luxuryPlans = [
    {
      num: "01",
      title: "Planta Arquitectónica - Nivel 1 (198.00 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_01.webp",
      specs: "Acceso, Parqueadero, Espejo de Agua, Alcoba, Baño, Cocina, Sala, Deck, Piscina",
      description: "Distribución completa del primer nivel. Incluye zona de estacionamiento frontal, vestíbulo de entrada con espejo de agua, amplia zona social integrada (sala y comedor), cocina tipo americana, deck exterior y piscina privada.",
    },
    {
      num: "02",
      title: "Planta Arquitectónica - Nivel 2 (76.04 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_02.webp",
      specs: "Escalera Interna, Alcobas Secundarias, Baños Privados, Balcones",
      description: "Distribución del segundo nivel. Alberga dormitorios secundarios con baños en suite y vestidores privados, aprovechando los ventanales hacia las fachadas principal y posterior.",
    },
    {
      num: "03",
      title: "Planta Arquitectónica - Nivel 3 - Altillo (79.13 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_03.webp",
      specs: "Habitación Master, Jacuzzi, Terraza Sunbed, Bar Exclusivo",
      description: "Planta del tercer nivel o altillo master suite. Espacio privado con habitación principal, jacuzzi hidromasaje exterior y terraza privada con vista al mar.",
    },
    {
      num: "04",
      title: "Planta de Cubierta",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/luxury_planta_04_cubierta.webp",
      specs: "Pérgola, Cubiertas Vegetales, Colectores y Remates",
      description: "Planta superior de cubierta que muestra la disposición de pérgolas de sombreado biofílico, vegetación integrada en bordes y acabados arquitectónicos.",
    },
  ];

  // Plantas Arquitectónicas Garden
  const gardenPlans = [
    {
      num: "01",
      title: "Planta Arquitectónica - Nivel 1 - Jardín Biofílico (150.00 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_01.webp",
      specs: "Acceso Peatonal, Parqueadero, Jardín Privado Extendido, Sala, Cocina, Ducha Externa",
      description: "Planta del primer nivel de la versión Garden Edition. Destaca la expansión de jardines interiores y patio privado envolvente con vegetación nativa.",
    },
    {
      num: "02",
      title: "Planta Arquitectónica - Nivel 2 (65.00 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_02.webp",
      specs: "Dormitorio de Huéspedes, Estudio/Estar, Baño Privado, Balcón Verde",
      description: "Distribución del segundo nivel optimizada para privacidad y frescura biofílica con vistas al jardín central.",
    },
    {
      num: "03",
      title: "Planta Arquitectónica - Nivel 3 (59.04 m²)",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_03.webp",
      specs: "Suite Principal, Vestidor, Baño Master, Terraza Biofílica",
      description: "Planta de la suite principal en el tercer nivel con balcón rodeado de paneles de madera perforada y jardineras integradas.",
    },
    {
      num: "04",
      title: "Planta de Cubierta",
      category: "Planta Arquitectónica",
      src: "/loom/renders/plans/garden_nivel_04_cubierta.webp",
      specs: "Pérgola de Sombra Natural, Cubierta Vegetal",
      description: "Planta de techos y cubiertas verdes para Garden Edition con aislamiento térmico natural.",
    },
  ];

  // Alzados y Elevaciones
  const sharedElevations = [
    {
      num: "01",
      title: "Alzado 01 - Fachada Principal (Vista Calle)",
      category: "Alzado / Elevación",
      src: "/loom/renders/elevations/alzado_01.webp",
      description: "Elevación arquitectónica de la fachada frontal. Detalla la altura total de los tres niveles, los paneles de celosía superior de apariencia madera, acabados de estuco y vegetación colgante.",
    },
    {
      num: "02",
      title: "Alzado 02 - Fachada Posterior (Vista Piscina)",
      category: "Alzado / Elevación",
      src: "/loom/renders/elevations/alzado_02.webp",
      description: "Elevación arquitectónica posterior orientada hacia la zona social y piscina privada. Muestra los ventanales correderos de piso a techo y balcones superiores.",
    },
    {
      num: "03",
      title: "Alzado 03 - Corte Longitudinal L1",
      category: "Corte Arquitectónico",
      src: "/loom/renders/elevations/alzado_03.webp",
      description: "Corte arquitectónico longitudinal que revela la circulación vertical (escalera flotante), alturas libres de entrepiso y la conexión fluida entre sala interior y deck de piscina.",
    },
    {
      num: "04",
      title: "Alzado 04 - Corte Transversal L2",
      category: "Corte Arquitectónico",
      src: "/loom/renders/elevations/alzado_04.webp",
      description: "Corte arquitectónico transversal mostrando el perfil estructural, el altillo master en nivel 3 y la integración con el patio exterior.",
    },
  ];

  // Escenarios 360° VR
  const tour360List = [
    { id: "fachada", label: "Fachada Principal", category: "Exterior", url: "https://kuula.co/share/collection/7TMZx?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "sala", label: "Sala & Comedor", category: "Interior Social", url: "https://kuula.co/share/collection/7TKQ2?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "habitacion", label: "Suite Principal", category: "Dormitorio Master", url: "https://kuula.co/share/collection/7TKzy?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "bano", label: "Baño Suite Master", category: "Interior Baño", url: "https://kuula.co/share/collection/7TndH?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
    { id: "altillo", label: "Altillo & Rooftop", category: "Rooftop Lounge", url: "https://kuula.co/share/collection/7T6Y1?logo=0&info=0&fs=1&vr=0&sd=1&thumbs=1" },
  ];

  const currentPlans = selectedVilla === "luxury" ? luxuryPlans : gardenPlans;

  const getActiveMediaList = useCallback(() => {
    if (activeTab === "gallery") return sharedGallery;
    if (activeTab === "axonometric") return sharedAxonometrics;
    if (activeTab === "plans") return currentPlans;
    if (activeTab === "elevations") return sharedElevations;
    return [];
  }, [activeTab, currentPlans]);

  const activeMediaList = getActiveMediaList();

  // Reiniciar índice al cambiar de pestaña
  const handleTabChange = (tab: "gallery" | "axonometric" | "plans" | "elevations" | "tour360") => {
    setActiveTab(tab);
    setActiveIndex(0);
  };

  const handlePrevMedia = useCallback(() => {
    if (activeTab === "tour360") {
      setActiveIndex((prev) => (prev - 1 + tour360List.length) % tour360List.length);
    } else {
      setActiveIndex((prev) => (prev - 1 + activeMediaList.length) % activeMediaList.length);
    }
  }, [activeTab, activeMediaList.length, tour360List.length]);

  const handleNextMedia = useCallback(() => {
    if (activeTab === "tour360") {
      setActiveIndex((prev) => (prev + 1) % tour360List.length);
    } else {
      setActiveIndex((prev) => (prev + 1) % activeMediaList.length);
    }
  }, [activeTab, activeMediaList.length, tour360List.length]);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevMedia();
      if (e.key === "ArrowRight") handleNextMedia();
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevMedia, handleNextMedia]);

  // Manejo de la acción "Separar Lote"
  const handleSeparateClick = () => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({
        type: 'LOT_SEPARATE_CLICKED',
        payload: {
          lotId: selectedLot.rawId || selectedLot.id,
          price: selectedLot.totalPrice
        }
      }, '*');
      return;
    }

    const currentRef = typeof window !== "undefined" 
      ? sessionStorage.getItem("loom_ref") || (window.location.hostname.includes("patrimofy.com") ? "patrimofy" : referrer) 
      : referrer;

    if (currentRef === "patrimofy" || (typeof window !== "undefined" && window.location.hostname.includes("patrimofy.com") && currentRef !== "chichaus")) {
      window.open("https://www.patrimofy.com/es/loom#contacto", "_blank");
    } else if (currentRef === "chichaus") {
      window.open("https://www.loomalmabeach.com/#contacto", "_blank");
    } else {
      setShowReferralModal(true);
    }
  };

  const currentMediaItem = activeTab !== "tour360" ? activeMediaList[activeIndex] : null;
  const currentTourItem = activeTab === "tour360" ? tour360List[activeIndex] : null;

  const formattedStage = stageId
    ? stageId.toLowerCase().startsWith("etapa_")
      ? `Etapa ${stageId.replace(/[^0-9]/g, "")}`
      : `Etapa ${stageId}`
    : "Etapa 1";

  const locationTypeDisplay = selectedLot.location && !selectedLot.location.toLowerCase().includes("etapa")
    ? selectedLot.location
    : "Lote Medianero";

  return (
    <div className="relative w-full h-screen bg-[#0A0D0B] text-[#EDE7E0] flex flex-col overflow-hidden font-sans select-none">

      {/* ========================================== */}
      {/* 1. VISOR PRINCIPAL INMERSIVO (SE ADAPTA AL PANEL & 4K) */}
      {/* ========================================== */}
      <div 
        className={`relative flex-1 h-full bg-[#0A0D0B] overflow-hidden flex items-center justify-center transition-all duration-300 ${
          isPanelOpen 
            ? "lg:ml-[336px] min-[2200px]:ml-[28vw] 2xl:ml-[30vw] min-[2500px]:ml-[32vw] w-full lg:w-[calc(100%-336px)] min-[2200px]:w-[72vw] 2xl:w-[70vw] min-[2500px]:w-[68vw]" 
            : "w-full ml-0"
        }`}
      >
        
        {/* Fondo borroso sutil de ambientación */}
        {currentMediaItem && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-3xl scale-110 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${currentMediaItem.src})` }}
          />
        )}

        {/* Gradiente sutil inferior para controles de fondo (Igual al efecto superior) */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#0A0D0B]/90 via-[#0A0D0B]/40 to-transparent pointer-events-none z-10" />

        {/* Contenido Principal (Imágenes HD a Pantalla Sangrada o Tour 360) */}
        <AnimatePresence mode="wait">
          {activeTab === "tour360" ? (
            <motion.div
              key={`tour-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full z-10"
            >
              <iframe
                src={currentTourItem?.url}
                title={`Tour 360° ${currentTourItem?.label}`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                allowFullScreen
              />
            </motion.div>
          ) : (
            currentMediaItem && (
              <motion.div
                key={`img-${activeTab}-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative z-10 w-full h-full flex items-center justify-center p-0"
              >
                <img
                  src={currentMediaItem.src}
                  alt={currentMediaItem.title}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Flechas de Navegación Claras & Visibles (Sleek en Desktop, grandes en 4K) */}
        <button
          onClick={handlePrevMedia}
          className={`absolute ${
            !isPanelOpen ? "left-12 sm:left-14 min-[2200px]:left-20" : "left-3 sm:left-4 min-[2200px]:left-8"
          } top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 min-[2200px]:p-8 rounded-full bg-[#EDE7E0] hover:bg-[#B35F27] border border-[#0A0D0B]/20 hover:border-[#B35F27] text-[#0A0D0B] hover:text-white transition-all duration-300 backdrop-blur-md shadow-xl active:scale-95 cursor-pointer group`}
          title="Anterior (Flecha Izquierda)"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 min-[2200px]:w-12 min-[2500px]:w-14 transform group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNextMedia}
          className="absolute right-3 sm:right-4 min-[2200px]:right-12 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 min-[2200px]:p-8 rounded-full bg-[#EDE7E0] hover:bg-[#B35F27] border border-[#0A0D0B]/20 hover:border-[#B35F27] text-[#0A0D0B] hover:text-white transition-all duration-300 backdrop-blur-md shadow-xl active:scale-95 cursor-pointer group"
          title="Siguiente (Flecha Derecha)"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 min-[2200px]:w-12 min-[2500px]:w-14 transform group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Badge Flotante Inferior de Información del Render (Compacto en Desktop, grande solo en 4K) */}
        <div className="absolute bottom-3 sm:bottom-4 min-[2200px]:bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3 min-[2200px]:gap-7 px-3 py-1.5 sm:px-4 sm:py-2 min-[2200px]:px-10 min-[2200px]:py-5 bg-[#0A0D0B]/85 backdrop-blur-xl border border-white/15 rounded-full shadow-2xl max-w-[50vw] sm:max-w-[60vw] min-[2200px]:max-w-[80vw]">
          <span className="text-[10px] sm:text-xs min-[2200px]:text-xl font-mono font-bold text-[#EBD9AB] uppercase tracking-wider shrink-0">
            {activeTab === "tour360"
              ? `${activeIndex + 1} / ${tour360List.length}`
              : `${activeIndex + 1} / ${activeMediaList.length}`}
          </span>
          <span className="h-3 min-[2200px]:h-7 w-[1px] bg-white/20" />
          <p className="text-[10px] sm:text-xs min-[2200px]:text-2xl font-serif font-bold text-white truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px] min-[2200px]:max-w-2xl">
            {activeTab === "tour360" ? currentTourItem?.label : currentMediaItem?.title}
          </p>
          {activeTab !== "tour360" && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="p-1 min-[2200px]:p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer ml-0.5"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 min-[2200px]:w-7 min-[2200px]:h-7" />
            </button>
          )}
        </div>

        {/* Botón Flotante Inferior Derecha: Plano de Ubicación (Compacto en Desktop, grande solo en 4K) */}
        <button
          onClick={() => setShowMiniMapModal(true)}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 min-[2200px]:bottom-14 min-[2200px]:right-14 z-20 flex items-center gap-1.5 sm:gap-2 min-[2200px]:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 min-[2200px]:px-9 min-[2200px]:py-5 bg-[#EDE7E0] hover:bg-white text-[#0A0D0B] border border-[#0A0D0B]/20 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 active:scale-95 cursor-pointer font-semibold text-[10px] sm:text-xs min-[2200px]:text-xl uppercase tracking-wider"
          title="Ver Plano de Ubicación del Lote"
        >
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 min-[2200px]:w-8 min-[2200px]:h-8 text-[#B35F27]" />
          <span className="hidden sm:inline">Ubicación en Área</span>
        </button>

      </div>

      {/* ========================================== */}
      {/* 2. BARRA SUPERIOR DE NAVEGACIÓN FLOTANTE */}
      {/* ========================================== */}
      <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-5 min-[2200px]:px-10 py-2.5 min-[2200px]:py-6 bg-gradient-to-b from-[#0A0D0B]/90 via-[#0A0D0B]/60 to-transparent backdrop-blur-sm flex justify-between items-center pointer-events-none">
        
        {/* Lado Izquierdo: Título o Volver si panel cerrado */}
        <div className={`flex items-center gap-3 min-[2200px]:gap-5 pointer-events-auto transition-all duration-300 ${!isPanelOpen ? "ml-12 sm:ml-14" : ""}`}>
          {!isPanelOpen && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 min-[2200px]:px-8 min-[2200px]:py-4 bg-[#B35F27] hover:bg-[#964d1d] active:scale-95 border border-[#B35F27] rounded-full text-[11px] sm:text-xs min-[2200px]:text-base font-bold text-[#EDE7E0] uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 min-[2200px]:w-6 min-[2200px]:h-6" />
              <span className="hidden sm:inline">Volver a la Etapa</span>
              <span className="sm:hidden">Volver</span>
            </button>
          )}

          <div className="hidden md:block">
            <span className="text-[8px] sm:text-[9px] min-[2200px]:text-sm uppercase tracking-[0.3em] text-[#EBD9AB] font-mono font-bold block">
              Reserva Caribe &bull; Loom
            </span>
            <h1 className="text-xs sm:text-sm min-[2200px]:text-xl font-serif font-bold text-white tracking-wide">
              Lote <span className="text-[#B35F27]">{selectedLot.rawId}</span> &bull; {formattedStage}
            </h1>
          </div>
        </div>

        {/* Lado Derecho: Estado del Lote & Acciones */}
        <div className="flex items-center gap-3 pointer-events-auto mr-12 sm:mr-14">
          <div className="px-2.5 py-1 sm:px-3 sm:py-1 min-[2200px]:px-7 min-[2200px]:py-3 bg-[#699385]/20 border border-[#699385]/40 text-[#699385] text-[10px] sm:text-xs min-[2200px]:text-base font-bold uppercase tracking-widest rounded-full">
            {selectedLot.statusRaw || "DISPONIBLE"}
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* 3. PANEL LATERAL COLAPSABLE (DESKTOP REDUCIDO 20% & 4K GIGANTE) */}
      {/* ========================================== */}
      <motion.aside
        initial={false}
        animate={{
          x: isPanelOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 bottom-0 z-40 w-full sm:w-[300px] lg:w-[336px] min-[2200px]:w-[28vw] 2xl:w-[30vw] min-[2500px]:w-[32vw] min-w-[280px] max-w-[950px] bg-[#EDE7E0] text-[#0A0D0B] shadow-2xl border-r border-[#0A0D0B]/15 flex flex-col justify-between"
      >
        {/* Pestaña Flotante Visible para Ocultar/Mostrar el Panel (Estilo VentoAzul) */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="absolute top-1/2 -right-9 min-[2200px]:-right-16 transform -translate-y-1/2 z-50 flex items-center justify-center w-9 h-14 sm:w-10 sm:h-16 min-[2200px]:w-16 min-[2200px]:h-28 rounded-r-xl sm:rounded-r-2xl bg-[#EDE7E0] hover:bg-[#B35F27] border-y border-r border-[#0A0D0B]/20 hover:border-[#B35F27] text-[#0A0D0B] hover:text-white shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer"
          title={isPanelOpen ? "Ocultar panel lateral" : "Mostrar panel lateral"}
        >
          {isPanelOpen ? (
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 min-[2200px]:w-10 min-[2200px]:h-10" />
          ) : (
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 min-[2200px]:w-10 min-[2200px]:h-10" />
          )}
        </button>

        {/* Scrollable Panel Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 2xl:p-8 min-[2500px]:p-12 space-y-6 2xl:space-y-8 min-[2500px]:space-y-10 scrollbar-hide pt-6">
          
          {/* Botón Volver a la Etapa Integrado en la Barra Lateral */}
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 xl:py-4 min-[2500px]:py-5 bg-[#B35F27] hover:bg-[#964d1d] active:scale-95 border border-[#B35F27] rounded-xl text-xs xl:text-sm min-[2500px]:text-lg font-bold text-[#EDE7E0] uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer whitespace-nowrap"
          >
            <ChevronLeft className="w-4 h-4 xl:w-5 xl:h-5 min-[2500px]:w-6 min-[2500px]:h-6" />
            <span>Volver a la Etapa</span>
          </button>
          
          {/* Header Specs Card */}
          <div className="bg-white/80 border border-[#0A0D0B]/10 rounded-2xl p-4 2xl:p-6 min-[2500px]:p-8 shadow-sm space-y-3">
            <div className="flex justify-between items-start border-b border-[#0A0D0B]/10 pb-3">
              <div>
                <span className="text-[10px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-[0.2em] text-[#B35F27] font-mono font-bold block">
                  Ficha Técnica
                </span>
                <h2 className="text-xl 2xl:text-3xl min-[2500px]:text-4xl font-serif font-bold text-[#0A0D0B] whitespace-nowrap">
                  Lote {selectedLot.rawId}
                </h2>
              </div>
              <span className="px-2.5 py-1 2xl:px-4 2xl:py-1.5 min-[2500px]:px-5 min-[2500px]:py-2 text-[9px] 2xl:text-xs min-[2500px]:text-sm font-bold uppercase tracking-widest rounded-full bg-[#699385]/15 text-[#699385] border border-[#699385]/30 whitespace-nowrap">
                {formattedStage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 2xl:gap-4 text-xs 2xl:text-base min-[2500px]:text-lg">
              <div className="bg-[#EDE7E0]/60 p-2.5 2xl:p-4 min-[2500px]:p-5 rounded-xl border border-[#0A0D0B]/5">
                <span className="text-[9px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-wider text-[#0A0D0B]/60 block font-medium">Área Lote</span>
                <strong className="text-sm 2xl:text-xl min-[2500px]:text-2xl font-serif font-bold text-[#0A0D0B]">{selectedLot.area} m²</strong>
              </div>
              <div className="bg-[#EDE7E0]/60 p-2.5 2xl:p-4 min-[2500px]:p-5 rounded-xl border border-[#0A0D0B]/5">
                <span className="text-[9px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-wider text-[#0A0D0B]/60 block font-medium">Ubicación</span>
                <strong className="text-xs 2xl:text-base min-[2500px]:text-xl font-semibold text-[#0A0D0B] truncate block mt-0.5">{locationTypeDisplay}</strong>
              </div>
            </div>
          </div>

          {/* Villa Model Selector Bar */}
          <div className="bg-white/80 border border-[#0A0D0B]/10 rounded-2xl p-2 2xl:p-4 shadow-sm">
            <span className="text-[10px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-[0.2em] text-[#B35F27] font-bold block mb-2 px-2 pt-1">
              Modelo de Villa
            </span>
            <div className="grid grid-cols-2 gap-2 2xl:gap-4">
              <button
                onClick={() => setSelectedVilla("luxury")}
                className={`flex flex-col items-center justify-center p-2.5 2xl:p-4 min-[2500px]:p-6 rounded-xl border text-center transition-all duration-300 cursor-pointer active:scale-95 ${
                  selectedVilla === "luxury"
                    ? "bg-[#B35F27] border-[#B35F27] text-[#EDE7E0] shadow-md shadow-[#B35F27]/20"
                    : "bg-[#EDE7E0]/60 border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                <span className="text-xs 2xl:text-lg min-[2500px]:text-xl font-serif font-bold uppercase tracking-wider">Luxury</span>
                <span className="text-[9px] 2xl:text-xs min-[2500px]:text-sm mt-0.5 font-mono opacity-90">353 m² &bull; 3 Niveles</span>
              </button>

              <button
                onClick={() => setSelectedVilla("garden")}
                className={`flex flex-col items-center justify-center p-2.5 2xl:p-4 min-[2500px]:p-6 rounded-xl border text-center transition-all duration-300 cursor-pointer active:scale-95 ${
                  selectedVilla === "garden"
                    ? "bg-[#B35F27] border-[#B35F27] text-[#EDE7E0] shadow-md shadow-[#B35F27]/20"
                    : "bg-[#EDE7E0]/60 border-[#0A0D0B]/10 text-[#0A0D0B]/70 hover:bg-white hover:text-[#0A0D0B]"
                }`}
              >
                <span className="text-xs 2xl:text-lg min-[2500px]:text-xl font-serif font-bold uppercase tracking-wider">Garden</span>
                <span className="text-[9px] 2xl:text-xs min-[2500px]:text-sm mt-0.5 font-mono opacity-90">274 m² &bull; Biofílico</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs List */}
          <div className="space-y-2 2xl:space-y-4">
            <span className="text-[10px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-[0.2em] text-[#B35F27] font-bold block px-1">
              Explorar Medios del Showroom
            </span>

            <div className="grid grid-cols-1 gap-1.5 2xl:gap-3">
              {(
                [
                  { id: "gallery" as const, label: "1. Galería Renderizada (15 Renders)", icon: ImageIcon, count: 15 },
                  { id: "axonometric" as const, label: "2. Vista Axonométrica (1 Isométrica)", icon: Layers, count: 1 },
                  { id: "plans" as const, label: "3. Plantas Arquitectónicas (4 Niveles)", icon: Building2, count: 4 },
                  { id: "elevations" as const, label: "4. Alzados & Cortes (4 Planos)", icon: Compass, count: 4 },
                  { id: "tour360" as const, label: "5. Recorrido 360° (5 Escenarios)", icon: Eye, count: 5 },
                ]
              ).map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 2xl:px-6 2xl:py-4 rounded-xl text-xs 2xl:text-base min-[2500px]:text-lg font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer text-left ${
                      isActive
                        ? "bg-[#B35F27] text-[#EDE7E0] shadow-md shadow-[#B35F27]/20"
                        : "bg-white/80 border border-[#0A0D0B]/10 text-[#0A0D0B]/80 hover:bg-white hover:text-[#0A0D0B]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 2xl:gap-4 truncate">
                      <IconComponent className="w-4 h-4 2xl:w-6 2xl:h-6 min-[2500px]:w-7 min-[2500px]:h-7 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thumbnails Grid for Active Tab Items */}
          <div className="space-y-2 2xl:space-y-4 pt-1">
            <span className="text-[10px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-wider text-[#0A0D0B]/60 font-mono font-bold block px-1">
              Selección Directa de Vista
            </span>

            {activeTab === "tour360" ? (
              <div className="grid grid-cols-1 gap-2 2xl:gap-3">
                {tour360List.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`flex items-center justify-between p-2.5 2xl:p-4 min-[2500px]:p-5 rounded-xl border text-xs 2xl:text-base text-left transition-all duration-300 cursor-pointer ${
                      activeIndex === idx
                        ? "bg-[#0A0D0B] text-white border-[#0A0D0B] shadow-md"
                        : "bg-white/80 border-[#0A0D0B]/10 text-[#0A0D0B]/80 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 2xl:gap-3 truncate">
                      <Sparkles className="w-3.5 h-3.5 2xl:w-5 2xl:h-5 text-[#B35F27]" />
                      <span className="font-semibold truncate">{scene.label}</span>
                    </div>
                    <span className="text-[9px] 2xl:text-xs min-[2500px]:text-sm font-mono opacity-70 uppercase">{scene.category}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 2xl:gap-4">
                {activeMediaList.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative rounded-lg overflow-hidden border aspect-[4/3] cursor-pointer transition-all duration-300 group ${
                      activeIndex === idx
                        ? "border-[#B35F27] ring-2 ring-[#B35F27]/50 shadow-md"
                        : "border-[#0A0D0B]/10 hover:border-[#B35F27]/50 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={media.src} alt={media.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1 2xl:p-2">
                      <span className="text-[8px] 2xl:text-xs min-[2500px]:text-sm font-mono text-white font-bold">{media.num}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Financial Breakdown Card */}
          <div className="bg-[#0A0D0B] text-[#EDE7E0] rounded-2xl p-4 sm:p-5 2xl:p-8 min-[2500px]:p-10 space-y-3 2xl:space-y-6 shadow-lg">
            <div className="flex justify-between items-baseline border-b border-white/10 pb-2.5 2xl:pb-4">
              <span className="text-[10px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-wider text-[#EBD9AB] font-mono">Valor Total Inversión</span>
              <span className="text-lg 2xl:text-3xl min-[2500px]:text-4xl font-serif font-bold text-[#EDE7E0]">{selectedLot.totalPrice}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 2xl:gap-5 text-xs 2xl:text-base min-[2500px]:text-lg pt-1">
              <div>
                <span className="text-[8px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-wider text-white/50 block">Cuota Inicial</span>
                <span className="font-semibold text-white/90 text-[11px] 2xl:text-base min-[2500px]:text-xl">{selectedLot.downPayment}</span>
              </div>
              <div>
                <span className="text-[8px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-wider text-white/50 block">Financiación</span>
                <span className="font-semibold text-white/90 text-[11px] 2xl:text-base min-[2500px]:text-xl">{selectedLot.financing}</span>
              </div>
              <div>
                <span className="text-[8px] 2xl:text-xs min-[2500px]:text-sm uppercase tracking-wider text-white/50 block">Contraentrega</span>
                <span className="font-semibold text-white/90 text-[11px] 2xl:text-base min-[2500px]:text-xl">{selectedLot.finalPayment}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 2xl:p-6 min-[2500px]:p-8 bg-white/90 border-t border-[#0A0D0B]/10 backdrop-blur-md">
          <button
            onClick={handleSeparateClick}
            className="w-full py-3 2xl:py-5 min-[2500px]:py-6 bg-[#B35F27] hover:bg-[#964d1d] active:scale-95 text-[#EDE7E0] font-semibold rounded-xl uppercase tracking-wider text-xs 2xl:text-base min-[2500px]:text-xl transition-all duration-300 flex items-center justify-center gap-2 2xl:gap-3 shadow-lg shadow-[#B35F27]/25 cursor-pointer whitespace-nowrap"
          >
            <Phone className="w-4 h-4 2xl:w-6 2xl:h-6 min-[2500px]:w-7 min-[2500px]:h-7" />
            <span>Separar Lote {selectedLot.rawId}</span>
          </button>
        </div>
      </motion.aside>

      {/* ========================================== */}
      {/* 4. MODAL VISTA PREVIA DEL PLANO (MINI-MAP) */}
      {/* ========================================== */}
      <AnimatePresence>
        {showMiniMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#EDE7E0] rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-[#0A0D0B]/10 bg-[#EDE7E0]">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#B35F27] font-bold block font-mono">
                    Ubicación en Master Plan
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#0A0D0B]">
                    Plano del Lote {selectedLot.rawId} &bull; {formattedStage}
                  </h3>
                </div>
                <button
                  onClick={() => setShowMiniMapModal(false)}
                  className="p-2 hover:bg-[#0A0D0B]/10 rounded-full text-[#0A0D0B] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full h-[500px] bg-black/5">
                <LoomLotZoomCanvas stageId={stageId} selectedLot={selectedLot} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* 5. MODAL LIGHTBOX COMPLETO (FULLSCREEN IMAGES) */}
      {/* ========================================== */}
      <AnimatePresence>
        {lightboxOpen && currentMediaItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
          >
            <div className="flex justify-between items-center max-w-7xl mx-auto w-full border-b border-white/10 pb-3">
              <span className="text-xs font-mono text-[#EBD9AB] uppercase tracking-widest font-bold">
                {currentMediaItem.title}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <img
                src={currentMediaItem.src}
                alt={currentMediaItem.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="max-w-4xl mx-auto w-full bg-white/10 backdrop-blur-md p-4 rounded-xl text-center">
              <p className="text-xs text-white/90 leading-relaxed font-sans">{currentMediaItem.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Selección de Inmobiliaria / Asesoría Comercial */}
      <LoomReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        lotRawId={selectedLot.rawId}
      />

    </div>
  );
}
