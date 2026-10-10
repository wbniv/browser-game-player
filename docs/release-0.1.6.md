# v0.1.6 — no scrollbar inside the player frame

Component package only (325322 bytes). The examples ZIP is unchanged and stays with [v0.1.4](https://github.com/wbniv/browser-game-player/releases/tag/v0.1.4).

- **Fixed a stuck scrollbar.** When a host follows the player's reported height, the frame's own scrollbar could appear during loading and stay. It takes about 15 px of width, which narrows the canvas and changes its height, so a one-pixel shortfall could keep it. Hosts that use `autoHeight` (the default) now hide the frame's scrollbar; pinned-height hosts (`autoHeight` off) are unchanged.
- **Documentation.** The user guide gains a FAQ and a note on the Play icon. The technical guide gains [Sizing the frame](technical-guide.md#sizing-the-frame), which explains the layered default size added in v0.1.5.
- Bundle receipts pin the player version, so re-freezing with 0.1.6 selects new bundle ids even where the frame bytes are unchanged.

Checks: 12 package tests, the JavaScript syntax check and the host browser test pass; the host test fails without the change. On a World Foundry page in Chromium with real scrollbars, the previous version showed the scrollbar in 6 of 6 loads (stage 895 px wide instead of 910 px); 0.1.6 showed none in 6 of 6 at 1440 px and 1920 px wide. The native runtimes are unchanged and the browser, fidelity and phone checks recorded for [v0.1.4](release-0.1.4.md) were not repeated.

[Hashes](release-0.1.6.json).

AI-Assisted: Claude Code; claude-sonnet-5-5.
