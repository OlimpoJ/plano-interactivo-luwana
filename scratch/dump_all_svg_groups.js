const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/loom/loom_stage_1.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

// Match all <g id="..."> tags and their immediate children tags
const gRegex = /<g[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/g>/gi;
let match;
while ((match = gRegex.exec(svg)) !== null) {
  const gId = match[1];
  const content = match[2];
  const circles = (content.match(/<circle/g) || []).length;
  const paths = (content.match(/<path/g) || []).length;
  const polygons = (content.match(/<polygon/g) || []).length;
  const rects = (content.match(/<rect/g) || []).length;
  console.log(`G ID: ${gId} => circles:${circles}, paths:${paths}, polygons:${polygons}, rects:${rects}`);
}
