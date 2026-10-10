# v0.1.5 — Play button icons and a themable frame size

Component package only (324346 bytes). The examples ZIP is unchanged and stays with [v0.1.4](https://github.com/wbniv/browser-game-player/releases/tag/v0.1.4).

- **Animated Play icons.** Optional `playIcons` (one to three of `temple`, `controller`, `cube`) cycles an `aria-hidden` icon before the Play label; it is static under reduced motion and while loading. Without `playIcons` the frame is byte-identical to 0.1.4's.
- **Frame size is now themable.** The Astro component's default iframe size is layered CSS (`@layer base`), so a site's own rules and Tailwind v4 utilities override it. Before, an unlayered default beat a utility such as `h-[68vh]` and left an empty band under the player on worldfoundry.org. Sites that use the default content-sizing are unaffected.
- Bundle receipts pin the player version, so re-freezing with 0.1.5 selects new bundle ids even where the frame bytes are unchanged.

Checks: 12 package tests and the JavaScript syntax check pass; the layering fix was exercised in Chromium with a layered utility height. The native runtimes are unchanged and the browser, fidelity and phone checks recorded for [v0.1.4](release-0.1.4.md) were not repeated.

[Hashes](release-0.1.5.json).

AI-Assisted: Claude Code; claude-sonnet-5-5.
