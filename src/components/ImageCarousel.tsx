"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
    images: string[];
    altText?: string;
}

export default function ImageCarousel({ images, altText = "Image" }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reset index if images change drastically
    useEffect(() => {
        setCurrentIndex(0);
    }, [images]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <img 
                src={images[0]} 
                alt={altText} 
                className="w-full h-full object-cover"
            />
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.img
                    key={`${images[currentIndex]}-${currentIndex}`}
                    src={images[currentIndex]}
                    alt={`${altText} ${currentIndex + 1}`}
                    className="w-full h-full object-contain md:object-cover"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                />
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button 
                    onClick={handlePrev}
                    className="pointer-events-auto p-2 rounded-full glass bg-black/50 text-white hover:bg-[var(--color-accent)] transition-colors border border-white/20"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={handleNext}
                    className="pointer-events-auto p-2 rounded-full glass bg-black/50 text-white hover:bg-[var(--color-accent)] transition-colors border border-white/20"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 glass rounded-full z-10">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[var(--color-accent)] w-6' : 'bg-white/50 hover:bg-white'}`}
                    />
                ))}
            </div>
        </div>
    );
}
