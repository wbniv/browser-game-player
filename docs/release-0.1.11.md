# v0.1.11 — correct the SNES display aspect ratio

- Display the complete SNES image at 4:3. The raw 256×224 framebuffer is an 8:7 sample grid; it is horizontally expanded for the traditional television presentation.
- Update bare-display Astro and WordPress examples and the Claude/Codex instructions to use 4:3.
- Keep iframe examples on the frozen `frame.html`, with accessible titles and the required fullscreen/autoplay/gamepad permissions.
