import { createRequire } from 'node:module';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

// PLAYWRIGHT_MODULES can point to a shared runtime; otherwise install playwright locally.
const require = createRequire(process.env.PLAYWRIGHT_MODULES ? path.join(process.env.PLAYWRIGHT_MODULES,'package.json') : import.meta.url);
const { chromium } = require('playwright');
const baseURL=process.env.MAGAZINE_URL || 'http://127.0.0.1:4322';
const output=path.resolve('output/pdf');
const previews=path.resolve('tmp/pdfs');
await mkdir(output,{recursive:true});
await mkdir(previews,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})});
try {
  const page=await browser.newPage({viewport:{width:1080,height:1000},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${baseURL}/imprimir/`,{waitUntil:'networkidle'});
  await page.waitForSelector('body[data-print-ready="true"]');
  const pages=page.locator('.sheet');
  const count=await pages.count();
  if(count!==10) throw new Error(`Expected 10 pages, found ${count}`);
  const spreads=page.locator('.print-spread');
  const arrangement=await spreads.evaluateAll(items=>items.map(item=>item.getAttribute('data-pages')));
  if(JSON.stringify(arrangement)!==JSON.stringify(['1','2,3','4,5','6,7','8,9','10'])) throw new Error(`Wrong PDF spreads: ${arrangement}`);
  const overflow=await pages.evaluateAll(items=>items.map((item,i)=>({page:i+1,overflow:Number(item.getAttribute('data-content-overflow')),fit:item.getAttribute('data-content-fit')})));
  if(overflow.some(item=>item.overflow>1)) throw new Error(`Content overflow: ${JSON.stringify(overflow)}`);
  for(let i=0;i<count;i++) await pages.nth(i).screenshot({path:path.join(previews,`page-${String(i+1).padStart(2,'0')}.png`),animations:'disabled'});
  for(let i=0;i<arrangement.length;i++) await spreads.nth(i).screenshot({path:path.join(previews,`spread-${i+1}.png`),animations:'disabled'});
  await page.emulateMedia({media:'print',reducedMotion:'reduce'});
  // Export each leaf in the same coordinate system, then combine PDF pages.
  // This preserves vector text and lets all ten leaves share one paper texture.
  // The visible /imprimir/ preview and manual browser printing still use spreads.
  await page.addStyleTag({content:`
    @page leaf { size:142.875mm 201.083333mm; margin:0 }
    html,body.print-edition{width:540px!important}
    .print-pages{width:540px!important}
    .print-spread{display:contents!important;page:auto!important}
    .print-pages .sheet{page:leaf!important;break-after:page!important}
    .print-pages .sheet:last-child{break-after:page!important}
    .print-spread:last-child .sheet:last-child{break-after:auto!important}
  `});
  const rawPDF=path.join(previews,'raw-export.pdf');
  await page.pdf({path:rawPDF,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
  const optimized=await promisify(execFile)(process.env.PDF_PYTHON || 'python',[
    path.resolve('scripts/optimize-pdf.py'),rawPDF,path.join(output,'revista-don-bigoton.pdf'),'--book-spreads',
  ]);
  process.stdout.write(optimized.stdout);
  await copyFile(path.join(output,'revista-don-bigoton.pdf'),path.resolve('public/revista-don-bigoton.pdf'));
  await writeFile(path.join(previews,'layout-report.json'),JSON.stringify({count,spreads:arrangement,overflow,errors},null,2));
  if(errors.length) throw new Error(errors.join('\n'));
  console.log(`Exported ${count} magazine pages in ${arrangement.length} PDF spreads to output/pdf/revista-don-bigoton.pdf and public/revista-don-bigoton.pdf`);
} finally { await browser.close(); }
