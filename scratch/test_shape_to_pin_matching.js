const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/loom/loom_stage_1.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

function decodeSvgNumber(attrStr) {
  // Regex to extract path d commands inside circle group
  const paths = (attrStr.match(/<path[^>]*d=["']([^"']+)["']/g) || []).map(p => {
    const m = p.match(/d=["']([^"']+)["']/);
    return m ? m[1] : '';
  });
  
  if (paths.length === 0) return null;
  
  let numberStr = "";
  
  paths.forEach((d) => {
    const noWhitespace = d.replace(/\s+/g, '');
    const clean = noWhitespace.replace(/^M\s*[-+]?[0-9]*\.?[0-9]+[\s,]+[-+]?[0-9]*\.?[0-9]+/i, '').trim();
    
    const cmds = clean.split(/[a-df-z]/i).length;
    const startsWith = clean.substring(0, 5).toLowerCase();

    let digit = "";
    if ((cmds === 20 || cmds === 21) && startsWith.startsWith("c-")) digit = "0";
    else if ((cmds === 11 || cmds === 12) && startsWith.startsWith("h-")) digit = "1";
    else if ((cmds === 31 || cmds === 32) && startsWith.startsWith("v-")) digit = "2";
    else if ((cmds === 32 || cmds === 33) && startsWith.startsWith("l0")) digit = "3";
    else if (cmds === 24 && startsWith.startsWith("v")) digit = "4";
    else if (cmds === 24 && startsWith.startsWith("l")) digit = "5";
    else if (cmds === 34 && startsWith.startsWith("c")) digit = "6";
    else if (cmds === 11 && startsWith.startsWith("c-")) digit = "7";
    else if (cmds === 38 && startsWith.startsWith("c0")) digit = "8";
    else if (cmds === 30 && startsWith.startsWith("c0")) digit = "9";
    
    if (digit) numberStr += digit;
  });
  
  if (!numberStr) return null;
  if (numberStr.startsWith("0") && numberStr.length > 1) {
    numberStr = numberStr.substring(1);
  }
  const parsed = parseInt(numberStr, 10);
  return isNaN(parsed) ? null : parsed;
}

// Find all circle groups
const gRegex = /<g[^>]*>([\s\S]*?<circle[\s\S]*?)<\/g>/gi;
let gMatch;
const pins = [];

// Helper for centroid calculation
function getCentroidFromPath(d) {
  const absCoords = [];
  const cmdRegex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
  let cmdMatch;
  let currX = 0, currY = 0;
  
  while ((cmdMatch = cmdRegex.exec(d)) !== null) {
    const cmd = cmdMatch[1];
    const nums = cmdMatch[2].trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    
    if (cmd === 'M' || cmd === 'L') {
      for (let i = 0; i < nums.length; i += 2) {
        if (nums[i] !== undefined && nums[i+1] !== undefined) {
          currX = nums[i]; currY = nums[i+1]; absCoords.push({ x: currX, y: currY });
        }
      }
    } else if (cmd === 'm' || cmd === 'l') {
      for (let i = 0; i < nums.length; i += 2) {
        if (nums[i] !== undefined && nums[i+1] !== undefined) {
          currX += nums[i]; currY += nums[i+1]; absCoords.push({ x: currX, y: currY });
        }
      }
    } else if (cmd === 'H') { if (nums[0] !== undefined) { currX = nums[0]; absCoords.push({ x: currX, y: currY }); } }
    else if (cmd === 'h') { if (nums[0] !== undefined) { currX += nums[0]; absCoords.push({ x: currX, y: currY }); } }
    else if (cmd === 'V') { if (nums[0] !== undefined) { currY = nums[0]; absCoords.push({ x: currX, y: currY }); } }
    else if (cmd === 'v') { if (nums[0] !== undefined) { currY += nums[0]; absCoords.push({ x: currX, y: currY }); } }
    else if (cmd === 'C') {
      for (let i = 0; i < nums.length; i += 6) {
        if (nums[i+4] !== undefined && nums[i+5] !== undefined) {
          currX = nums[i+4]; currY = nums[i+5]; absCoords.push({ x: currX, y: currY });
        }
      }
    } else if (cmd === 'c') {
      for (let i = 0; i < nums.length; i += 6) {
        if (nums[i+4] !== undefined && nums[i+5] !== undefined) {
          currX += nums[i+4]; currY += nums[i+5]; absCoords.push({ x: currX, y: currY });
        }
      }
    }
  }
  
  if (absCoords.length === 0) return null;
  let sumX = 0, sumY = 0;
  absCoords.forEach(pt => { sumX += pt.x; sumY += pt.y; });
  return { x: sumX / absCoords.length, y: sumY / absCoords.length };
}

