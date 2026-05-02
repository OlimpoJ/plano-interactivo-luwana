const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen to console logs from the browser
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  
  // Wait for the Enter button and click it to pass the hero screen
  await page.waitForSelector('button');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.textContent && b.textContent.toUpperCase().includes('INGRESAR'));
    if(enterBtn) enterBtn.click();
  });
  
  await page.waitForFunction(() => !!document.querySelector('#BASE') || !!document.querySelector('[id*="ZONA_"]'), { timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  const result = await page.evaluate(() => {
     const svg = document.querySelector('svg');
     const z1 = document.querySelector('[id*="ZONA_1"]');
     if (z1) {
         z1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
     }
     
     const svgs = Array.from(document.querySelectorAll('svg'));
     const currentSvg = svgs.find(s => s.querySelector('#BASE') || s.querySelector('#LUWANA') || s.querySelector('[id*="ZONA"]'));
     if (!currentSvg) return { error: "No SVG found" };
     
     const els = Array.from(currentSvg.querySelectorAll('[id], [data-lote]'));
     const interactiveCount = els.filter(el => {
         const style = window.getComputedStyle(el);
         return style.pointerEvents === 'all';
     }).map(el => el.id || el.getAttribute('data-lote'));
     
     return {
         svgPointerEvents: window.getComputedStyle(svg).pointerEvents,
         allElementsWithIdCount: els.length,
         clickableIds: interactiveCount
     };
  });
  
  console.dir(result, { depth: null });
  await browser.close();
})();
