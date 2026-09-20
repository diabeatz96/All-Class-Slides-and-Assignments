import { useState, useRef } from "react";
import { T, Code, Slide, Col, Qty, Reveal, Tiers, Checklist, Quiz, DeckShell } from "./ui.jsx";

/* ------------------------------------------------------------------
   CSC 436  |  Week 5, Tuesday Sep 22  |  Review
   Components, JSX, Props, State, Events, Conditional Rendering
------------------------------------------------------------------- */

/* 1. Title */
function TitleSlide() {
  const [likes, setLikes] = useState(0);
  const [who, setWho] = useState("");
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", padding: "0 80px", gap: 40 }}>
      <div>
        <div className="kicker">CSC 436, Week 5, Tuesday Sep 22</div>
        <h1 style={{ fontSize: 66, lineHeight: 1.0, fontWeight: 800 }}>Everything so far, in one hour</h1>
        <p style={{ fontSize: 21, color: T.muted, marginTop: 22, maxWidth: 540, lineHeight: 1.5 }}>
          Components. JSX. Props. State. Events. Conditional rendering. Today we make sure all of it is solid before we add lists on Thursday.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {["Components", "Props", "State", "Events"].map((c) => <span key={c} className="chip">{c}</span>)}
        </div>
      </div>
      <div className="panel" style={{ padding: "32px" }}>
        <div className="note" style={{ marginBottom: 6 }}>One tiny app that uses all of it</div>
        <input className="input" value={who} onChange={(e) => setWho(e.target.value)} placeholder="Your name" />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
          <button className="btn primary" onClick={() => setLikes(likes + 1)}>Like</button>
          <span className="num-display" style={{ fontSize: 40 }}>{likes}</span>
        </div>
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 17, minHeight: 26 }}>
          {who.trim() ? `${who} liked this ${likes} ${likes === 1 ? "time" : "times"}` : "Type a name to start"}
        </p>
        <div className="note" style={{ marginTop: 14 }}>Question for the room: which parts are state, which are events, which are derived?</div>
      </div>
    </div>
  );
}

