import { useState, useRef } from "react";
import { T, Code, Slide, Col, Reveal, Tiers, Checklist, Quiz, DeckShell } from "./ui.jsx";

/* ------------------------------------------------------------------
   CSC 436  |  Week 5, Thursday Sep 24  |  Mission 3
   Lists, Keys, Controlled Inputs. Theme: building a playlist.
------------------------------------------------------------------- */

const SEED = [
  { id: 1, title: "Midnight City", artist: "M83", fav: true },
  { id: 2, title: "Redbone", artist: "Childish Gambino", fav: false },
  { id: 3, title: "Dreams", artist: "Fleetwood Mac", fav: false },
];
let NEXT = 100;
const nextId = () => NEXT++;

function SongRow({ song, onRemove, onFav, children }) {
  return (
    <div className="row">
      <div>
        <div style={{ fontWeight: 600, color: T.ink }}>{song.title} {song.fav && <span className="chip" style={{ marginLeft: 6 }}>Favorite</span>}</div>
        <div className="note">{song.artist}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {children}
        {onFav && <button className="btn small" onClick={() => onFav(song.id)}>{song.fav ? "Unfav" : "Fav"}</button>}
        {onRemove && <button className="btn small" onClick={() => onRemove(song.id)}>Remove</button>}
      </div>
    </div>
  );
}

/* 1. Title */
function TitleSlide() {
  const [songs, setSongs] = useState(SEED.slice(0, 2));
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setSongs([...songs, { id: nextId(), title: text.trim(), artist: "Unknown", fav: false }]);
    setText("");
  };
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", padding: "0 80px", gap: 40 }}>
      <div>
        <div className="kicker">CSC 436, Week 5, Mission 3, Thursday Sep 24</div>
        <h1 style={{ fontSize: 66, lineHeight: 1.0, fontWeight: 800 }}>Lists, Keys, Controlled Inputs</h1>
        <p style={{ fontSize: 21, color: T.muted, marginTop: 22, maxWidth: 540, lineHeight: 1.5 }}>
          Every real app is a list of something. Today: an array in state, rendered with map, edited without mutation, fed by a form.
        </p>
      </div>
      <div className="panel" style={{ padding: 24 }}>
        <div className="note" style={{ marginBottom: 8 }}>Playlist ({songs.length})</div>
        {songs.map((s) => <SongRow key={s.id} song={s} />)}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a song" />
          <button className="btn primary" onClick={add}>Add</button>
        </div>
      </div>
    </div>
  );
}

/* 2. Arrays and map */
function MapSlide() {
  const [view, setView] = useState("data");
  return (
    <Slide kicker="Rendering a collection" title="map turns an array of data into an array of elements">
      <Col>
        <Code>{`const songs = [
  { id: 1, title: "Midnight City", artist: "M83" },
  { id: 2, title: "Redbone", artist: "Childish Gambino" },
  { id: 3, title: "Dreams", artist: "Fleetwood Mac" },
]

function Playlist() {
  return (
    <ul>
      {songs.map(song => (
        <li key={song.id}>{song.title} by {song.artist}</li>
      ))}
    </ul>
  )
}`}</Code>
        <div className="note">Same map you used in week 2. The callback returns JSX instead of a number, and React happily renders an array of elements.</div>
      </Col>
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={"tab" + (view === "data" ? " on" : "")} onClick={() => setView("data")}>The array</button>
          <button className={"tab" + (view === "jsx" ? " on" : "")} onClick={() => setView("jsx")}>What map returns</button>
          <button className={"tab" + (view === "ui" ? " on" : "")} onClick={() => setView("ui")}>What renders</button>
        </div>
        {view === "data" && <Code>{`[
  { id: 1, title: "Midnight City", ... },
  { id: 2, title: "Redbone", ... },
  { id: 3, title: "Dreams", ... },
]`}</Code>}
        {view === "jsx" && <Code>{`[
  <li key={1}>Midnight City by M83</li>,
  <li key={2}>Redbone by Childish Gambino</li>,
  <li key={3}>Dreams by Fleetwood Mac</li>,
]`}</Code>}
        {view === "ui" && (
          <div className="panel">
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, fontSize: 17 }}>
              {SEED.map((s) => <li key={s.id}>{s.title} by {s.artist}</li>)}
            </ul>
          </div>
        )}
        <div className="callout good">
          <div className="h">Three things to notice</div>
          The parentheses after the arrow return the JSX. The key sits on the outermost element you return. And the whole map call lives inside curly braces.
        </div>
      </Col>
    </Slide>
  );
}

