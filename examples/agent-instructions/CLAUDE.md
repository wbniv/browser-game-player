# Claude Code: embed the SNES player

Use the reusable `@wbniv/browser-game-player` component or HTML host. Before editing, inspect the site's existing bundle and same-origin policy; do not copy emulator runtime internals into the application.

Choose one example from [`../html/`](../html/) or [`../astro/`](../astro/):

- With touchscreen input: use `?game=mandel-display` and keep the Play/loading UI and touch controls.
- Bare visual preview: use `?game=mandel-display&display=bare`; this auto-starts and hides the overlay and touch bar.

Build and deploy the frozen SNES bundle with the host site. Use the bundle's `verifyManifest` receipt for Astro; keep the frame and all runtime, ROM, and metadata assets on the same origin as the host page. For WordPress, adapt the Gutenberg examples in [`../wordpress/README.md`](../wordpress/README.md).

Keep iframe titles accessible and size bare previews to the 4:3 SNES display. The source framebuffer is 256×224 (8:7 samples), but the full picture is horizontally expanded for the traditional 4:3 TV presentation. Preserve `allow="fullscreen; autoplay; gamepad"` when writing a raw iframe. Do not embed the Indri app page itself; embed the frozen `frame.html` from your own site.
