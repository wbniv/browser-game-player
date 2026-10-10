// Optional integration check: BGP_PLAYWRIGHT and BGP_CHROME select local tooling.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.BGP_PLAYWRIGHT || '@playwright/test');
const module = readFileSync(new URL('../src/embed.mjs', import.meta.url));
const server = createServer((req,res) => {
 res.setHeader('Content-Type', req.url === '/embed.mjs' ? 'text/javascript' : 'text/html');
 if(req.url === '/embed.mjs') return res.end(module);
 if(req.url.startsWith('/frame')) return res.end(`<script>const id=new URLSearchParams(location.search).get('instance');window.commands=[];addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin)commands.push(e.data)});setTimeout(()=>parent.postMessage({type:'browser-game-player',protocol:1,instanceId:id,event:'idle'},location.origin),100);</script>`);
 res.end(`<div id="one"></div><div id="two"></div><script type="module">import{mountPlayer}from'/embed.mjs';window.first=mountPlayer(document.querySelector('#one'),{src:'/frame',title:'One'});window.second=mountPlayer(document.querySelector('#two'),{src:'/frame',title:'Two'});first.start();window.ready=true;</script>`);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:process.env.BGP_CHROME,headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>window.ready && first.frame.contentWindow.commands?.length===1);
 assert.equal(await page.evaluate(()=>second.frame.contentWindow.commands.length),0);
 const send=async patch=>page.evaluate(p=>{const d={type:'browser-game-player',protocol:1,instanceId:first.instanceId,event:'running',...p};dispatchEvent(new MessageEvent('message',{origin:location.origin,source:first.frame.contentWindow,data:d}));},patch);
 await send({instanceId:'stale'});assert.equal(await page.evaluate(()=>first.state),'idle');
 await send({protocol:99});assert.equal(await page.evaluate(()=>first.state),'idle');
 await page.evaluate(()=>dispatchEvent(new MessageEvent('message',{origin:location.origin,source:second.frame.contentWindow,data:{type:'browser-game-player',protocol:1,instanceId:first.instanceId,event:'running'}})));assert.equal(await page.evaluate(()=>first.state),'idle');
 await page.evaluate(()=>dispatchEvent(new MessageEvent('message',{origin:'https://wrong.invalid',source:first.frame.contentWindow,data:{type:'browser-game-player',protocol:1,instanceId:first.instanceId,event:'running'}})));assert.equal(await page.evaluate(()=>first.state),'idle');
 await send({});assert.equal(await page.evaluate(()=>first.state),'running');
 await send({event:'height',height:99999});assert.equal(await page.evaluate(()=>first.frame.style.height),'');
 await send({event:'height',height:640});assert.equal(await page.evaluate(()=>first.frame.style.height),'640px');
 assert.equal(await page.evaluate(()=>first.frame.scrolling),'no');
 assert.equal(await page.evaluate(async()=>{const {mountPlayer}=await import('/embed.mjs');const h=document.createElement('div');document.body.append(h);const fixed=mountPlayer(h,{src:'/frame',autoHeight:false});const value=fixed.frame.scrolling;fixed.destroy();h.remove();return value;}),'');
 const old=await page.evaluate(()=>first.instanceId);await page.evaluate(()=>first.setSource('/frame?game=other'));
 assert.notEqual(await page.evaluate(()=>first.instanceId),old);await send({instanceId:old});assert.equal(await page.evaluate(()=>first.state),'idle');
 await page.evaluate(()=>{first.destroy();first.destroy();second.destroy();});assert.equal(await page.locator('iframe').count(),0);
 assert(await page.evaluate(()=>{try{first.start();return false;}catch{return true;}}));assert(await page.evaluate(async()=>{const {mountPlayer}=await import('/embed.mjs');const host=document.querySelector('#one');const loading=mountPlayer(host,{src:'/frame',title:'Pending'});loading.start();loading.destroy();return host.children.length===0;}));assert.equal(errors.length,0,errors.join('\n'));
 console.log('Two isolated frames, queued start, stale-message rejection, bounded sizing, source rotation and idempotent disposal passed.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
