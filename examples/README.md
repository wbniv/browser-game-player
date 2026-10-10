# Runnable binary examples

Download from [v0.1.2](https://github.com/wbniv/browser-game-player/releases/tag/v0.1.2):

| Download | Contents |
|---|---|
| `browser-game-player-snes-example-0.1.2.zip` | One 32 KiB ASMisland ROM, existing bsnes-jg WASM runtime, shared shell, host page and notices. |
| `browser-game-player-worldfoundry-example-0.1.2.zip` | One Snowgoons standalone level, verified World Foundry WASM, repacked preload, shared shell and host page. |
| `asmisland.sfc` | Raw ROM for an existing SNES emulator; browser users should choose the ZIP. |
| `snes-example-sources-0.1.2.tar.gz` | Emulator/frontend source, build script, ROM source and rendering headers. |
| `worldfoundry-example-sources-0.1.2.tar.gz` | Pinned engine/vendor/level source and original browser build overlay. |
| `examples-receipt.json` | Sizes and SHA-256 for all example/source assets. |

Unzip **one ZIP into its own directory**, run `python3 -m http.server 8000 --bind 127.0.0.1` there, and open **http://localhost:8000/**. Press Play. No build tools or network are needed after extraction. Each ZIP has `README.txt`, the [user guide](../docs/user-guide.md), license/source notices and the bundle's byte receipt. Archives contain files at their root; do not unpack both into the same directory.

The World Foundry example uses the engine from commit `c3e0a5b3b428a40e89ccd122d71a439394abbb67`, byte-identical WASM from the accepted FYW browser build, and Snowgoons standalone bytes from that same source commit. Only Emscripten's generated preload metadata and `.data` change. No shared engine source or allocator is modified. The original chapter binary/data are not included. This is a packaging demonstration, not a newly authored game or a fresh native build.

The SNES example reuses bsnes-jg 2.1.0 and the existing ASMisland ROM from the gallery. Its trimmed manifest preserves the published 300-frame `0x260B` self-check exactly. No other ROM or preview is included. The raw ROM is 32,768 bytes; the runnable ZIP also needs the emulator, so it is larger.

## Reproduce the downloads

Use Python 3 and the repository's pinned Node. Existing runtime inputs are deliberately explicit; this script does not clone repositories, install SDKs or download arbitrary games.

```sh
python3 examples/build-release.py \
  --wf-runtime /path/to/verified-fyw-runtime \
  --wf-level /path/to/snowgoons-standalone.iff \
  --wf-commit c3e0a5b3b428a40e89ccd122d71a439394abbb67 \
  --snes-runtime /path/to/staged-bsnes-runtime \
  --licenses /path/to/prepared-example-notices \
  --output /path/to/empty-release-directory
```

The WF input is the non-minified verified FYW engine's `wf_game.js/.wasm/.data`. The SNES input has `cores/`, `roms/manifest.json` and `roms/asmisland.sfc`. Export the level from the pinned World Foundry checkout with `git show <commit>:wflevels/snowgoons-standalone.iff > snowgoons-standalone.iff`.

`--licenses` must contain `worldfoundry/` and `snes/`, each with a `SOURCES.md` and all applicable notices. Extract these from the published example ZIPs to reproduce the notices exactly, or prepare them from the corresponding pinned sources. Supply the matching engine/emulator and game licenses, not only the player's GPL file. Source companion archives remain separate from the runnable ZIPs and are hashed in the final release receipt.

The output must be empty. The script creates one-level/one-ROM frozen bundles, host pages, deterministic-timestamp ZIPs, raw ROM and a preliminary receipt. The release process adds hashes for the separate source archives and records browser verification. `node bin/player.mjs check <extracted-bundle>` independently verifies each frozen bundle with the matching package version.

The optional `tests/release-examples.mjs` test operates on extracted downloads served at `/examples/worldfoundry/` and `/examples/snes/`. It checks manual loading, real startup/fullscreen, controls/menu, phone layout and SNES fidelity. See [test setup](../tests/README.md). Preserve originals and verify package/runtime pins before publishing changed examples.
