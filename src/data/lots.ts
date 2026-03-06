// Demo lot data — replace with real project data from Google Sheets
export type LotStatus = "available" | "reserved" | "sold";

export interface Lot {
    id: string;
    name: string;
    area: number; // m²
    price: number; // USD
    status: LotStatus;
    description: string;
    features: string[];
    // SVG polygon points (percentages of image dimensions — easy to adjust)
    points: string;
}

export const LOTS: Lot[] = [
    {
        id: "071",
        name: "Lote 71 — Etapa 1",
        area: 232.24,
        price: 341392800,
        status: "available",
        description: "Lote con un valor de separación de $10,000,000 y valor por M2 de $1,470,000.",
        features: ["Separación $10,000,000", "Valor M² $1,470,000"],
        points: "8,22 18,20 22,32 12,35",
    },
    {
        id: "073",
        name: "Lote 73 — Etapa 1",
        area: 232.24,
        price: 341392800,
        status: "reserved",
        description: "Lote interior con acceso a zona de amenidades. Rodeado de jardines tropicales.",
        features: ["Jardín tropical", "Acceso amenidades", "Seguridad 24h"],
        points: "22,20 32,18 36,30 26,33",
    },
    {
        id: "L03",
        name: "Lote 03 — Villa Brisa",
        area: 420,
        price: 172000,
        status: "sold",
        description: "Ubicación privilegiada frente a la piscina principal del proyecto. Ideal para renta vacacional.",
        features: ["Frente piscina", "Ideal renta corta", "Brisa del mar constante"],
        points: "36,18 46,16 50,28 40,31",
    },
    {
        id: "L04",
        name: "Lote 04 — Villa Sunset",
        area: 510,
        price: 210000,
        status: "available",
        description: "El lote más grande del proyecto, orientación perfecta para disfrutar atardeceres sobre el Caribe.",
        features: ["El más grande", "Vista panorámica", "Orientación oeste", "Premium corner"],
        points: "50,16 62,14 66,26 54,29",
    },
    {
        id: "L05",
        name: "Lote 05 — Villa Mar",
        area: 360,
        price: 148000,
        status: "reserved",
        description: "Lote con frente al sendero peatonal principal. Arquitectura contemporánea caribeña.",
        features: ["Frente peatonal", "Sendero privado", "Arquitectura premium"],
        points: "26,34 36,31 40,43 30,46",
    },
    {
        id: "L06",
        name: "Lote 06 — Villa Arena",
        area: 395,
        price: 162000,
        status: "available",
        description: "Acceso directo al club de playa y muelle privado. Inversión de alta rentabilidad.",
        features: ["Club de playa", "Muelle privado", "Alta rentabilidad", "Acceso exclusivo"],
        points: "40,43 50,40 54,52 44,55",
    },
    {
        id: "L07",
        name: "Lote 07 — Villa Cielo",
        area: 330,
        price: 135000,
        status: "sold",
        description: "Lote compacto ideal para villa de descanso. Máxima eficiencia de espacio.",
        features: ["Diseño eficiente", "Fácil mantenimiento", "Ideal 2da vivienda"],
        points: "14,36 24,34 28,46 18,49",
    },
    {
        id: "L08",
        name: "Lote 08 — Villa Brisa Sur",
        area: 440,
        price: 180000,
        status: "available",
        description: "Lote sur con vista a jardines centrales y montañas al fondo. Máxima privacidad.",
        features: ["Vista jardines", "Alta privacidad", "Topografía plana"],
        points: "54,29 66,27 70,39 58,42",
    },
    {
        id: "L09",
        name: "Lote 09 — Villa Selva",
        area: 475,
        price: 195000,
        status: "reserved",
        description: "Rodeado de vegetación tropical nativa. El lote más verde del proyecto.",
        features: ["Vegetación nativa", "Eco-friendly", "Máxima sombra natural"],
        points: "8,50 18,48 22,60 12,63",
    },
    {
        id: "L10",
        name: "Lote 10 — Villa Laguna",
        area: 415,
        price: 170000,
        status: "sold",
        description: "Frente al cuerpo de agua central del proyecto. Vistas reflejadas del amanecer.",
        features: ["Frente laguna", "Vista amanecer", "Ambiente único"],
        points: "62,40 72,38 76,50 66,53",
    },
    {
        id: "L11",
        name: "Lote 11 — Villa Nácar",
        area: 350,
        price: 142000,
        status: "available",
        description: "Lote de entrada al proyecto con diseño de portería exclusiva y parque propio.",
        features: ["Portería propia", "Parque frontal", "Diseño exclusivo"],
        points: "28,48 38,46 42,58 32,61",
    },
    {
        id: "L12",
        name: "Lote 12 — Villa Ébano",
        area: 500,
        price: 205000,
        status: "sold",
        description: "Gran lote posterior con total privacidad y espacio para piscina olímpica.",
        features: ["Total privacidad", "Piscina olímpica posible", "Gran patio trasero"],
        points: "62,26 74,24 78,36 66,39",
    },
];

export const PROJECT_INFO = {
    name: "Luwana Alma Beach",
    location: "Zona Norte, Cartagena de Indias",
    totalLots: LOTS.length,
    availableLots: LOTS.filter(l => l.status === "available").length,
    reservedLots: LOTS.filter(l => l.status === "reserved").length,
    soldLots: LOTS.filter(l => l.status === "sold").length,
    minPrice: Math.min(...LOTS.map(l => l.price)),
    maxPrice: Math.max(...LOTS.map(l => l.price)),
};

export const STATUS_CONFIG: Record<LotStatus, { label: string; color: string; bgClass: string }> = {
    available: { label: "Disponible", color: "#22c55e", bgClass: "bg-[#22c55e]" }, // Verde
    reserved: { label: "Reservado", color: "#eab308", bgClass: "bg-[#eab308]" },  // Amarillo
    sold: { label: "Vendido", color: "#ef4444", bgClass: "bg-[#ef4444]" },        // Rojo
};
