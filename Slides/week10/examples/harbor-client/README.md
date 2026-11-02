# Harbor Client

A tiny page for watching CORS happen. Every button is a plain `fetch()` from this page's origin to your API.

    npm install
    npm run dev        # http://localhost:5173  (in CORS_ORIGINS: allowed)
    npm run stranger   # http://localhost:5174  (not in the list: blocked)

Open DevTools (F12) on the page. The **Console** tab shows the browser's CORS messages; the **Network** tab shows every request, including the OPTIONS preflight. Keep your API's terminal visible too: it shows which requests actually arrived.

Thursday: paste your Vercel production URL into the box (no slash at the end) and try again. It only works if CORS_ORIGINS on Vercel includes `http://localhost:5173`.
