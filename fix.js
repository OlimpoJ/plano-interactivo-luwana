const fs = require('fs');
let c = fs.readFileSync('src/data/lots.ts', 'utf8');

c = c.replace(/\{\s*id:\s*"([^"]+)",/g, (match, idStr) => {
    let zoneId = '"zona-1"';
    const numMatch = idStr.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0], 10);
      if (num >= 1 && num <= 30) zoneId = '"zona-1"';
      else if (num >= 31 && num <= 60) zoneId = '"zona-2"';
      else if (num >= 61 && num <= 90) zoneId = '"zona-3"';
      else if (num >= 91 && num <= 122) zoneId = '"zona-4"';
    }
    return `{\n        zoneId: ${zoneId},\n        id: "${idStr}",`;
});

fs.writeFileSync('src/data/lots.ts', c);
console.log("Updated lots!");
