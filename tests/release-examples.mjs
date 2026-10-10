import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium,firefox}=await import(process.env.BGP_PLAYWRIGHT||'@playwright/test');
const [base,out]=process.argv.slice(2);mkdirSync(out,{recursive:true});
const kind=process.env.BGP_BROWSER||'chromium';
const browser=kind==='firefox'?await firefox.launch({headless:false}):await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results=[];
try {
 for(const adapter of (process.env.BGP_EXAMPLES||'worldfoundry,snes').split(',')) {
  const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();const errors=[];const requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.goto(`${base}/index.html`);
  assert(!requests.some(url=>/\.(wasm|sfc)$/.test(url)));
  await page.getByRole('link',{name:adapter==='worldfoundry'?'Play Baseline':'Play Doom Fire',exact:true}).click();
  assert(page.url().endsWith(`/examples/${adapter}/index.html`));
  const frame=page.frameLocator('iframe');await frame.getByRole('button',{name:'Play',exact:true}).waitFor();
  assert(!requests.some(url=>/wf_game\.(js|wasm|data)|cores\/bsnes_jg\.(js|wasm)|roms\/.*\.sfc/.test(url)));
  await frame.getByRole('button',{name:'Play',exact:true}).click();
  await frame.locator('#overlay').waitFor({state:'hidden',timeout:60000});
  const child=page.frames().find(f=>f.url().includes('/bundles/'));assert(child);
  await child.waitForFunction(()=>!!document.fullscreenElement);
  await frame.getByRole('button',{name:'Exit fullscreen',exact:true}).click();
  await frame.getByRole('button',{name:'Game menu',exact:true}).click();await frame.getByRole('button',{name:'Resume game'}).click();
  let fidelity=null;
  if(adapter==='worldfoundry') {
   const data=await child.evaluate(()=>({title:document.title,module:!!window.Module,canvas:[document.querySelector('#canvas').width,document.querySelector('#canvas').height]}));assert(data.module);
   await frame.locator('#canvas').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('ArrowUp');
  } else {
   await frame.locator('#screen').focus();await page.keyboard.down('KeyX');assert(await child.evaluate(()=>window.__bjgPlayer.state.pad&128));await page.keyboard.up('KeyX');assert.equal(await child.evaluate(()=>window.__bjgPlayer.state.pad),0);
   if(process.env.BGP_SKIP_FIDELITY!=='1') {
   await frame.getByRole('button',{name:'Game menu',exact:true}).click();await frame.getByRole('button',{name:'Verify fidelity',exact:true}).click();
   await child.waitForFunction(()=>document.querySelector('#checkresult').classList.contains('pass')||document.querySelector('#checkresult').classList.contains('fail'),null,{timeout:600000});
   assert(await frame.locator('#checkresult').evaluate(e=>e.classList.contains('pass')));fidelity=await frame.locator('#checkresult').textContent();
   }
  }
  if(adapter==='snes') {
   // Wait for actual post-title flame pixels, not the verification badge or stale canvas.
   await child.waitForFunction(()=>{const c=document.querySelector('#screen');const pixels=c.getContext('2d').getImageData(0,Math.floor(c.height*.6),c.width,Math.floor(c.height*.35)).data;let hot=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]>110&&pixels[i]>pixels[i+1]*1.2&&pixels[i+2]<80)hot++;return hot>1000;},null,{timeout:240000});
  }
  assert(await frame.locator('.direction').evaluateAll(nodes=>nodes.every(n=>!n.textContent.trim())));
  await page.screenshot({path:out+'/'+adapter+'-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/'+adapter+'-phone.png',fullPage:true});
  const fallback=await frame.locator('#fallback').getAttribute('href');
  assert(new URL(fallback,child.url()).href===`${base}/index.html`);
  await frame.getByRole('link',{name:'All examples',exact:true}).click();
  await page.getByRole('link',{name:'Play Baseline',exact:true}).waitFor();
  assert.equal(page.frames().length,1);
  assert.deepEqual(errors,[]);results.push({adapter,start:true,manualLoading:true,fullscreen:true,input:true,menuPauseResume:true,fidelity,errors});await context.close();console.log(adapter,'pass');
 }
 writeFileSync(out+'/results.json',JSON.stringify({browser:await browser.version(),engine:kind,results},null,2)+'\n');
}finally{await browser.close();}
