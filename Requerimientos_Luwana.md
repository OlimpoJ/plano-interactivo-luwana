#  Brief de Entregables Digitales  Plataforma Interactiva Luwana Alma Beach

**Objetivo del Proyecto:** 
Alimentar una plataforma web interactiva de ventas inmobiliarias. El usuario final debe poder explorar el proyecto completo (Plano Master) de forma fluida y fotorealista, y poder adentrarse a ver detalles de amenidades y cada tipo de villa.
**Prioridad técnica:** Privilegiar el uso de **renders 2D en alta resolución con perspectivas isométricas/drone**, ya que la plataforma los convertirá en un entorno '2.5D' navegable.

A continuación, los requerimientos técnicos y visuales agrupados por componente:

---

## 1. Masterplan Interactivo (Entorno 2.5D)

Este es el módulo principal de la plataforma. La app funcionará colocando polígonos interactivos sobre un render base para seleccionar cada lote. **Para lograr un efecto 3D fluido de 'órbita' al explorar el proyecto, necesitamos:**

*   **Renders Masterplan (Vista Drone/Aérea):**
    *   **Cantidad:** 4 a 8 renders del proyecto completo.
    *   **Ángulo de cámara:** Elevación tipo dron (~30° a 45° de inclinación hacia el suelo).
    *   **Rotación:** La cámara debe orbitar exactamente en el centro del proyecto. Los renders deben tomarse avanzando cada *X* grados (ejemplo: si son 4, a 0°, 90°, 180° y 270°).
    *   **Importante:** La iluminación solar, el cielo, el mar y la vegetación **no deben cambiar** entre las tomas para que al navegar entre ellas parezca un video fluido.
    *   **Formato y Resolución:** JPG alta calidad, mínimo **4K (3840 x 2160 px)**.
*   **Vectores para Programación (Poligonización):**
    *   Por cada uno de los *Renders Masterplan* aéreos, necesitamos que un diseñador trace la capa silueta/vector.
    *   **Entregable:** Archivos vectoriales (.SVG, Figma, o Illustrator) con un polígono individual exacto (cerrado) trazado sobre **cada lote vendible y amenidad**, respetando la perspectiva del render. Cada polígono debe estar nombrado/separado en capas identificables (Ej: 'Lote_01', 'Piscina').

## 2. Modelos 3D y Renders por Tipo de Villa

Cuando un cliente hace clic en un lote específico en el Masterplan Web, se abrirá la vista profunda de esa casa.

### A. Renders Estáticos (Galería)
Minímo 4 renders fotorrealistas por cada tipología de villa.
*   1x Fachada Principal (desde la calle/acceso).
*   1x Fachada Posterior / Exterior Privado (Jardín, piscina o vista al mar).
*   1x Zona Social Interior (Sala formal / Comedor integrados).
*   1x Habitación Principal.
*   **Formato:** JPG, mínimo 1920x1080 px (16:9). Se sugiere mantener la línea gráfica cálida (Beach House / Alma).

### B. Elemento 3D 'Lite' (Formato GLB)
Requerimos el modelo 3D independiente **solo de la villa** (sin el masterplan ni contexto gigantesco) para que el comprador pueda rotarla con el dedo en su celular.
*   **Entregable:** 1 archivo **.glb** (o .gltf) por cada tipo de villa.
*   **Optimizaciones web obligatorias (CRÍTICO):** 
    *   El peso final del archivo no debe superar los **10-15 MB**.
    *   Reducir poligonaje estricto. La vegetación pesada debe removerse o sustituirse por texturas/planos 2D cruzados.
    *   **Baking de Texturas:** Toda la iluminación, shadows oclusivas (ambient occlusion), y materiales complejos de V-Ray/Corona **deben estar 'horneados/baked'** en las texturas de imagen UV map de los modelos. Los navegadores web no calculan materiales complejos de forma nativa.

## 3. Renders de Amenidades / Áreas Sociales

Imágenes de alta calidad que se abrirán como 'Hotspots' (puntos de interés) sobre el mapa.
*   **Cantidad:** 3 a 5 renders.
*   **Requeridos:** Club de Playa, Piscina(s) Común(es), Portería / Recepción, Jardines/Senderos (u otras áreas destacadas).
*   **Formato:** JPG alta calidad, mínimo 1920x1080 px.

## 4. Recursos Branding y UI

Elementos gráficos planos para la interfaz de la aplicación de ventas:
*   **Identidad Visual:** Logos en curvas transparentes (Blanco, Negro, y Color) preferiblemente en .SVG o .PNG.
*   **Tipografía y Color:** Documento con paleta de colores oficial HEX y fuentes usadas (Ideal si aplican Google Fonts o adjuntan archivos TTF/OTF web).
*   **Ubicación Real:** Un PDF o plano técnico 2D real que muestre el área de cada lote (metros cuadrados) para cruzarlo con nuestra base de datos dinámica. (Puede ser desde AutoCAD, Revit, etc.).

---

### Resumen de Entrega (Checklist para la Agencia)

- [ ] Paquete de Renders Masterplan Orbit (4 a 8 imágenes secuenciales 4K).
- [ ] SVG con trazado de polígonos por cada lote (uno por cada imagen masterplan).
- [ ] Renders estáticos de galerías (mínimo 4 por cada tipología de villa).
- [ ] Renders estáticos de amenidades (3-5 imágenes).
- [ ] Archivos 3D Web Optimizados (.glb baked de menos de 15mb) para cada tipo de villa.
- [ ] Carpeta de Branding (Logos, fuentes, colores).
- [ ] Plano geométrico final con números de lote y áreas correspondientes.