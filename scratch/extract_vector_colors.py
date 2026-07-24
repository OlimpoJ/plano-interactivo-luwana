import fitz

pdf_path = r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\documentos sueltos\showroom\PROYECTOS\LOOM\MANUAL DE MARCA\manual de marca loom.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

drawings = page.get_drawings()
print(f"Total vector drawings: {len(drawings)}")

color_list = []
for d in drawings:
    fill = d.get("fill")
    if fill:
        # fill can be RGB (3 floats) or CMYK (4 floats)
        if len(fill) == 3:
            r, g, b = [int(c * 255) for c in fill]
            hex_val = f"#{r:02X}{g:02X}{b:02X}"
            color_list.append((hex_val, (r, g, b)))
        elif len(fill) == 4:
            c, m, y, k = fill
            r = int(255 * (1 - c) * (1 - k))
            g = int(255 * (1 - m) * (1 - k))
            b = int(255 * (1 - y) * (1 - k))
            hex_val = f"#{r:02X}{g:02X}{b:02X}"
            color_list.append((hex_val, (r, g, b)))

unique_colors = list(set(color_list))
print("\n=== VECTOR FILL COLORS FOUND IN PDF ===")
for hex_val, rgb in unique_colors:
    print(f"HEX: {hex_val} | RGB: {rgb}")
