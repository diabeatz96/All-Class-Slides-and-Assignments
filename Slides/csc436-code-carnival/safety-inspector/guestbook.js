// BOOTH 3: THE SAFETY INSPECTOR
// Golden rule of the midway: treat everything a visitor types as plain text,
// never as code or markup.
//
// HOW TO WORK THIS BOOTH
//   Follow the Booth Tickets list on the page, top to bottom. Every tier ends with "DONE WHEN".
//   Save this file after each change. Vite reloads the page, which also clears the guestbook.

const form = document.querySelector('#guest-form');
const nameInput = document.querySelector('#name');
const messageInput = document.querySelector('#message');
const entriesEl = document.querySelector('#entries');
const errorEl = document.querySelector('#error');

const entries = [];

// ---------- BRONZE (1 ticket): SEE WHY WE USE textContent ----------
//   B1. Sign the guestbook with name  Ada  and message  <b>Hello</b>
//       You see the tags printed as plain text. That is SAFE.
//   B2. Change SAFE_MODE below to false and save. Sign again with  <b>Hello</b>
//       Now "Hello" is bold. The browser read the visitor's text as HTML.
//   B3. Still unsafe? Sign with this message:
//         <img src="x" onerror="alert('The sign is talking!')">
//       A popup appears. A visitor just ran their own JavaScript on YOUR page. That is XSS.
//       On a real site, that script could read every visitor's session and act as them.
//   B4. Change SAFE_MODE back to true, save, and try the same message. It shows as plain text.
//   DONE WHEN: SAFE_MODE is true again and you can tell the inspector, in one sentence, why
//              textContent stopped the popup and innerHTML did not.
//              (Hint: one of them parses the string as markup. The other never does.)
const SAFE_MODE = true;

function renderEntries() {
  entriesEl.replaceChildren(); // clear old entries

  for (const entry of entries) {
    const row = document.createElement('div');
    row.className = 'entry';

    if (SAFE_MODE) {
      // SAFE: textContent always treats the value as text. The browser never parses it as HTML.
      // React does this same safe thing for you whenever you write {message} in JSX.
      const who = document.createElement('strong');
      who.textContent = entry.name;

      const what = document.createElement('p');
      what.textContent = entry.message;

      row.append(who, what);
    } else {
      // UNSAFE: innerHTML parses the string as markup, so visitor text becomes real HTML.
      // Never ship this. It is only here so you can see the bug for yourself.
      row.innerHTML = `<strong>${entry.name}</strong><p>${entry.message}</p>`;
    }

    entriesEl.append(row);
  }
}

// ---------- SILVER (2 tickets): VALIDATION ----------
// Validation keeps bad data out. On a real app you validate on the client
// for a nice experience AND on the server (or with database constraints)
// because anyone can skip your front end and call the API directly.
//
//   S1. In the submit handler below, add .trim() to both values (trim removes spaces at the ends).
//   S2. Fill in validate(). Check in this order and return the EXACT text shown:
//         - name is ''                                  -> return 'Please enter a name.'
//         - message is '' OR message.length > 280       -> return 'Message must be 1 to 280 characters.'
//         - otherwise                                   -> return null   (null means "no problem")
//   S3. Self-check: open DevTools (F12) > Console, type  checkSilver()  and press Enter.
//
//   DONE WHEN: checkSilver() prints "All 7 Silver checks passed". It runs every case below:
//     | Name        | Message           | Expected result                              |
//     | (empty)     | hi                | error: Please enter a name.                  |
//     | 3 spaces    | hi                | error: Please enter a name.                  |
//     | Ada         | (empty)           | error: Message must be 1 to 280 characters.  |
//     | Ada         | 3 spaces          | error: Message must be 1 to 280 characters.  |
//     | Ada         | 281 letters       | error: Message must be 1 to 280 characters.  |
//     | Ada         | 280 letters       | accepted                                     |
//     | "  Ada  "   | "  hi  "          | accepted and shown as "Ada" / "hi"           |
function validate(name, message) {
  // TODO SILVER S2: write your checks here

  return null;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  // TODO SILVER S1: add .trim() to the end of both lines
  const name = nameInput.value;
  const message = messageInput.value;

  const problem = validate(name, message);
  if (problem) {
    errorEl.textContent = problem;
    return;
  }

  errorEl.textContent = '';
  entries.push({ name, message });
  renderEntries();
  form.reset();
});

