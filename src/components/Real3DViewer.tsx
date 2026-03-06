"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Stage, Html } from "@react-three/drei";
import { MathUtils } from "three";
import { Loader2 } from "lucide-react";
import type { Lot } from "@/data/lots";

// Import the interactive SVG map
import InteractiveSVGMap from "@/components/InteractiveSVGMap";
import MasterplanMapZones from "@/components/MasterplanMapZones";
import { motion, AnimatePresence } from "framer-motion";

// --- The Actual 3D Model Component ---
function Model({ url }: { url: string }) {
    // useGLTF will auto-preload and decode the .glb
    const { scene } = useGLTF(url);

    // Optional: you can traverse the scene here to enable castShadow/receiveShadow on meshes
    return <primitive object={scene} />;
}

// Prefetch for speed (optional but good practice)
useGLTF.preload("/modelo.glb");
useGLTF.preload("/casa.glb");

// --- Loading Fallback ---
function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center gap-3 text-white/70">
                <Loader2 size={32} className="animate-spin text-sky-400" />
                <p className="text-sm font-medium tracking-wide">Cargando Modelo 3D...</p>
            </div>
        </Html>
    );
}

interface Real3DViewerProps {
    lots: Lot[];
    selectedLot: Lot | null;
    onSelectLot: (lot: Lot) => void;
    // If we want to toggle between the interactive map and the real 3D model:
    viewMode: "topdown" | "3d" | "topdown-villa1" | "3d-villa1" | "topdown-villa2" | "3d-villa2";
}

export default function Real3DViewer({ lots, selectedLot, onSelectLot, viewMode }: Real3DViewerProps) {
    const isTopDownMaster = viewMode === "topdown";
    const is3DMaster = viewMode === "3d";
    const is3DVilla1 = viewMode === "3d-villa1";

    // ── SCENARIO STATE ──
    // "zones" = Escenario 1: Vista general con 4 zonas
    // "lots" = Escenario 2: SVG interactivo
    const [scenario, setScenario] = useState<"zones" | "lots">("zones");
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    // We want to show the 3D canvas if any 3D mode is active
    const show3D = is3DMaster || is3DVilla1;
    // Determine which model to show
    const modelUrl = is3DVilla1 ? "/casa.glb" : "/modelo.glb";

    const handleSelectZone = (zoneId: string) => {
        setSelectedZone(zoneId);
        // Pequeño delay para que se vea el clic antes del zoom
        setTimeout(() => setScenario("lots"), 150);
    };

    const handleBackToZones = () => {
        setScenario("zones");
        setSelectedZone(null);
        if (selectedLot) {
            onSelectLot(selectedLot); // Toggle off
        }
    };

    return (
        <div className="relative w-full h-full bg-[#030810] overflow-hidden">

            {/* ── 3D MODEL VIEW ── */}
            <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: show3D ? 1 : 0, pointerEvents: show3D ? "auto" : "none", zIndex: show3D ? 5 : 0 }}
            >
                <Canvas shadows camera={{ position: [20, 15, 20], fov: 45 }}>
                    <Suspense fallback={<Loader />}>
                        <Environment preset="city" background={false} />
                        <Stage
                            environment="city"
                            intensity={0.5}
                            castShadow={false}
                            adjustCamera={1.2}
                        >
                            <Model url={modelUrl} key={modelUrl} />
                        </Stage>
                        <OrbitControls
                            makeDefault
                            autoRotate={show3D}
                            autoRotateSpeed={0.5}
                            enablePan={true}
                            enableZoom={true}
                            minDistance={5}
                            maxDistance={50}
                            maxPolarAngle={MathUtils.degToRad(85)}
                        />
                    </Suspense>
                </Canvas>

                {/* 3D View Badges */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs flex items-center gap-2 pointer-events-none z-20 text-white/80">
                    <span className="text-sky-400">🌐</span>
                    Arrastra para explorar en 3D
                </div>
            </div>

            {/* ── TOP-DOWN INTERACTIVE MAPS (SCENARIOS 1 & 2) ── */}
            <AnimatePresence mode="wait">
                {isTopDownMaster && scenario === "zones" && (
                    <motion.div
                        key="scenario-zones"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }} // Efecto de zoom in al salir
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-[#030810] z-10"
                    >
                        <MasterplanMapZones onSelectZone={handleSelectZone} />

                        {/* Top-down badges */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs text-white/60 flex items-center gap-2 pointer-events-none z-20"
                        >
                            Vista General — Selecciona una etapa/zona para hacer zoom
                        </motion.div>
                    </motion.div>
                )}

                {isTopDownMaster && scenario === "lots" && (
                    <motion.div
                        key="scenario-lots"
                        initial={{ opacity: 0, scale: 1.1 }} // Entra desde el zoom
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-[#030810] z-10"
                    >
                        {/* Botón Volver */}
                        <button
                            onClick={handleBackToZones}
                            className="absolute top-6 left-6 z-50 glass px-4 py-2 text-xs text-white hover:text-[#D4AF37] border border-white/20 hover:border-[#D4AF37] transition-all flex items-center gap-2 rounded shadow-lg"
                        >
                            <span>⟵</span> Volver a Vista General
                        </button>

                        <div className="w-full h-full">
                            <InteractiveSVGMap
                                svgUrl="/SHOW ROOM LUWANA.svg"
                                lots={lots}
                                selectedLot={selectedLot}
                                onSelectLot={onSelectLot}
                            />
                        </div>

                        {/* Top-down badges */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs text-white/60 flex items-center gap-2 pointer-events-none z-20"
                        >
                            Etapa 1 — Selecciona un lote
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── NEW VILLA VIEWS PLACEHOLDERS ── */}
            {!isTopDownMaster && !show3D && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#030810] z-10 transition-opacity duration-500">
                    {/* We can show the appropriate image for the selected view */}
                    {viewMode === "topdown-villa1" && <img src="/Render Villa 1 Fachada principal (1).jpg" className="w-full h-full object-cover" alt="Plano Villa 1" />}
                    {viewMode === "topdown-villa2" && <img src="/Render Villa 1 Fachada Posterior.jpg" className="w-full h-full object-cover" alt="Plano Villa 2" />}
                    {viewMode === "3d-villa2" && <img src="/Render Villa 1 Interior 1.jpg" className="w-full h-full object-cover" alt="Modelo 3D Villa 2" />}

                    <div className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs text-white/60 flex items-center gap-2 pointer-events-none">
                        Vista — {viewMode}
                    </div>
                </div>
            )}

        </div>
    );
}
