const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/loom/loom_stage_1.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

function getShapeCentroid(tag, attrStr) {
  if (tag === "rect") {
    const rx = parseFloat((attrStr.match(/x=["']([^"']+)["']/i) || [])[1] || 0);
    const ry = parseFloat((attrStr.match(/y=["']([^"']+)["']/i) || [])[1] || 0);
    const rw = parseFloat((attrStr.match(/width=["']([^"']+)["']/i) || [])[1] || 0);
    const rh = parseFloat((attrStr.match(/height=["']([^"']+)["']/i) || [])[1] || 0);
    return { x: rx + rw / 2, y: ry + rh / 2 };
  }
  
  if (tag === "polygon") {
    const pointsAttr = (attrStr.match(/points=["']([^"']+)["']/i) || [])[1] || "";
    const coords = pointsAttr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (coords.length < 2) return null;
    let sumX = 0, sumY = 0, count = 0;
    for (let i = 0; i < coords.length; i += 2) {
      if (coords[i] !== undefined && coords[i+1] !== undefined) {
        sumX += coords[i];
        sumY += coords[i+1];
        count++;
      }
    }
    return count > 0 ? { x: sumX / count, y: sumY / count } : null;
  }
  
  if (tag === "path") {
    const d = (attrStr.match(/d=["']([^"']+)["']/i) || [])[1] || "";
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
            currX = nums[i]; currY = nums[i+1];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'm' || cmd === 'l') {
        for (let i = 0; i < nums.length; i += 2) {
          if (nums[i] !== undefined && nums[i+1] !== undefined) {
            currX += nums[i]; currY += nums[i+1];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'H') {
        if (nums[0] !== undefined) { currX = nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'h') {
        if (nums[0] !== undefined) { currX += nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'V') {
        if (nums[0] !== undefined) { currY = nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'v') {
        if (nums[0] !== undefined) { currY += nums[0]; absCoords.push({ x: currX, y: currY }); }
      } else if (cmd === 'C') {
        for (let i = 0; i < nums.length; i += 6) {
          if (nums[i+4] !== undefined && nums[i+5] !== undefined) {
            currX = nums[i+4]; currY = nums[i+5];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'c') {
        for (let i = 0; i < nums.length; i += 6) {
          if (nums[i+4] !== undefined && nums[i+5] !== undefined) {
            currX += nums[i+4]; currY += nums[i+5];
            absCoords.push({ x: currX, y: currY });
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

const targets = [
  { name: 'B-10', x: 1382.89, y: 1800.14 },
  { name: 'B-11', x: 1647.68, y: 1809.35 },
  { name: 'C-15', x: 2009.98, y: 1790.60 },
  { name: 'C-16', x: 2278.18, y: 1794.56 },
];

targets.forEach(t => {
  console.log(`\n=================== SEARCHING ACCURATE CENTROIDS NEAR ${t.name} (${t.x}, ${t.y}) ===================`);
  const tagRegex = /<(path|polygon|rect)[^>]*>/gi;
  let match;
  let matchesCount = 0;
  while ((match = tagRegex.exec(svg)) !== null) {
    const tag = match[1].toLowerCase();
    const raw = match[0];
    if (raw.includes('st2') || raw.includes('svg-pin')) continue;
    
    const centroid = getShapeCentroid(tag, raw);
    if (centroid) {
      const dist = Math.sqrt((centroid.x - t.x)**2 + (centroid.y - t.y)**2);
      if (dist < 400) {
        matchesCount++;
        console.log(`Tag: ${tag} | Dist: ${dist.toFixed(1)} | Centroid: (${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)}) | Raw: ${raw.substring(0, 100)}`);
      }
    }
  }
  console.log(`Total shapes near ${t.name}: ${matchesCount}`);
});
