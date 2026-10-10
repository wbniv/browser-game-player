import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, lstatSync, rmSync, renameSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { validateConfig, PROTOCOL, PLAYER_VERSION } from './config.mjs';
import frameTemplate from './frame-template.mjs';
const shell = fileURLToPath(new URL('../shell/', import.meta.url));
const shellFiles = ['frame.html', 'player.js', 'player.css', 'adapters/worldfoundry.js', 'adapters/snes.js', 'adapters/snes-loader.js'];
function runtimeFiles(config) {
  return config.adapter === 'worldfoundry' ? ['wf_game.js', 'wf_game.wasm', 'wf_game.data']
    : ['cores/bsnes_jg.js', 'cores/bsnes_jg.wasm', 'cores/PROVENANCE.json', 'roms/manifest.json', ...config.games.map(id => 'roms/' + id + '.sfc'), ...(config.previews || []).map(id => 'preview/' + id + '.png')];
}
function expectedFiles(config) { return [...runtimeFiles(config), ...shellFiles, 'config.json', ...(config.poster ? [config.poster] : [])]; }
function walk(directory, prefix = '') {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw Error('Bundle symlinks are unsupported');
    if (entry.isDirectory()) result.push(...walk(join(directory, entry.name), name + '/'));
    else result.push(name);
  }
  return result;
}
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const stable = value => value && typeof value === 'object' && !Array.isArray(value)
  ? '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}'
  : Array.isArray(value) ? '[' + value.map(stable).join(',') + ']' : JSON.stringify(value);
