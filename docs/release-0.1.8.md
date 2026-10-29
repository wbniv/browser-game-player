# v0.1.8 — bare SNES display and integration examples

- Add `display=bare` for auto-starting a SNES ROM without the overlay or touch controls, suited to small visual previews.
- Make SNES touch controls fit in one compact phone-width strip, with a two-row face-button grid.
- Add complete HTML and Astro examples with and without controls, a WordPress Gutenberg guide, and Claude/Codex integration notes.
- Keep the frame, runtime assets and host page on the same origin.

The package remains a static player shell and adapter; it does not contain SNES core binaries or ROMs. Consumers freeze and deploy their own licensed runtime bundle.