/* 3. Keys and the index-key bug */
function KeysSlide() {
  const [mode, setMode] = useState("index");
  const [list, setList] = useState([{ id: 1, name: "Song A" }, { id: 2, name: "Song B" }, { id: 3, name: "Song C" }]);
  const reset = () => setList([{ id: 1, name: "Song A" }, { id: 2, name: "Song B" }, { id: 3, name: "Song C" }]);
  return (
    <Slide kicker="Keys" title="A key is how React tells rows apart between renders">
      <Col>
        <Code>{`// Good: a stable id from your data
{songs.map(song => <SongRow key={song.id} song={song} />)}

// Risky: the index changes when items move or are removed
{songs.map((song, i) => <SongRow key={i} song={song} />)}

// Wrong: no key at all. React warns in the console and
// falls back to index behavior anyway.
{songs.map(song => <SongRow song={song} />)}`}</Code>
        <div className="callout">
          <div className="h">Why it matters</div>
          React reuses DOM nodes by key. With index keys, removing the first row makes React think "row 0 changed its text" instead of "row 0 was deleted." Anything the DOM holds on its own, like the text inside an uncontrolled input, stays with the wrong row.
        </div>
      </Col>
      <Col>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className={"tab" + (mode === "index" ? " on" : "")} onClick={() => { setMode("index"); reset(); }}>key = index</button>
          <button className={"tab" + (mode === "id" ? " on" : "")} onClick={() => { setMode("id"); reset(); }}>key = id</button>
          <button className="btn small" onClick={reset}>Reset rows</button>
        </div>
        <div className="panel">
          <div className="note" style={{ marginBottom: 8 }}>Type a note in each box, then remove Song A.</div>
          {list.map((s, i) => (
            <div key={mode === "index" ? i : s.id} className="row">
              <span style={{ fontWeight: 600, color: T.ink, width: 80 }}>{s.name}</span>
              <input className="input" defaultValue="" placeholder="note" style={{ width: 160 }} />
              <button className="btn small" onClick={() => setList(list.filter((x) => x.id !== s.id))}>Remove</button>
            </div>
          ))}
          {list.length === 0 && <div className="note">All gone. Reset to try again.</div>}
        </div>
        <div className="note">With index keys the notes slide up into the wrong rows. With id keys they stay with their song.</div>
      </Col>
    </Slide>
  );
}

/* 4. Controlled input plus a form */
function FormSlide() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLog((l) => [...l, text.trim()].slice(-5));
    setText("");
  };
  return (
    <Slide kicker="Controlled inputs" title="A form is a controlled input plus one submit handler">
      <Col>
        <Code>{`const [text, setText] = useState("")

function handleSubmit(e) {
  e.preventDefault()          // stop the page reload
  if (!text.trim()) return    // ignore empty
  addSong(text.trim())
  setText("")                 // clear the box: set state, not the DOM
}

<form onSubmit={handleSubmit}>
  <input value={text} onChange={e => setText(e.target.value)} />
  <button type="submit">Add</button>
</form>`}</Code>
        <div className="callout">
          <div className="h">Two things students forget</div>
          Without <span className="mono">e.preventDefault()</span> the browser reloads the page and your state is gone. And to clear the box you set the state to "", you never touch <span className="mono">input.value</span>.
        </div>
      </Col>
      <Col>
        <form className="panel" onSubmit={submit}>
          <label className="note">Song title</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Press Enter or click Add" />
            <button className="btn primary" type="submit">Add</button>
          </div>
          <div className="mono note" style={{ marginTop: 10 }}>text state right now: "{text}"</div>
        </form>
        <div className="panel">
          <div className="note" style={{ marginBottom: 6 }}>submitted</div>
          {log.length === 0 ? <div className="note">(nothing yet)</div> : log.map((l, i) => <div key={i} style={{ padding: "4px 0" }}>{l}</div>)}
        </div>
        <div className="note">Press Enter in the box. onSubmit fires for Enter and the button both. That is the whole reason to use a form element.</div>
      </Col>
    </Slide>
  );
}

