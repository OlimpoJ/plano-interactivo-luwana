const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set viewport size
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

    console.log("Taking pre-click screenshot...");
    await page.screenshot({ path: 'pre-click.png' });

    // Get ZONA_1 location and click
    const result = await page.evaluate(() => {
        const poly = document.querySelector('#ZONA_1');
        if (!poly) return "Poly not found";
        
        const rect = poly.getBoundingClientRect();
        // Since it's an irregular polygon, clicking exactly the center bounding box might miss the path.
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        return { x, y };
    });
    
    console.log("Calculated click center:", result);
    
    if (result.x && result.y) {
        console.log(`Clicking mouse exactly at ${result.x}, ${result.y}`);
        await page.mouse.click(result.x, result.y);
        
        // Wait for React re-render and animation
        console.log("Waiting for re-render...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log("Taking post-click screenshot...");
        await page.screenshot({ path: 'post-click.png' });
    }
    
    await browser.close();
    console.log("Done.");
})();
