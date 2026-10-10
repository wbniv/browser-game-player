import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium,firefox}=await import(process.env.BGP_PLAYWRIGHT||'@playwright/test');
const [base,out]=process.argv.slice(2);mkdirSync(out,{recursive:true});
const kind=process.env.BGP_BROWSER||'chromium';
const browser=kind==='firefox'?await firefox.launch({headless:false}):await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results=[];
try {
 for(const adapter of ['worldfoundry','snes']) {
  const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();const errors=[];const requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.goto(`${base}/examples/${adapter}/index.html`);
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
   await frame.getByRole('button',{name:'Game menu',exact:true}).click();await frame.getByRole('button',{name:'Verify fidelity',exact:true}).click();
   await child.waitForFunction(()=>document.querySelector('#checkresult').classList.contains('pass')||document.querySelector('#checkresult').classList.contains('fail'),null,{timeout:300000});
   assert(await frame.locator('#checkresult').evaluate(e=>e.classList.contains('pass')));fidelity=await frame.locator('#checkresult').textContent();
  }
  await page.screenshot({path:out+'/'+adapter+'-desktop.png'});await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/'+adapter+'-phone.png'});
  assert.deepEqual(errors,[]);results.push({adapter,start:true,manualLoading:true,fullscreen:true,input:true,menuPauseResume:true,fidelity,errors});await context.close();console.log(adapter,'pass');
 }
 writeFileSync(out+'/results.json',JSON.stringify({browser:await browser.version(),engine:kind,results},null,2)+'\n');
}finally{await browser.close();}