/* 5. Adding: push vs spread */
function AddSlide() {
  const pushed = useRef([...SEED.slice(0, 1)]);
  const [good, setGood] = useState(SEED.slice(0, 1));
  const [, force] = useState(0);
  return (
    <Slide kicker="Adding" title="Never push. Make a new array that includes the old one.">
      <Col>
        <Code>{`// Broken: same array reference, React sees no change
songs.push(newSong)
setSongs(songs)

// Correct: a brand new array
setSongs([...songs, newSong])

// Correct and safe when adding in a burst
setSongs(prev => [...prev, newSong])`}</Code>
        <div className="callout">
          <div className="h">Same rule as objects on Tuesday</div>
          React compares the old and new value with ===. A pushed array is the same object, so === says "nothing changed" and the render is skipped. Spread creates a new array, === says "different," render happens.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ borderColor: T.warn }}>
          <div className="note" style={{ marginBottom: 6 }}>push then setSongs(songs)</div>
          <div>Rendered rows: <b>{pushed.current.length === 1 ? 1 : 1}</b>, real length: <b>{pushed.current.length}</b> <button className="btn small" onClick={() => force((x) => x + 1)}>peek</button></div>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => { pushed.current.push({ id: nextId(), title: "Pushed song", artist: "Nobody sees this", fav: false }); }}>Add with push</button>
        </div>
        <div className="panel" style={{ borderColor: T.accent }}>
          <div className="note" style={{ marginBottom: 6 }}>setSongs([...songs, newSong])</div>
          {good.map((s) => <SongRow key={s.id} song={s} />)}
          <button className="btn primary" style={{ marginTop: 10 }} onClick={() => setGood([...good, { id: nextId(), title: `Song ${good.length + 1}`, artist: "Spread", fav: false }])}>Add with spread</button>
        </div>
      </Col>
    </Slide>
  );
}

/* 6. Removing: filter */
function RemoveSlide() {
  const [songs, setSongs] = useState(SEED);
  return (
    <Slide kicker="Removing" title="filter keeps everything except the one you name">
      <Col>
        <Code>{`function remove(id) {
  setSongs(songs.filter(song => song.id !== id))
}

// In the row: pass the id up through the click
<button onClick={() => remove(song.id)}>Remove</button>`}</Code>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>Why filter and not splice</div>
          splice edits the array in place, which is mutation. filter returns a new array with the rows you kept. Read it as "keep every song whose id is not this one."
        </div>
      </Col>
      <Col>
        <div className="panel">
          {songs.map((s) => <SongRow key={s.id} song={s} onRemove={(id) => setSongs(songs.filter((x) => x.id !== id))} />)}
          {songs.length === 0 && <div className="note">Playlist is empty.</div>}
        </div>
        <button className="btn small" onClick={() => setSongs(SEED)}>Restore</button>
      </Col>
    </Slide>
  );
}

/* 7. Updating one item */
function UpdateSlide() {
  const [songs, setSongs] = useState(SEED);
  const toggle = (id) => setSongs(songs.map((s) => (s.id === id ? { ...s, fav: !s.fav } : s)));
  return (
    <Slide kicker="Updating one item" title="map over the array, spread the one row that changes">
      <Col>
        <Code>{`function toggleFav(id) {
  setSongs(songs.map(song =>
    song.id === id
      ? { ...song, fav: !song.fav }   // new object for this row
      : song                          // everyone else unchanged
  ))
}`}</Code>
        <div className="callout">
          <div className="h">The pattern is always the same</div>
          New array (map). New object for the changed row (spread). Same reference for the rest. Three lines you will write a hundred times this semester.
        </div>
      </Col>
      <Col>
        <div className="panel">
          {songs.map((s) => <SongRow key={s.id} song={s} onFav={toggle} />)}
        </div>
        <div className="panel" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Favorites</span><span className="num-display">{songs.filter((s) => s.fav).length}</span>
        </div>
        <div className="note">The favorites count is derived with filter. Do not store it.</div>
      </Col>
    </Slide>
  );
}

