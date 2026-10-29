| Date | Change |
|------|--------|
| [2026-10-11](https://github.com/wbniv/browser-game-player/commit/eb457fd) | Hide the frame scrollbar when the host follows the player's height (0.1.6) |
| [2026-10-11](https://github.com/wbniv/browser-game-player/commit/a8ed92b) | Release 0.1.5 notes: Play icons and themable frame size |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/38289ee) | Ship one download with Baseline and Doom Fire examples |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/d8d20ff) | Use baseline and Doom Fire examples and simplify joystick circles |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/485dede) | Document player APIs and usage and ship small runnable examples |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/1c57565) | Fix letterboxed SNES touch navigation and version bundle identity |
| [2026-10-10](https://github.com/wbniv/browser-game-player/commit/0615394) | Extract shared browser game player with World Foundry and SNES adapters |

<!--history-meta v1
eb457fd	author	Will Norris
eb457fd	added	2
eb457fd	deleted	2
eb457fd	files	1
eb457fd	body	With autoHeight on, the frame's own scrollbar could appear while loading\nand stay: its ~15 px width narrows the canvas, which changes the height,\nso a one-pixel shortfall kept it. On worldfoundry.org the previous version\nshowed the scrollbar in 6 of 6 Chromium loads. Set scrolling="no" on the\nframe when autoHeight is on; pinned-height hosts are unchanged.\n\nAdd a user-guide FAQ and Play icon note, a "Sizing the frame" section in\nthe technical guide, and the 0.1.6 release notes.\n\nAI-Assisted: Claude Code; claude-sonnet-5-5.\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DS7xsYjHjzWXscfvzcVFfL
a8ed92b	author	Will Norris
a8ed92b	added	2
a8ed92b	deleted	2
a8ed92b	files	1
a8ed92b	body	Component-only release. Record the tarball hash and point the install\ninstructions at v0.1.5; the examples ZIP stays with v0.1.4.\n\nAI-Assisted: Claude Code; claude-sonnet-5-5.\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DS7xsYjHjzWXscfvzcVFfL
38289ee	author	Will Norris
38289ee	added	3
38289ee	deleted	3
38289ee	files	1
38289ee	body	Add a responsive chooser, share the host module and illustrated guide, fix return navigation, and verify both unchanged runtimes in Chromium and Firefox. Publish as v0.1.4 with byte receipts and existing corresponding sources.\n\nAI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
d8d20ff	author	Will Norris
d8d20ff	added	2
d8d20ff	deleted	2
d8d20ff	files	1
d8d20ff	body	AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
485dede	author	Will Norris
485dede	added	10
485dede	deleted	2
485dede	files	1
485dede	body	AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
1c57565	author	Will Norris
1c57565	added	2
1c57565	deleted	2
1c57565	files	1
1c57565	body	AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
0615394	author	Will Norris
0615394	added	74
0615394	deleted	0
0615394	files	1
0615394	body	Share shell, lifecycle, input ownership and Astro/vanilla embedding across both runtimes. Add immutable bundle tooling, offline tarball integration and real-browser verification while preserving existing engine and emulator bytes.\n\nAI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
-->
