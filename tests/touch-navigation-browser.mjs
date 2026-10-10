const{chromium}=await import(process.env.BGP_PLAYWRIGHT || '@playwright/test');import assert from'node:assert/strict';import{readFileSync,mkdirSync,writeFileSync}from'node:fs';
const[base,out,identities]=process.argv.slice(2);mkdirSync(out,{recursive:true});const ids=JSON.parse(readFileSync(identities));const browser=await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});await page.goto(base+'/bundles/'+ids.snes+'/frame.html?game=lzss-gallery');await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#overlay').hidden,null,{timeout:60000});assert.equal(await page.locator('#verify').textContent(),'Verify benchmark');
 const checks=[];
 for(const fullscreen of [false,true]){
  if(fullscreen){await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);}
  const points=await page.locator('#screen').evaluate(c=>{const r=c.getBoundingClientRect(),scale=Math.min(r.width/c.width,r.height/c.height),left=r.left+(r.width-c.width*scale)/2,top=r.top+(r.height-c.height*scale)/2;return{right:{x:left+244*scale,y:top+82*scale},margin:{x:r.left+2,y:top+82*scale},letterboxed:r.width>c.width*scale+4};});assert(points.letterboxed);
  await page.locator('#screen').evaluate((c,p)=>c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,clientX:p.x,clientY:p.y})),points.right);assert(await page.evaluate(()=>__bjgPlayer.state.pad & 256),'Visible ROM Right chevron maps to the Right pad bit');
  await page.locator('#screen').dispatchEvent('pointercancel');assert.equal(await page.evaluate(()=>__bjgPlayer.state.pad),0);
  await page.locator('#screen').evaluate((c,p)=>c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:2,clientX:p.x,clientY:p.y})),points.margin);assert.equal(await page.evaluate(()=>__bjgPlayer.state.pad),0,'Black margin stays inert');checks.push({fullscreen,visibleChevron:true,inertMargin:true});
 }
 writeFileSync(out+'/results.json',JSON.stringify({game:'lzss-gallery',checks}));console.log('ROM chevrons and inert black margins pass inline and fullscreen.');
}finally{await browser.close();}
