# v0.1.1 verification — 2026-10-10

This patch preserves ROM touch hitboxes when the shared SNES canvas is letterboxed inline or in fullscreen. It maps pointer coordinates relative to the displayed 8:7 image and leaves black margins inert. The existing ROM hit rectangles, pad bits, pulse duration, emulator core and fidelity algorithm are unchanged. Bundle identity now also includes protocol and component version, so metadata-only package revisions cannot collide with an older immutable receipt.

The real `lzss-gallery` ROM passes Right-chevron, pointer-cancellation and inert-margin checks in both letterboxed views; its action retains “Verify benchmark.” Chromium and Firefox repeat real startup/control/fidelity checks with the unchanged cores. The initial [verification record](verification-2026-10-10.md) covers the shared shell and full package surface.

Consumer previews additionally migrate Indri's gallery, Blossom and compiler embed. Nonce-based CSP framing/navigation checks pass, including entering SNES from the gallery, Back disposal and Blossom startup. The gallery filter now retains Astro history state and disposes page handlers on swaps. These are consumer fixes, not an emulator change. Worldfoundry.org's engine-sync task refreshes the component and keeps legacy hash pruning away from component bundles.

Confirmed chapter restart and simulated visibility-event pause/release/resume checks also pass. Automated Chrome tabs remained visible in the attempted headed-tab test, so simulated visibility is recorded explicitly; it is not an OS occlusion or physical-device measurement.

The patch is a separate versioned GitHub release. The v0.1.0 artifact is retained, and no website production deployment is claimed.
