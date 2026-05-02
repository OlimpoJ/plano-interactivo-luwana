"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Stage, Html } from "@react-three/drei";
import { MathUtils } from "three";
import { Loader2 } from "lucide-react";
import type { Lot, Zone } from "@/data/lots";

import InteractiveSVGMap from "@/components/InteractiveSVGMap";
import ImageCarousel from "@/components/ImageCarousel";
import { motion, AnimatePresence } from "framer-motion";

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

useGLTF.preload("/modelo.glb");
useGLTF.preload("/casa.glb");

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
    viewMode: "topdown" | "3d" | "topdown-villa1" | "3d-villa1" | "topdown-villa2" | "3d-villa2";
    activeZone: Zone;
}

export default function Real3DViewer({ lots, selectedLot, onSelectLot, viewMode, activeZone }: Real3DViewerProps) {
    const isTopDownMaster = viewMode === "topdown";
    const is3DMaster = viewMode === "3d";
    const is3DVilla1 = viewMode === "3d-villa1";

    const show3D = is3DMaster || is3DVilla1;
    const modelUrl = is3DVilla1 ? "/casa.glb" : "/modelo.glb";

    const isSvg = activeZone.svgPath.toLowerCase().endsWith(".svg");

    return (
        <div className="relative w-full h-full bg-[var(--color-bg)] overflow-hidden">
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
                <div className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs flex items-center gap-2 pointer-events-none z-20 text-white/80">
                    <span className="text-sky-400">🌐</span>
                    Arrastra para explorar en 3D
                </div>
            </div>

            {/* ── TOP-DOWN ZONE VIEW (SVG OR IMAGE) ── */}
            <AnimatePresence mode="wait">
                {isTopDownMaster && (
                    <motion.div
                        key={`zone-${activeZone.id}`}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-[var(--color-bg)] z-10"
                    >
                        <div className="w-full h-full relative">
                            {isSvg ? (
                                <InteractiveSVGMap
                                    svgUrl={activeZone.svgPath}
                                    bgImage={activeZone.bgImage}
                                    lots={lots}
                                    selectedLot={selectedLot}
                                    onSelectLot={onSelectLot}
                                />
                            ) : activeZone.gallery && activeZone.gallery.length > 0 ? (
                                <ImageCarousel images={activeZone.gallery} altText={activeZone.name} />
                            ) : (
                                <img 
                                    src={activeZone.svgPath} 
                                    alt={activeZone.name} 
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-2 text-xs text-white uppercase tracking-widest font-semibold pointer-events-none z-20 border border-[var(--color-accent)]/30 backdrop-blur-md shadow-lg">
                            {activeZone.name}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── NEW VILLA VIEWS PLACEHOLDERS ── */}
            {!isTopDownMaster && !show3D && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)] z-10 transition-opacity duration-500">
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
