const fs = require('fs');
const { JSDOM } = require('jsdom');

const svgText = fs.readFileSync('public/loom/loom_stage_2.svg', 'utf8');
const dom = new JSDOM(svgText, { contentType: 'image/svg+xml' });
const doc = dom.window.document;

const circles = Array.from(doc.querySelectorAll('circle'));
console.log(`Found ${circles.length} circles in loom_stage_2.svg`);

const parsedCircles = circles.map((c) => {
  let parent = c.parentElement;
  let manzana = "";
  let manzanaGroup = null;

  while (parent) {
    const id = (parent.getAttribute("id") || "").toUpperCase();
    if (id.includes("PORTERIA") || id.includes("PORTERÍA")) { manzana = "PORTERIA"; manzanaGroup = parent; break; }
    if (id.includes("PARQUE_1")) { manzana = "PARQUE_1"; manzanaGroup = parent; break; }
    if (id.includes("PARQUE_2")) { manzana = "PARQUE_2"; manzanaGroup = parent; break; }
    if (id.includes("PARQUE")) { manzana = "PARQUE"; manzanaGroup = parent; break; }
    
    const mzMatch = id.match(/(?:MANZANA|MANZONA|LOTES|TEXTOS)_?([A-L])/i);
    if (mzMatch) {
      manzana = mzMatch[1].toUpperCase();
      manzanaGroup = parent;
      break;
    }
    parent = parent.parentElement;
  }
  const cx = parseFloat(c.getAttribute("cx") || "0");
  const cy = parseFloat(c.getAttribute("cy") || "0");
  return { element: c, manzana, manzanaGroup, cx, cy };
});

console.log("Sample parsed circles:");
parsedCircles.slice(0, 15).forEach((sc, i) => {
  const c = sc.element;
  const dataLot = c.getAttribute("data-lot") || c.parentElement.getAttribute("data-lot") || c.parentElement.getAttribute("id") || "";
  let decodedNum = null;
  const idNumMatch = dataLot.match(/(?:[A-L]|g)[-_]?(\d+)/i);
  if (idNumMatch) {
    decodedNum = parseInt(idNumMatch[1], 10);
  }
  console.log(`  Circle ${i+1}: manzana=${sc.manzana}, cx=${sc.cx}, cy=${sc.cy}, dataLot=${dataLot}, decodedNum=${decodedNum}`);
});