/* 2. Component tree explorer */
function TreeSlide() {
  const [sel, setSel] = useState(null);
  const nodes = [
    { id: "app", label: "App", depth: 0, desc: "The root. Owns the cart state. Renders everything below." },
    { id: "header", label: "Header", depth: 1, desc: "Receives the cart count as a prop. Has no state of its own." },
    { id: "menu", label: "Menu", depth: 1, desc: "Receives the items array and an onAdd callback. Maps items to MenuItem." },
    { id: "item1", label: "MenuItem", depth: 2, desc: "Reused. Same component, different props: name, price, onAdd." },
    { id: "item2", label: "MenuItem", depth: 2, desc: "Reused. Same component, different props: name, price, onAdd." },
    { id: "cart", label: "CartSummary", depth: 1, desc: "Receives the cart and computes a total during render. Nothing stored." },
  ];
  const on = (id) => sel === id;
  return (
    <Slide kicker="Components" title="A component is a function that returns UI. Apps are trees of them.">
      <Col>
        <div className="panel">
          {nodes.map((n) => (
            <div key={n.id} className={"hot" + (on(n.id) ? " on" : "")} style={{ marginLeft: n.depth * 26, display: "flex", gap: 10, alignItems: "center" }} onClick={() => setSel(n.id)}>
              <span className="mono" style={{ color: T.blue }}>{"<" + n.label + " />"}</span>
            </div>
          ))}
        </div>
        <div className="panel" style={{ minHeight: 80, fontSize: 16, lineHeight: 1.5 }}>
          {sel ? nodes.find((n) => n.id === sel).desc : <span className="note">Click a node on the tree or a region of the app.</span>}
        </div>
        <div className="note">Rule of thumb: if you would copy and paste it, it is a component. If it needs different data each time, that data is a prop.</div>
      </Col>
      <Col>
        <div className={"hot" + (on("app") ? " on" : "")} onClick={() => setSel("app")} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className={"hot" + (on("header") ? " on" : "")} onClick={(e) => { e.stopPropagation(); setSel("header"); }} style={{ display: "flex", justifyContent: "space-between", background: T.bg }}>
            <b>Corner Cafe</b><span className="chip">Cart: 3</span>
          </div>
          <div className={"hot" + (on("menu") ? " on" : "")} onClick={(e) => { e.stopPropagation(); setSel("menu"); }} style={{ background: T.bg, display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="note">Menu</div>
            {[["item1", "Iced coffee", "$4.50"], ["item2", "Bagel", "$3.25"]].map(([id, n, p]) => (
              <div key={id} className={"hot" + (on(id) ? " on" : "")} onClick={(e) => { e.stopPropagation(); setSel(id); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface }}>
                <span>{n} <span className="note">{p}</span></span><button className="btn small" onClick={(e) => e.stopPropagation()}>Add</button>
              </div>
            ))}
          </div>
          <div className={"hot" + (on("cart") ? " on" : "")} onClick={(e) => { e.stopPropagation(); setSel("cart"); }} style={{ display: "flex", justifyContent: "space-between", background: T.bg }}>
            <span>Total</span><b className="mono">$12.25</b>
          </div>
        </div>
      </Col>
    </Slide>
  );
}

/* 3. JSX rules bug hunt */
function JsxSlide() {
  const [k, setK] = useState(0);
  const cases = [
    {
      label: "One parent",
      code: `function Item() {
  return (
    <h3>Bagel</h3>
    <p>$3.25</p>
  )
}`,
      fix: "Adjacent JSX needs one parent. Wrap in a <div> or a fragment <>...</>.",
    },
    {
      label: "class vs className",
      code: `function Badge() {
  return <span class="chip">New</span>
}`,
      fix: "class is a reserved word in JavaScript. JSX uses className. Same story: for becomes htmlFor.",
    },
    {
      label: "Close every tag",
      code: `function Photo() {
  return <img src="bagel.png">
}`,
      fix: "Every tag closes in JSX. Self-closing tags need the slash: <img src=\"bagel.png\" />, <input />, <br />.",
    },
    {
      label: "JS goes in braces",
      code: `function Price({ amount }) {
  return <p>Price: $amount</p>
}`,
      fix: "Text inside a tag is literal. To print a variable, wrap it in curly braces: <p>Price: ${amount}</p> becomes <p>Price: {amount}</p>. Anything in braces is JavaScript.",
    },
    {
      label: "Component names",
      code: `function menuItem() {
  return <li>Bagel</li>
}

<menuItem />`,
      fix: "Components must start with a capital letter. Lowercase tags are treated as plain HTML elements, so React renders an unknown <menuitem> and shows nothing.",
    },
  ];
  const c = cases[k];
  return (
    <Slide kicker="JSX" title="Spot the error. Five rules that produce ninety percent of red screens.">
      <Col>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cases.map((x, i) => <button key={i} className={"tab" + (k === i ? " on" : "")} onClick={() => setK(i)}>{i + 1}</button>)}
        </div>
        <Code>{c.code}</Code>
      </Col>
      <Col>
        <div className="panel"><div className="note">Rule</div><div style={{ fontSize: 22, fontWeight: 600, color: T.ink }}>{c.label}</div></div>
        <Reveal key={k} label="What is wrong here?">
          <div className="h">Fix</div>
          {c.fix}
        </Reveal>
        <div className="note">Ask the room before revealing. Hands up for what line is broken.</div>
      </Col>
    </Slide>
  );
}

/* 4. Props live */
function MenuItem({ name, price, tag }) {
  return (
    <div className="row" style={{ borderBottom: "none" }}>
      <div>
        <div style={{ fontWeight: 600, color: T.ink }}>{name} {tag && <span className="chip" style={{ marginLeft: 6 }}>{tag}</span>}</div>
        <div className="note">${Number(price || 0).toFixed(2)}</div>
      </div>
      <button className="btn small">Add</button>
    </div>
  );
}
function PropsSlide() {
  const [name, setName] = useState("Iced coffee");
  const [price, setPrice] = useState("4.50");
  const [tag, setTag] = useState("Popular");
  return (
    <Slide kicker="Props" title="Props go down. The child reads them, never changes them.">
      <Col>
        <Code>{`// Parent decides the data
<MenuItem name="${name}" price={${price || 0}} tag="${tag}" />

// Child receives it as one object, destructured
function MenuItem({ name, price, tag }) {
  return (
    <div>
      <b>{name}</b> {tag && <span>{tag}</span>}
      <p>\${price.toFixed(2)}</p>
      <button>Add</button>
    </div>
  )
}`}</Code>
        <div className="callout">
          <div className="h">Props are read-only</div>
          <span className="mono">name = "Bagel"</span> inside the child does nothing useful. If the child needs to change something, the parent owns that value and hands down a function. That is Thursday week after next.
        </div>
      </Col>
      <Col>
        <div className="panel">
          <div className="note" style={{ marginBottom: 6 }}>Parent: edit the props</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" />
            <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="price" />
            <input className="input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag" />
          </div>
        </div>
        <div className="panel" style={{ borderColor: T.blue }}>
          <div className="note" style={{ marginBottom: 6 }}>Child: MenuItem renders whatever it was given</div>
          <MenuItem name={name} price={price} tag={tag} />
        </div>
        <div className="note">Clear the tag field. The badge disappears because <span className="mono">{"{tag && ...}"}</span> guards it.</div>
      </Col>
    </Slide>
  );
}

/* 5. Prop, state, or derived sorting game */
function SortSlide() {
  const cards = [
    { t: "The text the user is typing into the search box", a: "State" },
    { t: "The item name a MenuItem displays", a: "Prop" },
    { t: "The cart subtotal", a: "Derived" },
    { t: "Whether the Place Order button is disabled", a: "Derived" },
    { t: "Pickup or Delivery, chosen by the user", a: "State" },
    { t: "The onAdd function a MenuItem calls when clicked", a: "Prop" },
  ];
  const opts = ["Prop", "State", "Derived"];
  const [ans, setAns] = useState(cards.map(() => null));
  const [checked, setChecked] = useState(false);
  const score = ans.filter((a, i) => a === cards[i].a).length;
  return (
    <Slide kicker="The core question" title="Prop, state, or derived? Sort each one." wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignContent: "start" }}>
        {cards.map((c, i) => {
          const right = checked && ans[i] === c.a;
          const wrong = checked && ans[i] !== null && ans[i] !== c.a;
          return (
            <div key={i} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderColor: right ? T.accent : wrong ? T.warn : T.line }}>
              <span style={{ fontSize: 16 }}>{c.t}</span>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {opts.map((o) => <button key={o} className={"tab" + (ans[i] === o ? " on" : "")} onClick={() => { setAns(ans.map((x, j) => (j === i ? o : x))); setChecked(false); }}>{o}</button>)}
              </div>
            </div>
          );
        })}
        <div className="panel" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
            <b>Prop:</b> given by the parent. <b>State:</b> changes because of the user, and this component owns it. <b>Derived:</b> can be computed from props or state during render, so never stored.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {checked && <span className="num-display" style={{ fontSize: 28, color: score === cards.length ? T.accent : T.ink }}>{score} / {cards.length}</span>}
            <button className="btn primary" onClick={() => setChecked(true)}>Check</button>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 6. useState recap + snapshot rule */
