const {chromium}=await import(process.env.BGP_PLAYWRIGHT || '@playwright/test');
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.argv[2] || './artifacts/consumers';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});const results=[];
async function loaded(page){
 await page.waitForFunction(()=>{const frame=document.querySelector('[data-browser-game-player] iframe');return frame?.contentDocument?.querySelector('#overlay')?.hidden;},null,{timeout:60000});
 return page.frameLocator('[data-browser-game-player] iframe');
}
try{
 for(const site of ['indri','world','bio']){
  const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const origin={indri:process.env.BGP_INDRI_URL || 'http://127.0.0.1:4390',world:process.env.BGP_WORLD_URL || 'http://127.0.0.1:4391',bio:process.env.BGP_BIO_URL || 'http://127.0.0.1:4392'}[site];const route={indri:'/apps/finding-your-way/play/',world:'/v2/play/?level=snowgoons-standalone',bio:'/snes/asmisland/'}[site];
  await page.goto(`${origin}${route}`,{waitUntil:'networkidle'});
  if(site==='indri'){await page.frameLocator('iframe').getByRole('button',{name:'Play',exact:true}).click();}
  let frame=await loaded(page);
  if(site==='indri') {assert(await frame.locator('body').evaluate(()=>!!document.fullscreenElement));await frame.getByRole('button',{name:'Exit fullscreen',exact:true}).click();}
  if(site==='world'){
   assert((await page.locator('[data-browser-game-player] iframe').getAttribute('src')).includes('level=snowgoons-standalone'));const id=await page.evaluate(()=>document.querySelector('#wf-demo-frame').player.instanceId);
   await page.locator('[data-level="moon_site01-standalone"]').click();await page.waitForFunction(()=>location.search.includes('moon_site01'));
   await page.waitForFunction(old=>document.querySelector('#wf-demo-frame').player.instanceId!==old,id);
   await page.waitForTimeout(800);assert(page.frames().some(f=>f.url().includes('level=moon_site01-standalone')));
   await page.goBack();await page.waitForTimeout(800);assert(page.frames().some(f=>f.url().includes('level=snowgoons-standalone')));frame=await loaded(page);
  }
  if(site==='bio'){
   assert((await page.locator('[data-browser-game-player] iframe').getAttribute('src')).includes('game=asmisland'));await frame.getByRole('button',{name:'Game menu',exact:true}).click();await frame.getByRole('button',{name:'Verify fidelity',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('[data-browser-game-player] iframe')?.contentDocument?.querySelector('#checkresult')?.classList.contains('pass'),null,{timeout:60000});
  }
  await page.screenshot({path:out+'/'+site+'-desktop.png',fullPage:false});assert.equal(errors.length,0,errors.join('\n'));results.push({site,ready:true,navigation:site==='world',fidelity:site==='bio',errors});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/'+site+'-phone.png',fullPage:false});
  const size=await frame.locator('canvas').evaluate(c=>({width:c.clientWidth,height:c.clientHeight,intrinsic:[c.width,c.height],fit:getComputedStyle(c).objectFit}));
  if(site==='bio'){assert.deepEqual(size.intrinsic,[256,224]);assert.equal(size.fit,'contain');}
  await page.close();
 }
 writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log(results);
}finally{await browser.close();}
