# ASSIGNMENT GRIND

An incremental homework game built with TypeScript and Vite for CMPM 121 D1.

## Play the Game

https://imalice77.github.io/CMPM121_D01/

Click to complete homework assignments, purchase upgrades, and unlock automatic production over time.

## Run and Build

- `deno task setup` — install project dependencies.
- `deno task dev` — start the local development server.
- `deno task build` — build the production app.
- `deno task ci` — run project checks.

## Code Structure

- **Game content:** `src/content.ts` defines game content and upgrade data.
- **Game logic:** `src/game.ts` manages game state and gameplay behavior.
- **User interface:** `src/main.ts` handles rendering and player input.
- **Styling:** `src/style.css` defines the visual appearance.

Game content and shared gameplay logic are separated to make the game easier to maintain and extend.

## Design Revision

**Revision:** Improved upgrade tracking by keeping track of purchased quantities.

**Reason:** Tracking purchases makes upgrade ownership and progression easier to manage.

**Result:** The game can display purchased quantities and keep upgrade progress consistent with player actions.

**Related commit:** [Integrate room companions and show purchased counts](https://github.com/imalice77/CMPM121_D01/commit/dc079f2)

## Credits

- **AI-assisted development:** Codex was used to assist with code development.
- **AI-generated visuals:** Visual assets were generated with AI assistance.
- **Fonts and Documentation:** The interface uses [DM Sans](https://fonts.google.com/specimen/DM+Sans) and [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) through Google Fonts, with system sans-serif fallbacks. Asset handling follows the [Vite asset guide](https://vite.dev/guide/assets.html).
- **Starter project:** Tooling adapted from the [CMPM 121 Fall 2026 S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da), which has no explicit repository license. No new license is assigned to that material.
