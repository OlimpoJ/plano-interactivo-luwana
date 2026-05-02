const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console messages
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    console.log("Navigating to localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    console.log("Entering...");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const enterBtn = btns.find(b => b.textContent && b.textContent.includes('Ingresar'));
        if (enterBtn) enterBtn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.mouse.click(10, 10);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Evaluating DOM elements...");
    await page.evaluate(() => {
        const poly = document.querySelector('#ZONA_1');
        if (!poly) {
            console.log("Error: #ZONA_1 not found!");
            return;
        }
        
        console.log("ZONA_1 stats:");
        console.log("- pointer-events:", getComputedStyle(poly).pointerEvents);
        console.log("- display:", getComputedStyle(poly).display);
        console.log("- visibility:", getComputedStyle(poly).visibility);
        console.log("- opacity:", getComputedStyle(poly).opacity);
        console.log("- fill:", getComputedStyle(poly).fill);
        
        const img = document.querySelector('#LUWANA');
        if (img) {
            console.log("LUWANA Image stats:");
            console.log("- pointer-events:", getComputedStyle(img).pointerEvents);
            console.log("- z-index:", getComputedStyle(img).zIndex);
        }

        // Test elementFromPoint in an array of points along the path
        const rect = poly.getBoundingClientRect();
        console.log("ZONA_1 rect:", rect.left, rect.top, rect.width, rect.height);
        
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const elem = document.elementFromPoint(x, y);
        console.log("Element at center point:", elem ? elem.id + " (" + elem.tagName + ")" : "null");
        if (elem) {
             console.log("Element pointer-events:", getComputedStyle(elem).pointerEvents);
        }
    });

    await browser.close();
})();
