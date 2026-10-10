# v0.1.4 — one download for both examples

Download **browser-game-player-examples-0.1.4.zip** (3,236,164 bytes). Extract it, run `python3 -m http.server 8000 --bind 127.0.0.1` in that directory, and open http://localhost:8000/. The starting page offers **Baseline** (World Foundry) and **Doom Fire** (SNES). Each game has an **All examples** link back to the chooser. No Node, compiler, SDK or internet is needed after extraction.

The ZIP shares one host module, illustrated player guide and guide assets. Runtime bundles retain independent integrity receipts. Native engine/emulator/game bytes and matching v0.1.3 source snapshots are unchanged. Source archives remain separate from the runnable download and keep their original v0.1.3 filenames. The component tarball includes the illustrated guides and corrected lifecycle diagram.

The exact extracted ZIP passes Chromium 154.0.8037.57 and Firefox 148.0.2 checks in Ubuntu 24.10: chooser, deferred downloads, startup/fullscreen, keyboard input/release, menu pause/resume, return navigation and desktop/phone layout. Both browsers capture actual Doom Fire flames after the title screen with arrow-free joystick circles. Eight integrity/configuration checks and JavaScript syntax checks pass. The packed package verifies both frozen bundles. v0.1.3's 500-frame `0x3C59` fidelity witnesses apply to the identical native bytes; that long check was not repeated for this packaging change.

[User guide](user-guide.md) · [Technical guide](technical-guide.md) · [Example build instructions](../examples/README.md) · [Hashes and browser results](release-0.1.4.json).

Phone-sized views are emulated. This does not claim physical-phone, Apple, all-ROM or sustained-performance coverage. Existing releases stay immutable; website production deployments are unchanged.

AI-Assisted: Codex CLI 0.162.0; gpt-6.1-sol; reasoning effort medium.
