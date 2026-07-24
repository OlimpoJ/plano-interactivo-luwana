from PIL import Image
import numpy as np

img = Image.open(r"c:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\loom_brand_manual.png")
w, h = img.size

# Save a crop of the top region where PALETA DE COLORES is located
crop = img.crop((0, 0, w, int(h * 0.4)))
crop.save(r"c:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\paleta_crop.png")

print(f"Saved crop of paleta de colores to scratch/paleta_crop.png ({w}x{crop.height})")
