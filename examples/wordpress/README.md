# WordPress Gutenberg examples

Add a **Custom HTML** block and paste one of these iframes. Replace `https://example.org/player/snes/` with a complete frozen SNES bundle hosted on the WordPress site's origin or a same-origin static host. Keep `frame.html`, `player.css`, `player.js`, the core, ROM, and metadata files together at their bundle paths.

## With touch controls

Use [`with-controls.html`](with-controls.html) in a **Custom HTML** block. Prefix the frame path with your site origin, for example `https://example.org`.

## Bare display, no controls

Use [`bare-display.html`](bare-display.html), replacing the frame path with your same-origin bundle URL.

`display=bare` starts the configured SNES ROM automatically, showing only its canvas. The regular frame includes the shell's Play/loading UI and touchscreen controls.

## Hosting requirements

- WordPress must allow iframes in Custom HTML blocks for the editing account. Some roles or security plugins strip iframe markup.
- The frame and player assets must be served from the same origin as the embedding page. The shared host API intentionally rejects cross-origin frames.
- Serve `.wasm` as `application/wasm`, JavaScript as a JavaScript MIME type, JSON as `application/json`, and ROM files as binary. The Media Library may block or alter these files; a same-origin static directory or deployment plugin is usually simpler.
- The host site's Content Security Policy must permit the required scripts, WebAssembly and iframe. The frame's `frame-ancestors` policy must allow the WordPress origin.
- The standard frame is tall to fit its game screen and controls. The bare frame uses the 4:3 SNES television display area. The source framebuffer is 256×224 (8:7 samples); display the complete picture at 4:3 to match the original TV presentation.
