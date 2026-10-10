const {chromium}=await import(process.env.BGP_PLAYWRIGHT || '@playwright/test');
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const [target,out]=process.argv.slice(2);mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
 const ctx=await browser.newContext({viewport:{width:320,height:844},hasTouch:true});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(target);await page.getByRole('button',{name:'Play',exact:true}).focus();await page.keyboard.press('Space');
 await page.waitForFunction(()=>document.querySelector('#overlay').hidden,null,{timeout:60000});
 await page.waitForFunction(()=>document.fullscreenElement?.id==='stage');
 await page.screenshot({path:out+'/320-fullscreen.png'});
 await page.evaluate(()=>{window.inputEvents=[];for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{if(e.fywSynthetic)inputEvents.push({type,code:e.code});});});
 const pad=await page.locator('#joystick').boundingBox();const select=await page.locator('[data-code=Space]').boundingBox();const cdp=await ctx.newCDPSession(page);
 const move={id:1,x:pad.x+pad.width/2,y:pad.y+12};const action={id:2,x:select.x+select.width/2,y:select.y+select.height/2};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move,action]});
 assert.equal(await page.locator('[data-code=ArrowUp]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-code=Space]').getAttribute('aria-pressed'),'true');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 assert.equal(await page.locator('[data-code=ArrowUp]').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('[data-code=Space]').getAttribute('aria-pressed'),'false');
 const cancelled=await page.evaluate(()=>inputEvents.splice(0));for(const code of ['ArrowUp','Space']){assert(cancelled.some(e=>e.code===code&&e.type==='keydown'));assert(cancelled.some(e=>e.code===code&&e.type==='keyup'));}
 // Verify the engine receives no premature key-up while a physical arrow owns it.
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move]});await page.keyboard.down('ArrowUp');
 await page.evaluate(()=>inputEvents.length=0);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await page.locator('[data-code=ArrowUp]').getAttribute('aria-pressed'),'true');assert(!(await page.evaluate(()=>inputEvents)).some(e=>e.type==='keyup'&&e.code==='ArrowUp'));
 await page.keyboard.up('ArrowUp');assert.equal(await page.locator('[data-code=ArrowUp]').getAttribute('aria-pressed'),'false');
 // Lost capture must also neutralize the joystick and the engine input.
 await page.evaluate(()=>{window.capturedPointer=null;document.querySelector('#joystick').addEventListener('gotpointercapture',e=>window.capturedPointer=e.pointerId,{once:true});});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...move,y:move.y+1}]});await page.waitForFunction(()=>capturedPointer!==null);
 await page.evaluate(()=>document.querySelector('#joystick').releasePointerCapture(capturedPointer));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...move,y:move.y+2}]});
 await page.waitForFunction(()=>document.querySelector('[data-code=ArrowUp]').getAttribute('aria-pressed')==='false');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Toggle reduced motion',exact:true}).click();await page.waitForTimeout(250);
 const motion=await page.evaluate(()=>inputEvents.filter(e=>e.code==='Digit4'));assert.deepEqual(motion.map(e=>e.type),['keydown','keyup']);
 await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.screenshot({path:out+'/320-menu.png'});await page.keyboard.press('Escape');assert.equal(await page.locator('#menu').evaluate(e=>e.hidden),true);assert.equal(errors.length,0,errors.join('\n'));
 writeFileSync(out+'/results.json',JSON.stringify({passed:true,target,browser:await browser.version(),keyboardSpacePlayFullscreen:true,twoFingerJoystickAndSelect:true,touchCancellation:true,noPrematureKeyboardRelease:true,lostPointerCapture:true,reducedMotionDispatch:true,menuEscape:true,errors,limits:'Ubuntu 24.10 Chrome with emulated touch at 320 px; not physical phone acceptance.'},null,2)+'\n');console.log('PASS two-finger input, cancellation, keyboard ownership, lost capture, menu and motion dispatch');
}finally{await browser.close();}
