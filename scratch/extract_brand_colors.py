from PIL import Image
import numpy as np

img = Image.open(r"c:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\loom_brand_manual.png")
w, h = img.size
print(f"Image dimensions: {w}x{h}")

# Convert to RGB array
arr = np.array(img.convert("RGB"))

# Sample colors across grid
colors = {}
for y in range(0, h, 20):
    for x in range(0, w, 20):
        r, g, b = arr[y, x]
        # Ignore pure black/white
        if (r < 15 and g < 15 and b < 15) or (r > 245 and g > 245 and b > 245):
            continue
        hex_val = f"#{r:02X}{g:02X}{b:02X}"
        colors[hex_val] = colors.get(hex_val, 0) + 1

# Sort by frequency
sorted_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)

print("\n================ TOP COLOR SWATCHES SAMPLED ================")
for hex_code, count in sorted_colors[:25]:
    print(f"{hex_code}: {count} pixels")
