import fitz

pdf_path = r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\documentos sueltos\showroom\PROYECTOS\LOOM\MANUAL DE MARCA\manual de marca loom.pdf"
doc = fitz.open(pdf_path)

for i, page in enumerate(doc):
    text = page.get_text()
    print(f"--- PAGE {i+1} ---")
    print(text)
