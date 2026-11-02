-- RECIPE BOX: run this ONCE in your Supabase project.
-- Dashboard, left sidebar: SQL Editor, then New query. Paste all of it. Click Run.
--
-- Read it top to bottom. Every block is one idea.

-- 1. THE TABLE. One row per recipe, one column per field.
--    Each column has a name, a type, and rules.
create table public.recipes (
  id          bigint generated always as identity primary key,  -- the database picks the id
  name        text not null,                                     -- text, required
  cuisine     text not null,                                     -- text, required
  minutes     integer not null check (minutes > 0),              -- whole number, required, above 0
  tags        text[] not null default '{}',                      -- a list of text, empty if you send none
  created_at  timestamptz not null default now()                 -- filled in automatically
);

-- 2. LOCK THE FRONT DOOR. Row Level Security with no rules means
--    the public key gets nothing. (We write rules in Week 12, with login.)
alter table public.recipes enable row level security;

-- 3. HAND OUT THE KEYS. Only the kitchen (our Express server, using the
--    SECRET key) may read and write this table. Nobody else.
revoke all on public.recipes from anon, authenticated;
grant select, insert, update, delete on public.recipes to service_role;

-- 4. STOCK THE PANTRY. The same 8 recipes we kept in memory last week.
--    No ids here: the database numbers them 1 to 8 for us.
insert into public.recipes (name, cuisine, minutes, tags) values
  ('Margherita Pizza',     'Italian',        25, array['vegetarian', 'oven']),
  ('Chicken Tikka Masala', 'Indian',         50, array['spicy', 'dinner']),
  ('Pad Thai',             'Thai',           30, array['noodles', 'dinner']),
  ('Avocado Toast',        'American',       10, array['vegetarian', 'breakfast']),
  ('Beef Tacos',           'Mexican',        20, array['quick', 'dinner']),
  ('Shakshuka',            'Middle Eastern', 35, array['vegetarian', 'breakfast']),
  ('Miso Ramen',           'Japanese',       45, array['noodles', 'dinner']),
  ('Greek Salad',          'Greek',          15, array['vegetarian', 'quick']);

-- 5. CHECK YOUR WORK. You should see 8 rows below when this finishes.
select * from public.recipes order by id;
