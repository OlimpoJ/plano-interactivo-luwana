import fitz # PyMuPDF

pdf_path = r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\documentos sueltos\showroom\PROYECTOS\LOOM\MANUAL DE MARCA\manual de marca loom.pdf"
img_out = r"c:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\loom_brand_manual.png"

doc = fitz.open(pdf_path)
page = doc[0]
pix = page.get_pixmap(dpi=150)
pix.save(img_out)

print(f"Saved brand manual rendering to {img_out} ({pix.width}x{pix.height} px)")
