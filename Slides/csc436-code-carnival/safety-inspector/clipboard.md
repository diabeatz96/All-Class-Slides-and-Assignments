# Safety Inspector Clipboard

Team: ______________________

For each ride, fill in all three lines. Your **safe fix** must answer every question under "Your fix must answer". Write what you would actually do or type, not "be careful". Bring this to the inspector to collect Gold tickets.

---

## 1. The Leaky Ticket Booth

A secret service key is pasted straight into a React component.

Your fix must answer:
- Where does the secret go instead? Name the file.
- Who can see any value that ends up in browser JavaScript?
- Which Supabase key is safe to ship to the browser, and which one never is?

- **What is wrong:**
- **What could happen:**
- **The safe fix:**

---

## 2. The Unlocked Prize Closet

A Supabase table has Row Level Security turned off.

Your fix must answer:
- Who can read and change every row right now?
- What is the SQL command that turns RLS on for a table?
- What does a policy compare to decide that a row belongs to the signed-in user? (Hint: `auth.uid()`.)

- **What is wrong:**
- **What could happen:**
- **The safe fix:**

---

## 3. The Talking Sign

User messages are dropped into the page with `innerHTML`.

Your fix must answer:
- Why does the browser treat that text as markup? (You saw this in Bronze.)
- What do you use instead in plain JavaScript?
- What do you use instead in React?

- **What is wrong:**
- **What could happen:**
- **The safe fix:**

---

## 4. The Bottomless Bucket

The form accepts empty names and 50,000-character messages.

Your fix must answer:
- What are the two places you validate?
- Why is checking only in the browser not enough? (Hint: can someone send data without using your form?)
- Write one database rule that would block a 50,000-character message.

- **What is wrong:**
- **What could happen:**
- **The safe fix:**

---

## 5. The Open Diary

The `.env` file got committed to GitHub.

Your fix must answer:
- What exact line goes in `.gitignore`?
- Is deleting the file in a new commit enough? Why or why not?
- What must you do with every key that was in the pushed file?

- **What is wrong:**
- **What could happen:**
- **The safe fix:**

---

## Bonus: Row Level Security Policies

Use the `guestbook` table from the bottom of `guestbook.js`.

**Bonus 1: INSERT policy** (signed-in users only; `user_id` must be their own id)

```sql

```

**Bonus 2: UPDATE policy** (only the author may edit their own row)

```sql

```

**In one sentence each:**
- `USING` decides:
- `WITH CHECK` decides:
