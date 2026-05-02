const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console messages
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err));

    console.log("Navigating to localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    console.log("Waiting for Intro button...");
    await page.waitForSelector('button', { timeout: 15000 });
    
    // Click button to enter
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const enterBtn = btns.find(b => b.textContent && b.textContent.includes('Ingresar'));
        if (enterBtn) enterBtn.click();
    });
    
    // Wait for transition video overlay and click to skip
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.mouse.click(10, 10);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Waiting for SVG map to load... searching for ZONA_1");
    // Wait for the specific element inside the SVG
    await page.waitForSelector('#ZONA_1, [id*="ZONA_1"]', { timeout: 15000 });

    console.log("Element found. Attempting to click ZONA_1...");
    // Force clicking it in browser context just in case puppeteer center is off:
    await page.evaluate(() => {
        const poly = document.querySelector('#ZONA_1') || document.querySelector('[id*="ZONA_1"]');
        if (poly) {
            console.log("Found poly:", poly.id, "Pointer events:", getComputedStyle(poly).pointerEvents);
            // Dispatch click explicitly
            poly.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
            console.log("Poly not found!");
        }
    });

    console.log("Waiting 2 seconds to capture logs...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await browser.close();
    console.log("Done.");
})();