/* 8. Derived lists: search */
function SearchSlide() {
  const [q, setQ] = useState("");
  const songs = [...SEED, { id: 4, title: "Electric Feel", artist: "MGMT", fav: false }, { id: 5, title: "Dog Days Are Over", artist: "Florence + The Machine", fav: true }];
  const shown = songs.filter((s) => (s.title + s.artist).toLowerCase().includes(q.toLowerCase()));
  return (
    <Slide kicker="Derived lists" title="Search is a filter during render, not a second list in state">
      <Col>
        <Code>{`const [songs, setSongs] = useState(SEED)   // the truth
const [query, setQuery] = useState("")     // what they typed

// computed every render, never stored
const shown = songs.filter(s =>
  s.title.toLowerCase().includes(query.toLowerCase())
)

<input value={query} onChange={e => setQuery(e.target.value)} />
<p>{shown.length} of {songs.length}</p>
{shown.map(s => <SongRow key={s.id} song={s} />)}`}</Code>
        <div className="callout">
          <div className="h">The mistake</div>
          Storing <span className="mono">filteredSongs</span> in state. Now adding a song has to update two arrays and they drift. Two pieces of state, one derived array.
        </div>
      </Col>
      <Col>
        <div className="panel">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or artist" />
          <div className="note" style={{ margin: "10px 0 4px" }}>{shown.length} of {songs.length}</div>
          {shown.map((s) => <SongRow key={s.id} song={s} />)}
          {shown.length === 0 && <div className="note">No matches.</div>}
        </div>
      </Col>
    </Slide>
  );
}

/* 9. Progression stepper */
function ProgressionSlide() {
  const [stage, setStage] = useState(0);
  const stages = [
    { title: "Stage 1: render a hardcoded array", code: `const [songs, setSongs] = useState(SEED)

<ul>
  {songs.map(s => <li key={s.id}>{s.title}</li>)}
</ul>`, demo: <P1 /> },
    { title: "Stage 2: add from a controlled form", code: `const [text, setText] = useState("")

function handleSubmit(e) {
  e.preventDefault()
  setSongs([...songs, { id: Date.now(), title: text }])
  setText("")
}`, demo: <P2 /> },
    { title: "Stage 3: remove with filter", code: `function remove(id) {
  setSongs(songs.filter(s => s.id !== id))
}

<button onClick={() => remove(s.id)}>Remove</button>`, demo: <P3 /> },
    { title: "Stage 4: derived count and empty state", code: `{songs.length === 0
  ? <p>Your playlist is empty. Add a song.</p>
  : <p>{songs.length} songs</p>}`, demo: <P4 /> },
  ];
  const s = stages[stage];
  return (
    <Slide kicker="Progression" title="Hardcoded list to a working playlist in four moves">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {stages.map((_, i) => <button key={i} className={"tab" + (stage === i ? " on" : "")} onClick={() => setStage(i)}>Stage {i + 1}</button>)}
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 600 }}>{s.title}</h3>
        <Code>{s.code}</Code>
      </Col>
      <Col>
        {s.demo}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn small" disabled={stage === 0} onClick={() => setStage(stage - 1)}>Previous stage</button>
          <button className="btn small primary" disabled={stage === stages.length - 1} onClick={() => setStage(stage + 1)}>Next stage</button>
        </div>
      </Col>
    </Slide>
  );
}
function P1() {
  return <div className="panel"><ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>{SEED.map((s) => <li key={s.id}>{s.title}</li>)}</ul></div>;
}
function useList(withRemove) {
  const [songs, setSongs] = useState(SEED);
  const [text, setText] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSongs([...songs, { id: nextId(), title: text.trim(), artist: "You", fav: false }]);
    setText("");
  };
  const remove = withRemove ? (id) => setSongs(songs.filter((s) => s.id !== id)) : undefined;
  return { songs, text, setText, submit, remove };
}
function P2() {
  const L = useList(false);
  return (
    <div className="panel">
      <form onSubmit={L.submit} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input className="input" value={L.text} onChange={(e) => L.setText(e.target.value)} placeholder="Song title" />
        <button className="btn primary" type="submit">Add</button>
      </form>
      {L.songs.map((s) => <SongRow key={s.id} song={s} />)}
    </div>
  );
}
function P3() {
  const L = useList(true);
  return (
    <div className="panel">
      <form onSubmit={L.submit} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input className="input" value={L.text} onChange={(e) => L.setText(e.target.value)} placeholder="Song title" />
        <button className="btn primary" type="submit">Add</button>
      </form>
      {L.songs.map((s) => <SongRow key={s.id} song={s} onRemove={L.remove} />)}
    </div>
  );
}
function P4() {
  const L = useList(true);
  return (
    <div className="panel">
      <form onSubmit={L.submit} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input className="input" value={L.text} onChange={(e) => L.setText(e.target.value)} placeholder="Song title" />
        <button className="btn primary" type="submit">Add</button>
      </form>
      {L.songs.length === 0 ? <div className="note" style={{ padding: "12px 0" }}>Your playlist is empty. Add a song.</div> : <div className="note" style={{ marginBottom: 4 }}>{L.songs.length} songs</div>}
      {L.songs.map((s) => <SongRow key={s.id} song={s} onRemove={L.remove} />)}
    </div>
  );
}

