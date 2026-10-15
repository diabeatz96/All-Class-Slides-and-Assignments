# CSC 436 Code Carnival

Three booths and a grand finale. Pure Vite, no React today.

## Run it

```bash
npm install
npm run dev
```

Open the link Vite prints, then pick a booth from the midway. Keep `npm run dev` running: every time you save a file, the browser updates by itself.

## Booths

| Booth | Open this file | Topic |
| --- | --- | --- |
| 1. The Ring Toss | `ring-toss/main.js` | Three.js scene, camera, renderer, animation loop, raycasting |
| 2. The Fun House | `fun-house/index.html`, then `fun-house/funhouse.js` | CSS frameworks: Tailwind CSS, DaisyUI components and themes, Animate.css, framework tour |
| 3. The Safety Inspector | `safety-inspector/guestbook.js` | Safe rendering (XSS), validation, secrets, Row Level Security |
| Grand Finale | `your-booth/index.html` and `your-booth/booth.js` | Combine all three into your own attraction |

Look for `TODO BRONZE`, `TODO SILVER`, `TODO GOLD`, and `BONUS` comments in each booth. Every booth page also has a getting-started box and docs links.

## Stuck?

- **Blank page or nothing happens:** open the browser Console (`Cmd+Option+J` on Mac, `Ctrl+Shift+J` on Windows). Red text names the file and line.
- **Uncomment a line:** select it and press `Cmd+/` or `Ctrl+/`.
- **A Tailwind class does nothing:** check the spelling. Tailwind silently ignores names it does not know.
- **Broke everything:** `Cmd+Z` / `Ctrl+Z` until it works again.

Instructors: answer keys are in [INSTRUCTOR_KEY.md](INSTRUCTOR_KEY.md).

## Reminder

This project is ESM. Use `import`, never `require()`.
