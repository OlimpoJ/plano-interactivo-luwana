const puppeteer = require('puppeteer');

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

    // Evaluate position of ZONAS
    const results = await page.evaluate(() => {
        const ids = ['ZONA_1', 'ZONA_2', 'ZONA_3', '_ZONA_3'];
        return ids.map(id => {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                return { id, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
            }
            return { id, rect: null };
        });
    });

    console.log(JSON.stringify(results, null, 2));

    await browser.close();
})();
