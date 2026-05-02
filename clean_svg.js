const fs = require('fs');
const content = fs.readFileSync('public/LUWANA_GENERAL.svg', 'utf8');
const cleaned = content.replace(/<image[\s\S]*?(?:\/>|<\/image>)/g, '');
fs.writeFileSync('public/LUWANA_CLEAN.svg', cleaned);
console.log('Done, new size:', fs.statSync('public/LUWANA_CLEAN.svg').size);
