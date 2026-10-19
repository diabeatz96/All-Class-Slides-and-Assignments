# Week 9 examples

Requires Node 20.19 or newer (Express 5 and Vite 7). Check with `node -v`.

## recipe-box-api
Your first Express server, built in stages. One file per stage, each runnable on its own.

    cd recipe-box-api
    npm install

| Command | File | What it shows |
|---------|------|---------------|
| npm run oops | stages/00-oops-commonjs.js | Crashes on purpose: require in an ESM project |
| npm run stage1 | stages/01-hello.js | Two text routes, Express's HTML 404 |
| npm run stage2 | stages/02-json.js | res.json, /api/recipes |
| npm run stage3 | stages/03-params.js | /api/recipes/:id, Number(), JSON 404 |
| npm run stage4 | stages/04-query.js | ?cuisine= &maxMinutes= &tag= &q= |
| npm run stage5 | stages/05-post.js | express.json(), POST, validation, 201 / 400 |
| npm run stage6 | stages/06-put-delete.js | PATCH, DELETE, 204, full CRUD |
| npm run stage7 | stages/07-middleware.js | logger, route-level validation, 404 catcher, error handler |
| npm run dev | final/server.js | Same server split into routes/, middleware/, data/ with express.Router and cors |

Tuesday covers stages 0 to 4. Thursday covers 5 to 7 and final.
`requests.http` tests every route (VS Code REST Client extension, or copy into Thunder Client).

## recipe-finder-client
The Week 7 Recipe Finder (same useFetch hook) pointed at http://localhost:3000. Run the API's `npm run dev` in one terminal and this app's `npm run dev` in another.
