import os
import glob
import asyncio

async def main():
    try:
        from winrt.windows.media.ocr import OcrEngine
        from winrt.windows.graphics.imaging import BitmapDecoder
        from winrt.windows.storage import StorageFile, FileAccessMode
        from winrt.windows.globalization import Language
        
        engine = OcrEngine.try_create_from_language(Language("es")) or OcrEngine.try_create_from_user_profile_languages()
        print("Initialized Windows native OCR engine.")

        pages = sorted(glob.glob(r"C:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\scratch\brochure_pages\*.png"))
        
        for p in pages:
            file = await StorageFile.get_file_from_path_async(p)
            stream = await file.open_async(FileAccessMode.READ)
            decoder = await BitmapDecoder.create_async(stream)
            bitmap = await decoder.get_software_bitmap_async()
            result = await engine.recognize_async(bitmap)
            
            txt = result.text or ""
            pname = os.path.basename(p)
            
            keywords = ["villa", "modelo", "tipo", "casa", "m2", "axonometria", "planta", "nivel", "habitaciones"]
            if any(k in txt.lower() for k in keywords):
                print(f"\n=================== {pname} ===================")
                print(txt)
    except Exception as e:
        print("WinRT OCR Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
