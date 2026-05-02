const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

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
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Draw borders on all interactive polygons
    await page.evaluate(() => {
        const svg = document.querySelector('svg');
        if (!svg) return;
        
        // Find everything with pointerEvents = 'all'
        const all = Array.from(svg.querySelectorAll('*')).filter(el => {
            return getComputedStyle(el).pointerEvents === 'all';
        });
        
        all.forEach(el => {
            el.style.fill = 'rgba(255, 0, 0, 0.4)';
            el.style.stroke = 'red';
            el.style.strokeWidth = '5px';
            el.style.opacity = '1';
        });
    });

    console.log("Taking screenshot of clickable areas...");
    await page.screenshot({ path: 'clickable-areas.png', fullPage: true });

    await browser.close();
    console.log("Done.");
})();