function StateSlide() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const renders = useRef(0);
  renders.current += 1;
  return (
    <Slide kicker="State" title="useState in one line, and the one rule people forget">
      <Col>
        <Code>{`const [qty, setQty] = useState(0)
//     ^ value  ^ setter          ^ initial, used once

// setQty does two things:
//   1. remembers the new value
//   2. re-runs this function (a render)

// Inside ONE render, qty is a snapshot. It never changes.
setQty(qty + 1); setQty(qty + 1)   // ends at 1, not 2
setQty(q => q + 1); setQty(q => q + 1)   // ends at 2`}</Code>
        <div className="callout">
          <div className="h">Never do this</div>
          <span className="mono">qty = qty + 1</span> or <span className="mono">cart.coffee += 1</span>. Mutating is invisible to React. Always go through the setter with a new value.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, textAlign: "center" }}>
          <div>
            <div className="note">setA(a + 1) twice</div>
            <div className="num-display" style={{ fontSize: 48, color: T.warn }}>{a}</div>
            <button className="btn" onClick={() => { setA(a + 1); setA(a + 1); }}>+2 stale</button>
          </div>
          <div>
            <div className="note">setB(b =&gt; b + 1) twice</div>
            <div className="num-display" style={{ fontSize: 48, color: T.accent }}>{b}</div>
            <button className="btn primary" onClick={() => { setB((x) => x + 1); setB((x) => x + 1); }}>+2 functional</button>
          </div>
        </div>
        <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>This slide component has rendered</span>
          <span className="mono num-display" style={{ fontSize: 22 }}>{renders.current}x</span>
        </div>
        <button className="btn small" onClick={() => { setA(0); setB(0); }}>Reset</button>
        <div className="note">Every click bumps the render count. That is React re-running the function, not editing the page in place.</div>
      </Col>
    </Slide>
  );
}

