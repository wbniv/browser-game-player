# Playing a game

Browser Game Player supplies the game screen, controls, loading messages and menu. The game decides what its buttons do. World Foundry games and SNES ROMs use the same player, with controls appropriate to each game.

## See the player

![World Foundry Baseline running in the browser, with the joystick and compact control strip below the game](user-guide-assets/worldfoundry-desktop.png)

**World Foundry Baseline:** the game fills the main area; movement, fullscreen and menu sit on the left, with camera, close dialogue and Select on the right.

![Doom Fire running after its title screen, with the SNES controls below the flames](user-guide-assets/snes-desktop.png)

**SNES Doom Fire:** the flames shown here are the running demo, after its title screen. The game keeps its original screen proportions, with SNES buttons underneath.

## Start and fullscreen

Press **Play**. On some pages a small icon (a triangle alternating with a temple, controller or cube) cycles in front of the label; it is decoration only and stays still if your system asks for reduced motion. A title screen can appear before the game downloads. Some pages start automatically; those normally stay inline until you choose fullscreen from the menu. Manual Play requests fullscreen only when the page has enabled it. If the browser declines, you can still play inline.

Click or tap the game to give it keyboard focus. The first interaction also enables browser audio where the runtime supports audio. On a phone, landscape orientation usually gives the game more room. Black margins around a SNES screen preserve its shape; they are not touch controls.

```mermaid
flowchart LR
  Page[Open the game page] --> Play[Press Play]
  Play --> Load[Wait for loading]
  Load --> Game[Play the game]
  Play --> Fullscreen[Fullscreen if enabled and allowed]
  Fullscreen --> Game
  Game --> Inline[Leave fullscreen to play inline]
  Inline --> Game
```

## Controls

The joystick is a plain circle with a movable center. Drag the circular joystick to move; release it to stop. You can hold an action with another finger. The labels beside the joystick are the selected game's actions. Keyboard input belongs to the focused game; release a held key before switching to another player.

![Annotated mockup of World Foundry and SNES control strips: plain joystick on the left, compact fullscreen and menu buttons, game actions on the right](user-guide-assets/controls-reference.svg)

*Illustrated control reference. The layout wraps on narrow screens; actual game action labels can vary.*

| World Foundry default | Keyboard |
|---|---|
| Move/turn | Arrow keys, I/J/K/L or W/A/S/D |
| Select/interact | Space |
| Camera | 2 |
| Close dialogue | 3 |

These are common defaults, not a promise that every level assigns the same actions. Read that game's menu help. Dialogue controls and optional reduced motion are game-specific. The film-camera button changes the in-game camera; it does not record video.

| SNES control | Keyboard |
|---|---|
| D-pad | Arrow keys |
| B / A | Z / X |
| Y / X | A / S |
| L / R | Q / W |
| Start / Select | Enter / Shift |

The SNES screen provides the corresponding circular buttons, including **ST** for Start and **SE** for Select. Some ROMs also draw their own clickable navigation arrows. SNES gamepad support is not implemented by this adapter.

### On a phone

![Doom Fire in a phone-sized browser viewport, with a plain joystick and the SNES controls wrapped below the flames](user-guide-assets/snes-phone.png)

The joystick stays on the left. The action buttons wrap so they remain easy to tap. This is a phone-sized browser view; landscape gives the game more room. Use the compact fullscreen button to expand the player.

## Menu, pause and restart

Open the menu for control help, fullscreen, restart and any game-specific actions. Opening it pauses gameplay. Closing it returns focus to the game and resumes. Moving focus away or hiding the page releases held input and pauses; click or tap the game to continue. Escape closes the menu first, then leaves fullscreen or releases game focus.

**Restart** asks for confirmation and reloads the game. Current progress is lost. The component does not provide saved games or save states. Leaving the page or choosing another game removes the old runtime frame.

```mermaid
flowchart TD
  Playing[Playing] -->|Open menu| Menu[Paused with menu open]
  Menu -->|Close menu| Playing
  Playing -->|Switch tab or move focus away| Paused[Paused with held controls released]
  Paused -->|Click or tap the game| Playing
  Menu -->|Choose Restart| Confirm{Confirm restart?}
  Confirm -->|Cancel| Menu
  Confirm -->|Confirm| Reload[Reload game and lose current progress]
  Reload --> Playing
```

**Verify fidelity**, when present on a SNES game, runs the ROM's published self-check against the emulator's memory. Ordinary checks restart the emulated machine and can interrupt play. A pass confirms that particular check, not every possible interaction. A benchmark ROM may label its action **Verify benchmark** instead.

## Downloadable examples

The [release page](https://github.com/wbniv/browser-game-player/releases) supplies one **`browser-game-player-examples-0.1.4.zip`** download (published with v0.1.4; later component-only releases leave it unchanged). Its starting page offers both examples:

- **SNES Doom Fire:** one 32 KiB homebrew ROM, emulator and player; its fidelity check runs 500 frames and expects `0x3C59`. The ROM is bundled with the runtime so you can try the player directly.
- **World Foundry Baseline:** one standalone level, engine and player. The engine is reused; its preload contains only this level.

Unzip the combined download, open a terminal in the extracted directory, and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://localhost:8000/**, choose **Baseline** or **Doom Fire**, and press Play. Use **All examples** to return to the starting page. Stop the server with Ctrl+C. These are static websites, not native installers. Opening `index.html` directly with a `file:` URL will not reliably load WebAssembly or game files. No Node, compiler, Emscripten SDK or internet access is required to play the extracted example.

## Frequently asked questions

**Do I need to install anything?** No. Games run in a recent browser page. Only the [downloadable examples](#downloadable-examples) need a small local web server, because browsers will not reliably load WebAssembly from a `file:` page.

**Does it save my progress?** No. The player has no saved games or save states, and **Restart** (after you confirm) reloads the game and loses current progress. A game page may say more about its own progress.

**Which keys or buttons do I use?** It depends on the game. Open the menu for that game's control help. On a phone, use the on-screen joystick and buttons. Gamepad support is listed in a game's menu help where the game provides it.

**Why does the game pause when I switch tabs or click elsewhere?** To release held keys and stop the game running unseen. Click or tap the game to continue.

**Why are there black bars around a SNES game?** They keep the console's original screen shape. They are not touch controls.

**Why does a game open inline instead of fullscreen?** Fullscreen is only requested when the page enables it, and your browser may decline. Use the menu's fullscreen action, or play inline.

**Why do I see a scrollbar inside the game frame, or a large empty band under it?** That is a layout problem on the page, not something you need to fix. Reload the page; if it persists, report it with the page address and your browser. Site owners: see [Sizing the frame](technical-guide.md#sizing-the-frame).

**Which browsers work?** The player has been tested in Chromium and Firefox, including phone-sized touch views. It has not been tested on physical phones or Apple devices, so those are not promised.

More fixes are in the next section.

## If something goes wrong

| Symptom | Try |
|---|---|
| Loading error | Check your connection or local server, then press Retry and Play again. |
| Keys scroll the page or do nothing | Click/tap the game to focus it; check its menu help. |
| Game paused after changing tabs | Click/tap the game to resume. |
| Fullscreen does not open | Use the menu's fullscreen action with a click/tap, or play inline. |
| No audio | Interact with the game and check browser/device mute; some levels have no bundled sound. |
| Verification takes time | Let the indicated check finish; native emulation speed varies by browser/device. |

If reporting a bug, include the page URL, browser/device, game, the action that caused it and the loading message. A screenshot helps with layout problems. The player has been tested in Chromium and Firefox with phone-sized touch viewports; these checks are not physical-phone or Apple certification.
