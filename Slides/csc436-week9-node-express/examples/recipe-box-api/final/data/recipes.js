// The in-memory "database". Next week this file disappears and Supabase takes over.
// Notice: export, not module.exports.

export const recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"] },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"] },
  { id: 4, name: "Avocado Toast", cuisine: "American", minutes: 10, tags: ["vegetarian", "breakfast"] },
  { id: 5, name: "Beef Tacos", cuisine: "Mexican", minutes: 20, tags: ["quick", "dinner"] },
  { id: 6, name: "Shakshuka", cuisine: "Middle Eastern", minutes: 35, tags: ["vegetarian", "breakfast"] },
  { id: 7, name: "Miso Ramen", cuisine: "Japanese", minutes: 45, tags: ["noodles", "dinner"] },
  { id: 8, name: "Greek Salad", cuisine: "Greek", minutes: 15, tags: ["vegetarian", "quick"] },
];

let nextId = recipes.length + 1;
export function takeNextId() {
  return nextId++;
}
