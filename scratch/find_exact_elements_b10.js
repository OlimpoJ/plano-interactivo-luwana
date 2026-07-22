const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/loom/loom_stage_1.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

// Print all elements near (1382, 1800) B-10, (1647, 1809) B-11, (2009, 1790) C-15, (2278, 1794) C-16
const targets = [
  { name: 'B-10', x: 1382.89, y: 1800.14 },
  { name: 'B-11', x: 1647.68, y: 1809.35 },
  { name: 'C-15', x: 2009.98, y: 1790.60 },
  { name: 'C-16', x: 2278.18, y: 1794.56 },
];

targets.forEach(t => {
  console.log(`\n=================== SEARCHING NEAR ${t.name} (${t.x}, ${t.y}) ===================`);
  const tagRegex = /<(path|polygon|rect)[^>]*>/gi;
  let match;
  while ((match = tagRegex.exec(svg)) !== null) {
    const raw = match[0];
    const dMatch = raw.match(/d=["']([^"']+)["']/i) || raw.match(/points=["']([^"']+)["']/i);
    if (dMatch) {
      const coords = dMatch[1].match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || [];
      if (coords.length >= 2) {
        let sumX = 0, sumY = 0, count = 0;
        for (let i = 0; i < coords.length; i += 2) {
          if (coords[i] !== undefined && coords[i+1] !== undefined) {
            sumX += coords[i]; sumY += coords[i+1]; count++;
          }
        }
        const cx = sumX / count;
        const cy = sumY / count;
        const dist = Math.sqrt((cx - t.x)**2 + (cy - t.y)**2);
        if (dist < 300) {
          console.log(`Dist: ${dist.toFixed(1)} | Raw: ${raw.substring(0, 120)}`);
        }
      }
    }
  }
});
