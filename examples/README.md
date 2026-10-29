# Integration examples

These examples show the same verified SNES player bundle embedded in HTML, Astro and WordPress, with either the standard player controls or a bare display. Claude and Codex setup notes are in [agent-instructions](agent-instructions/).

## HTML

- [With touch controls](html/with-controls.html)
- [Bare display](html/bare-display.html)

Both examples assume the frozen bundle is deployed at `/player/snes/`; change that path to the same-origin directory used by your site. Build the SNES bundle from [`snes.json`](snes.json), then copy the complete bundle directory, including `frame.html`, `player.css`, `player.js`, the ROM and core assets. Keep these resources on the same origin as the page.

## Astro

- [With touch controls](astro/WithControls.astro)
- [Bare display](astro/BareDisplay.astro)

The Astro samples use `verifyManifest` at build time and `GamePlayer` for the iframe lifecycle and responsive height. Place each file in a page or component and update the public bundle paths for your project.

## WordPress

The [Gutenberg Custom HTML block examples](wordpress/README.md) use a player bundle hosted on the WordPress site or a same-origin static host. WordPress must serve `.wasm`, `.mjs`, `.js`, `.json`, and ROM assets with suitable MIME types; ordinary Media Library uploads may reject or rewrite these files.

## Claude and Codex

Use [`CLAUDE.md`](agent-instructions/CLAUDE.md) with Claude Code and [`AGENTS.md`](agent-instructions/AGENTS.md) with Codex or other AGENTS.md-aware coding tools. Both guides point agents to the same four HTML/Astro examples and explain the same-origin requirement.

## Display modes

[`embed-modes.json`](embed-modes.json) records the supported player variants. Standard frames include the Play/loading presentation and touch controls. Append `display=bare` to a SNES frame URL for an auto-starting canvas with no overlay or touch bar. This mode is intended for a visual preview; use the standard frame when visitors need touchscreen input.

---

## Archived runnable binary examples

The earlier engine-backed downloads are documented in [the archived examples guide](.history/README.md). They are separate from the small reusable player package.

| Download | Contents |
|---|---|
| `browser-game-player-examples-0.1.4.zip` | One starting page offering Baseline (World Foundry) and Doom Fire (SNES), both runtimes, shared host module, illustrated guide and notices. |
| `wbniv-browser-game-player-0.1.4.tgz` | Reusable player component for Astro or vanilla browser integration. |

Unzip the combined ZIP, run `python3 -m http.server 8000 --bind 127.0.0.1` in the extracted directory, and open **http://localhost:8000/**. Choose **Baseline** or **Doom Fire**, then press Play. **All examples** returns to the starting page. No build tools or network are needed after extraction. The ZIP has one `README.txt`, shared host module, illustrated [user guide](../docs/user-guide.md), license/source notices and a byte receipt for each runtime bundle. The latest release lists only the player package and combined runnable examples ZIP.

The World Foundry example uses the engine from commit `c3e0a5b3b428a40e89ccd122d71a439394abbb67`, byte-identical WASM from the accepted FYW browser build, and the existing locally exported baseline standalone bytes. Only Emscripten's generated preload metadata and `.data` change. No shared engine source or allocator is modified. The original chapter binary/data are not included. This is a packaging demonstration, not a newly authored game or a fresh native build.

The SNES example reuses bsnes-jg 2.1.0 and the existing Doom Fire ROM from the gallery. Its trimmed manifest preserves the published 500-frame `0x3C59` self-check exactly. No other ROM or preview is included. The bundled ROM is 32,768 bytes; the runnable ZIP includes the emulator required to demonstrate the player.

The checked-in profiles are [`baseline.json`](baseline.json) and [`doom-fire.json`](doom-fire.json). They match the shipped examples. Joystick circles have no arrow glyphs; keyboard arrows and directional buttons still work.

## Reproduce the downloads

Use Python 3 and the repository's pinned Node. Existing runtime inputs are deliberately explicit; this script does not clone repositories, install SDKs or download arbitrary games.

```sh
python3 examples/build-release.py \
  --wf-runtime /path/to/verified-fyw-runtime \
  --wf-level /path/to/baseline-standalone.iff \
  --wf-commit c3e0a5b3b428a40e89ccd122d71a439394abbb67 \
  --snes-runtime /path/to/staged-bsnes-runtime \
  --licenses /path/to/prepared-example-notices \
  --output /path/to/empty-release-directory
```

The WF input is the non-minified verified FYW engine's `wf_game.js/.wasm/.data`. The SNES input has `cores/`, `roms/manifest.json` and `roms/doom-fire.sfc`. Use the baseline authoring/export workflow in the engine checkout's `wflevels/baseline/`; supply its existing `wflevels/baseline-standalone.iff` export. The release records that export's hash separately from the engine binary pin.

`--licenses` must contain `worldfoundry/` and `snes/`, each with a `SOURCES.md` and all applicable notices. Extract these from the published example ZIPs to reproduce the notices exactly, or prepare them from the corresponding pinned sources. Supply the matching engine/emulator and game licenses, not only the player's GPL file. The unchanged source companions are available from the [earlier v0.1.3 release](https://github.com/wbniv/browser-game-player/releases/tag/v0.1.3); they are not downloads on the current player release page. Retain license/source notices inside the runnable ZIP.

The output must be empty. The script creates one-level/one-ROM frozen bundles, a chooser and host pages, one deterministic-timestamp ZIP and a local integrity receipt. Publish the combined ZIP alongside the component package; retain the receipt as development evidence. The release process adds hashes for the separate source archives and records browser verification. `node bin/player.mjs check <extracted-bundle>` independently verifies each frozen bundle with the matching package version.

The optional `tests/release-examples.mjs` test operates on extracted downloads served at `/examples/worldfoundry/` and `/examples/snes/`. It checks manual loading, real startup/fullscreen, controls/menu, phone layout and SNES fidelity. See [test setup](../tests/README.md). Preserve originals and verify package/runtime pins before publishing changed examples.
