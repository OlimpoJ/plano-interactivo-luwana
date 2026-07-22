const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/loom/loom_stage_1.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

// Find MANZANA_A block
const mzAIndex = svg.indexOf('MANZANA_A');
console.log('MANZANA_A index in SVG:', mzAIndex);

// Find all circles in SVG
const circleRegex = /<circle[^>]*cx=["']([^"']+)["'][^>]*cy=["']([^"']+)["'][^>]*>/g;
let match;
const circles = [];
while ((match = circleRegex.exec(svg)) !== null) {
  circles.push({ cx: parseFloat(match[1]), cy: parseFloat(match[2]), raw: match[0] });
}

console.log(`Total circles found in SVG: ${circles.length}`);

// Print circles with cy between 1200 and 1900 (Manzana A is around cx ~ 500..1000, cy ~ 1200..1900)
const mzA_circles = circles.filter(c => c.cx >= 400 && c.cx <= 1100 && c.cy >= 1200 && c.cy <= 1900);
console.log(`Manzana A circles count: ${mzA_circles.length}`);
mzA_circles.forEach((c, idx) => {
  console.log(`Circle ${idx+1}: cx=${c.cx}, cy=${c.cy}`);
});

// Search for polygons/paths in LOTES_A or MANZANA_A
const lotesARegex = /<g[^>]*id=["'](?:LOTES_A|MANZANA_A)[^"']*["'][^>]*>([\s\S]*?)<\/g>/gi;
const lotesABlock = lotesARegex.exec(svg);
if (lotesABlock) {
  console.log("Found LOTES_A/MANZANA_A block snippet length:", lotesABlock[1].length);
  const pathRegex = /<polygon[^>]*points=["']([^"']+)["']|<path[^>]*d=["']([^"']+)["']/g;
  let pMatch;
  let count = 0;
  while ((pMatch = pathRegex.exec(lotesABlock[1])) !== null) {
    count++;
    console.log(`Shape #${count}: ${pMatch[1] ? 'polygon points=' + pMatch[1].substring(0, 30) : 'path d=' + pMatch[2].substring(0, 30)}`);
  }
}