/* 7. Events + controlled inputs */
function EventsSlide() {
  const [good, setGood] = useState("");
  const [count, setCount] = useState(0);
  return (
    <Slide kicker="Events" title="Pass the function. Do not call it. And control your inputs.">
      <Col>
        <Code>{`// Buttons
<button onClick={handleClick}>OK</button>     // passes the function
<button onClick={() => setQty(qty + 1)}>+</button>   // arrow wrapper, also fine
<button onClick={handleClick()}>Broken</button>  // CALLS it during render

// Inputs: value in state, onChange keeps it in sync
const [name, setName] = useState("")
<input value={name} onChange={e => setName(e.target.value)} />

// Forgot onChange? React freezes the input at its value.
<input value={name} />   // you cannot type into this`}</Code>
        <div className="note">The event object <span className="mono">e</span> is the same one you used in vanilla JS. <span className="mono">e.target.value</span>, <span className="mono">e.preventDefault()</span>, all still there.</div>
      </Col>
      <Col>
        <div className="panel">
          <div className="note">Controlled: value and onChange</div>
          <input className="input" value={good} onChange={(e) => setGood(e.target.value)} placeholder="Type here, it works" />
        </div>
        <div className="panel" style={{ borderColor: T.warn }}>
          <div className="note">Frozen: value with no onChange (try typing)</div>
          <input className="input" value="" onChange={() => {}} placeholder="Nothing you type will stick" />
        </div>
        <div className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Clicks handled</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="num-display" style={{ fontSize: 26 }}>{count}</span>
            <button className="btn primary" onClick={() => setCount((c) => c + 1)}>Click</button>
          </div>
        </div>
      </Col>
    </Slide>
  );
}

/* 8. Conditional rendering recap */
function CondSlide() {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState(1);
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <Slide kicker="Conditional rendering" title="Three tools, one trap">
      <Col>
        <Code>{`// 1. Ternary: pick one of two things
{open ? <p>Open</p> : <p>Closed</p>}

// 2. && guard: show or show nothing
{loggedIn && <button>Log out</button>}

// 3. Early return: bail out of the whole component
if (!loggedIn) return <LoginPrompt />

// THE TRAP: numbers are printed, and 0 is falsy
{items && <p>Cart has items</p>}      // renders "0" when empty
{items > 0 && <p>Cart has items</p>}  // fixed`}</Code>
      </Col>
      <Col>
        <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, color: T.ink }}>{open ? "We're open" : "Closed"}</span>
          <button className="btn small" onClick={() => setOpen(!open)}>Toggle</button>
        </div>
        <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{loggedIn ? "Signed in as Adam" : "Guest"}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {loggedIn && <button className="btn small">Log out</button>}
            <button className="btn small primary" onClick={() => setLoggedIn(!loggedIn)}>{loggedIn ? "Sign out" : "Sign in"}</button>
          </div>
        </div>
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>items</span>
            <Qty value={items} onDec={() => setItems(Math.max(0, items - 1))} onInc={() => setItems(items + 1)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <div style={{ background: T.bg, borderRadius: 10, padding: 10, minHeight: 58 }}>
              <div className="note mono" style={{ fontSize: 12 }}>{"{items && ...}"}</div>
              <div style={{ marginTop: 4, fontWeight: 500 }}>{items && <span>Cart has items</span>}</div>
            </div>
            <div style={{ background: T.bg, borderRadius: 10, padding: 10, minHeight: 58 }}>
              <div className="note mono" style={{ fontSize: 12 }}>{"{items > 0 && ...}"}</div>
              <div style={{ marginTop: 4, fontWeight: 500 }}>{items > 0 && <span>Cart has items</span>}</div>
            </div>
          </div>
        </div>
      </Col>
    </Slide>
  );
}

