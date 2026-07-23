import os
import fitz # PyMuPDF
import re

pdf_path = r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\documentos sueltos\showroom\PROYECTOS\LOOM\MANUAL DE MARCA\manual de marca loom.pdf"

if not os.path.exists(pdf_path):
    print("PDF not found at:", pdf_path)
else:
    doc = fitz.open(pdf_path)
    print(f"Opened {os.path.basename(pdf_path)} with {len(doc)} pages.")
    
    full_text = []
    hex_colors = set()
    
    for i, page in enumerate(doc):
        txt = page.get_text()
        if txt.strip():
            print(f"\n--- Page {i+1} ---")
            print(txt)
            full_text.append(txt)
            
            # Find hex color codes like #DBAA67, #070C16, etc.
            matches = re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', txt)
            for m in matches:
                hex_colors.add(m.upper())
                
            # Find RGB/CMYK patterns
            color_matches = re.findall(r'(?:RGB|CMYK|HEX|C:|R:)\s*[\d\s\w,#%]+', txt, re.IGNORECASE)
            for cm in color_matches:
                print("Color match:", cm)

    print("\n================ HEX COLORS FOUND IN BRAND MANUAL ================")
    for h in sorted(hex_colors):
        print(h)
