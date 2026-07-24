import re

svg_path = r"c:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\public\loom\loom_stage_1.svg"

with open(svg_path, "r", encoding="utf-8") as f:
    content = f.read()

# Search for Porteria or Parque in the raw content
matches = re.findall(r'<g[^>]*id="([^"]+)"[^>]*>', content)
print("All group IDs in loom_stage_1.svg:")
for m in matches:
    if "PARQUE" in m.upper() or "PORT" in m.upper() or "AMENI" in m.upper():
        print("  -> MATCHED:", m)
    else:
        print("  - Group:", m[:60])
