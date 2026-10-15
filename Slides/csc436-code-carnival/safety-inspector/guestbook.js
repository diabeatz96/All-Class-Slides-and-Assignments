// BOOTH 3: THE SAFETY INSPECTOR
// Golden rule of the midway: treat everything a visitor types as plain text,
// never as code or markup.
//
// YOUR TICKETS
//   BRONZE - run the Broken Sign experiment on the page, then read renderEntries() below
//   SILVER - write validate() and trim the inputs     search for: TODO SILVER   (2 spots)
//   GOLD   - fill in the Inspection Cards on the page (no code needed)
//   BONUS  - finish the RLS policies at the bottom     search for: TODO BONUS

const form = document.querySelector('#guest-form');
const nameInput = document.querySelector('#name');
const messageInput = document.querySelector('#message');
const entriesEl = document.querySelector('#entries');
const errorEl = document.querySelector('#error');
const counterEl = document.querySelector('#counter');
const brokenModeBox = document.querySelector('#broken-mode');

const MAX_MESSAGE = 280;
const entries = [];

// ---------- SILVER: VALIDATION ----------
// Validation keeps bad data out. On a real app you validate on the client
// for a nice experience AND on the server (or with database constraints)
// because anyone can skip your front end and call the API directly.
//
// validate() gets the name and message and returns EITHER an error sentence (something is wrong)
// OR null (everything is fine). The submit code below shows the sentence in red for you.
function validate(name, message) {
  // TODO SILVER step 1: replace the `return null` with three checks, in this order:
  //
  //   if the name is empty            -> return 'Please enter a name.';
  //   if the message is empty         -> return 'Please write a message.';
  //   if the message is too long      -> return `Message must be ${MAX_MESSAGE} characters or fewer.`;
  //   otherwise                       -> return null;
  //
  // Tools you need:
  //   name === ''                   true when name is empty
  //   message.length                how many characters are in message
  //   message.length > MAX_MESSAGE  true when it is too long
  //
  // The first check, to copy the pattern from:
  //   if (name === '') {
  //     return 'Please enter a name.';
  //   }
  //
  // TEST IT: submit an empty form, a name with no message, and paste a huge message (try 300 x's).
  return null;
}

// ---------- BRONZE: SAFE RENDERING ----------
// textContent always treats the value as text. The browser never parses it as HTML,
// so whatever the visitor typed shows up exactly as they typed it.
// innerHTML parses the string as markup, which is why we keep visitor text away from it.
// React does the same safe thing for you whenever you write {message} in JSX.
function renderEntries() {
  entriesEl.replaceChildren(); // clear old entries

  for (const entry of entries) {
    const row = document.createElement('div');
    row.className = 'entry';

    const who = document.createElement('strong');
    who.textContent = entry.name;

    const what = document.createElement('p');
    if (brokenModeBox.checked) {
      // THE BROKEN SIGN: this is the bug from Inspection Card 3, here only so you can see it happen.
      // Never put visitor text into innerHTML in a real app.
      what.innerHTML = entry.message;
    } else {
      what.textContent = entry.message; // the safe way
    }

    row.append(who, what);
    entriesEl.append(row);
  }
}

// flipping the switch redraws the same entries the other way
brokenModeBox.addEventListener('change', renderEntries);

// live "0 / 280" counter under the message box (also written with textContent)
function updateCounter() {
  const length = messageInput.value.trim().length;
  counterEl.textContent = `${length} / ${MAX_MESSAGE}`;
  counterEl.classList.toggle('over', length > MAX_MESSAGE);
}
messageInput.addEventListener('input', updateCounter);

form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  // TODO SILVER step 2: trim() both values so "   " counts as empty.
  //   Change the two lines below to:  nameInput.value.trim()   and   messageInput.value.trim()
  //   TEST IT: type only spaces in the name box. Before trim it is accepted; after, you get your error.
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
  updateCounter();
});

// ---------- GOLD: INSPECTION CARDS (done for you, just write in the boxes) ----------
// Each answer is saved in this browser (localStorage) so a refresh will not erase your work.
const cardBoxes = document.querySelectorAll('.card textarea');
const progressEl = document.querySelector('#inspection-progress');

function updateProgress() {
  let done = 0;
  for (const box of cardBoxes) {
    const filled = box.value.trim().length > 0;
    box.closest('.card').classList.toggle('done', filled);
    if (filled) done++;
  }
  progressEl.textContent = done === cardBoxes.length
    ? `All ${done} cards complete. Call the inspector over to sign off!`
    : `${done} / ${cardBoxes.length} cards complete.`;
}

for (const box of cardBoxes) {
  const key = `carnival-inspection-${box.dataset.card}`;
  try { box.value = localStorage.getItem(key) ?? ''; } catch { /* storage blocked; answers just won't persist */ }
  box.addEventListener('input', () => {
    try { localStorage.setItem(key, box.value); } catch { /* ignore */ }
    updateProgress();
  });
}
updateProgress();

// ---------- BONUS: THE SUPABASE VERSION ----------
// If this guestbook lived in Supabase, the browser would only ever hold the
// public anon key (import.meta.env.VITE_SUPABASE_ANON_KEY). That key is fine to ship
// ONLY because Row Level Security decides what each user may do.
// The service role key bypasses RLS and must never appear in front-end code.
//
// Picture the table:  guestbook(id, user_id, name, message, created_at)
// where user_id is the id of the signed-in visitor who wrote the entry.
// In a policy, auth.uid() means "the id of whoever is signed in right now".
//
// Write your policies on paper or in a comment here. Starting point:
//
//   alter table guestbook enable row level security;
//
//   create policy "anyone can read the guestbook"
//     on guestbook for select
//     using (true);
//
//   -- TODO BONUS: insert policy (signed-in users only, user_id must be their own id)
//   --   hint: inserts use  with check ( ... )  instead of  using ( ... )
//   -- TODO BONUS: update policy (only the author can edit their own row)
//   --   hint: compare auth.uid() to the row's user_id
//
// Docs with examples: https://supabase.com/docs/guides/database/postgres/row-level-security
