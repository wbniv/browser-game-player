# Verification

`npm test` exercises both bundle formats, exact-byte staging, immutable provenance, tampering, symlinks, config serialization and level selection. `npm run check` checks JavaScript syntax. These checks require no browser, engine or ROM download.

Optional browser checks reuse local Playwright and Chrome installations through `BGP_PLAYWRIGHT` and `BGP_CHROME`. Firefox uses Playwright's installed browser and Xvfb in Ubuntu 24.10. The native runtimes and authored game files remain outside this repository.

- `node tests/host-browser.mjs` creates its own small server and exercises isolated instances, queued commands, bounded size messages, stale identity rejection, source rotation and disposal.
- `node tests/browser.mjs BASE_URL OUT_DIR IDENTITIES_JSON` uses a server with frozen bundles below `/bundles/` and an identity map keyed `fyw`, `gallery`, `snes`. It checks manual download gating, real startup, menu pause/resume, keyboard input, fullscreen and the current `asmisland` WRAM self-check. Set `BGP_BROWSER=firefox` and run under Xvfb for Firefox. Its verification timeout accommodates Firefox's slower unchanged emulator loop.
- `node tests/diagnostics-browser.mjs BASE_URL OUT_DIR IDENTITIES_JSON` checks failed-loader retry/reload, focus policy, cancelled restart, SNES pointer/key release and phone fullscreen.
- `node tests/accepted-input.mjs FRAME_URL OUT_DIR` retains the accepted FYW two-finger, pointer-cancellation and keyboard-ownership regression.
- `node tests/consumers-browser.mjs OUT_DIR` checks actual built site routes, gallery history, fidelity and phone sizing. `BGP_INDRI_URL`, `BGP_WORLD_URL`, `BGP_BIO_URL` select local site servers (default ports 4390, 4391, 4392).

These are browser/emulated-touch checks, not claims of physical phone or Apple verification. Native engine `printErr` diagnostic messages are distinguished from JavaScript exceptions.

- `node tests/touch-navigation-browser.mjs BASE_URL OUT_DIR IDENTITIES_JSON` checks the real LZSS ROM's visible chevrons and inert black margins inline and fullscreen.
- `node tests/visibility-browser.mjs BASE_URL OUT_DIR IDENTITIES_JSON` tests visibility policy against the real native loop with an explicitly simulated document visibility event.
