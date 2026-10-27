-- THURSDAY DEMO: the schema changes. Run in the Supabase SQL Editor.
-- A new, OPTIONAL column: how many people a recipe feeds.
-- Optional means existing rows get null (nothing) instead of breaking.
alter table public.recipes
  add column servings integer check (servings > 0);

-- Give a few recipes a value so there is something to see.
update public.recipes set servings = 2 where name in ('Pad Thai', 'Miso Ramen');
update public.recipes set servings = 4 where name = 'Margherita Pizza';

select id, name, servings from public.recipes order by id;

-- After running this: regenerate your types (npm run types),
-- then hover Recipe in VS Code. servings is now `number | null`.
