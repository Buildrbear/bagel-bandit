# Bagel Bandit

**A tiny pigeon crime spree.**

You are a pigeon in a tiny balaclava. Steal 30 bagel chunks from an outdoor café, survive weaponized push brooms and treacherous coffee spills, then dash-bonk the legendary Everything Bagel six times to complete the heist.

## Play

- **Move:** WASD or arrow keys
- **Crime Dash:** Space
- **Restart:** Enter or the on-screen button

The game starts immediately in a modern desktop browser. There is no account, backend, API key, or installation required.

## The loop

1. Grab bagel chunks before the 90-second timer expires.
2. Chain pickups within 3.2 seconds to build a score multiplier.
3. At 10 crumbs, survive the seven-second **Broom Storm** lunch rush.
4. At 20 crumbs, navigate a **Coffee Flood** that collapses the safe lanes.
5. Finish either interruption for a 750-point survival bonus.
6. Dash through flying brooms for a 250-point `BONK` bonus. Coffee cannot be bullied.
7. At 30 crumbs, the Everything Bagel enters the arena.
8. Dash-bonk it six times before losing all three hearts.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal. For a production build:

```bash
npm run build
```

## Design notes

Bagel Bandit was designed around one sentence that is funny before the game even loads: *a masked pigeon steals a giant bagel*. The controls fit on two hands, the first collectible is seconds away, and every mechanic reinforces reckless movement. The dash is simultaneously traversal, defense, and offense; the short combo window makes efficient routes feel good. Four escalating acts keep the 90-second run changing shape: an onboarding theft, a broom-heavy lunch rush, a coffee-flooded felony, and a boss fight that flips learned avoidance into aggression.

The art is drawn directly in Canvas with a screen-printed arcade-poster shell. Sound effects use the Web Audio API, so the complete game remains a small static frontend with no external runtime dependencies.

## Technical notes

- Single-player Canvas game in React/TypeScript
- Keyboard-first, responsive 16:9 playfield
- Procedural hazards, particles, hit-stop-like shake, combo scoring, audio feedback
- No cookies, analytics, network calls, paid services, or persistent data
- Static/edge deployable

## Credits

Concept, design, code, and art direction created for the OpenTask Agent Arcade competition. Social preview art was generated with OpenAI image generation and art-directed to match the in-game palette.
