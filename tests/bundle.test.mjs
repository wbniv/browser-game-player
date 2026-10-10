import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { freezeBundle, syncBundle, verifyBundle, renderFrame, sha256 } from '../src/bundle.mjs';
import { validateConfig, resolveLevel } from '../src/config.mjs';
const baseConfig = { schema:1, adapter:'worldfoundry', startMode:'manual', title:'Game', subtitle:'Hello', status:'Ready', canvasLabel:'Game screen', restartPrompt:'Restart?', fallbackLabel:'Details', fallbackUrl:'/details/', fullscreenOnPlay:true, arguments:['-L/game.iff'], help:['Arrows move'], actions:[{code:'Space',label:'Select',caption:'Select'}] };
function fixture(t, adapter='worldfoundry') {
  const dir = mkdtempSync(join(tmpdir(),'bgp-test-')); t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const runtime = join(dir,'runtime'); mkdirSync(runtime);
  const config = {...baseConfig,adapter};
  let files = ['wf_game.js','wf_game.wasm','wf_game.data'];
  if(adapter==='snes') {
    config.game='test';config.games=['test'];config.actions=[{code:'KeyX',label:'A',caption:'A'}];
    files=['cores/bsnes_jg.js','cores/bsnes_jg.wasm','cores/PROVENANCE.json','roms/manifest.json','roms/test.sfc'];
  }
  for(const name of files){const p=join(runtime,name);mkdirSync(join(p,'..'),{recursive:true});writeFileSync(p,name==='roms/manifest.json'?JSON.stringify({roms:[{id:'test'}]}):'test '+name);}
  return {dir,runtime,config,output:join(dir,'bundles')};
}
test('both adapters freeze, verify and stage exact byte receipts', t=>{
  for(const adapter of ['worldfoundry','snes']) {
    const f=fixture(t,adapter);const bundle=freezeBundle({runtimeDirectory:f.runtime,config:f.config,output:f.output});const receipt=verifyBundle(bundle);
    assert.equal(receipt.protocol,1);assert.match(receipt.bundleId,/^bgp1-[0-9a-f]{24}$/);
    const stage=join(f.dir,'site');syncBundle(bundle,stage);syncBundle(bundle,stage,{check:true});
    assert.equal(sha256(readFileSync(join(bundle,adapter==='snes'?'cores/bsnes_jg.wasm':'wf_game.wasm'))),sha256(readFileSync(join(f.runtime,adapter==='snes'?'cores/bsnes_jg.wasm':'wf_game.wasm'))));
  }
});
test('runtime tampering, extra files and symlinks fail closed',t=>{
  for(const problem of ['bytes','extra','symlink']){
    const f=fixture(t);const b=freezeBundle({runtimeDirectory:f.runtime,config:f.config,output:f.output});
    if(problem==='bytes')writeFileSync(join(b,'wf_game.wasm'),'tampered');
    if(problem==='extra')writeFileSync(join(b,'secret.txt'),'not distributable');
    if(problem==='symlink'){rmSync(join(b,'wf_game.wasm'));symlinkSync(join(f.runtime,'wf_game.wasm'),join(b,'wf_game.wasm'));}
    assert.throws(()=>verifyBundle(b));
  }
});
test('failed staging cannot overwrite a valid immutable bundle',t=>{
 const f=fixture(t);const b=freezeBundle({runtimeDirectory:f.runtime,config:f.config,output:f.output});const site=join(f.dir,'site');const dest=syncBundle(b,site);const before=readFileSync(join(dest,'wf_game.wasm'));
 writeFileSync(join(b,'wf_game.wasm'),'bad');assert.throws(()=>syncBundle(b,site));assert.deepEqual(readFileSync(join(dest,'wf_game.wasm')),before);
});
test('config serialization cannot close its inert JSON script',()=>{
 const html=renderFrame({...baseConfig,title:'</script><script>alert(1)</script>'});assert(!html.includes('<script>alert(1)'));assert(html.includes('\\u003c/script>'));
});
test('config rejects executable links, invalid controls and unknown adapters',()=>{
 for(const changed of [{fallbackUrl:'javascript:alert(1)'},{adapter:'arbitrary'},{actions:[{code:'Bad',label:'Bad',caption:'Bad'}]},{adapter:'snes',game:'../secret',games:['../secret']}]) assert.throws(()=>validateConfig({...baseConfig,...changed}));
});
test('gallery selection permits only declared levels',()=>{
 const config={...baseConfig,defaultLevel:'first',levels:{first:{title:'First',arguments:['-L/first.iff']},second:{title:'Second',arguments:['-L/second.iff']}}};validateConfig(config);assert.equal(resolveLevel(config,'?level=second').title,'Second');assert.equal(resolveLevel(config,'?level=__proto__').title,'First');
});
test('cannot silently relabel an existing immutable bundle provenance',t=>{
 const f=fixture(t);const args={runtimeDirectory:f.runtime,config:f.config,output:f.output,provenance:{engine:'one'}};
 freezeBundle(args);assert.throws(()=>freezeBundle({...args,provenance:{engine:'two'}}),/immutable receipt/);
});
test('level entries cannot override validated adapter or shell settings',()=>{
 assert.throws(()=>validateConfig({...baseConfig,defaultLevel:'game',levels:{game:{title:'Game',arguments:[],adapter:'snes'}}}),/level fields/);
});
test('play icons accept only distinct built-in ids',()=>{
 for(const playIcons of [['temple'],['temple','controller','cube'],['cube','temple']]) assert.deepEqual(validateConfig({...baseConfig,playIcons}).playIcons,playIcons);
 for(const playIcons of [[],'temple',['temple','temple'],['play'],['rocket'],['temple','controller','cube','temple'],[{}]]) assert.throws(()=>validateConfig({...baseConfig,playIcons}),/play icons/);
});
test('default frame keeps the plain Play button; configured frames add hidden icons',()=>{
 const plain=renderFrame(baseConfig);assert(plain.includes('<button id="play">Play</button>'));assert(!plain.includes('play-icons'));
 // Byte-identical to the 0.1.4 renderer's output for the same config.
 assert.equal(sha256(plain),'5a625732882f634f39b6df6863d51c85a95a7146a830b85f0c1311f4bc51f9e2');
 assert.equal(renderFrame({...baseConfig,adapter:'snes',game:'test',games:['test']}).includes('play-icons'),false);
 const html=renderFrame({...baseConfig,playIcons:['temple','controller','cube']});
 assert(!html.includes('<button id="play">Play</button>'));
 const button=html.match(/<button id="play"[^>]*>.*?<\/button>/s)[0];
 assert.match(button,/<span class="play-icons" aria-hidden="true" data-slots="6">/);assert.match(button,/<span class="play-label">Play<\/span>/);
 assert.deepEqual([...button.matchAll(/data-icon="(\w+)"/g)].map(m=>m[1]),['play','temple','controller','cube']);
 // Slots: play, temple 2-4 s, play, controller 6-8 s, play, cube 10-12 s of a 12 s cycle.
 assert.deepEqual([...button.matchAll(/animation-delay:(-\d+)s/g)].map(m=>Number(m[1])),[-10,-6,-2]);
 assert.equal((button.match(/data-static/g)||[]).length,1);assert.match(button,/data-icon="temple" viewBox="0 0 24 24" data-static/);
});
test('frozen bundles with play icons verify and differ from the default bundle',t=>{
 const f=fixture(t);const plain=freezeBundle({runtimeDirectory:f.runtime,config:f.config,output:f.output});
 const icons=freezeBundle({runtimeDirectory:f.runtime,config:{...f.config,playIcons:['temple']},output:f.output});
 assert.notEqual(verifyBundle(plain).bundleId,verifyBundle(icons).bundleId);assert.match(readFileSync(join(icons,'frame.html'),'utf8'),/play-label/);
});
