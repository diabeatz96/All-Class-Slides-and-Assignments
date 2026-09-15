# CSC 436, Week 4, Mission 2: useState + Events

Interactive slide deck for Thursday Sep 17. Every slide has a live React component next to the code it demonstrates.

## Run it

    npm install
    npm run dev

Open the URL Vite prints (usually http://localhost:5173) and go full screen in the browser (F11).

## Presenting

- Right arrow, space, or Page Down: next slide
- Left arrow or Page Up: previous slide
- Home: first slide
- N: toggle the instructor note strip for the current slide
- Click the progress bar segments to jump

All slides live in `src/Deck.jsx`. Each slide is its own component and the `SLIDES` array at the bottom controls order and instructor notes.

## Slide list

1. Title, live cart counter
2. Warm-up, the plain variable bug
3. Anatomy of useState
4. Working counter with render log
5. Events and controlled inputs
6. State as the source of truth
7. Conditional rendering and the 0 trap
8. Stale vs functional updates
9. Progression: one counter to a full order builder in four stages
10. Target build: Order Builder
11. Assignment: Build Your Order Builder (Bronze / Silver / Gold / Bonus)
12. Close quiz

This project is ESM throughout. Do not paste `require()` or `module.exports` anywhere.
