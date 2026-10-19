// Every call to OUR server lives in one file.
// Week 7: https://dummyjson.com/recipes
// Week 9: http://localhost:3000/api/recipes   <- your own kitchen

export const API = "http://localhost:3000/api/recipes";

export async function createRecipe(recipe) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.problems ? body.problems.join(", ") : body.error);
  return body;
}

export async function deleteRecipe(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed: HTTP ${res.status}`);
}