/* 9. Bug hunt */
function BugHuntSlide() {
  const [k, setK] = useState(0);
  const bugs = [
    {
      title: "The button does nothing",
      code: `function Counter() {
  const [n, setN] = useState(0)
  function up() {
    n = n + 1
  }
  return <button onClick={up}>{n}</button>
}`,
      fix: "n is a const snapshot. Assigning to it is an error, and even if it were a let, React would never re-render. Use setN(n + 1).",
      demo: <BugDemo1 />,
    },
    {
      title: "Cart total never changes",
      code: `const [cart, setCart] = useState({ coffee: 0 })
function add() {
  cart.coffee += 1
  setCart(cart)
}`,
      fix: "Same object reference goes into setCart, so React sees no change and skips the render. Make a new object: setCart({ ...cart, coffee: cart.coffee + 1 }).",
      demo: <BugDemo2 />,
    },
    {
      title: "Page freezes on load",
      code: `function Order() {
  const [placed, setPlaced] = useState(false)
  return (
    <button onClick={setPlaced(true)}>Place</button>
  )
}`,
      fix: "onClick={setPlaced(true)} calls the setter during render, which triggers a render, which calls it again. Infinite loop. Pass a function: onClick={() => setPlaced(true)}.",
      demo: <div className="panel note">Not run live for obvious reasons. Ask: what does React do the moment this component renders?</div>,
    },
    {
      title: "Cannot type in the box",
      code: `const [name, setName] = useState("")
return <input value={name} />`,
      fix: "A controlled input needs onChange. Without it, every keystroke is immediately overwritten by the state value. Add onChange={e => setName(e.target.value)}.",
      demo: <div className="panel"><input className="input" value="" onChange={() => {}} placeholder="Try typing" /></div>,
    },
    {
      title: "A random 0 on the page",
      code: `const [count, setCount] = useState(0)
return (
  <>
    {count && <p>You have {count} items</p>}
  </>
)`,
      fix: "0 is falsy, and React renders numbers. The && expression evaluates to 0 and prints it. Use count > 0 && or a ternary.",
      demo: <BugDemo5 />,
    },
  ];
  const b = bugs[k];
  return (
    <Slide kicker="Bug hunt" title="Five bugs you will see in your own project. Diagnose before you reveal.">
      <Col>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {bugs.map((x, i) => <button key={i} className={"tab" + (k === i ? " on" : "")} onClick={() => setK(i)}>Bug {i + 1}</button>)}
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 600 }}>{b.title}</h3>
        <Code>{b.code}</Code>
      </Col>
      <Col>
        {b.demo}
        <Reveal key={k} label="Reveal the fix">
          <div className="h">Diagnosis</div>
          {b.fix}
        </Reveal>
      </Col>
    </Slide>
  );
}
function BugDemo1() {
  const n = useRef(0);
  const [, force] = useState(0);
  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button className="btn primary" onClick={() => { n.current += 1; }}>Broken: {0}</button>
      <span className="note">(the variable is actually {n.current} <button className="btn small" onClick={() => force((x) => x + 1)}>peek</button>)</span>
    </div>
  );
}
function BugDemo2() {
  const cart = useRef({ coffee: 0 });
  const [, force] = useState(0);
  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button className="btn primary" onClick={() => { cart.current.coffee += 1; }}>Add coffee</button>
      <span>Coffee in cart: <b>0</b></span>
      <span className="note">(really {cart.current.coffee} <button className="btn small" onClick={() => force((x) => x + 1)}>peek</button>)</span>
    </div>
  );
}
function BugDemo5() {
  const [count, setCount] = useState(0);
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>count</span>
        <Qty value={count} onDec={() => setCount(Math.max(0, count - 1))} onInc={() => setCount(count + 1)} />
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: 12, marginTop: 12, minHeight: 44, fontWeight: 500 }}>
        {count && <span>You have {count} items</span>}
      </div>
    </div>
  );
}

