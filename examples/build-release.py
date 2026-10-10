#!/usr/bin/env python3
"""Package two small static examples from existing runtimes; no native rebuild."""
import argparse, hashlib, json, re, shutil, subprocess, zipfile
from pathlib import Path

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + '\n')

def archive(directory, destination):
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for path in sorted(directory.rglob('*')):
            if path.is_file():
                info=zipfile.ZipInfo(path.relative_to(directory).as_posix(), (2026,10,10,0,0,0))
                info.compress_type=zipfile.ZIP_DEFLATED; info.external_attr=0o100644 << 16
                z.writestr(info,path.read_bytes())

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--wf-runtime',type=Path,required=True,help='Verified JS/WASM/data directory')
    p.add_argument('--wf-level',type=Path,required=True,help='baseline-standalone.iff exported from pinned source')
    p.add_argument('--wf-commit',required=True)
    p.add_argument('--snes-runtime',type=Path,required=True,help='Existing cores/, roms/, preview/ directory')
    p.add_argument('--licenses',type=Path,required=True,help='Prepared worldfoundry/ and snes/ license/source notices')
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--node',default='node')
    a=p.parse_args();root=Path(__file__).resolve().parents[1];a.output.mkdir(parents=True,exist_ok=True)
    version=json.loads((root/'package.json').read_text())['version']
    if not re.fullmatch(r'[a-f0-9]{40}',a.wf_commit):p.error('wf-commit must be a full source commit')
    for adapter in ['worldfoundry','snes']:
        if not (a.licenses/adapter/'SOURCES.md').is_file():p.error('Missing '+adapter+' source/license notices')
    if any(a.output.iterdir()):p.error('Output must be empty; do not overwrite a published example')
    work=a.output/'work';work.mkdir()
    wf=work/'worldfoundry-runtime';wf.mkdir()
    original=(a.wf_runtime/'wf_game.js').read_text()
    # Update only the generated preload metadata. Engine glue and WASM remain unchanged.
    match=re.search(r'loadPackage\(\s*(\{\s*"files"\s*:.*?\})\s*\);',original,re.S)
    if not match:raise ValueError('Expected non-minified Emscripten JSON preload metadata')
    old=json.loads(match[1]);size=(a.wf_runtime/'wf_game.data').stat().st_size
    if old['remote_package_size']!=size:raise ValueError('Original preload size differs')
    level=a.wf_level.read_bytes()
    if len(level)<8 or int.from_bytes(level[4:8],'little')+8!=len(level):raise ValueError('Invalid standalone IFF size')
    name='/baseline-standalone.iff'
    metadata={'files':[{'filename':name,'start':0,'end':len(level)}],'remote_package_size':len(level)}
    (wf/'wf_game.js').write_text(original[:match.start(1)]+json.dumps(metadata)+original[match.end(1):])
    (wf/'wf_game.data').write_bytes(level);shutil.copyfile(a.wf_runtime/'wf_game.wasm',wf/'wf_game.wasm')
    snes=work/'snes-runtime';(snes/'roms').mkdir(parents=True)
    shutil.copytree(a.snes_runtime/'cores',snes/'cores')
    manifest=json.loads((a.snes_runtime/'roms/manifest.json').read_text())
    rom=next(row for row in manifest['roms'] if row['id']=='doom-fire')
    write_json(snes/'roms/manifest.json',{'roms':[rom]})
    shutil.copyfile(a.snes_runtime/'roms/doom-fire.sfc',snes/'roms/doom-fire.sfc')
    receipts=[]
    for kind,runtime in [('worldfoundry',wf),('snes',snes)]:
        demo=a.output/f'browser-game-player-{kind}-example-{version}';demo.mkdir()
        config=json.loads((root/'examples'/('baseline.json' if kind=='worldfoundry' else 'doom-fire.json')).read_text())
        config.update(startMode='manual',fullscreenOnPlay=True,poster=None,fallbackUrl='./index.html',fallbackLabel='Example home',status='Example · progress resets on restart')
        if kind=='worldfoundry':
            config.update(title='Baseline',subtitle='A single World Foundry level',arguments=['-L'+name]);config.pop('levels',None);config.pop('defaultLevel',None)
        else:
            config.update(title='Doom Fire',subtitle='A 32 KiB SNES homebrew example',game='doom-fire',games=['doom-fire'],previews=[]);config.pop('verifyLabels',None)
        provenance={'example':kind,'inputFiles':{str(path.name):sha(path) for path in ([a.wf_runtime/'wf_game.js',a.wf_runtime/'wf_game.wasm',a.wf_level] if kind=='worldfoundry' else [a.snes_runtime/'cores/bsnes_jg.wasm',a.snes_runtime/'roms/doom-fire.sfc'])}}
        if kind=='worldfoundry':provenance.update(engineCommit=a.wf_commit,stackBytes=65536,preloadRepacked=True)
        options=work/(kind+'.json');write_json(options,{'runtimeDirectory':str(runtime.resolve()),'output':str((demo/'bundles').resolve()),'config':config,'provenance':provenance})
        subprocess.run([a.node,str(root/'bin/player.mjs'),'freeze',str(options)],check=True)
        bundle=next((demo/'bundles').glob('bgp1-*'));write_json(demo/'manifest.json',{'bundleId':bundle.name});receipt=json.loads((bundle/'receipt.json').read_text())
        shutil.copyfile(root/'src/embed.mjs',demo/'embed.mjs')
        (demo/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+config['title']+' — Browser Game Player</title><style>body{margin:0;background:#29261f;color:#eee;font:16px system-ui}h1,p{margin:16px}iframe{display:block;border:0;width:100%;min-height:400px}</style><h1>'+config['title']+'</h1><p>Press Play. Open the menu for controls. <a style="color:inherit" href="user-guide.md">Player guide</a></p><div id="game"></div><script type="module">import {mountPlayer} from "./embed.mjs";mountPlayer(document.querySelector("#game"),{src:"./bundles/'+bundle.name+'/frame.html",title:'+json.dumps(config['title'])+'});</script></html>')
        shutil.copyfile(root/'docs/user-guide.md',demo/'user-guide.md');shutil.copyfile(root/'LICENSE',demo/'PLAYER-LICENSE');shutil.copyfile(root/'NOTICE',demo/'PLAYER-NOTICE')
        shutil.copytree(root/'docs/user-guide-assets',demo/'user-guide-assets')
        shutil.copytree(a.licenses/kind,demo/'licenses')
        (demo/'README.txt').write_text('Unzip, run python3 -m http.server 8000 --bind 127.0.0.1 here, then open http://localhost:8000/ and press Play.\nNo compiler or Node is required. Use HTTP, not file: URLs.\nSource and licenses: licenses/SOURCES.md and companion release source archives.\n')
        archive(demo,a.output/(demo.name+'.zip'));receipts.append({'adapter':kind,'bundle':receipt['bundleId'],'runtimeBytes':receipt['totalBytes']})
    shutil.copyfile(a.snes_runtime/'roms/doom-fire.sfc',a.output/'doom-fire.sfc')
    write_json(a.output/'examples-receipt.json',{'playerVersion':version,'examples':receipts,'assets':{path.name:{'bytes':path.stat().st_size,'sha256':sha(path)} for path in sorted(a.output.iterdir()) if path.is_file()}})
    shutil.rmtree(work)
if __name__=='__main__':main()
