# WordPress Gutenberg examples

Add a **Custom HTML** block and paste one of these iframes. Replace `https://example.org/player/snes/` with a complete frozen SNES bundle hosted on the WordPress site's origin or a same-origin static host. Keep `frame.html`, `player.css`, `player.js`, the core, ROM, and metadata files together at their bundle paths.

## With touch controls

```html
<iframe
  title="Mandelbrot SNES player"
  src="https://example.org/player/snes/frame.html?game=mandel-display"
  width="100%"
  height="760"
  loading="lazy"
  allow="fullscreen; autoplay; gamepad"
  allowfullscreen
  style="display:block;width:100%;max-width:720px;border:0;background:#29261f"
></iframe>
```

## Bare display, no controls

```html
<iframe
  title="Mandelbrot SNES display"
  src="https://example.org/player/snes/frame.html?game=mandel-display&amp;display=bare"
  width="180"
  height="158"
  loading="lazy"
  allow="autoplay"
  style="display:block;width:min(180px,48vw);height:auto;aspect-ratio:8/7;border:0;background:#111820"
></iframe>
```

`display=bare` starts the configured SNES ROM automatically, showing only its canvas. The regular frame includes the shell's Play/loading UI and touchscreen controls.

## Hosting requirements

- WordPress must allow iframes in Custom HTML blocks for the editing account. Some roles or security plugins strip iframe markup.
- The frame and player assets must be served from the same origin as the embedding page. The shared host API intentionally rejects cross-origin frames.
- Serve `.wasm` as `application/wasm`, JavaScript as a JavaScript MIME type, JSON as `application/json`, and ROM files as binary. The Media Library may block or alter these files; a same-origin static directory or deployment plugin is usually simpler.
- The host site's Content Security Policy must permit the required scripts, WebAssembly and iframe. The frame's `frame-ancestors` policy must allow the WordPress origin.
- The standard frame is tall to fit its 8:7 game screen and controls. The bare frame only needs the 8:7 display area.
