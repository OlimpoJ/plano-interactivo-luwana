const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/loom/loom_stage_1.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

function decodeSvgNumber(d) {
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
  return digit;
}

function getShapeCentroid(tag, raw) {
  if (tag === "rect") {
    const rx = parseFloat((raw.match(/x=["']([^"']+)["']/i) || [])[1] || 0);
    const ry = parseFloat((raw.match(/y=["']([^"']+)["']/i) || [])[1] || 0);
    const rw = parseFloat((raw.match(/width=["']([^"']+)["']/i) || [])[1] || 0);
    const rh = parseFloat((raw.match(/height=["']([^"']+)["']/i) || [])[1] || 0);
    let cx = rx + rw / 2;
    let cy = ry + rh / 2;

    const transform = (raw.match(/transform=["']([^"']+)["']/i) || [])[1] || "";
    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
      const [a, b, c, d, e, f] = matrixMatch[1].split(/[\s,]+/).map(Number);
      if (!isNaN(a) && !isNaN(f)) {
        cx = a * cx + c * cy + e;
        cy = b * cx + d * cy + f;
      }
    }
    return { x: cx, y: cy };
  }
  
  if (tag === "path") {
    const d = (raw.match(/d=["']([^"']+)["']/i) || [])[1] || "";
    const absCoords = [];
    const cmdRegex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
    let cmdMatch;
    let currX = 0, currY = 0;
    
    while ((cmdMatch = cmdRegex.exec(d)) !== null) {
      const cmd = cmdMatch[1];
      const nums = cmdMatch[2].trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      
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
      } else if (cmd === 'C') {
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
    absCoords.forEach((pt) => { sumX += pt.x; sumY += pt.y; });
    return { x: sumX / absCoords.length, y: sumY / absCoords.length };
  }
  
  return null;
}

// Find circles
const circleRegex = /<circle[^>]*cx=["']([^"']+)["'][^>]*cy=["']([^"']+)["'][^>]*>/g;
let cMatch;
const circles = [];
while ((cMatch = circleRegex.exec(svg)) !== null) {
  const cx = parseFloat(cMatch[1]);
  const cy = parseFloat(cMatch[2]);
  
  const cIndex = cMatch.index;
  const prevG = svg.lastIndexOf('<g', cIndex);
  const nextG = svg.indexOf('</g>', cIndex);
  const gSnippet = svg.substring(prevG, nextG + 4);
  
  const pRegex = /<path[^>]*d=["']([^"']+)["']/g;
  let pMatch;
  let digits = "";
  while ((pMatch = pRegex.exec(gSnippet)) !== null) {
    const d = decodeSvgNumber(pMatch[1]);
    if (d) digits += d;
  }
  if (digits.startsWith("0") && digits.length > 1) digits = digits.substring(1);
  
  let manzana = "";
  if (cy > 1750 && cx < 1500) manzana = "B";
  else if (cy > 1700 && cx >= 1500) manzana = "C";
  else if (cx < 1100 && cy > 1200) manzana = "A";
  else if (cx > 1200) manzana = "C";
  else manzana = "B";
  
  circles.push({ cx, cy, num: parseInt(digits, 10), id: `${manzana}-${digits}` });
}

// Extract ONLY lot geometry shapes
const shapeRegex = /<(polygon|path|rect)[^>]*>/gi;
let sMatch;
const lotShapes = [];

while ((sMatch = shapeRegex.exec(svg)) !== null) {
  const tag = sMatch[1].toLowerCase();
  const raw = sMatch[0];
  
  if (tag === 'path' && !raw.includes('class="st')) continue;
  if (raw.includes('st2') || raw.includes('svg-pin')) continue;
  
  const centroid = getShapeCentroid(tag, raw);
  if (centroid && centroid.x > 300 && centroid.y > 300) {
    lotShapes.push({ id: `shape_${lotShapes.length+1}`, tag, centroid, raw, assignedTo: null });
  }
}

// Sort circles so those closest to their shapes get first pick (ascending distance)
// For each circle, pick closest UNASSIGNED shape
circles.forEach((c) => {
  let minDist = Infinity;
  let bestShape = null;
  lotShapes.forEach((s) => {
    if (s.assignedTo) return; // SKIP ALREADY ASSIGNED SHAPES!
    const dist = Math.sqrt((s.centroid.x - c.cx)**2 + (s.centroid.y - c.cy)**2);
    if (dist < minDist && dist < 450) {
      minDist = dist;
      bestShape = s;
    }
  });
  
  if (bestShape) {
    bestShape.assignedTo = c.id;
    console.log(`Pin ${c.id.padEnd(5)} matched Shape ${bestShape.id} (dist=${minDist.toFixed(1)}, centroid=${bestShape.centroid.x.toFixed(1)},${bestShape.centroid.y.toFixed(1)})`);
  } else {
    console.log(`Pin ${c.id.padEnd(5)} => NO SHAPE MATCHED!`);
  }
});
