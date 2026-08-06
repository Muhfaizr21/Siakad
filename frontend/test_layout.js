import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to login page...');
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForTimeout(1000);
  
  console.log('Filling form...');
  await page.fill('#identifier', 'psikolog1@bku.ac.id');
  await page.fill('#password', '12345678');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for redirection to dashboard...');
  await page.waitForURL('**/psychologist');
  await page.waitForTimeout(3000);
  
  console.log('Page loaded. Capturing screenshot...');
  const screenshotPath = 'C:\\Users\\tegar\\.gemini\\antigravity-ide\\brain\\16716e49-b050-4af8-aedc-4f48e7c07fa7\\dashboard_fixed.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to:', screenshotPath);
  
  const cardHeight = await page.evaluate(() => {
    // Find the queue card item
    const el = document.querySelector('div.group.cursor-pointer');
    if (!el) return 'Not Found';
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const h5 = el.querySelector('h5');
    const h5Style = h5 ? window.getComputedStyle(h5) : null;
    return {
      cardHeight: rect.height,
      h5MarginTop: h5Style ? h5Style.marginTop : 'N/A',
      h5MarginBottom: h5Style ? h5Style.marginBottom : 'N/A'
    };
  });
  
  console.log('Layout evaluation:', cardHeight);
  await browser.close();
}

run().catch(console.error);
