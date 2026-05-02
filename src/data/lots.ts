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
    points?: string;
    zoneId: string;
}

export type ZoneType = "residential" | "amenity" | "other";

export interface Zone {
    id: string;
    name: string;
    type: ZoneType;
    svgPath: string; // Path to the SVG or JPG depending on requirements
    bgImage?: string; // Background image for SVG overlay zones
    gallery?: string[]; // Array of images for a gallery view
    lotsRange?: [number, number]; // e.g. [1, 30] for lots 1 through 30
}

export const ZONES: Record<string, Zone> = {
    "etapa-1": {
        id: "etapa-1",
        name: "Etapa 1",
        type: "residential",
        svgPath: "/LUWANA 1.svg",
        bgImage: "/LUWANA_1_bg.jpg",
        lotsRange: [71, 90],
    },
    "etapa-2": {
        id: "etapa-2",
        name: "Etapa 2",
        type: "residential",
        svgPath: "/LUWANA 2.svg",
        bgImage: "/LUWANA_2_bg.jpg",
        lotsRange: [1, 40],
    },
    "etapa-3": {
        id: "etapa-3",
        name: "Etapa 3",
        type: "residential",
        svgPath: "/LUWANA 3.svg",
        bgImage: "/LUWANA_3_bg.jpg",
        lotsRange: [41, 70],
    },
};

export const LOTS: Lot[] = [
    {
        zoneId: "etapa-1",
        id: "071",
        name: "Lote 71 — Etapa 1",
        area: 232.24,
        price: 341392800,
        status: "available",
        description: "Lote con un valor de separación de $10,000,000 y valor por M2 de $1,470,000.",
        features: ["Separación $10,000,000", "Valor M² $1,470,000"],
    },
    {
        zoneId: "etapa-1",
        id: "072",
        name: "Lote 72 — Etapa 1",
        area: 232.24,
        price: 341392800,
        status: "reserved",
        description: "Lote interior con acceso a zona de amenidades. Rodeado de jardines tropicales.",
        features: ["Jardín tropical", "Acceso amenidades", "Seguridad 24h"],
    },
    {
        zoneId: "etapa-1",
        id: "073",
        name: "Lote 73 — Etapa 1",
        area: 234.09,
        price: 344112300,
        status: "available",
        description: "Lote con gran frente de calle y orientación privilegiada.",
        features: ["Separación $10,000,000", "Valor M² $1,470,000", "Excelente frente"],
    },
    {
        zoneId: "etapa-1",
        id: "074",
        name: "Lote 74 — Etapa 1",
        area: 232.24,
        price: 341392800,
        status: "available",
        description: "Ubicación privilegiada en la primera etapa con excelente frente de calle.",
        features: ["Separación $10,000,000", "Valor M² $1,470,000", "Excelente frente"],
    },
    {
        zoneId: "etapa-1",
        id: "075",
        name: "Lote 75 — Etapa 1",
        area: 234.09,
        price: 344112300,
        status: "sold",
        description: "Lote premium en la primera etapa del proyecto.",
        features: ["Primera etapa", "Alta valorización"],
    },
    {
        zoneId: "etapa-1",
        id: "076",
        name: "Lote 76 — Etapa 1",
        area: 232.24,
        price: 341392800,
        status: "available",
        description: "Lote disponible con excelente relación costo-beneficio.",
        features: ["Separación $10,000,000", "Valor M² $1,470,000"],
    },
    {
        zoneId: "etapa-2",
        id: "001",
        name: "Lote 01 — Etapa 2",
        area: 250.0,
        price: 367500000,
        status: "available",
        description: "Lote de gran extensión en la Etapa 2, ideal para villa de lujo.",
        features: ["Gran extensión", "Etapa 2", "Acceso amenidades"],
    },
    {
        zoneId: "etapa-2",
        id: "002",
        name: "Lote 02 — Etapa 2",
        area: 238.5,
        price: 350595000,
        status: "reserved",
        description: "Lote reservado con vista privilegiada.",
        features: ["Vista privilegiada", "Etapa 2"],
    },
    {
        zoneId: "etapa-3",
        id: "041",
        name: "Lote 41 — Etapa 3",
        area: 260.0,
        price: 382200000,
        status: "available",
        description: "Lote amplio en la Etapa 3 con acceso directo a amenidades.",
        features: ["Etapa 3", "Acceso amenidades", "Alta privacidad"],
    },
    {
        zoneId: "etapa-3",
        id: "042",
        name: "Lote 42 — Etapa 3",
        area: 245.0,
        price: 360150000,
        status: "sold",
        description: "Lote premium en ubicación destacada de la Etapa 3.",
        features: ["Etapa 3", "Ubicación premium"],
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
