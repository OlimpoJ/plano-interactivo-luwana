const fs = require('fs');

const content = fs.readFileSync('public/LUWANA GENERAL ULTIMO.svg', 'utf8');

// Extract each zone group and its polygon/path elements
// Groups: BASE, _ZONA_3, ZONA_2_..., ZONA_1_...
const groupRe = /<g id="([^"]+)">([\s\S]*?)<\/g>/g;
let m;
const output = [];

while ((m = groupRe.exec(content)) !== null) {
  const id = m[1];
  const body = m[2];
  
  // Skip BASE group (too large)
  if (id === 'BASE') {
    output.push(`GROUP: ${id} (skipped - base image)`);
    continue;
  }
  
  output.push(`\nGROUP: ${id}`);
  
  // Extract polylines
  const polyRe = /<polyline[^>]+points="([^"]{0,500})"/g;
  let pm;
  while ((pm = polyRe.exec(body)) !== null) {
    output.push(`  POLYLINE points: ${pm[1].substring(0, 200)}...`);
  }
  
  // Extract paths
  const pathRe = /<path[^>]+d="([^"]{0,500})"/g;
  while ((pm = pathRe.exec(body)) !== null) {
    output.push(`  PATH d: ${pm[1].substring(0, 200)}...`);
  }
  
  // Extract polygons
  const polygRe = /<polygon[^>]+points="([^"]{0,500})"/g;
  while ((pm = polygRe.exec(body)) !== null) {
    output.push(`  POLYGON points: ${pm[1].substring(0, 200)}...`);
  }
  
  // Count elements
  const elCount = (body.match(/<(polyline|path|polygon|rect)/g) || []).length;
  output.push(`  Total elements: ${elCount}`);
}

// Also get the viewBox from the SVG
const vbMatch = content.match(/viewBox="([^"]+)"/);
output.unshift(`viewBox: ${vbMatch ? vbMatch[1] : 'not found'}`);

fs.writeFileSync('zone_groups_analysis.txt', output.join('\n'));
console.log('Done. Written to zone_groups_analysis.txt');
console.log('Preview:');
output.slice(0, 20).forEach(l => console.log(l));
