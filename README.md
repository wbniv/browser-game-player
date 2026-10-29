# Browser Game Player

One configurable browser shell and component for World Foundry and SNES. The shared player owns loading/errors/retry, fullscreen, focused keyboard/touch input, pause/resume policy, restart and frame disposal. Adapters own native/emulator startup and run-loop operations. Game bytes and engine binaries are staged separately and never shipped in this package.

## Documentation and examples

- [User guide](docs/user-guide.md): Play, fullscreen, controls, pause/restart and troubleshooting.
- [Technical guide](docs/technical-guide.md): architecture diagrams, APIs, configuration, lifecycle, provenance, CSP and deployment.
- [Integration examples](examples/README.md): HTML and Astro embeds with and without touch controls, WordPress blocks, and setup notes for Claude and Codex.
- [Runnable binary examples](examples/.history/README.md): archived engine-backed downloads and build instructions.

The component package contains docs and shell code. Example binaries are separate release assets, not npm payload or Git history.

## Install

Versioned package tarballs are published as [GitHub release assets](https://github.com/wbniv/browser-game-player/releases). This first release is not published to the npm registry:

```sh
npm install https://github.com/wbniv/browser-game-player/releases/download/v0.1.10/wbniv-browser-game-player-0.1.10.tgz
```

Consumers can vendor the same small tarball and use `file:vendor/browser-game-player-0.1.11.tgz` for offline, locked installation.

## Use in Astro

```astro
---
import GamePlayer from '@wbniv/browser-game-player/astro';
import { verifyManifest } from '@wbniv/browser-game-player/bundle';
const { frame } = verifyManifest('public/games/my-game', '/games/my-game');
---
<GamePlayer src={frame} title="My game" />
```

For a bare display with no overlay or touch controls, add `&display=bare` to the frame URL. The SNES frame starts the selected ROM automatically. See the [HTML and Astro variants](examples/README.md) for complete examples.

The verified bundle config selects `worldfoundry` or `snes`. Choose a declared gallery level with `?level=<slug>`, or a declared ROM with `?game=<id>`. Unknown selections fall back to configured defaults. A site-owned gallery can use `deferred` and `srcBase` to resolve a deep link before mounting; it remains responsible for URL/history and picker UI.

The component works with Astro 5/6 and cleans up frames before ClientRouter swaps. Multiple instances have independent frames, commands and input. This release requires same-origin frames; configure the site's CSP to permit its content-addressed player frames. It does not require COOP/COEP or another runtime script in the parent page.

## Vanilla embed

```js
import { mountPlayer } from '@wbniv/browser-game-player';
const player = mountPlayer(document.querySelector('#game'), {
  src: '/games/my-game/bundles/bgp1-<hash>/frame.html',
  title: 'My game'
});
player.start();
player.pause();
player.resume();
player.restart(); // asks before losing progress
player.destroy(); // removes the frame and host listeners; idempotent
```

A host emits `player-state` with idle/loading/ready/running/paused/error state. `setSource(url)` replaces the frame document for gallery navigation and rotates its instance ID. Commands queue until the frame handshake. Messages check source window, origin, protocol and instance ID. Removing the frame is disposal: this does not claim an in-process native-runtime teardown API.

Fullscreen/audio activation must occur on a real user gesture. Calling `start()` through the parent API starts loading without claiming browser fullscreen activation. Manual Play can request fullscreen when configured; gallery autostart stays inline.

## Freeze, stage and verify assets

```sh
browser-game-player freeze options.json
browser-game-player check /path/to/bgp1-<hash>
browser-game-player sync /path/to/bgp1-<hash> public/games/my-game/bundles
browser-game-player sync /path/to/bgp1-<hash> public/games/my-game/bundles --check
```

`options.json` supplies `runtimeDirectory`, `output`, `config`, optional `poster`, and provenance. The repository's `examples/` contains FYW, gallery and SNES configuration examples. All paths resolve from the command's working directory. Sync never prunes older releases and writes an immutable directory atomically. The site selects a verified bundle by writing `manifest.json` with its `bundleId`; selection/publication are explicit site operations.

Receipts independently identify schema/protocol, component version, content hash, every asset's size/SHA-256 and engine/game provenance. Check rejects mismatched, missing/extra, symlinked or malformed files and config/frame drift. Generic integrity does not substitute for game-specific provenance policy: FYW retains its original Android chapter/engine/stack checks in its own tools.

## Adapter behavior

World Foundry uses its existing `Module.callMain`, `pauseMainLoop` and `resumeMainLoop` and matching JS/WASM/data preload bundle. Its renderer, allocator, authored settings and 64 KiB stack are unchanged by extraction.

SNES reuses the bsnes-jg browser loader from `@wbniv/bsnes-jg-player` 1.1.0, with narrow lifecycle hooks and delegated shell/fullscreen ownership. It renders the full 256×224 framebuffer at the traditional 4:3 television display ratio; 8:7 describes the source sample grid. ROM touch navigation and WRAM/fidelity algorithms are retained. The package does not rebuild or contain the emulator core. Fidelity uses each staged ROM's actual manifest expectations; historical README example CRCs are not a substitute for the current manifest.

Controls and help come from game configuration. The SNES profile exposes all eight action/shoulder/system controls plus the D-pad. Browser gamepad support is not added to the SNES loader; only adapters with existing support may claim it. Saved progress, context restoration, direct same-document runtime instances and a hosted player service are outside this release.

## Development

Use Node **26.11.1**, pinned in `.node-version` and CI. The package remains compatible with Node >=22.12.0 for existing Astro consumers. Run `npm test` and `npm run check`, then `npm pack`; install the packed tarball in the consumer previews. Browser checks use real frozen runtimes in Ubuntu 24.10, not mock engines. No native compiler SDK or engine clone is needed to develop the component.

GPL-3.0-only; see LICENSE and NOTICE for reused SNES loader attribution. Engine, game and site licenses remain with their respective assets.
