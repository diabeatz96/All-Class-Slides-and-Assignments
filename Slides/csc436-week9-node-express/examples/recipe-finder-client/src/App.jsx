import { useState } from "react";
import { useFetch } from "./useFetch.js";
import { API, createRecipe, deleteRecipe } from "./api.js";

export default function App() {
  const [q, setQ] = useState("");
  const url = q ? `${API}?q=${encodeURIComponent(q)}` : API;
  const { data, loading, error, refetch } = useFetch(url);

  return (
    <main className="wrap">
      <header>
        <p className="kicker">Recipe Finder, now powered by your own server</p>
        <h1>Recipe Box</h1>
        <p className="muted">
          Fetching from <code>{url}</code>
        </p>
      </header>

      <input className="search" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />

      {loading && <p className="muted">Loading...</p>}
      {error && (
        <div className="error">
          <strong>{error}</strong>
          <button onClick={refetch}>Try again</button>
        </div>
      )}
      {data && !loading && !error && (
        <ul className="list">
          {data.length === 0 && <li className="muted">No matches.</li>}
          {data.map((r) => (
            <li key={r.id} className="row">
              <div>
                <div className="name">{r.name}</div>
                <div className="muted">
                  {r.cuisine}, {r.minutes} min
                </div>
              </div>
              <div className="right">
                {r.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
                <button
                  className="ghost"
                  onClick={async () => {
                    await deleteRecipe(r.id);
                    refetch();
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddRecipe onAdded={refetch} />
    </main>
  );
}

function AddRecipe({ onAdded }) {
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [minutes, setMinutes] = useState("");
  const [problem, setProblem] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setProblem(null);
    try {
      // Number(minutes): inputs give strings, our server wants a number.
      await createRecipe({ name, cuisine, minutes: Number(minutes) });
      setName("");
      setCuisine("");
      setMinutes("");
      onAdded();
    } catch (err) {
      // The server's 400 message, shown to the user.
      setProblem(err.message);
    }
  }

  return (
    <form className="add" onSubmit={submit}>
      <h2>Add a recipe</h2>
      <div className="fields">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
        <input placeholder="Minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        <button type="submit">Add</button>
      </div>
      {problem && <p className="error-text">Server said: {problem}</p>}
    </form>
  );
}
