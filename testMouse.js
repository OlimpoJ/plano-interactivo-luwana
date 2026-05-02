const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

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

    // Get ZONA_1 location and click using MOUSE
    const result = await page.evaluate(() => {
        const poly = document.querySelector('#ZONA_1');
        if (!poly) return "Poly not found";
        
        const rect = poly.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        const elem = document.elementFromPoint(x, y);
        let current = elem;
        const hierarchy = [];
        while(current) {
            hierarchy.push(`${current.tagName} id="${current.id}" class="${current.className.baseVal || current.className}"`);
            current = current.parentElement;
            if (current === document.body) break;
        }
        
        return {
            x, y,
            width: rect.width,
            height: rect.height,
            targetId: elem ? elem.id : 'null',
            targetTag: elem ? elem.tagName : 'null',
            hierarchy
        };
    });
    
    console.log("Element at center of ZONA_1:", JSON.stringify(result, null, 2));
    
    if (result.x && result.y) {
        console.log(`Clicking mouse exactly at ${result.x}, ${result.y}`);
        await page.mouse.click(result.x, result.y);
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    await browser.close();
    console.log("Done.");
})();
