**Unpublished draft, superseded by [v0.1.3](release-0.1.3.md).** The v0.1.2 source tag is preserved; its draft assets were removed.

# v0.1.2 — guides and small runnable examples

Added a [user guide](user-guide.md) and [technical guide](technical-guide.md) with architecture/lifecycle diagrams, API/configuration reference, asset provenance, hosting/CSP, controls and troubleshooting. Guides and text-only example configurations/tooling ship in the 52,619-byte component package. This release changes no runtime behavior beyond the component version used by immutable bundle receipts. Existing consumers can retain their matching v0.1.1 package/bundles.

Separate release downloads:

| Artifact | Bytes |
|---|---:|
| World Foundry Snowgoons runnable ZIP | 1,007,657 |
| SNES ASMisland runnable ZIP | 1,995,148 |
| Raw ASMisland ROM | 32,768 |
| World Foundry corresponding source archive | 54,470,497 |
| SNES corresponding source archive | 5,029,690 |

Each ZIP is standalone static content: extract into its own directory, serve with `python3 -m http.server 8000 --bind 127.0.0.1`, open http://localhost:8000/ and press Play. No compiler, Node or SDK is required to play. Binary artifacts stay out of component Git history and the npm payload. Source archives are separate so players need not download build sources.

World Foundry reuses the accepted FYW engine WASM, unchanged, at source commit `c3e0a5b3b428a40e89ccd122d71a439394abbb67`. Snowgoons standalone bytes come from that same commit. Only the generated preload metadata and data file are repacked for one level. There is no engine rebuild, allocator rewrite or chapter payload in this example. The source archive includes pinned submodule snapshots and the original browser build overlay.

SNES reuses the existing bsnes-jg 2.1.0 / Emscripten 6.0.4 runtime and ASMisland homebrew ROM. Only one manifest entry and ROM are staged; the original self-check is preserved. No core rebuild, emulation arithmetic or expected CRC changes occur.

Both extracted ZIPs pass real Chromium 154.0.8037.57 and Firefox 148.0.2 tests in Ubuntu 24.10: manual loading, startup/fullscreen, menu pause/resume, keyboard input/release, desktop/phone screenshots and zero JavaScript exceptions. Both browsers reproduce ASMisland's 300-frame `0x260B` fidelity witness. Eight package integrity/config tests and syntax checks pass. The packed package verifies both extracted bundles; all packed files match repository source and contain no WASM/data/ROM binaries.

[Exact hashes and browser receipts](release-0.1.2.json) · [Example downloads and reproduction](../examples/README.md).

Phone screenshots use emulated viewports. These tests do not certify physical phones, Apple backends, all ROMs or sustained performance. Source and dependency notices accompany the artifacts. Website production deployments are unchanged.

AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