// Find circles
const circleRegex = /<circle[^>]*cx=["']([^"']+)["'][^>]*cy=["']([^"']+)["'][^>]*>/g;
let cMatch;
const circles = [];
while ((cMatch = circleRegex.exec(svg)) !== null) {
  const cx = parseFloat(cMatch[1]);
  const cy = parseFloat(cMatch[2]);
  
  // Find group enclosing this circle
  const cIndex = cMatch.index;
  const prevG = svg.lastIndexOf('<g', cIndex);
  const nextG = svg.indexOf('</g>', cIndex);
  const gSnippet = svg.substring(prevG, nextG + 4);
  
  let manzana = "";
  if (cy > 1200 && cx < 1100 && cy < 1900 && cx < 850) manzana = "A";
  else if (cx > 1200) manzana = "C";
  else manzana = "B";
  
  const num = decodeSvgNumber(gSnippet);
  circles.push({ cx, cy, num, snippet: gSnippet });
}

// Extract lot polygon/path shapes
const shapeRegex = /<(polygon|path|rect)[^>]*>/gi;
let sMatch;
const lotShapes = [];

while ((sMatch = shapeRegex.exec(svg)) !== null) {
  const tag = sMatch[1].toLowerCase();
  const raw = sMatch[0];
  if (raw.includes('st2') || raw.includes('svg-pin')) continue; // skip circle and pin rects
  
  let centroid = null;
  if (tag === 'polygon') {
    const pointsMatch = raw.match(/points=["']([^"']+)["']/i);
    if (pointsMatch) {
      const coords = pointsMatch[1].trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      let sumX = 0, sumY = 0, count = 0;
      for (let i = 0; i < coords.length; i += 2) {
        if (coords[i] !== undefined && coords[i+1] !== undefined) {
          sumX += coords[i]; sumY += coords[i+1]; count++;
        }
      }
      if (count > 0) centroid = { x: sumX / count, y: sumY / count };
    }
  } else if (tag === 'path') {
    const dMatch = raw.match(/d=["']([^"']+)["']/i);
    if (dMatch) centroid = getCentroidFromPath(dMatch[1]);
  }
  
  if (centroid && centroid.x > 300 && centroid.y > 300) {
    lotShapes.push({ tag, centroid, raw });
  }
}

console.log(`Matching ${circles.length} circles against ${lotShapes.length} shapes...`);

// Test matching for Manzana A circles
const mzA = circles.filter(c => c.cx < 1100 && c.cy > 1200 && c.cy < 1900).sort((a, b) => a.num - b.num);

mzA.forEach(c => {
  let minDist = Infinity;
  let bestShape = null;
  lotShapes.forEach(s => {
    const d = Math.sqrt((s.centroid.x - c.cx)**2 + (s.centroid.y - c.cy)**2);
    if (d < minDist) {
      minDist = d;
      bestShape = s;
    }
  });
  console.log(`Circle num=${c.num} (cx=${c.cx}, cy=${c.cy}) => Closest Shape dist=${minDist.toFixed(1)}, centroid=(${bestShape.centroid.x.toFixed(1)}, ${bestShape.centroid.y.toFixed(1)})`);
});
