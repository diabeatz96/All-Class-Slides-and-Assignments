# CSC 436 Code Carnival

Three booths and a grand finale. Pure Vite, no React today.

## Run it

```bash
npm install
npm run dev
```

Open the link Vite prints (usually http://localhost:5173), then pick a booth from the midway.
Keep `npm run dev` running. Every time you save a file, the page reloads by itself.

## Booths

| Booth | Time | Edit these files | Topic |
| --- | --- | --- | --- |
| 1. The Ring Toss | ~13 min | `ring-toss/main.js` | Three.js scene, camera, renderer, animation loop, raycasting |
| 2. The Fun House | ~13 min | `fun-house/index.html`, `fun-house/funhouse.js` | Tailwind CSS, DaisyUI components and themes, Animate.css, framework tour (`fun-house/tour.html`) |
| 3. The Safety Inspector | ~13 min | `safety-inspector/guestbook.js`, `safety-inspector/clipboard.md` | Safe rendering, validation, secrets, Row Level Security |
| Grand Finale | 25 min | `your-booth/index.html`, `your-booth/booth.js` | Combine all three into your own attraction |

## How every booth works

1. Each booth page lists its tiers on screen: **Bronze** (1 ticket), **Silver** (2), **Gold** (3), **Bonus** (5 per team).
2. In the code, search for `TODO BRONZE`, `TODO SILVER`, `TODO GOLD`, and `BONUS`. Steps are numbered (B1, B2, S1, G1, ...).
3. Every tier ends with a **Done when** line. That is exactly what you show a volunteer to collect tickets.
4. Do the tiers in order. Each one builds on the one before it.

## Stuck?

- **Blank screen or nothing changed?** Press F12, open the Console tab, and read the red error. It names the file and line.
- **Saved but nothing happened?** Check that `npm run dev` is still running in your terminal.
- **Tailwind or DaisyUI class did nothing?** Check the spelling. A misspelled class gives no error, it just does nothing.
- **Safety Inspector Silver:** type `checkSilver()` in the Console to test your `validate()`.

## Reminder

This project is ESM. Use `import`, never `require()`.
