const fs = require('fs');
const data = fs.readFileSync('public/LUWANA 2.svg', 'utf8');

const regex = /id="([^"]+)"/g;
let match;
while ((match = regex.exec(data))) {
  let raw = match[1];
  const decoded = raw.replace(/_x([0-9a-fA-F]{2,})_/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
  if (decoded.includes('81')) {
    console.log(raw, '->', decoded);
  }
}
