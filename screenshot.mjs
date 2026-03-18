import fs from 'fs';
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const dir = './temporary screenshots';

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let n = 1;
while (fs.existsSync(`${dir}/screenshot-${n}${label}.png`)) n++;
const outPath = `${dir}/screenshot-${n}${label}.png`;

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
// Force all fade-up elements visible for screenshot
await page.evaluate(() => {
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('in'));
  document.querySelectorAll('.counter').forEach(el => {
    el.textContent = el.dataset.target;
  });
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`Saved: ${outPath}`);
