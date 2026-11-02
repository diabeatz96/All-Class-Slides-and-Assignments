# Recipe Box API: ready to deploy

This folder is checkpoint 15 laid out like a real repo: `app.js` at the top level, ready for Vercel.

## Run it on your laptop

1. Node 22.18 or newer (`node -v`).
2. Copy `.env.example` to `.env` and fill it in (SUPABASE_URL, SUPABASE_SECRET_KEY, PORT, CORS_ORIGINS).
3. `npm install`, then `npm run dev`. Open http://localhost:3000/api/health

## Deploy it to Vercel

Vercel's free (Hobby) plan cannot deploy a **private repo owned by a GitHub organization**, and GitHub Classroom repos are exactly that. So you deploy a copy that lives in **your own** GitHub account.

1. Check that your secrets are not in git. This must print nothing:

        git ls-files .env

   If it prints `.env`: run `git rm --cached .env`, commit, and make a NEW secret key in Supabase (the old one is in your history forever).

2. On github.com, create a new **empty, private** repo in your own account (do not add a README). Then:

        git remote add personal https://github.com/YOUR-USERNAME/recipe-box-api.git
        git push personal main

3. Go to vercel.com/new (sign in with GitHub). Import the repo from your own account. Vercel detects Express on its own. No build command, no vercel.json.
4. **Before you click Deploy**, open Environment Variables and add:

   | Name | Value |
   |------|-------|
   | SUPABASE_URL | your Project URL |
   | SUPABASE_SECRET_KEY | your `sb_secret_...` key |
   | CORS_ORIGINS | `http://localhost:5173` for now (comma separated; no slash at the end) |

   You do not need PORT on Vercel. Nothing listens there: Vercel calls your app for each request.

5. Click Deploy. Then open `https://YOUR-PROJECT.vercel.app/api/health`. You should see `"runningOn": "vercel"`.
6. Change `@base` in `requests.http` to your production URL and run every request.

## After that

- To redeploy your code: `git push personal main` (and `git push` to Classroom for grading).
- Changed an environment variable in Vercel? It only applies to NEW deployments. Redeploy.
- A link shows a Vercel login page? You opened a protected deployment URL. Use your short production domain (`your-project.vercel.app`) instead.
- `/api/health` on Vercel says `"runningOn": "your laptop"`? Vercel's system variables (like `VERCEL=1`) are not exposed to your project. In Project Settings, Environment Variables, check "Enable access to System Environment Variables", then redeploy.

## Why this works with no code changes

Vercel looks for `app.js` (or `index.js` / `server.js`) that imports express and does `export default app`. It turns that file into one Vercel Function. `server.js` is not even included: it is only for your laptop.
