import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login');
  
  console.log('Taking login page screenshot...');
  await page.screenshot({ path: 'login_initial.png' });
  
  console.log('Filling fields...');
  await page.fill('#identifier', 'psikolog@bku.ac.id');
  await page.fill('#password', '12345678');
  await page.screenshot({ path: 'login_filled.png' });
  
  console.log('Clicking submit...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting 3 seconds...');
  await page.waitForTimeout(3000);
  
  console.log('Taking final screenshot...');
  await page.screenshot({ path: 'login_final.png' });
  
  console.log('Current URL:', page.url());
  
  const errorText = await page.evaluate(() => {
    const errDiv = document.querySelector('.bg-red-50');
    return errDiv ? errDiv.textContent : 'No error message div found';
  });
  console.log('Error text:', errorText);
  
  await browser.close();
}

run().catch(console.error);
