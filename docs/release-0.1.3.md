# v0.1.3 — guides and small runnable examples

Added a [user guide](user-guide.md) and [technical guide](technical-guide.md) with architecture/lifecycle diagrams, API/configuration reference, asset provenance, hosting/CSP, controls and troubleshooting. Guides and text-only example configurations/tooling ship in the 53,019-byte component package. This release removes arrow glyphs from the joystick circles and retains their directional hit targets and accessible labels. Existing consumers can retain their matching v0.1.1 package/bundles.

Separate release downloads:

| Artifact | Bytes |
|---|---:|
| World Foundry Baseline runnable ZIP | 988,497 |
| SNES Doom Fire runnable ZIP | 1,994,491 |
| Raw Doom Fire ROM | 32,768 |
| World Foundry corresponding source archive | 54,692,281 |
| SNES corresponding source archive | 5,037,705 |

Each ZIP is standalone static content: extract into its own directory, serve with `python3 -m http.server 8000 --bind 127.0.0.1`, open http://localhost:8000/ and press Play. No compiler, Node or SDK is required to play. Binary artifacts stay out of component Git history and the npm payload. Source archives are separate so players need not download build sources.

World Foundry reuses the accepted FYW engine WASM, unchanged, at source commit `c3e0a5b3b428a40e89ccd122d71a439394abbb67`. The existing baseline export has its own recorded SHA-256; its tracked authored source matches that engine pin. Only the generated preload metadata and data file are repacked for one level. There is no engine rebuild, allocator rewrite or chapter payload in this example. The source archive includes pinned submodule snapshots and the original browser build overlay.

SNES reuses the existing bsnes-jg 2.1.0 / Emscripten 6.0.4 runtime and Doom Fire homebrew ROM. Only one manifest entry and ROM are staged; the original self-check is preserved. No core rebuild, emulation arithmetic or expected CRC changes occur.

Both extracted ZIPs pass real Chromium 154.0.8037.57 and Firefox 148.0.2 tests in Ubuntu 24.10: manual loading, startup/fullscreen, menu pause/resume, keyboard input/release, desktop/phone screenshots and zero JavaScript exceptions. Both browsers reproduce Doom Fire's 500-frame `0x3C59` fidelity witness; screenshots wait for actual flame pixels after the title screen. Directional hit targets retain accessible labels with no arrow glyphs. Eight package integrity/config tests and syntax checks pass. The packed package verifies both extracted bundles; all packed files match repository source and contain no WASM/data/ROM binaries.

[Exact hashes and browser receipts](release-0.1.3.json) · [Example downloads and reproduction](../examples/README.md).

Phone screenshots use emulated viewports. These tests do not certify physical phones, Apple backends, all ROMs or sustained performance. Source and dependency notices accompany the artifacts. Website production deployments are unchanged.

AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
