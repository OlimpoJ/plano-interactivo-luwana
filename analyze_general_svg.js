const fs = require('fs');

const svgContent = fs.readFileSync('./public/LUWANA GENERAL.svg', 'utf8');

const zoneIds = ['ZONA_1', 'ZONA_2', 'ZONA_3'];

for (const id of zoneIds) {
    const regex = new RegExp(`<[^>]*id="${id}"[^>]*>`, 'i');
    const match = svgContent.match(regex);
    if (match) {
        console.log(`Found ${id}:`, match[0]);
    }
    
    // Check if it's a group and extract the first shape inside it
    const groupRegex = new RegExp(`<g[^>]*id="${id}"[^>]*>([\\s\\S]*?)</g>`, 'i');
    const groupMatch = svgContent.match(groupRegex);
    if (groupMatch) {
        const shapeMatch = groupMatch[1].match(/<(polygon|path|rect)[^>]*>/i);
        if (shapeMatch) {
            console.log(`  -> Shape inside ${id}:`, shapeMatch[0]);
        }
    }
}
