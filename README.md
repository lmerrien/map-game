# Allégeance

A persistent multiplayer game of lords, vassals and shifting oaths, inspired by *Diplomacy*.

**Status: phase 1.** The former single-file sandbox now runs as a small server plus a browser client.
One game, one hot-seat browser (you still give every realm's orders). Several players come in phase 2.
The old toy game is kept in `legacy/`.

## Run it

Needs Node 18 or newer. No dependencies.

```
npm start            # http://localhost:3000
npm test             # engine + API smoke test (Node only)
```

Environment variables: `PORT` (default 3000), `DATA_DIR` (default `./data`, where `game.json` is saved),
`ALLEGEANCE_KEY` (optional access key; then open the page as `/?key=YOUR_KEY`).

## How it is built

- `public/index.html`: the whole client, including the rules engine (physics, territory, provinces, titles, levies).
- `engine/engine.js`: runs that same script on the server in a Node `vm` with a stub page, so the server resolves a turn with exactly the code the browser runs.
- `server.js`: static files plus `GET/PUT /api/game`, `POST /api/run`, `GET /api/health`. The game is saved to `data/game.json`.
- When you press *Run turn*, the browser sends its state, the server resolves the turn and saves it, then the browser replays the turn and compares its result with the server's (the status line says whether they are in step). The server's result wins.
- `test/parity.mjs` (needs Playwright) checks that browser and server agree over several turns.

## Next (phase 2)

Seats and access for several players, hidden treasuries and orders, orders checked per realm, turn closing by deadline or when all are ready. See the project's server plan.

## Deploy

Any Node host works (Render, Fly, a VPS): start command `node server.js`, and a persistent disk for `DATA_DIR`. Set `ALLEGEANCE_KEY` before sharing the link.
