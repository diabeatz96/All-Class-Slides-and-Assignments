# Recipe Finder Client (Week 9)

Your Week 7 Recipe Finder, pointed at your own Express server instead of dummyjson.

## Run it (two terminals)

    # terminal 1: the server
    cd ../recipe-box-api
    npm install
    npm run dev          # http://localhost:3000

    # terminal 2: this app
    npm install
    npm run dev          # http://localhost:5173

Try: stop the server (Ctrl + C) and reload the app. The error state from Week 7 shows up. Start it again and click Try again.

`src/useFetch.js` is the exact hook from Week 7. Only the URL in `src/api.js` changed.
