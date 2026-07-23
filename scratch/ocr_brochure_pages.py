import os
import glob

try:
    import pytesseract
    from PIL import Image
    has_tesseract = True
except ImportError:
    has_tesseract = False

pages = sorted(glob.glob(r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\brochure_pages\*.png"))

if has_tesseract:
    for p in pages:
        pname = os.path.basename(p)
        try:
            txt = pytesseract.image_to_string(Image.open(p), lang='spa')
            if any(w in txt.lower() for w in ['villa', 'modelo', 'tipo', 'casa', 'm2', 'nivel', 'planta']):
                print(f"\n--- {pname} ---")
                print(txt[:1000])
        except Exception as e:
            pass
else:
    print("pytesseract not installed. Checking images directly or using paddle/easyocr...")
