// Code for the live playground slides. Kept in one file so it can be tested.

export const CONSOLE = `declare const console: { log(...data: unknown[]): void; error(...data: unknown[]): void };
`;

/* ---------- Slide 5: labels on values ---------- */
export const P_VALUES = [
  {
    label: "Start here",
    code: `let minutes: number = 25;
minutes = 30;
minutes = "forty";

let name = "Pad Thai";
name = 12;

const tags: string[] = ["noodles", "dinner"];
tags.push(5);

const vegetarian: boolean = true;
`,
  },
  {
    label: "Fixed",
    code: `let minutes: number = 25;
minutes = 30;
minutes = 40;

let name = "Pad Thai";
name = "Pad See Ew";

const tags: string[] = ["noodles", "dinner"];
tags.push("quick");

const vegetarian: boolean = true;
`,
  },
];

/* ---------- Slide 6: shapes of objects ---------- */
const RECIPE_TYPE = `type Recipe = {
  id: number;
  name: string;
  minutes: number;
  tags: string[];
};
`;
export const P_OBJECTS = [
  {
    label: "A typo",
    code: `${RECIPE_TYPE}
const pizza: Recipe = {
  id: 1,
  name: "Margherita Pizza",
  minuts: 25,
  tags: ["oven"],
};

console.log(pizza.cuisine);
`,
  },
  {
    label: "Something missing",
    code: `${RECIPE_TYPE}
const pizza: Recipe = {
  id: 1,
  name: "Margherita Pizza",
  minutes: 25,
};

console.log(pizza.name);
`,
  },
  {
    label: "Fixed",
    code: `${RECIPE_TYPE}
const pizza: Recipe = {
  id: 1,
  name: "Margherita Pizza",
  minutes: 25,
  tags: ["oven"],
};

console.log(pizza.minutes);
`,
  },
];

/* ---------- Slide 7: maybe there, maybe not ---------- */
export const P_MAYBE = [
  {
    label: "Start here",
    code: `type Recipe = {
  name: string;
  servings: number | null; // a number, or nothing
  notes?: string;          // this key might be missing
};

const ramen: Recipe = { name: "Miso Ramen", servings: null };

const forTwo = ramen.servings * 2;

if (ramen.servings !== null) {
  const forFour = ramen.servings * 2;
}

console.log(ramen.notes.toUpperCase());
`,
  },
  {
    label: "Fixed",
    code: `type Recipe = {
  name: string;
  servings: number | null; // a number, or nothing
  notes?: string;          // this key might be missing
};

const ramen: Recipe = { name: "Miso Ramen", servings: null };

if (ramen.servings !== null) {
  const forTwo = ramen.servings * 2;
}

if (ramen.servings !== null) {
  const forFour = ramen.servings * 2;
}

console.log(ramen.notes?.toUpperCase());
`,
  },
];

/* ---------- Slide 8: functions ---------- */
export const P_FUNCTIONS = [
  {
    label: "Start here",
    code: `function findRecipe(id: number): string | undefined {
  return id === 3 ? "Pad Thai" : undefined;
}

const fromUrl = "3"; // req.params.id is always text

findRecipe(fromUrl);
findRecipe(Number(fromUrl));

function totalMinutes(times: number[]): number {
  return times.reduce((sum, m) => sum + m, 0);
}

const total = totalMinutes([25, 30, "10"]);
`,
  },
  {
    label: "Fixed",
    code: `function findRecipe(id: number): string | undefined {
  return id === 3 ? "Pad Thai" : undefined;
}

const fromUrl = "3"; // req.params.id is always text

const found = findRecipe(Number(fromUrl));

function totalMinutes(times: number[]): number {
  return times.reduce((sum, m) => sum + m, 0);
}

const total = totalMinutes([25, 30, 10]);
`,
  },
];

/* ---------- Slide 9: checking with typeof ---------- */
export const P_NARROW = [
  {
    label: "Start here",
    code: `function shout(value: unknown) {
  return value.toUpperCase();
}

function shoutSafely(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return "not text";
}

function trustMe(value: any) {
  return value.toUpperCase();
}

trustMe(42); // no red here, but this crashes when it runs
`,
  },
  {
    label: "Like validateRecipe",
    code: `function checkMinutes(minutes: unknown): string[] {
  const problems: string[] = [];
  if (typeof minutes !== "number" || minutes <= 0) {
    problems.push("minutes must be a positive number");
  }
  return problems;
}

const fromThunderClient: unknown = "forty";
const problems = checkMinutes(fromThunderClient);
`,
  },
];

/* ---------- Slide 13: a typed Supabase-style client (simplified) ---------- */
export const SUPA_PRELUDE = `${CONSOLE}
type Recipe = { id: number; name: string; cuisine: string; minutes: number; tags: string[]; created_at: string };
type NewRecipe = { id?: never; name: string; cuisine: string; minutes: number; tags?: string[]; created_at?: string };
type RecipeChanges = { id?: never; name?: string; cuisine?: string; minutes?: number; tags?: string[]; created_at?: string };
type Result<T> = { data: T; error: null } | { data: null; error: { code: string; message: string } };
interface Query<T> extends PromiseLike<Result<T>> {
  eq<C extends "created_at" | "cuisine" | "id" | "minutes" | "name" | "tags">(column: C, value: Recipe[C]): Query<T>;
  lte<C extends "created_at" | "cuisine" | "id" | "minutes" | "name" | "tags">(column: C, value: Recipe[C]): Query<T>;
  ilike(column: "name" | "cuisine", pattern: string): Query<T>;
  order(column: keyof Recipe): Query<T>;
  select(): Query<T>;
  single(): Query<T extends (infer R)[] ? R : T>;
  maybeSingle(): Query<(T extends (infer R)[] ? R : T) | null>;
}
declare const supabase: {
  from(table: "recipes"): {
    select(columns?: "*"): Query<Recipe[]>;
    insert(row: NewRecipe): Query<Recipe[]>;
    update(changes: RecipeChanges): Query<Recipe[]>;
    delete(): Query<Recipe[]>;
  };
};
`;

export const P_CLIENT = [
  {
    label: "Three mistakes",
    code: `const idFromUrl = "3"; // req.params.id is text

const { data, error } = await supabase
  .from("recipes")
  .select("*")
  .eq("id", idFromUrl)
  .maybeSingle();

await supabase.from("recipes").insert({
  name: "Ramen",
  cuisine: "Japanese",
  minutes: "40",
});

await supabase.from("recipes").select("*").eq("cusine", "Thai");
`,
  },
  {
    label: "Sending an id",
    code: `const saved = await supabase
  .from("recipes")
  .insert({ id: 99, name: "Ramen", cuisine: "Japanese", minutes: 40 })
  .select()
  .single();
`,
  },
  {
    label: "Forgot about null",
    code: `const { data, error } = await supabase
  .from("recipes")
  .select("*")
  .eq("id", 99)
  .maybeSingle();

if (error) throw error;
console.log(data.name);
`,
  },
  {
    label: "All fixed",
    code: `const id = Number("3"); // Number(req.params.id)

const { data, error } = await supabase
  .from("recipes")
  .select("*")
  .eq("id", id)
  .maybeSingle();

if (error) throw error;
if (data) console.log(data.name);

await supabase.from("recipes").insert({
  name: "Ramen",
  cuisine: "Japanese",
  minutes: 40,
});

await supabase.from("recipes").select("*").eq("cuisine", "Thai");
`,
  },
];