const bundleId = files => 'bgp1-' + sha256(stable({protocol:PROTOCOL,playerVersion:PLAYER_VERSION,files})).slice(0, 24);
const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const iconPaths = {
  play: '<path d="m8 5 11 7-11 7Z"/>',
  temple: '<path d="m2 8 10-6 10 6H2Zm2 3v7m5-7v7m6-7v7m5-7v7M2 21h20M3 18h18"/>',
  controller: '<path d="M7 7h10c3 0 4 3 5 10 .4 3-2 4-4 2l-3-3H9l-3 3c-2 2-4.4 1-4-2C3 10 4 7 7 7Z"/><path d="M6 10v5m-2.5-2.5h5M16 11h.01M19 14h.01"/>',
  cube: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10v10M3 7l9 5 9-5"/>',
};
// Two-second slots: play, ids[0], play, ids[1], ... The first id is the
// static icon whenever motion is reduced (see player.css).
function playButton(ids) {
  const period = 4 * ids.length;
  const svg = (id, extra = '') => `<svg class="icon-${id}" data-icon="${id}" viewBox="0 0 24 24"${extra}>${iconPaths[id]}</svg>`;
  const icons = [svg('play'), ...ids.map((id, k) => svg(id, `${k ? '' : ' data-static'} style="animation-delay:-${period - 2 * (2 * k + 1)}s"`))];
  return `<button id="play" class="with-icons"><span class="play-icons" aria-hidden="true" data-slots="${2 * ids.length}">${icons.join('')}</span><span class="play-label">Play</span></button>`;
}
export function renderFrame(config) {
  config = validateConfig(config);
  let frame = frameTemplate.replace('<!-- WF_PLAYER_CONFIG -->', `<script type="application/json" id="wf-player-config">${json(config)}</script>`);
  if (config.playIcons) frame = frame.replace('<button id="play">Play</button>', playButton(config.playIcons));
  return frame;
}
function inventory(directory, names) {
  return Object.fromEntries([...names].sort().map(name => {
    const path = join(directory, name);
    if (name.split('/').some(part => !part || part === '.' || part === '..') || name.includes('\\')) throw Error('Invalid file path');
    if (!lstatSync(path).isFile()) throw Error(`Bundle file must be a regular file: ${name}`);
    const bytes = readFileSync(path);
    return [name, { bytes: bytes.length, sha256: sha256(bytes) }];
  }));
}
export function verifyBundle(directory) {
  if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) throw Error('Bundle directory must be a regular directory');
  const receiptPath=join(directory,'receipt.json');
  if (!lstatSync(receiptPath).isFile()) throw Error('Receipt must be a regular file');
  const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
  if (receipt.schema !== 1 || receipt.protocol !== PROTOCOL || receipt.playerVersion !== PLAYER_VERSION || !receipt.files || Array.isArray(receipt.files)) throw Error('Unsupported bundle schema/player/protocol');
  const names = Object.keys(receipt.files);
  const config = validateConfig(JSON.parse(readFileSync(join(directory, 'config.json'), 'utf8')));
  const expected = expectedFiles(config);
  if (names.sort().join() !== expected.sort().join() || walk(directory).sort().join() !== [...names, 'receipt.json'].sort().join()) throw Error('Incomplete or unexpected bundle files');
  for (const info of Object.values(receipt.files)) if (!Number.isSafeInteger(info.bytes) || info.bytes <= 0 || !/^[a-f0-9]{64}$/.test(info.sha256)) throw Error('Invalid file receipt');
  if (bundleId(receipt.files) !== receipt.bundleId) throw Error('Bundle identity mismatch');
  const actual = inventory(directory, names);
  if (stable(actual) !== stable(receipt.files)) throw Error('Bundle artifact differs');
  if (receipt.totalBytes !== Object.values(actual).reduce((n, f) => n + f.bytes, 0)) throw Error('Bundle size mismatch');
  if (readFileSync(join(directory, 'frame.html'), 'utf8') !== renderFrame(config)) throw Error('Frame/config/player compatibility mismatch');
  if (config.adapter === 'snes') {
    const manifest = JSON.parse(readFileSync(join(directory, 'roms/manifest.json'), 'utf8'));
    if (!Array.isArray(manifest.roms) || !config.games.every(id => manifest.roms.some(rom => rom.id === id))) throw Error('SNES ROM manifest mismatch');
  }
  return receipt;
}
export function freezeBundle({ runtimeDirectory, config, output, poster, provenance = {} }) {
  config = validateConfig(config);
  if (Boolean(config.poster) !== Boolean(poster)) throw Error('Poster source/config mismatch');
  mkdirSync(output, { recursive: true });
  const temp = join(output, '.staging-' + randomUUID()); mkdirSync(temp);
  try {
    for (const name of runtimeFiles(config)) { mkdirSync(dirname(join(temp, name)), { recursive: true }); copyFileSync(join(runtimeDirectory, name), join(temp, name)); }
    for (const name of shellFiles.filter(name => name !== 'frame.html')) { mkdirSync(dirname(join(temp, name)), { recursive: true }); copyFileSync(join(shell, name), join(temp, name)); }
    writeFileSync(join(temp, 'frame.html'), renderFrame(config));
    writeFileSync(join(temp, 'config.json'), JSON.stringify(config, null, 2) + '\n');
    if (poster) copyFileSync(poster, join(temp, config.poster));
    const files = inventory(temp, expectedFiles(config));
    const receipt = { schema: 1, protocol: PROTOCOL, playerVersion: PLAYER_VERSION, bundleId: bundleId(files), provenance, files, totalBytes: Object.values(files).reduce((n, f) => n + f.bytes, 0) };
    writeFileSync(join(temp, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n'); verifyBundle(temp);
    const dest = join(output, receipt.bundleId);
    try { lstatSync(dest); const existing=verifyBundle(dest); if(stable(existing)!==stable(receipt)) throw Error('Existing immutable receipt differs'); rmSync(temp, { recursive: true }); }
    catch (e) { if (e.code !== 'ENOENT') throw e; renameSync(temp, dest); }
    return dest;
  } catch (error) { rmSync(temp, { recursive: true, force: true }); throw error; }
}
export function syncBundle(source, destination, { check = false } = {}) {
  const receipt = verifyBundle(source);
  const dest = join(resolve(destination), receipt.bundleId);
  if (check) { const existing = verifyBundle(dest); if (stable(existing) !== stable(receipt)) throw Error('Staged receipt differs'); return dest; }
  mkdirSync(destination, { recursive: true });
  const temporary = join(resolve(destination), '.sync-' + randomUUID()); mkdirSync(temporary);
  try {
    for (const name of [...Object.keys(receipt.files), 'receipt.json']) { mkdirSync(dirname(join(temporary, name)), { recursive: true }); copyFileSync(join(source, name), join(temporary, name)); }
    verifyBundle(temporary);
    try { lstatSync(dest); const existing = verifyBundle(dest); if (stable(existing) !== stable(receipt)) throw Error('Existing immutable receipt differs'); rmSync(temporary, { recursive: true }); }
    catch (e) { if (e.code !== 'ENOENT') throw e; renameSync(temporary, dest); }
    return dest;
  } catch (error) { rmSync(temporary, { recursive: true, force: true }); throw error; }
}
export function verifyManifest(base, publicBase) {
  const manifest = JSON.parse(readFileSync(join(base, 'manifest.json'), 'utf8'));
  if (!/^bgp1-[a-f0-9]{24}$/.test(manifest.bundleId)) throw Error('Invalid selected bundle');
  const receipt = verifyBundle(join(base, 'bundles', manifest.bundleId));
  if (receipt.bundleId !== manifest.bundleId) throw Error('Selected bundle mismatch');
  return { receipt, frame: publicBase.replace(/\/$/, '') + '/bundles/' + receipt.bundleId + '/frame.html' };
}
