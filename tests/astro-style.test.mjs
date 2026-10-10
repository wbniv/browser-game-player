import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../astro/GamePlayer.astro', import.meta.url), 'utf8');
// Unlayered CSS beats layered CSS whatever the specificity, so an unlayered default height
// silently beat Tailwind v4 height utilities (a site's `h-[68vh]` frameClass never applied).
test('the default iframe size is layered so site rules and utilities win', () => {
  const rule = source.match(/:where\(\.browser-game-player > iframe\)\s*\{[^}]*\}/);
  assert(rule, 'default iframe rule exists');
  const before = source.slice(0, rule.index);
  assert.match(before, /@layer\s+base\s*\{\s*$/, 'default iframe rule is wrapped in @layer base');
});
