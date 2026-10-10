#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { freezeBundle, syncBundle, verifyBundle } from '../src/bundle.mjs';
const [command, ...args] = process.argv.slice(2);
try {
  if (command === 'check' && args.length === 1) console.log('Verified', verifyBundle(args[0]).bundleId);
  else if (command === 'sync' && args.filter(a => a !== '--check').length === 2) {
    const paths = args.filter(a => a !== '--check'); console.log(syncBundle(...paths, { check: args.includes('--check') }));
  } else if (command === 'freeze' && args.length === 1) {
    const options = JSON.parse(readFileSync(args[0], 'utf8')); console.log(freezeBundle(options));
  } else throw Error('Usage: browser-game-player freeze <options.json> | check <bundle> | sync <bundle> <destination> [--check]');
} catch (error) { console.error(error.message); process.exitCode = 1; }
