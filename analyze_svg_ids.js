const fs = require('fs');
const path = require('path');

const files = ['public/LUWANA 1.svg', 'public/LUWANA 2.svg', 'public/LUWANA 3.svg'];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`${file} NOT FOUND`);
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n--- Analyzing ${file} ---`);
  
  // Extract all tags with an ID
  const idRegex = /<([a-zA-Z0-9]+)[^>]*id="([^"]+)"[^>]*>/g;
  let match;
  
  const tagCounts = {};
  const idsFound = [];
  
  while ((match = idRegex.exec(content)) !== null) {
    const tagName = match[1];
    const id = match[2];
    
    if (!tagCounts[tagName]) tagCounts[tagName] = 0;
    tagCounts[tagName]++;
    
    idsFound.push({ tag: tagName, id: id });
  }
  
  console.log(`Tags with IDs:`, tagCounts);
  
  // Look at the first 20 IDs on paths, polygons, polylines
  const shapeIds = idsFound.filter(i => ['path', 'polygon', 'polyline', 'rect'].includes(i.tag));
  console.log(`First 20 shape IDs:`);
  console.log(shapeIds.slice(0, 20).map(i => `${i.tag}: ${i.id}`).join(', '));
  
  // Look at group IDs (<g>)
  const groupIds = idsFound.filter(i => i.tag === 'g');
  console.log(`First 20 group IDs:`);
  console.log(groupIds.slice(0, 20).map(i => `${i.tag}: ${i.id}`).join(', '));
  
  console.log(`Total shapes with IDs: ${shapeIds.length}`);
  console.log(`Total groups with IDs: ${groupIds.length}`);
});