/* 10. Final: playlist builder */
function FinalSlide() {
  const [songs, setSongs] = useState(SEED);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [q, setQ] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSongs([...songs, { id: nextId(), title: title.trim(), artist: artist.trim() || "Unknown", fav: false }]);
    setTitle("");
    setArtist("");
  };
  const remove = (id) => setSongs(songs.filter((s) => s.id !== id));
  const fav = (id) => setSongs(songs.map((s) => (s.id === id ? { ...s, fav: !s.fav } : s)));
  const shown = songs.filter((s) => (!onlyFav || s.fav) && (s.title + s.artist).toLowerCase().includes(q.toLowerCase()));
  const favCount = songs.filter((s) => s.fav).length;
  return (
    <Slide kicker="Target build" title="Playlist Builder: every concept from today, in one component">
      <Col>
        <form className="panel" onSubmit={submit}>
          <div className="note" style={{ marginBottom: 6 }}>Add a song</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <input className="input" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" />
            <button className="btn primary" type="submit" disabled={!title.trim()}>Add</button>
          </div>
        </form>
        <div className="panel">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
            <button className={"tab" + (onlyFav ? " on" : "")} onClick={() => setOnlyFav(!onlyFav)} style={{ whiteSpace: "nowrap" }}>Favorites only</button>
          </div>
          <div className="note" style={{ margin: "10px 0 2px" }}>{shown.length} of {songs.length} shown, {favCount} favorites</div>
          {shown.map((s) => <SongRow key={s.id} song={s} onRemove={remove} onFav={fav} />)}
          {songs.length === 0 && <div className="note" style={{ padding: "12px 0" }}>Your playlist is empty. Add a song above.</div>}
          {songs.length > 0 && shown.length === 0 && <div className="note" style={{ padding: "12px 0" }}>No songs match.</div>}
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.7 }}>
          <div style={{ color: T.accent, fontWeight: 600, marginBottom: 4 }}>Concept checklist inside this one component</div>
          <div>Five pieces of state: songs, title, artist, query, onlyFav</div>
          <div>map with key={"{"}song.id{"}"} to render rows</div>
          <div>Controlled inputs in a form with onSubmit and preventDefault</div>
          <div>Add with spread, remove with filter, toggle with map plus spread</div>
          <div>shown and favCount derived every render, never stored</div>
          <div>Two different empty states chosen with conditionals</div>
        </div>
        <div className="callout">
          <div className="h">Ask the room</div>
          Why is the Add button disabled instead of checking inside submit? Both work. Which one gives the user feedback sooner?
        </div>
      </Col>
    </Slide>
  );
}

