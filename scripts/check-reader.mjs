import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
const require=createRequire(process.env.PLAYWRIGHT_MODULES ? path.join(process.env.PLAYWRIGHT_MODULES,'package.json') : import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})});
const base=process.env.MAGAZINE_URL || 'http://127.0.0.1:4322';
await mkdir('tmp/reader',{recursive:true});

async function waitAt(page,number) {
  await page.waitForFunction(n=>location.hash===`#pagina-${n}`,number);
  if(number!==1) await page.locator('#prev-page:enabled').waitFor();
  if(number!==10) await page.locator('#next-page:enabled').waitFor();
}
async function swipe(page,direction,{slow=false,vertical=false,cancel=false}={}) {
  const box=await page.locator('#book').boundingBox();
  const x=box.x+box.width*(direction==='back' ? .22 : .78);
  const y=box.y+box.height*.42;
  const dx=vertical ? 8 : box.width*.5*(direction==='back' ? 1 : -1);
  const dy=vertical ? 110 : 4;
  const session=await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  const steps=slow ? 12 : 5;
  for(let i=1;i<=steps;i++) {
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/steps,y:y+dy*i/steps}]});
    await page.waitForTimeout(slow ? 55 : 15);
  }
  await session.send('Input.dispatchTouchEvent',{type:cancel ? 'touchCancel' : 'touchEnd',touchPoints:[]});
  await session.detach();
}
try {
  for(const reducedMotion of ['no-preference','reduce']) {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'networkidle'});
    await waitAt(page,1);
    // Traverse both boundaries with real touch taps and the normal flip animation.
    for(let i=2;i<=10;i++) {await page.locator('#next-page').tap();await waitAt(page,i);}
    assert(await page.locator('#next-page').isDisabled());
    for(let i=9;i>=1;i--) {await page.locator('#prev-page').tap();await waitAt(page,i);}
    assert(await page.locator('#prev-page').isDisabled());
    await page.locator('#next-page').tap();await waitAt(page,2);
    for(const slow of [false,true]) {
      await swipe(page,'forward',{slow});await waitAt(page,3);
      await swipe(page,'back',{slow});await waitAt(page,2);
    }
    await swipe(page,'back',{vertical:true});
    assert.equal(new URL(page.url()).hash,'#pagina-2');
    await swipe(page,'forward',{cancel:true});
    assert.equal(new URL(page.url()).hash,'#pagina-2');
    await page.locator('#prev-page').tap();await waitAt(page,1);
    assert.deepEqual(errors,[]);
    console.log(`PASS mobile ${reducedMotion}: buttons 1–10–1; fast/slow swipes both directions; vertical/cancel ignored`);
    await context.close();
  }
  const page=await browser.newPage();
  for(const width of [320,360,390,430,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto(`${base}/#pagina-2`,{waitUntil:'networkidle'});
    await page.waitForSelector('.sheet[data-content-overflow]',{state:'attached'});
    const layout=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      icons:[...document.querySelectorAll('.page-navigation>button')].map(button=>{
        const b=button.getBoundingClientRect();const s=button.querySelector('svg').getBoundingClientRect();
        return {dx:Math.abs(b.x+b.width/2-s.x-s.width/2),dy:Math.abs(b.y+b.height/2-s.y-s.height/2),width:b.width,height:b.height};
      })
    }));
    assert.equal(layout.overflow,false);
    for(const icon of layout.icons) {assert(icon.dx<.5 && icon.dy<.5);assert(icon.width>=44 && icon.height>=44);}
    if(width===390) await page.screenshot({path:'tmp/reader/mobile.png'});
    console.log(`PASS ${width}px: centered arrow icons, 44px buttons, no horizontal overflow`);
  }
  await page.locator('#prev-page').click();
  await waitAt(page,1);
  console.log('PASS desktop animated back to cover');
} finally {await browser.close();}
