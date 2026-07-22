const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/loom/loom_stage_1.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

const polygonRegex = /<(polygon|path|rect)[^>]*>/gi;
let match;
const elements = [];

function getCentroid(tag, attrStr) {
  if (tag === 'polygon') {
    const pointsMatch = attrStr.match(/points=["']([^"']+)["']/i);
    if (!pointsMatch) return null;
    const coords = pointsMatch[1].trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
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
  
  if (tag === 'path') {
    const dMatch = attrStr.match(/d=["']([^"']+)["']/i);
    if (!dMatch) return null;
    const d = dMatch[1];
    
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
            currX = nums[i];
            currY = nums[i+1];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'm' || cmd === 'l') {
        for (let i = 0; i < nums.length; i += 2) {
          if (nums[i] !== undefined && nums[i+1] !== undefined) {
            currX += nums[i];
            currY += nums[i+1];
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
            currX = nums[i+4];
            currY = nums[i+5];
            absCoords.push({ x: currX, y: currY });
          }
        }
      } else if (cmd === 'c') {
        for (let i = 0; i < nums.length; i += 6) {
          if (nums[i+4] !== undefined && nums[i+5] !== undefined) {
            currX += nums[i+4];
            currY += nums[i+5];
            absCoords.push({ x: currX, y: currY });
          }
        }
      }
    }
    
    if (absCoords.length === 0) return null;
    let sumX = 0, sumY = 0;
    absCoords.forEach(pt => { sumX += pt.x; sumY += pt.y; });
    return { x: sumX / absCoords.length, y: sumY / absCoords.length };
  }
  
  if (tag === 'rect') {
    const x = parseFloat((attrStr.match(/x=["']([^"']+)["']/i) || [])[1] || 0);
    const y = parseFloat((attrStr.match(/y=["']([^"']+)["']/i) || [])[1] || 0);
    const w = parseFloat((attrStr.match(/width=["']([^"']+)["']/i) || [])[1] || 0);
    const h = parseFloat((attrStr.match(/height=["']([^"']+)["']/i) || [])[1] || 0);
    return { x: x + w / 2, y: y + h / 2 };
  }
  
  return null;
}

while ((match = polygonRegex.exec(svgContent)) !== null) {
  const tag = match[1].toLowerCase();
  const attrStr = match[0];
  const centroid = getCentroid(tag, attrStr);
  if (centroid) {
    elements.push({ tag, centroid, raw: match[0] });
  }
}

console.log(`Parsed centroids for ${elements.length} SVG shapes.`);
