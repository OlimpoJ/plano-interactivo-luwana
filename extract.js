const fs = require('fs');
const content = fs.readFileSync('public/LUWANA_GENERAL.svg', 'utf8');
const regex = /<g id="_ZONA_3"([\s\S]*?)<\/g>/;
const match = content.match(regex);
if (match) {
    console.log("Matched content length:", match[1].length);
    console.log(match[1].substring(0, 500)); // Print start
    console.log("...");
    console.log(match[1].substring(match[1].length - 500)); // Print end
} else {
    console.log("Could not find _ZONA_3");
}
