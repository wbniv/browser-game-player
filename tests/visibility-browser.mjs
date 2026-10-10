const{chromium}=await import(process.env.BGP_PLAYWRIGHT || '@playwright/test');import assert from'node:assert/strict';import{readFileSync,mkdirSync,writeFileSync}from'node:fs';
const[base,out,identities]=process.argv.slice(2);mkdirSync(out,{recursive:true});const ids=JSON.parse(readFileSync(identities));const browser=await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext();const page=await context.newPage();await page.goto(base+'/bundles/'+ids.snes+'/frame.html?game=asmisland');await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#overlay').hidden);
 await page.locator('#screen').focus();await page.keyboard.down('KeyX');assert(await page.evaluate(()=>__bjgPlayer.state.pad & 128));
 // Playwright keeps automated tabs visible. Exercise the visibility policy
 // explicitly against the real native runtime rather than claiming OS occlusion.
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await page.evaluate(()=>__bjgPlayer.state.running),false);assert.equal(await page.evaluate(()=>__bjgPlayer.state.pad),0);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});await page.keyboard.up('KeyX');await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Resume game'}).click();assert.equal(await page.evaluate(()=>__bjgPlayer.state.running),true);
 writeFileSync(out+'/results.json',JSON.stringify({simulatedVisibility:true,pausedNativeLoop:true,releasedInput:true,focusedResume:true}));console.log('Visibility policy pauses the native loop and releases input; focused resume passes.');
}finally{await browser.close();}
