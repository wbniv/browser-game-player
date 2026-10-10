# v0.1.0 verification — 2026-10-10

Both World Foundry and SNES use the same shell, Astro/vanilla host and versioned asset tools. Native binaries, engine allocators and the emulator fidelity algorithm are unchanged.

- Eight package tests pass; malformed/tampered bundles, changed immutable provenance and unsafe level overrides are rejected.
- Chromium and Firefox in Ubuntu 24.10 pass real startup, menu pause/resume and SNES keyboard release. Both reproduce the current `asmisland` manifest CRC `0x260B` over 300 native frames.
- Firefox's original and extracted loaders both needed longer than the initial short verification timeout. A bounded five-minute window completes the unchanged native check. No emulator arithmetic or expected CRC was changed.
- The host checks two isolated frames, source/origin/protocol/instance validation, queued start, bounded size messages, source rotation and disposal, including during loading.
- FYW's accepted two-finger, pointer-cancellation and keyboard-ownership check passes against the extracted shell at 320 px. Its reader and desktop/phone controls retain the accepted presentation.
- Failed-loader retry/reload, focused pause/resume, cancelled restart, SNES pointer/blur release and phone fullscreen pass.
- The packed package builds in the Indri, Worldfoundry.org and Biohack consumer previews. Site checks pass: 19 Indri, 55 Worldfoundry.org, 51 Biohack with one existing skipped check. Gallery selection/back navigation and the built SNES page's fidelity check pass.

The exact tarball identity, browser versions, bundle identities and coverage limits are in [the verification receipt](verification-2026-10-10.json). Native `printErr` startup logs are counted separately from JavaScript exceptions. There were zero JavaScript exceptions in the final engine and consumer checks.

This first package is published as a versioned GitHub release tarball. It is not an npm-registry publication. Consumer website production deployment is a separate step; these migrations are local previews. No new physical-device performance claims are made.
