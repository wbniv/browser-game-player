const {chromium}=await import(process.env.BGP_PLAYWRIGHT || '@playwright/test');
import assert from 'node:assert/strict';import{readFileSync,mkdirSync,writeFileSync}from'node:fs';
const [base,out,identityPath]=process.argv.slice(2);const ids=JSON.parse(readFileSync(identityPath));mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});let abort=true;const errors=[];
 await page.route('**/wf_game.js',r=>abort?r.abort():r.continue());
 await page.goto(base+'/bundles/'+ids.fyw+'/frame.html');await page.getByRole('button',{name:'Play',exact:true}).click();await page.getByRole('button',{name:'Retry',exact:true}).waitFor();
 abort=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#overlay').hidden||document.querySelector('#play').textContent==='Retry',null,{timeout:60000});console.log(await page.evaluate(()=>({status:document.querySelector('#status').textContent,button:document.querySelector('#play').textContent,ready:document.querySelector('#overlay').hidden})));assert(await page.locator('#overlay').evaluate(e=>e.hidden));
 if(await page.evaluate(()=>!!document.fullscreenElement)) await page.getByRole('button',{name:'Exit fullscreen',exact:true}).click();
 await page.evaluate(()=>{window.events=[];addEventListener('bgp-state',e=>events.push(e.detail.event));document.querySelector('canvas').blur();});assert(await page.evaluate(()=>events.includes('paused')));
 await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Resume game'}).click();assert(await page.evaluate(()=>events.includes('running')));
 const original=page.url();page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Restart…'}).click();assert.equal(page.url(),original);assert(await page.locator('#overlay').evaluate(e=>e.hidden));
 await page.getByRole('button',{name:'Resume game'}).click();await page.screenshot({path:out+'/fyw-phone.png'});
 await page.goto(base+'/bundles/'+ids.snes+'/frame.html?game=asmisland');await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#overlay').hidden);
 const button=page.getByRole('button',{name:'A',exact:true});const box=await button.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();assert(await page.evaluate(()=>__bjgPlayer.state.pad & 128));await page.mouse.up();assert.equal(await page.evaluate(()=>__bjgPlayer.state.pad),0);
 await page.locator('#screen').focus();await page.keyboard.down('KeyX');await page.evaluate(()=>document.querySelector('#screen').blur());assert.equal(await page.evaluate(()=>__bjgPlayer.state.pad),0);assert.equal(await page.evaluate(()=>__bjgPlayer.state.running),false);await page.keyboard.up('KeyX');
 await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Resume game'}).click();await page.screenshot({path:out+'/snes-phone.png'});
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);assert(await page.locator('canvas').evaluate(c=>c.clientHeight<=innerHeight && getComputedStyle(c).objectFit==='contain'));await page.getByRole('button',{name:'Exit fullscreen',exact:true}).click();
 writeFileSync(out+'/results.json',JSON.stringify({retry:true,focusPauseResume:true,cancelledRestart:true,snesPointerRelease:true,snesBlurRelease:true,snesFullscreen:true}));console.log('Retry, focus pause/resume, cancelled restart, SNES pointer/blur release and fullscreen passed.');
}finally{await browser.close();}
