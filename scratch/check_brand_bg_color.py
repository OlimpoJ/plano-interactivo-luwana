from PIL import Image
import numpy as np

img = Image.open(r"c:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\loom_brand_manual.png")
arr = np.array(img.convert("RGB"))

# Sample top corners (background area of manual de marca)
top_left_rgb = arr[50, 50]
top_right_rgb = arr[50, -50]
center_bg_rgb = arr[500, 500]

print(f"Top Left BG RGB: {top_left_rgb} -> HEX: #{top_left_rgb[0]:02X}{top_left_rgb[1]:02X}{top_left_rgb[2]:02X}")
print(f"Top Right BG RGB: {top_right_rgb} -> HEX: #{top_right_rgb[0]:02X}{top_right_rgb[1]:02X}{top_right_rgb[2]:02X}")
print(f"Center BG RGB: {center_bg_rgb} -> HEX: #{center_bg_rgb[0]:02X}{center_bg_rgb[1]:02X}{center_bg_rgb[2]:02X}")
