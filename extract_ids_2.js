const fs = require('fs');
const data = fs.readFileSync('public/LUWANA 2.svg', 'utf8');

const regex = /id="([^"]+)"/g;
let match;
const ids = new Set();
while ((match = regex.exec(data))) {
  let raw = match[1];
  const decoded = raw.replace(/_x([0-9a-fA-F]{2,})_/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
  const num = decoded.replace(/[^\d]/g, '');
  if (num) {
    ids.add(num);
  }
}

console.log(Array.from(ids).sort((a,b) => parseInt(a) - parseInt(b)));
