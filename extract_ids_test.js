const fs = require('fs');
const data = fs.readFileSync('public/LUWANA 2.svg', 'utf8');

const regex = /id="([^"]+)"/g;
let match;
while ((match = regex.exec(data))) {
  let raw = match[1];
  const decoded = raw.replace(/_x([0-9a-fA-F]{2,})_/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
  const m2 = decoded.match(/\d+/);
  if (m2) {
    const num = parseInt(m2[0]);
    if (num > 0 && num <= 122) {
      console.log(decoded, '->', num);
    }
  }
}
