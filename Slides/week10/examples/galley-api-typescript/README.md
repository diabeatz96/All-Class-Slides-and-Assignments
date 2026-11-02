# Recipe Box API: TypeScript (Track B), ready to deploy

Same API as `galley-api`, in TypeScript, including the `servings` column from Week 10 (run `add-servings.sql` once if your table does not have it yet).

## Run it on your laptop

1. Node 22.18 or newer. Node runs the `.ts` files directly by erasing the types.
2. Copy `.env.example` to `.env` and fill it in.
3. `npm install`, then `npm run dev`. Check types any time with `npm run typecheck`.

## Deploy it to Vercel

Exactly the same steps as the JavaScript version (see `../galley-api/README.md`): push a copy to your own GitHub account, import it at vercel.com/new, add the three environment variables, deploy.

Vercel finds `app.ts`, compiles it with your project's TypeScript, and turns it into one Vercel Function. `server.ts` is not included.

### The one Track B gotcha

Without this line in `tsconfig.json`, the Vercel build fails with
`error TS2688: Cannot find type definition file for 'node'.`

    "types": ["node"],
    "typeRoots": ["./node_modules/@types"],

It is already in this project's `tsconfig.json`. Copy it into yours.
