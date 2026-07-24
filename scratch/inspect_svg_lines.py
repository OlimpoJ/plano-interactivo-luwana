import xml.etree.ElementTree as ET

svg_path = r"c:\Users\olimp\OneDrive\Documentos\ANTIGRAVITY TEST 1\PLANO INTERACTIVO 3D\plano-interactivo\public\loom\loom_stage_1.svg"

with open(svg_path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Find top-level elements or elements outside LOTGROUP
groups = re.findall(r'<g[^>]*id="([^"]+)"[^>]*>', content)
print("All group IDs found in loom_stage_1.svg:")
for g in groups:
    if not g.startswith("LOTGROUP_"):
        print("  - OUTSIDE LOTGROUP:", g)

# Also check for paths/lines/polygons directly under root or non-lot groups
lines = content.splitlines()
for i, line in enumerate(lines[:60]):
    print(f"{i+1}: {line[:120]}")
