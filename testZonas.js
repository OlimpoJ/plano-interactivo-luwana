const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("Navigating...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    console.log("Entering...");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const enterBtn = btns.find(b => b.textContent && b.textContent.includes('Ingresar'));
        if (enterBtn) enterBtn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.mouse.click(10, 10);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force draw borders on all ZONAs
    await page.evaluate(() => {
        const ids = ['ZONA_1', 'ZONA_2', 'ZONA_3', '_ZONA_3'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.fill = 'rgba(255, 0, 0, 0.4)';
                el.style.stroke = 'red';
                el.style.strokeWidth = '5px';
                el.style.opacity = '1';
                el.style.pointerEvents = 'none'; // so they don't block
            }
        });
    });

    console.log("Taking screenshot of ZONAS...");
    await page.screenshot({ path: 'zonas_marked.png', fullPage: true });

    await browser.close();
    console.log("Done.");
})();
