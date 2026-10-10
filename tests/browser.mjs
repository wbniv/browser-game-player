const { chromium, firefox } = await import(process.env.BGP_PLAYWRIGHT || '@playwright/test');
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const [base,out,identityPath = './bundle-identities.json'] = process.argv.slice(2);mkdirSync(out,{recursive:true});
const bundles=JSON.parse(readFileSync(identityPath));
const engine=process.env.BGP_BROWSER||'chromium';
const browser=engine==='firefox'?await firefox.launch({headless:false}):await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results=[];
try{
 for(const kind of (process.env.BGP_KINDS||'fyw,gallery,snes').split(',')){
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});const page=await ctx.newPage();const errors=[],consoleErrors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')consoleErrors.push(e.text());});page.on('request',r=>requests.push(r.url()));
  const query=kind==='gallery'?'?level=snowgoons-standalone':kind==='snes'?'?game=asmisland':'';
  console.log('Starting',engine,kind);
  await page.goto(base+'/bundles/'+bundles[kind]+'/frame.html'+query,{waitUntil:'networkidle'});
  if(kind!=='gallery'){
   assert(!requests.some(u=>/wf_game\.(wasm|js|data)|cores\/bsnes_jg\.(js|wasm)|roms\/.*\.sfc/.test(u)),'No runtime before Play');
   await page.screenshot({path:out+'/'+kind+'-title.png'});
   await page.getByRole('button',{name:'Play',exact:true}).click();
  }
  await page.waitForFunction(()=>document.querySelector('#overlay').hidden||document.querySelector('#play').textContent==='Retry',null,{timeout:60000});
  assert(await page.locator('#overlay').evaluate(e=>e.hidden),await page.locator('#status').textContent());
  console.log('Ready',engine,kind);
  if(kind==='fyw'){
   await page.waitForFunction(()=>!!document.fullscreenElement);
   await page.getByRole('button',{name:'Exit fullscreen',exact:true}).click();
   await page.locator('#canvas').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('ArrowUp');await page.waitForTimeout(250);await page.keyboard.down('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('ArrowUp');
   await page.screenshot({path:out+'/fyw-reader.png'});
  }
  await page.getByRole('button',{name:'Game menu',exact:true}).click();
  await page.evaluate(()=>window.bgpEvents=[]);
  await page.evaluate(()=>window.addEventListener('bgp-state',e=>window.bgpEvents.push(e.detail.event)));
  await page.waitForTimeout(300);
  if(kind==='snes') assert.equal(await page.evaluate(()=>window.__bjgPlayer.state.running),false);
  await page.getByRole('button',{name:'Resume game'}).click();
  if(kind==='snes'){
   assert.equal(await page.evaluate(()=>window.__bjgPlayer.state.running),true);
   await page.locator('#screen').focus();await page.keyboard.down('KeyX');await page.waitForTimeout(150);assert(await page.evaluate(()=>window.__bjgPlayer.state.pad & 128));await page.keyboard.up('KeyX');assert.equal(await page.evaluate(()=>window.__bjgPlayer.state.pad),0);
   await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Verify fidelity',exact:true}).click();
   console.log('Verifying',engine,kind);
   await page.waitForFunction(()=>document.querySelector('#checkresult').classList.contains('pass')||document.querySelector('#checkresult').classList.contains('fail'),null,{timeout:300000,polling:100}).catch(async error=>{console.log(await page.evaluate(()=>({status:document.querySelector('#checkresult').textContent,player:window.__bjgPlayer.state,focus:document.activeElement.id,hidden:document.hidden})));throw error;});
   assert(await page.locator('#checkresult').evaluate(e=>e.classList.contains('pass')),await page.locator('#checkresult').textContent());
   await page.screenshot({path:out+'/snes-fidelity.png'});await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Resume game'}).click();
  }
  await page.screenshot({path:out+'/'+kind+'-running.png'});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/'+kind+'-phone.png'});
  assert.equal(errors.length,0,errors.join('\n'));
  results.push({kind,bundle:bundles[kind],errors,consoleErrors,ready:true,menuPauseResume:true,fidelity:kind==='snes'?await page.locator('#checkresult').textContent():null});await ctx.close();
 }
 writeFileSync(out+'/results.json',JSON.stringify({browser:await browser.version(),engine,results},null,2)+'\n');console.log(JSON.stringify(results.map(({kind,ready,menuPauseResume,fidelity,errors})=>({kind,ready,menuPauseResume,fidelity,errors}))));
}finally{await browser.close();}
