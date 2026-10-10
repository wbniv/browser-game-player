| Date | Change |
|------|--------|
| [2026-10-11](https://github.com/wbniv/browser-game-player/commit/5325772) | Add optional animated icons to the Play button (0.1.5) |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/d8d20ff) | Use baseline and Doom Fire examples and simplify joystick circles |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/485dede) | Document player APIs and usage and ship small runnable examples |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/1c57565) | Fix letterboxed SNES touch navigation and version bundle identity |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/0615394) | Extract shared browser game player with World Foundry and SNES adapters |

<!--history-meta v1
5325772	author	Will Norris
5325772	added	1
5325772	deleted	1
5325772	files	1
5325772	body	New optional config key playIcons: one to three distinct built-in ids\n(temple, controller, cube). renderFrame then puts an aria-hidden icon\ncycle before the Play label (play triangle interleaved, two-second\nslots); without the key the frame is byte-identical to 0.1.4, so SNES\nand other consumers render unchanged. The first id is static under\nprefers-reduced-motion, while loading, and after the in-game reduced\nmotion toggle, which the shell now mirrors as data-reduced-motion on\n<html>. Retry writes into the label span so the icons survive errors.\n\nShell bytes change for every consumer, so PLAYER_VERSION and the\npackage go to 0.1.5; re-freeze bundles when adopting.\n\nAI-Assisted: Claude Code; claude-opus-5-5; reasoning effort medium.\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01FHCgJEKFj9n9X4Ju4vPgVR
d8d20ff	author	Will Norris
d8d20ff	added	2
d8d20ff	deleted	2
d8d20ff	files	1
d8d20ff	body	AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
485dede	author	Will Norris
485dede	added	2
485dede	deleted	0
485dede	files	1
485dede	body	AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
1c57565	author	Will Norris
1c57565	added	3
1c57565	deleted	0
1c57565	files	1
1c57565	body	AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
0615394	author	Will Norris
0615394	added	13
0615394	deleted	0
0615394	files	1
0615394	body	Share shell, lifecycle, input ownership and Astro/vanilla embedding across both runtimes. Add immutable bundle tooling, offline tarball integration and real-browser verification while preserving existing engine and emulator bytes.\n\nAI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
-->
