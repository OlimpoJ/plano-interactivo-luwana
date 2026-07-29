"use client";

import React, { useEffect, useState } from "react";

export default function TestSvgPage() {
  const [stage, setStage] = useState<number>(2);
  const [svgContent, setSvgContent] = useState<string>("");
  const [stats, setStats] = useState<{ rects: number; paths: number; polygons: number; circles: number }>({
    rects: 0,
    paths: 0,
    polygons: 0,
    circles: 0,
  });

  useEffect(() => {
    fetch(`/loom/loom_stage_${stage}.svg`)
      .then((res) => res.text())
      .then((text) => {
        setSvgContent(text);

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");

        const rects = doc.querySelectorAll("rect").length;
        const paths = doc.querySelectorAll("path").length;
        const polygons = doc.querySelectorAll("polygon, polyline").length;
        const circles = doc.querySelectorAll("circle").length;

        setStats({ rects, paths, polygons, circles });
      })
      .catch((err) => console.error("Error loading SVG:", err));
  }, [stage]);

  return (
    <div style={{ background: "#1a1a1a", color: "#fff", minHeight: "100vh", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
        🧪 Diagnóstico Directo del SVG Original (Etapa {stage})
      </h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: stage === s ? "#10b981" : "#333",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Etapa {s}
          </button>
        ))}
      </div>
      <p style={{ color: "#aaa", marginBottom: "20px" }}>
        Esta página muestra el archivo SVG puro de la Etapa {stage} tal como fue exportado desde Illustrator, sin procesamiento de React ni filtros de lotes.
      </p>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", background: "#2a2a2a", padding: "15px", borderRadius: "8px" }}>
        <div>🔴 Rectángulos (&lt;rect&gt;): <strong>{stats.rects}</strong></div>
        <div>🔵 Trayectorias (&lt;path&gt;): <strong>{stats.paths}</strong></div>
        <div>🟠 Polígonos (&lt;polygon&gt;): <strong>{stats.polygons}</strong></div>
        <div>🟢 Círculos de Pin (&lt;circle&gt;): <strong>{stats.circles}</strong></div>
      </div>

      <div
        style={{
          border: "2px solid #444",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#EDE7E0",
          position: "relative",
          width: "100%",
          height: "80vh",
        }}
      >
        <style>{`
          svg {
            width: 100%;
            height: 100%;
          }
          /* Resaltar todas las formas vectoriales dibujadas en Illustrator */
          svg rect {
            stroke: rgba(239, 68, 68, 0.8) !important;
            stroke-width: 3px !important;
            fill: rgba(239, 68, 68, 0.2) !important;
            cursor: pointer;
          }
          svg path {
            stroke: rgba(59, 130, 246, 0.8) !important;
            stroke-width: 3px !important;
            fill: rgba(59, 130, 246, 0.15) !important;
            cursor: pointer;
          }
          svg polygon, svg polyline {
            stroke: rgba(249, 115, 22, 0.8) !important;
            stroke-width: 3px !important;
            fill: rgba(249, 115, 22, 0.2) !important;
            cursor: pointer;
          }
          svg circle {
            fill: #10b981 !important;
            stroke: #ffffff !important;
            stroke-width: 2px !important;
            r: 12px !important;
          }
          svg rect:hover, svg path:hover, svg polygon:hover {
            fill: rgba(234, 179, 8, 0.6) !important;
            stroke: #eab308 !important;
            stroke-width: 5px !important;
          }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
