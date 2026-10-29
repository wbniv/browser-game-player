# Codex and AGENTS.md-aware tools: embed the SNES player

Use the reusable `@wbniv/browser-game-player` component or HTML host. Inspect the site's existing bundle and same-origin policy before editing; keep emulator runtime internals out of application code.

Choose one example from [`../html/`](../html/) or [`../astro/`](../astro/):

- Touch controls: `?game=mandel-display` shows the normal player presentation and phone controls.
- Bare visual preview: `?game=mandel-display&display=bare` auto-starts and hides the overlay and controls.

Build and deploy the frozen SNES bundle with the host site. For Astro, call `verifyManifest` during the build and use `GamePlayer`. For plain HTML, use `mountPlayer` and serve the shared module plus the frozen bundle on the same origin. WordPress instructions are in [`../wordpress/README.md`](../wordpress/README.md).

Give each iframe a useful title, size a bare SNES display at 4:3, and retain `allow="fullscreen; autoplay; gamepad"` for a raw iframe. The 256×224 source grid is 8:7, while the complete picture is horizontally expanded to 4:3 for the original TV presentation. Embed the frozen `frame.html`, never the surrounding Indri app page.
