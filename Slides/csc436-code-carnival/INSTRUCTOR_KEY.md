# Code Carnival Instructor Key

## Booth 1: Ring Toss (`ring-toss/main.js`)

**Bronze:** any change to the four `TODO BRONZE` spots (rim color, `CAR_COUNT`, peg color, `wheel.rotation.z` speed or sign).

**Silver:** step 1 is given; the roof:

```js
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(1.8, 1.5, 4),
  new THREE.MeshStandardMaterial({ color: 0xd62839 })
);
roof.position.set(-3, 2.75, 5);
roof.rotation.y = Math.PI / 4;
scene.add(roof);
```

**Gold:** inside `onPegClicked(peg)`:

```js
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.06, 12, 32),
  new THREE.MeshStandardMaterial({ color: 0xf4b400 })
);
ring.rotation.x = Math.PI / 2;
scene.add(ring);
tossRing(ring, peg);
```

Common misses: a `???` left in (syntax error), no `rotation.x` (ring lands on its edge), no `scene.add` (score rises, no ring, console warning).

## Booth 2: Fun House

**Bronze:** any reasonable Tailwind classes on the second card.

**Silver:**

```html
<input type="radio" name="theme" class="btn theme-controller" aria-label="Valentine" value="valentine" />
<input type="radio" name="theme" class="btn theme-controller" aria-label="Cyberpunk" value="cyberpunk" />
```

Plus two copied cards and one DaisyUI component (rating, progress, stat, or alert).

**Gold:** uncommenting both steps in `funhouse.js` is the full answer. Bonus: `const name = 'animate__' + prize.dataset.anim;` used in both `add` and `remove`.

## Booth 3: Safety Inspector

**Bronze (verbal):** `textContent` puts the string in as plain text, so the browser never parses tags or runs handlers; `innerHTML` parses it as HTML, so visitor text can become markup and run script (XSS). React's `{message}` escapes the same way.

**Silver:**

```js
function validate(name, message) {
  if (name === '') return 'Please enter a name.';
  if (message === '') return 'Please write a message.';
  if (message.length > MAX_MESSAGE) return `Message must be ${MAX_MESSAGE} characters or fewer.`;
  return null;
}
// and in the submit handler:
const name = nameInput.value.trim();
const message = messageInput.value.trim();
```

**Gold (Inspection Cards):**

1. **Leaky Ticket Booth:** secrets go in server-side env vars (`.env`, never committed) and are used only by server code or edge functions. Only the anon/publishable key may ship to the browser (`VITE_` vars are public). The service role key bypasses RLS and must never be in front-end code.
2. **Unlocked Prize Closet:** with RLS off, anyone holding the public anon key can read and change every row. `alter table ... enable row level security;` plus policies such as `using (auth.uid() = user_id)`.
3. **Talking Sign:** `innerHTML` parses the string as HTML. Use `textContent` (or `{value}` in React).
4. **Bottomless Bucket:** validate on the client for friendly messages AND on the server/database (`check` constraints, `not null`, RLS `with check`), because anyone can call the API directly and skip the form.
5. **Open Diary:** add `.env` (and `.env.*`) to `.gitignore`. A pushed key is compromised: **rotate/revoke it immediately**, then remove it from history if needed. Deleting the file later does not help, because old commits still contain it.

**Bonus (RLS):**

```sql
create policy "signed-in users add their own entries"
  on guestbook for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "authors edit their own entries"
  on guestbook for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## Grand Finale (`your-booth/`)

Starters are commented in place: the Gold form (in `index.html`) and its handler (in `booth.js`); students only finish `validate(text)`. The Bonus block has canvas-relative raycasting, because the Ring Toss math (`innerWidth`) is wrong for a canvas that does not fill the window.