/* 11. Assignment */
function AssignmentSlide() {
  const setup = [
    { t: "npm create vite@latest playlist -- --template react", m: true },
    { t: "cd playlist   then   npm install   then   npm run dev", m: true },
    { t: "Empty the return in src/App.jsx, clear src/App.css, leave main.jsx alone", m: false },
    { t: "Start with a hardcoded array of 3 songs, each with id, title, artist", m: false },
    { t: "ESM only. No require(), no module.exports. export default App at the bottom.", m: false },
  ];
  const tiers = [
    { name: "Bronze", text: "Render the hardcoded songs with map. Each row shows title and artist. key uses the id. No console warnings." },
    { name: "Silver", text: "A form with two controlled inputs (title, artist) and a submit handler that adds a song with spread and clears both boxes. Enter key works." },
    { name: "Gold", text: "Remove button on each row using filter. A favorite toggle using map plus spread. A derived favorites count. An empty-state message when the list is empty." },
    { name: "Bonus", text: "A search box that filters during render. A SongRow component in its own file receiving song, onRemove, onFav as props. Sort by title with a toggle." },
  ];
  return (
    <Slide kicker="Assignment: due before you leave" title="Build Your Playlist">
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Set up a fresh project</h3>
        <Checklist items={setup} />
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>Rules of the road</div>
          <div>No push, no splice, no direct assignment into state. If you wrote <span className="mono">songs[0].fav = true</span>, stop and use map.</div>
          <div style={{ marginTop: 6 }}>Use <span className="mono">Date.now()</span> or a counter for new ids. Never the index.</div>
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.5 }}>
          Submit: push to your GitHub Classroom repo and paste the link in Brightspace. Gold counts as complete.
        </div>
      </Col>
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Milestones</h3>
        <Tiers tiers={tiers} />
      </Col>
    </Slide>
  );
}

/* 12. Close quiz */
function CloseSlide() {
  const qs = [
    { q: "Best key for a list of songs from your data?", a: ["the array index", "song.id", "song.title"], c: 1 },
    { q: "Add a song to state. Which is correct?", a: ["songs.push(s); setSongs(songs)", "setSongs([...songs, s])", "setSongs(songs.concat)"], c: 1 },
    { q: "Toggle one song's fav. What does the callback return for the other rows?", a: ["a copy of each", "the same song object", "undefined"], c: 1 },
    { q: "The search results list should be...", a: ["its own useState", "computed with filter in render", "stored in a ref"], c: 1 },
  ];
  return (
    <Slide kicker="Close" title="Four checks before you go" wide>
      <Quiz
        qs={qs}
        footer={
          <div>
            <div style={{ fontSize: 21, fontWeight: 600, color: T.ink }}>Next: the playlist splits into three components that share one list.</div>
            <div className="note">Composition and lifting state. Props down, events up.</div>
          </div>
        }
      />
    </Slide>
  );
}

const SLIDES = [
  { el: <TitleSlide />, notes: "Add a song from the room. Ask: what changed when I hit Add? An array in state got longer and React drew a new row. That is the whole day." },
  { el: <MapSlide />, notes: "Click through the three tabs slowly. Data, elements, pixels. Point out the parentheses after the arrow, and that key goes on the li." },
  { el: <KeysSlide />, notes: "Type a note in all three boxes with index keys, remove Song A, watch the notes shift. Switch to id keys, repeat. This demo sells keys better than any explanation." },
  { el: <FormSlide />, notes: "Deliberate mistake beat: delete e.preventDefault live and hit Enter. Page reloads, state gone. Put it back." },
  { el: <AddSlide />, notes: "Push first, peek, show the real length grew but nothing rendered. Then spread. Tie back to Tuesday's bug 2: same reference, no render." },
  { el: <RemoveSlide />, notes: "Read the filter line out loud as English: keep every song whose id is not this one." },
  { el: <UpdateSlide />, notes: "This is the one they will get wrong on the assignment. Write the three-line pattern on the board and leave it there." },
  { el: <SearchSlide />, notes: "Ask: how many arrays are in state here? One. shown is not state. Same as subtotal on Tuesday." },
  { el: <ProgressionSlide />, notes: "Live-code script. Stages 1 to 4 in order. At stage 3, use splice on purpose, watch nothing happen, then filter." },
  { el: <FinalSlide />, notes: "Add a song from the room, favorite it, search for it, remove it. Walk the checklist. This is the assignment target." },
  { el: <AssignmentSlide />, notes: "Read the rules of the road out loud. Start a 25 minute timer. Circulate for index keys and mutation." },
  { el: <CloseSlide />, notes: "Hands up per question. Q3 catches people who copy every row. Tease next week: SongRow becomes its own component with callbacks." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
