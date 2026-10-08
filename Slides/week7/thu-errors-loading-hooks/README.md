# CSC 436, Week 7, Thursday Oct 8: Mission 6, Error Handling, Loading UX, Custom Hooks

Interactive deck. Opens with an API Lab on real public APIs (PokéAPI, Deck of Cards, DummyJSON fashion), then Recipe Finder continues. Ends with the Harden Recipe Finder assignment. Also plants the API key slide for Project 4.

## Run it

    npm install
    npm run dev

Open the printed URL (usually http://localhost:5173), then F11 for full screen.

## Presenting

- Right arrow, space, Page Down: next slide
- Left arrow, Page Up: previous slide
- Home: first slide
- N: toggle the instructor note strip
- Click a progress bar segment to jump

Demo slides have a Network delay slider and a Healthy / Failing toggle. The demos use a fake API (src/fakeApi.jsx) so they work without wifi. The live-code stages run against the real API in ../examples/recipe-finder.

The API Lab slides make real requests (open the Network tab). If the wifi dies, every lab slide has a Live API / Backup data switch; backup answers from fixtures in src/apiLab.jsx with the same JSON shapes.

Slides live in src/Deck.jsx, API Lab slides in src/LabSlides.jsx. Shared theme and helpers are in src/ui.jsx. The student handout is the DOCX in this folder.

## Slides

1. Title: api lab, errors, loading, hooks
2. API Lab 1: Pokédex on PokéAPI (live search, random, 404, cries)
3. API Lab 2: the five steps of every call, stepped one at a time (Pokémon / Cards / Fashion)
4. API Lab 3: Deck of Cards war game, sequential awaits (deck_id needed for draw)
5. API Lab 4: Fashion fit check on DummyJSON, one at a time vs Promise.all with a timing chart
6. Picking an API: six questions plus live tryouts (CORS block, key required, rate limit)
7. Reading docs: scan order on a mock PokéAPI docs page, URL builder
8. JSON treasure hunt: click the real response tree, get the code path
9. Warm-up: rate the error message (1 to 3)
10. Four ways a fetch fails
11. Retry button and automatic retries with backoff (live)
12. Loading UX: text vs skeleton vs keep old data (live)
13. The smell: three copies of the same effect
14. Extract useFetch in four cuts
15. Payoff: search plus detail, two useFetch calls (live)
16. Why an API key cannot live in React code
17. Assignment: Harden Recipe Finder
18. Close quiz

ESM throughout. No require() or module.exports.