/* 10. Review lab assignment */
function AssignmentSlide() {
  const setup = [
    { t: "npm create vite@latest tip-splitter -- --template react", m: true },
    { t: "cd tip-splitter   then   npm install   then   npm run dev", m: true },
    { t: "Empty the return in src/App.jsx, clear src/App.css, leave main.jsx alone", m: false },
    { t: "Make a second file src/TipButton.jsx and import it into App. ESM: export default, import ... from", m: false },
  ];
  const tiers = [
    { name: "Bronze", text: "A bill amount input (controlled) and a tip percent shown on screen. Tip amount is derived: bill * percent. Not stored." },
    { name: "Silver", text: "A TipButton component in its own file. Props: percent, active, onSelect. Render it three times (15, 18, 20). Clicking one sets the active percent in App." },
    { name: "Gold", text: "A people counter with + and - (min 1) and a per-person total. If the bill is empty or 0, show \"Enter a bill to start\" instead of the totals." },
    { name: "Bonus", text: "A custom tip input that appears only when a Custom button is active. Round per-person total up to the nearest dollar with a toggle. Reset button." },
  ];
  return (
    <Slide kicker="Review lab: due before you leave" title="Build a Tip Splitter">
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Set up a fresh project</h3>
        <Checklist items={setup} />
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>Before you write code, answer on paper</div>
          <div>What is state in this app? What is a prop? What is derived?</div>
          <div className="note" style={{ marginTop: 6 }}>Hint: there should be exactly three pieces of state at Gold. If you have more, something is derived.</div>
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.5 }}>
          Submit: push to your GitHub Classroom repo and paste the link in Brightspace. Silver counts as complete today, Gold earns the review badge.
        </div>
      </Col>
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Milestones</h3>
        <Tiers tiers={tiers} />
      </Col>
    </Slide>
  );
}

/* 11. Close quiz */
function CloseSlide() {
  const qs = [
    { q: "A MenuItem shows a price passed from App. The price is a...", a: ["state", "prop", "derived value"], c: 1 },
    { q: "Subtotal = qty * price. Where does subtotal live?", a: ["useState", "computed in render", "a global variable"], c: 1 },
    { q: "Which onClick is correct?", a: ["onClick={save()}", "onClick={save}", "onClick=\"save()\""], c: 1 },
    { q: "cart.coffee += 1 then setCart(cart). What renders?", a: ["Updated count", "Nothing changes", "An error"], c: 1 },
  ];
  return (
    <Slide kicker="Close" title="Four checks before Thursday" wide>
      <Quiz
        qs={qs}
        footer={
          <div>
            <div style={{ fontSize: 21, fontWeight: 600, color: T.ink }}>Thursday: arrays in state. Lists, keys, and forms that add to them.</div>
            <div className="note">Bring your tip splitter. We turn the three tip buttons into a list.</div>
          </div>
        }
      />
    </Slide>
  );
}

const SLIDES = [
  { el: <TitleSlide />, notes: "Cold open. Have a student type their name and click Like. Ask the three questions. State: who, likes. Event: onChange, onClick. Derived: the sentence." },
  { el: <TreeSlide />, notes: "Click App first, then a MenuItem. Push on: why is MenuItem reused? Where does the cart live and why not inside MenuItem?" },
  { el: <JsxSlide />, notes: "Rapid fire. 60 seconds per case. Hands up for the broken line, then reveal. Case 5 catches people who think naming is cosmetic." },
  { el: <PropsSlide />, notes: "Edit the props live. Then clear the tag field. Ask: could MenuItem change its own price? No. Plant the lifting state seed for next week." },
  { el: <SortSlide />, notes: "Do this as a whole room vote per card before Check. The subtotal and disabled cards are the ones people get wrong. Repeat: store facts, compute views." },
  { el: <StateSlide />, notes: "Snapshot rule again. Click stale then functional. Point at the render counter every time. This is the bridge to Thursday's array updates." },
  { el: <EventsSlide />, notes: "Have a student try the frozen input. Then explain why: state wins on every render. Preview: Thursday uses e.preventDefault on a form." },
  { el: <CondSlide />, notes: "Quick. Toggle each one. Set items to 0 and let them spot the stray zero without pointing." },
  { el: <BugHuntSlide />, notes: "This is the heart of the review. Pair up, 90 seconds per bug to diagnose, then reveal. Bug 3 is not run live. Bug 2 is the one that will bite them on Thursday with arrays." },
  { el: <AssignmentSlide />, notes: "Read the paper question out loud and make them answer it before npm create. Circulate for derived-stored-as-state. Silver is the bar today." },
  { el: <CloseSlide />, notes: "Hands up per question. Q4 is the setup for Thursday: same reference means no render. Arrays work the same way." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
