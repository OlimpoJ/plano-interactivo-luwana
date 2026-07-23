import os
import fitz # PyMuPDF

pdf_path = r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\documentos sueltos\BROCHURE LOOM julio.pdf"
out_dir = r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\brochure_pages"

os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Total pages in BROCHURE LOOM julio.pdf: {len(doc)}")

for page_num in range(len(doc)):
    page = doc[page_num]
    pix = page.get_pixmap(dpi=150)
    img_path = os.path.join(out_dir, f"page_{page_num+1:02d}.png")
    pix.save(img_path)
    print(f"Saved {img_path}")
