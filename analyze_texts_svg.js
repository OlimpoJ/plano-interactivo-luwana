const fs = require('fs');

try {
    const svgContent = fs.readFileSync('./public/LUWANA_GENERAL.svg', 'utf8');

    // 1. Extract all text content from <text> or <tspan> tags
    const textRegex = />([^<]+)<\/(text|tspan)>/gi;
    let match;
    const texts = new Set();
    while ((match = textRegex.exec(svgContent)) !== null) {
        const text = match[1].trim();
        if (text) texts.add(text);
    }
    console.log('\n--- TEXT ELEMENTS ---');
    if (texts.size > 0) {
        console.log(Array.from(texts).join(', '));
    } else {
        console.log('No <text> or <tspan> elements with readable text were found.');
    }

    // 2. Extract all IDs from group tags <g id="...">
    const groupRegex = /<g[^>]+id="([^"]+)"/gi;
    const groupIds = new Set();
    while ((match = groupRegex.exec(svgContent)) !== null) {
        groupIds.add(match[1]);
    }
    console.log('\n--- GROUP IDs (Sublayers) ---');
    if (groupIds.size > 0) {
        // Filter out auto-generated Adobe Illustrator IDs if needed, but let's show all
        const importantGroups = Array.from(groupIds).filter(id => !id.startsWith('SVGID'));
        console.log(importantGroups.slice(0, 100).join(', '));
    } else {
        console.log('No <g> elements with an id were found.');
    }

} catch (e) {
    console.error('Error:', e.message);
}