// ---------- SILVER SELF-CHECK (do not edit) ----------
// Fills in the real form, submits it, and checks what happened. Type checkSilver() in the Console.
window.checkSilver = () => {
  const NAME_ERR = 'Please enter a name.';
  const MSG_ERR = 'Message must be 1 to 280 characters.';
  const cases = [
    { name: '', message: 'hi', expect: NAME_ERR },
    { name: '   ', message: 'hi', expect: NAME_ERR },
    { name: 'Ada', message: '', expect: MSG_ERR },
    { name: 'Ada', message: '   ', expect: MSG_ERR },
    { name: 'Ada', message: 'a'.repeat(281), expect: MSG_ERR },
    { name: 'Ada', message: 'a'.repeat(280), expect: { name: 'Ada', message: 'a'.repeat(280) } },
    { name: '  Ada  ', message: '  hi  ', expect: { name: 'Ada', message: 'hi' } },
  ];

  const saved = entries.splice(0); // set real entries aside while testing
  const results = cases.map((c) => {
    entries.length = 0;
    errorEl.textContent = '';
    nameInput.value = c.name;
    messageInput.value = c.message;
    form.requestSubmit();

    let got;
    let pass;
    if (typeof c.expect === 'string') {
      got = errorEl.textContent || '(no error, entry was accepted)';
      pass = got === c.expect && entries.length === 0;
    } else {
      const added = entries[0];
      got = added ? `accepted as "${added.name}" / "${added.message.slice(0, 12)}"` : `rejected: ${errorEl.textContent}`;
      pass = !!added && added.name === c.expect.name && added.message === c.expect.message;
    }
    const show = (s) => (s.length > 12 ? `${s.length} letters` : JSON.stringify(s));
    return { name: show(c.name), message: show(c.message), pass: pass ? 'PASS' : 'FAIL', got };
  });

  entries.length = 0;
  entries.push(...saved);
  renderEntries();
  form.reset();
  errorEl.textContent = '';

  console.table(results);
  const passed = results.filter((r) => r.pass === 'PASS').length;
  return passed === cases.length
    ? `All ${cases.length} Silver checks passed`
    : `${passed} of ${cases.length} passed. Fix the FAIL rows above.`;
};

// ---------- GOLD (3 tickets) ----------
// Gold is on paper, not in code: complete safety-inspector/clipboard.md. See the page for details.

// ---------- BONUS (5 tickets per team): THE SUPABASE VERSION ----------
// If this guestbook lived in Supabase, the browser would only ever hold the
// public anon key (import.meta.env.VITE_SUPABASE_ANON_KEY). That key is fine to ship
// ONLY because Row Level Security decides what each user may do.
// The service role key bypasses RLS and must never appear in front-end code.
//
// Write your policies in the Bonus section of clipboard.md. This is the table they protect:
//
//   create table guestbook (
//     id         bigint generated always as identity primary key,
//     user_id    uuid not null default auth.uid() references auth.users,
//     name       text not null,
//     message    text not null check (char_length(message) between 1 and 280),  -- "check it twice"
//     created_at timestamptz not null default now()
//   );
//
//   alter table guestbook enable row level security;
//
//   create policy "anyone can read the guestbook"
//     on guestbook for select
//     using (true);
//
//   -- TODO BONUS 1: an INSERT policy. Only signed-in users ("to authenticated"),
//   --               and the new row's user_id must equal auth.uid(). Insert uses WITH CHECK.
//   -- TODO BONUS 2: an UPDATE policy. Only the author may edit their own row.
//   --               Use USING (which rows they may touch) AND WITH CHECK (what the row may become).
//
// DONE WHEN: both policies are written in clipboard.md and you can explain the difference
//            between USING and WITH CHECK in one sentence each.
