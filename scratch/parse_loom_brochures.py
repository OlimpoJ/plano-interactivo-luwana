import os
import sys

try:
    import pypdf
    has_pypdf = True
except ImportError:
    has_pypdf = False

try:
    import pdfplumber
    has_pdfplumber = True
except ImportError:
    has_pdfplumber = False

files = [
    r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\documentos sueltos\BROCHURE LOOM julio.pdf",
    r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\documentos sueltos\BROCHURE LOOM COMERCIAL.pdf"
]

for fpath in files:
    print(f"\n=================== READING {os.path.basename(fpath)} ===================")
    if not os.path.exists(fpath):
        print("File not found!")
        continue
    
    text = ""
    if has_pdfplumber:
        with pdfplumber.open(fpath) as pdf:
            for i, page in enumerate(pdf.pages):
                ptext = page.extract_text() or ""
                print(f"--- Page {i+1} ---")
                print(ptext)
    elif has_pypdf:
        reader = pypdf.PdfReader(fpath)
        for i, page in enumerate(reader.pages):
            ptext = page.extract_text() or ""
            print(f"--- Page {i+1} ---")
            print(ptext)
    else:
        print("Neither pypdf nor pdfplumber installed. Trying fitz / PyMuPDF...")
        try:
            import fitz
            doc = fitz.open(fpath)
            for i, page in enumerate(doc):
                print(f"--- Page {i+1} ---")
                print(page.get_text())
        except Exception as e:
            print("Error parsing PDF:", e)
