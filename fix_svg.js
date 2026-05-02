const fs = require('fs');

try {
    let content = fs.readFileSync('public/LUWANA GENERAL.svg', 'utf8');

    let count = 0;
    const parsed = content.replace(/<(g|path|polygon)([^>]*)id="([^"]*ZONA[^"]*)"([^>]*)>(.*?)<\/\1>/gs, (match, tag, attr1, id, attr2, inner) => {
        count++;
        // Replace fill="none" with fill="rgba(0,0,0,0.01)" in the entire tag and inner content
        return match.replace(/fill="none"/g, 'fill="rgba(0,0,0,0.01)"');
    });

    console.log('Modified', count, 'ZONA blocks');
    if (count > 0) {
        fs.writeFileSync('public/LUWANA GENERAL.svg', parsed);
        console.log('Saved SVG');
    } else {
        console.log('No ZONA blocks found or matched by regex.');
    }
} catch (err) {
    console.error(err);
}
