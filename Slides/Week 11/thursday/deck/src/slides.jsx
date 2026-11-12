import { S, Cols, Stack, Reveal, Ask, Predict, Check, Callout, Steps, Table, Code, C } from "./ui.jsx";
import { Flow, JwtDecoder, RequestSim } from "./live.jsx";

/* Thursday November 12, 12:20 to 2:15. Week 12, Session 2: Supabase Auth.
   Notes (press N) use tags: TIME, SAY, ASK, WATCH, CHECK, DO, IF BEHIND. */

export const slides = [
  /* ------------------------------------------------------------ 1 */
  {
    title: "Who goes there?",
    part: "intro",
    notes: `
      TIME: 12:20. Leave this up while people open their laptops.
      DO: Have your own recipe-api and recipe-web from Tuesday open in two terminals, and your Supabase dashboard open in a tab.
      SAY: Tuesday we put the API and the site on the internet. Today we decide who is allowed to do what.
      SAY: Same style as Tuesday. Slow, everyone types the same thing, and we stop at three checkpoints.
    `,
    body: () => (
      <S className="title-slide">
        <div className="title-kicker">CSC 436 | Week 12 | Thursday, November 12</div>
        <h1 className="title-main">Who goes there?</h1>
        <div className="title-sub">Supabase Auth: sign up, log in, and an API that knows who is asking.</div>
        <div className="title-row">
          <div className="title-chip"><b>Open now:</b> recipe-api and recipe-web from Tuesday</div>
          <div className="title-chip"><b>Also open:</b> your Supabase dashboard</div>
        </div>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 2 */
  {
    title: "Tuesday: both are live. So...",
    part: "intro",
    steps: 1,
    notes: `
      TIME: 12:23
      DO: Put your own deployed recipe-web address on the projector. Let two or three students open it on their phones and add a recipe.
      ASK: Take answers for all three questions before revealing anything. Let them disagree.
      SAY: Right now the honest answer is: anyone on Earth with the address can add and delete. Nothing in our code ever asks who you are.
      WATCH: Someone will say "just hide the delete button". Do not correct it yet. Write it on the board. We come back to it in Part 2.
    `,
    body: () => (
      <S kicker="Start here" title="Tuesday: both are live. So...">
        <Ask n={1}>Open a neighbor's deployed site. Can you add a recipe to it? Can you delete one of theirs?</Ask>
        <Ask n={2}>Should you be able to?</Ask>
        <Ask n={3}>If the answer is no: what would the API have to <b>know</b> about a request before it could refuse it?</Ask>
        <Reveal>
          <Callout kind="why" title="Two things">
            <b>Who is asking</b>, and <b>proof</b> that they are who they say they are. That is the whole lesson.
          </Callout>
        </Reveal>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 3 */
  {
    title: "Two words that sound the same",
    part: "idea",
    steps: 4,
    notes: `
      TIME: 12:28
      SAY: Authentication is "who are you". Authorization is "what are you allowed to do". Auth-N and Auth-Z.
      ASK: For each row, have the room vote N or Z with fingers before you reveal it. One at a time.
      SAY: The last row matters for today. 401 means "I do not know who you are". 403 means "I know who you are, and the answer is no".
      IF BEHIND: Reveal all four quickly and move on. The words come back all class.
    `,
    body: () => (
      <S kicker="The idea" title="Two words that sound the same">
        <Cols split="1fr 1fr" gap={24}>
          <Callout title="Authentication">Who are you? <span className="muted">Prove it.</span></Callout>
          <Callout title="Authorization">What are <b>you</b> allowed to do?</Callout>
        </Cols>
        <Ask>Which one is it? Vote before each reveal.</Ask>
        <Table
          widths={["62%", "38%"]}
          head={["Situation", "Which one?"]}
          rows={[
            ["Typing your email and password", <Reveal at={1} block={false} label="vote">Authentication</Reveal>],
            ["You can delete your own recipe, but not mine", <Reveal at={2} block={false} label="vote">Authorization</Reveal>],
            ["The API answers 401 Unauthorized", <Reveal at={3} block={false} label="vote">Authentication: "I don't know who you are"</Reveal>],
            ["The API answers 403 Forbidden", <Reveal at={4} block={false} label="vote">Authorization: "I know you. Still no."</Reveal>],
          ]}
        />
      </S>
    ),
  },

  /* ------------------------------------------------------------ 4 */
  {
    title: "The wristband",
    part: "idea",
    steps: 2,
    notes: `
      TIME: 12:33
      SAY: Think of a concert. You show ID once at the door. They give you a wristband. After that, nobody inside looks at your ID again. They look at the wristband.
      SAY: Logging in is the door. The wristband is called a token. Every request to our API will carry it.
      ASK: Question 1 first. Answers you want: showing ID everywhere is slow, and every bartender would need to be able to check IDs. With a wristband only the door handles your ID.
      ASK: Question 2. You want: a lost or stolen wristband would work forever. Supabase tokens last one hour, then the site quietly gets a new one.
    `,
    body: () => (
      <S kicker="The idea" title="The wristband">
        <Cols split="1fr 1fr 1fr" gap={18}>
          <Callout title="1. The door">You show your ID <b>once</b>.<br /><span className="muted">Log in with email and password.</span></Callout>
          <Callout title="2. The wristband">The door gives you a wristband.<br /><span className="muted">Supabase gives the site a <b>token</b>.</span></Callout>
          <Callout title="3. Inside">Every bar checks the wristband.<br /><span className="muted">Every API request carries the token.</span></Callout>
        </Cols>
        <Ask n={1}>Why not just show your ID at every bar? What is the wristband saving us from?</Ask>
        <Reveal at={1}><Callout kind="why">Only the door ever handles your ID. Our API will <b>never see a password</b>.</Callout></Reveal>
        <Ask n={2}>What goes wrong if a wristband never expires?</Ask>
        <Reveal at={2}><Callout kind="why">A stolen one works forever. Supabase tokens last <b>one hour</b>. The site swaps in a fresh one for you.</Callout></Reveal>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 5 */
  {
    title: "Three players, five messages",
    part: "idea",
    steps: 5,
    notes: `
      TIME: 12:38
      DO: Press Right once per arrow. Before each one, ask "what has to happen next?"
      SAY: Arrow 1 and 2 are Part 1 today. Arrow 3 and 4 are Part 3. Arrow 5 is Part 4.
      ASK: After all five: which of these boxes ever sees the password? Only Supabase Auth. Our API and our database never do.
      ASK: Which box did we build? React site and API. Which did we not build? The door. That is the point of using Supabase Auth.
      WATCH: Students think the API logs you in. It does not. The site talks to Supabase directly for login. The API only checks wristbands.
    `,
    body: () => (
      <S kicker="The idea" title="Three players, five messages">
        <Flow />
        <Ask>Before each arrow: what has to happen next? At the end: which box ever sees the password?</Ask>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 6 */
  {
    title: "Today's plan",
    part: "intro",
    notes: `
      TIME: 12:42
      SAY: Four parts, three checkpoints. If you fall behind, the checkpoint is where you catch up, and your neighbor is your first helper.
      SAY: Part 4 is the stretch. If we run out of time we finish it Tuesday.
      WATCH: Anyone who used sample data Tuesday and has no Supabase project. Today needs a real project. Pair them with a neighbor now, or have them create a project during setup (two minutes).
    `,
    body: () => (
      <S kicker="Today" title="Today's plan">
        <Table
          widths={["12%", "40%", "48%"]}
          head={["When", "What we do", "Checkpoint"]}
          rows={[
            ["12:42", "Setup: one switch, one key, one install", ""],
            ["12:55", <b>Part 1: Sign up and log in (React)</b>, "1. The site shows your email after you log in"],
            ["1:20", <b>Part 2: Hide what needs a login</b>, "Is the API safe now? (we test it)"],
            ["1:27", <b>Part 3: Protect the API (Express)</b>, "2. No token, no new recipe: 401"],
            ["1:52", <b>Part 4: Whose recipe is it?</b>, "3. You can delete yours, not mine"],
            ["2:05", "Deploy notes, Project 5, wrap up", ""],
          ]}
        />
        <Callout title="Same rules as Tuesday">We go slow. Everyone types the same thing. Stuck for more than a minute? Ask your neighbor, then raise a hand.</Callout>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 7 */
  {
    title: "Setup 1: one switch in Supabase",
    part: "setup",
    steps: 1,
    notes: `
      TIME: 12:45
      DO: Do this live in your own dashboard, slowly. Authentication in the left sidebar, then Sign In / Providers, then Email. Turn off "Confirm email" and Save.
      WATCH: The dashboard labels move around. If you cannot find it, search the dashboard for "Confirm email".
      SAY: Normally Supabase emails every new user a confirmation link. The free built-in mailer sends 2 emails per hour and only to people on your Supabase team. With 27 of us testing, we would be stuck in a minute.
      ASK: Should a real app turn this off? No. A real app keeps it on and connects a real email service. We are turning it off for class and for Project 5.
    `,
    body: () => (
      <S kicker="Setup" title="Setup 1: one switch in Supabase">
        <Cols split="1.1fr 1fr" gap={28}>
          <Steps items={[
            <>Open your Supabase project (the one from Week 10).</>,
            <>Left sidebar: <b>Authentication</b>.</>,
            <>Open <b>Sign In / Providers</b>, then <b>Email</b>.</>,
            <>Turn <b>Confirm email</b> off. Click <b>Save</b>.</>,
          ]} />
          <Stack>
            <Ask>Why would we turn off a safety feature? Guess before the reveal.</Ask>
            <Reveal>
              <Callout kind="why" title="Because of the free mailer">
                Supabase's built-in email sends <b>2 emails an hour</b>, and only to your own team. Fine for one tester, not for a class. Real apps keep confirmation on and plug in a real email service.
              </Callout>
            </Reveal>
          </Stack>
        </Cols>
        <Check title="You are ready when">Confirm email is off and saved.</Check>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 8 */
  {
    title: "Setup 2: a second key",
    part: "setup",
    steps: 1,
    notes: `
      TIME: 12:48
      DO: Project Settings, API Keys. Show the publishable key (starts with sb_publishable_). Do not show the secret key on the projector.
      ASK: Read the Predict box out loud and give it a full minute. This is the best question of the day. Tuesday's rule was "never put a secret in a VITE_ variable".
      SAY: No contradiction. The publishable key is not a secret. It is designed to sit in a browser. It only says "this is the recipe project". The secret key can do anything, so it stays on the API.
      WATCH: Students copying the secret key into recipe-web. Check the prefix: sb_publishable_ goes in the browser, sb_secret_ never does.
    `,
    body: () => (
      <S kicker="Setup" title="Setup 2: a second key">
        <Table
          widths={["22%", "39%", "39%"]}
          head={["", "Secret key", "Publishable key"]}
          rows={[
            ["Starts with", <C>sb_secret_</C>, <C>sb_publishable_</C>],
            ["Lives in", "recipe-api only (since Week 10)", "recipe-web, in the browser (new today)"],
            ["Can do", "Anything. Skips every rule.", "Sign up, log in, and whatever your rules allow"],
            ["If someone copies it", "Very bad. Replace it right away.", "Nothing happens. It is meant to be seen."],
          ]}
        />
        <Predict>Tuesday's rule: <b>never put a secret in a <C>VITE_</C> variable.</b> Today we put a Supabase key in a <C>VITE_</C> variable. Did we just break our own rule?</Predict>
        <Reveal>
          <Callout kind="why">No. The publishable key is <b>not a secret</b>. It only tells Supabase which project is calling. Find it in <b>Project Settings, API Keys</b>.</Callout>
        </Reveal>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 9 */
  {
    title: "Setup 3: install and connect",
    part: "setup",
    notes: `
      TIME: 12:51
      DO: Type all three with them. Stop Vite first with Ctrl + C.
      SAY: The API already has supabase-js from Week 10. The website does not have it yet. Two programs, two package.json files.
      WATCH: Running npm install in recipe-api instead of recipe-web. Have them check the folder name in the terminal prompt.
      WATCH: Forgetting to restart Vite after editing the .env file. Vite only reads env files when it starts.
      WATCH: Quotes or spaces around the values in the env file. No quotes, no spaces.
      CHECK: Everyone's site still shows recipes at localhost:5173 before you go on.
    `,
    body: () => (
      <S kicker="Setup" title="Setup 3: install and connect">
        <Cols split="1fr 1fr" gap={24}>
          <Stack>
            <Code lang="bash" title="Terminal 2 (in recipe-web)">{`
# Ctrl + C to stop Vite first
$ npm install @supabase/supabase-js
`}</Code>
            <Code lang="env" title="recipe-web/.env.development (add two lines)">{`
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
`}</Code>
          </Stack>
          <Stack>
            <Code title="recipe-web/src/supabase.js (new file)">{`
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
`}</Code>
            <Code lang="bash" title="Terminal 2">{`
$ npm run dev
`}</Code>
          </Stack>
        </Cols>
        <Ask>We already installed supabase-js in Week 10. Why are we installing it again?</Ask>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 10 */
  {
    title: "Part 1, step 1: a login box",
    part: "p1",
    notes: `
      TIME: 12:55
      DO: Create src/AuthBox.jsx and type it with them. Only the form for now. The two buttons do nothing yet.
      ASK: The three questions on the right are review from the React unit. Cold call. "What is this pattern called?" Controlled inputs.
      ASK: "What changes if type is text instead of password?" The dots. Nothing about security changes.
      DO: Import AuthBox in App.jsx and put <AuthBox /> at the top of the page so everyone can see it.
      CHECK: Everyone sees two inputs and two buttons on their site.
    `,
    body: () => (
      <S kicker="Part 1" title="Step 1: a login box">
        <Cols split="1.35fr 1fr" gap={24}>
          <Code title="recipe-web/src/AuthBox.jsx (new file)" size={15.5}>{`
import { useState } from "react";
import { supabase } from "./supabase.js";

export default function AuthBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div className="auth-box">
      <input type="email" placeholder="email" value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} />
      <button>Log in</button>
      <button>Sign up</button>
      {message && <p>{message}</p>}
    </div>
  );
}
`}</Code>
          <Stack>
            <Ask n={1}>We have seen <C>value</C> plus <C>onChange</C> before. What is that pattern called?</Ask>
            <Ask n={2}>What does <C>type="password"</C> actually change?</Ask>
            <Ask n={3}>What will <C>message</C> be for?</Ask>
            <Callout kind="do" title="Then">In <C>App.jsx</C>: import it and put <C>{"<AuthBox />"}</C> at the top of the page.</Callout>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 11 */
  {
    title: "Part 1, step 2: sign up",
    part: "p1",
    steps: 1,
    notes: `
      TIME: 1:01
      DO: Add the signUp function above the return, and onClick={signUp} on the Sign up button. Open DevTools, Console tab.
      ASK: Predict box first. Take guesses about what data holds.
      DO: Sign up with a real-looking email and a password of 6 or more characters. Expand the object in the console together: data.user and data.session.
      DO: Then open the Supabase dashboard, Authentication, Users. Your new user is in the list. Ask: can you see the password there? No.
      WATCH: "Password should be at least 6 characters". That is Supabase's minimum.
      WATCH: session is null in the console. That means Confirm email is still on. Go back to Setup 1.
      WATCH: "User already registered" on a second try. Correct behavior. Use Log in next.
    `,
    body: () => (
      <S kicker="Part 1" title="Step 2: sign up">
        <Cols split="1.25fr 1fr" gap={24}>
          <Stack>
            <Code title="AuthBox.jsx (add above the return)" size={16.5}>{`
async function signUp() {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  console.log("signUp", data, error);
  setMessage(error ? error.message : "Account created");
}
`}</Code>
            <Code title="AuthBox.jsx (the button)" size={16.5}>{`
<button onClick={signUp}>Sign up</button>
`}</Code>
          </Stack>
          <Stack>
            <Predict>Open the Console. Click Sign up. What do you expect inside <C>data</C>?</Predict>
            <Reveal>
              <Callout kind="why" title="Two things">
                <C>data.user</C>: your new account (id, email).<br />
                <C>data.session</C>: you are already logged in. The token is inside it.
              </Callout>
            </Reveal>
            <Ask>Now look in Supabase: <b>Authentication, Users</b>. Find yourself. Can you see your password?</Ask>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 12 */
  {
    title: "Part 1, step 3: log in",
    part: "p1",
    steps: 1,
    notes: `
      TIME: 1:07
      DO: Add logIn and wire the Log in button. Try a wrong password on purpose first.
      ASK: The message says "Invalid login credentials". It does not say which part was wrong. Why would Supabase be vague on purpose?
      SAY: If it said "wrong password", an attacker learns that the email has an account. Vague is safer.
      SAY: Notice we never check the password ourselves. We never even store it. We hand it to the door and get an answer.
      WATCH: Clicking Log in and "nothing happens". That is correct for now. Nothing on the page shows who is logged in. Next slide fixes it.
    `,
    body: () => (
      <S kicker="Part 1" title="Step 3: log in">
        <Cols split="1.25fr 1fr" gap={24}>
          <Stack>
            <Code title="AuthBox.jsx (add under signUp)" size={16.5}>{`
async function logIn() {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  setMessage(error ? error.message : "");
}
`}</Code>
            <Code title="AuthBox.jsx (the button)" size={16.5}>{`
<button onClick={logIn}>Log in</button>
`}</Code>
          </Stack>
          <Stack>
            <Predict>Log in with the <b>wrong</b> password on purpose. What will the message say?</Predict>
            <Reveal>
              <Callout kind="why"><b>Invalid login credentials.</b> Not "wrong password". Not "no such email".</Callout>
            </Reveal>
            <Ask>Why is the message vague on purpose? Who would a more helpful message help?</Ask>
            <Ask>Now use the right password. Did anything on the page change? Should it?</Ask>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 13 */
  {
    title: "Part 1, step 4: the app remembers",
    part: "p1",
    steps: 1,
    notes: `
      TIME: 1:11
      DO: Type this into App.jsx. Keep everything that is already in App. We are adding one piece of state and one effect.
      ASK: Go through the three questions with the code on screen. Point at the line each time.
      SAY: onAuthStateChange is a subscription. Supabase calls our function every time the login state changes: on page load, on log in, on log out.
      SAY: The return inside useEffect is the cleanup. Same idea as clearing a timer.
      DO: Open the Console and log in and out once so they see INITIAL_SESSION, SIGNED_IN, SIGNED_OUT appear.
      ASK: Predict: refresh the page while logged in. The first event is INITIAL_SESSION with a session, because the browser kept it in localStorage. Show it in DevTools, Application, Local Storage.
    `,
    body: () => (
      <S kicker="Part 1" title="Step 4: the app remembers">
        <Cols split="1.3fr 1fr" gap={24}>
          <Code title="recipe-web/src/App.jsx (add these, keep the rest)" size={16.5} nums mark={[6, 8, 9, 10, 11, 12, 13, 14, 15]}>{`
import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";
import AuthBox from "./AuthBox.jsx";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(event);
        setSession(session);
      });
    return () => data.subscription.unsubscribe();
  }, []);

  // everything you already have stays here
}
`}</Code>
          <Stack tight>
            <Ask n={1}>When does the function on lines 10 to 13 run? Who calls it?</Ask>
            <Ask n={2}>What is <C>session</C> when nobody is logged in?</Ask>
            <Ask n={3}>What is line 14 for? Where have we seen a <C>return</C> inside <C>useEffect</C> before?</Ask>
            <Predict>Log in, then refresh the page. Still logged in?</Predict>
            <Reveal><Callout kind="why">Yes. The browser keeps the session in <b>localStorage</b>.</Callout></Reveal>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 14 */
  {
    title: "Part 1, step 5: show who is logged in",
    part: "p1",
    notes: `
      TIME: 1:15
      DO: Replace the plain <AuthBox /> in App.jsx with this.
      ASK: What is this ? and : pattern called? Conditional rendering, from Week 5.
      ASK: Why session.user.email and not just the email from the form? The form's state lives inside AuthBox and is gone after a refresh. The session is the source of truth.
      CHECK: Checkpoint 1. Walk the room. Everyone should be able to sign up, log out, log in, refresh, and still see their email.
      IF BEHIND: Anyone not at Checkpoint 1 pairs with a neighbor who is. Do not start Part 2 with more than three people stuck.
    `,
    body: () => (
      <S kicker="Part 1" title="Step 5: show who is logged in">
        <Cols split="1.25fr 1fr" gap={24}>
          <Code title="App.jsx (inside the return, where <AuthBox /> was)" size={16.5}>{`
{session ? (
  <p>
    Logged in as {session.user.email}{" "}
    <button onClick={() => supabase.auth.signOut()}>
      Log out
    </button>
  </p>
) : (
  <AuthBox />
)}
`}</Code>
          <Stack>
            <Ask n={1}>We never call <C>setSession(null)</C> when you click Log out. So how does the page know to change?</Ask>
            <Ask n={2}>Why <C>session.user.email</C> and not the email you typed in the form?</Ask>
          </Stack>
        </Cols>
        <Check title="Checkpoint 1">
          Sign up, log out, log in, refresh. Your email stays on the page until you click Log out. You are in <b>Authentication, Users</b> in Supabase.
        </Check>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 15 */
  {
    title: "When it breaks: Part 1",
    part: "fix",
    notes: `
      TIME: Use only if needed. This slide is the same table students can come back to with G.
      SAY: Read the error out loud before you touch anything. Most of these say exactly what is wrong.
    `,
    body: () => (
      <S kicker="When it breaks" title="Part 1 problems">
        <Table
          widths={["40%", "60%"]}
          head={["You see", "Check this"]}
          rows={[
            [<><C>supabaseUrl is required</C> (white page)</>, <>The two <C>VITE_SUPABASE_</C> lines are missing or misspelled, or Vite was not restarted after you edited the env file.</>],
            ["Invalid API key", <>You pasted the wrong key, or only part of it. It must start with <C>sb_publishable_</C>.</>],
            ["Password should be at least 6 characters", "Supabase's minimum. Use a longer one."],
            ["User already registered", "That account exists. Click Log in."],
            [<>Sign up works but <C>data.session</C> is <C>null</C></>, "Confirm email is still on. Setup 1, then sign up with a new email."],
            ["Email rate limit exceeded", "Confirm email was on and the free mailer hit its limit. Turn it off, then use a new email."],
            ["Clicking a button does nothing", <>Is <C>onClick</C> on the button? Any red text in the Console?</>],
          ]}
        />
      </S>
    ),
  },

  /* ------------------------------------------------------------ 16 */
  {
    title: "Part 2: hide what needs a login",
    part: "p2",
    steps: 1,
    notes: `
      TIME: 1:20
      DO: Wrap the add-recipe form in App.jsx. Use whatever the form component is called in their file.
      SAY: This is the "just hide the button" idea from the start of class. It takes one line.
      ASK: Predict box. Make them commit: hands up for "safe", hands up for "not safe". Do not reveal the answer. The next slide tests it.
      CHECK: Logged out: the form is gone. Logged in: it is back.
    `,
    body: () => (
      <S kicker="Part 2" title="Hide what needs a login">
        <Cols split="1.2fr 1fr" gap={24}>
          <Stack>
            <Code title="App.jsx (around your add-recipe form)" size={16.5}>{`
{session ? (
  <AddRecipeForm onAdd={handleAdd} />
) : (
  <p>Log in to add a recipe.</p>
)}
`}</Code>
            <Callout title="Your names will differ">Use your own form component and props. The only new part is the <C>session ?</C> around it.</Callout>
          </Stack>
          <Stack>
            <Ask>Log out. Is the form gone? Log in. Is it back?</Ask>
            <Predict>The form is hidden from logged-out visitors. <b>Is our API protected now?</b> Hands up: yes or no.</Predict>
            <Reveal><Callout kind="why">Do not answer yet. We are going to test it.</Callout></Reveal>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 17 */
  {
    title: "Test it: who needs our website?",
    part: "p2",
    steps: 1,
    notes: `
      TIME: 1:23
      DO: Run this yourself on the projector while logged OUT of the site. Mac, Linux and Git Bash: the curl line works as written. Windows PowerShell: use Thunder Client or Postman instead, same as Week 8.
      WATCH: If your API's validation rejects the body, add whatever field it asks for. The point is the 201.
      DO: Refresh the site. Sneaky Soup is in the list. Nobody logged in.
      SAY: The website is only one way to reach the API. Hiding a button changes the website. It does not change the API.
      ASK: Who else can send requests to our API without ever opening our site? curl, Postman, someone else's website, a script.
      SAY: Hiding things in React is for a nicer experience. The API is where the rule has to live.
    `,
    body: () => (
      <S kicker="Part 2" title="Test it: who needs our website?">
        <Code lang="bash" title="Any terminal. Not logged in. Not even using the site." size={16}>{`
$ curl -X POST http://localhost:3000/api/recipes \\
    -H "Content-Type: application/json" \\
    -d '{"name":"Sneaky Soup","cuisine":"None","minutes":5,"tags":[]}'
`}</Code>
        <Predict>What status code comes back? Then refresh the site: is Sneaky Soup there?</Predict>
        <Reveal>
          <Cols split="1fr 1fr" gap={20}>
            <Callout kind="warn" title="201 Created">The API saved it. It never asked who we were.</Callout>
            <Callout kind="why" title="The rule">Hiding a button is a courtesy, not security. <b>The API has to check.</b></Callout>
          </Cols>
        </Reveal>
        <Ask>Name three ways to send a request to our API without opening our website.</Ask>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 18 */
  {
    title: "Part 3: what is in the wristband?",
    part: "p3",
    notes: `
      TIME: 1:27
      DO: Start with the sample token so everyone sees the three parts. Then get a real one: in App.jsx add console.log(session?.access_token) under the useState line, copy the long string from the Console (no quotes), then delete that line.
      SAY: It is also sitting in the signUp log from Part 1, under data, session, access_token, if you have not refreshed since.
      DO: Paste your token into the box. Everything stays in this page, nothing is sent anywhere.
      ASK: Can anyone read the payload? Yes, it is only encoded, not encrypted. So what must never go in a token? Secrets, passwords.
      ASK: If I can read it, can I change the email to yours and be you? No. The signature would no longer match, and only Supabase can make a signature.
      ASK: What is exp? When the wristband stops working. About an hour from login.
      SAY: This kind of token has a name: JWT, said "jot". JSON Web Token.
    `,
    body: () => (
      <S kicker="Part 3" title="What is in the wristband?">
        <JwtDecoder />
        <Ask>Can anyone read it? Could you change the email inside and become someone else? What is <C>exp</C>?</Ask>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 19 */
  {
    title: "Part 3, step A: React shows the wristband",
    part: "p3",
    steps: 1,
    notes: `
      TIME: 1:32
      DO: Open recipe-web/src/api.js from Tuesday. Add the import at the top and the highlighted lines inside request(). The fetch line changes to pass headers.
      ASK: Why put this in request() and not next to each fetch? Every call to the API goes through request(), so we write it once. That was the reason for the helper on Tuesday.
      SAY: "Authorization: Bearer token" is the standard way to send a token. Bearer means "whoever carries this".
      ASK: Predict: does the site work differently now? No. We are sending the wristband but nobody at the API looks at it yet.
      WATCH: Missing the space after Bearer. Missing backticks. Spelling it Authorisation.
      CHECK: DevTools, Network tab, click a POST request, Request Headers. They should see authorization: Bearer ey...
    `,
    body: () => (
      <S kicker="Part 3" title="Step A: React shows the wristband">
        <Cols split="1.4fr 1fr" gap={24}>
          <Code title="recipe-web/src/api.js (inside request)" size={16} nums mark={[1, 4, 5, 6, 7, 11, 12]}>{`
import { supabase } from "./supabase.js";

async function request(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = { ...options.headers };
  if (token) headers.Authorization = \`Bearer \${token}\`;

  let response;
  try {
    response = await fetch(\`\${API_URL}\${path}\`,
      { ...options, headers });
  } catch {
    // the rest of request() does not change
`}</Code>
          <Stack>
            <Ask n={1}>Why add this inside <C>request()</C> instead of next to each <C>fetch</C>?</Ask>
            <Ask n={2}>What does the <C>?.</C> on line 5 protect us from?</Ask>
            <Predict>Save. Add a recipe while logged in. Does anything behave differently?</Predict>
            <Reveal><Callout kind="why">No. We are showing the wristband, but <b>nobody at the API is looking yet</b>. See it in DevTools: Network, Request Headers.</Callout></Reveal>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 20 */
  {
    title: "Part 3, step B: the bouncer",
    part: "p3",
    notes: `
      TIME: 1:38
      DO: New file in recipe-api: middleware/require-auth.js. Type it slowly. This is the most important file today.
      ASK: Dissect it line by line with the four questions. Give each one real time.
      SAY: Line 12 is arrow 4 from the diagram. Our API hands the token to Supabase and asks whose it is. We use the supabase client we already made in Week 10.
      SAY: req.user is something we are adding. Any route that runs after the bouncer can read req.user.id.
      ASK: What happens if we forget next()? The request hangs forever. Same as every middleware since Week 8.
      WATCH: import path. From middleware/ to data/ is ../data/supabase.js, with the .js on the end. ESM needs the extension.
      WATCH: Anyone running on sample data: supabase is null in their API and this will crash with a 500. They need real keys in recipe-api/.env today.
      SAY: Gold tier people: supabase.auth.getClaims(token) is the faster cousin of getUser. Look it up after class.
    `,
    body: () => (
      <S kicker="Part 3" title="Step B: the bouncer">
        <Cols split="1.4fr 1fr" gap={22}>
          <Code title="recipe-api/middleware/require-auth.js (new file)" size={15.5} nums>{`
import { supabase } from "../data/supabase.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Log in first" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401)
      .json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  next();
}
`}</Code>
          <Stack tight>
            <Ask n={1}>There are three ways out of this function. Find them. Which one lets the request continue?</Ask>
            <Ask n={2}>Which line is arrow 4 from our diagram?</Ask>
            <Ask n={3}>Why 401 and not 403?</Ask>
            <Ask n={4}>What is <C>req.user</C>? Did Express give us that?</Ask>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 21 */
  {
    title: "Part 3, step C: put the bouncer on the door",
    part: "p3",
    steps: 1,
    notes: `
      TIME: 1:44
      DO: Open the recipes routes file in recipe-api. Import requireAuth and add it as the second argument on every route that changes data. Handler names in their file may differ. Only the requireAuth word is new.
      ASK: Question 1 before revealing. Let them argue about GET. For our app, reading is public and changing needs a login. That is a decision, not a rule of the universe.
      SAY: Middleware runs left to right. requireAuth runs first. If it answers 401, the route function never runs.
      WATCH: Writing requireAuth() with parentheses. We pass the function, we do not call it.
      DO: The API restarts on save if they use node --watch. Otherwise Ctrl + C and npm run dev again.
    `,
    body: () => (
      <S kicker="Part 3" title="Step C: put the bouncer on the door">
        <Cols split="1.35fr 1fr" gap={24}>
          <Code title="recipe-api/routes (your recipes routes file)" size={16} mark={[1, 5, 6, 7]}>{`
import { requireAuth } from "../middleware/require-auth.js";

router.get("/", listRecipes);
router.get("/:id", getRecipe);
router.post("/", requireAuth, createRecipe);
router.patch("/:id", requireAuth, updateRecipe);
router.delete("/:id", requireAuth, deleteRecipe);
`}</Code>
          <Stack>
            <Ask n={1}>Which routes should get the bouncer? What about <C>GET</C>? Who decides?</Ask>
            <Reveal>
              <Callout kind="why" title="Our decision">Anyone can <b>read</b> recipes. You must be logged in to <b>change</b> anything.</Callout>
            </Reveal>
            <Ask n={2}>Why is it <C>requireAuth</C> and not <C>requireAuth()</C>?</Ask>
            <Ask n={3}>If the bouncer answers 401, does <C>createRecipe</C> run?</Ask>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 22 */
  {
    title: "Predict the bouncer",
    part: "p3",
    notes: `
      TIME: 1:48
      DO: This simulator uses the same rules as the file they just typed. Pick a combination, make the room call the status code out loud, then click Send it.
      DO: Good order: POST with no token (401), POST with a made-up token (401, different message), POST with Ana's token (201), GET with no token (200).
      SAY: Save the DELETE rows for Part 4. Ben deleting Ana's recipe is the question Part 4 answers.
      IF BEHIND: Do two combinations and move to the checkpoint.
    `,
    body: () => (
      <S kicker="Part 3" title="Predict the bouncer">
        <RequestSim />
      </S>
    ),
  },

  /* ------------------------------------------------------------ 23 */
  {
    title: "Checkpoint 2: try to sneak in again",
    part: "p3",
    notes: `
      TIME: 1:50
      DO: Run the same curl from Part 2 on the projector. This time it says 401 and "Log in first". Then add a recipe from the site while logged in. It works.
      CHECK: Checkpoint 2. Walk the room. Ask two or three students to show you the 401.
      WATCH: 401 even when logged in on the site: Step A is missing or the header is misspelled. Check Network, Request Headers.
      WATCH: 500 instead of 401: usually the import path in require-auth.js, or the API has no Supabase keys.
      IF BEHIND: If it is past 1:58, skip Part 4 as a code-along. Show slides 25 and 26 as a demo, and say we build it Tuesday.
    `,
    body: () => (
      <S kicker="Part 3" title="Checkpoint 2: try to sneak in again">
        <Code lang="bash" title="The same request as before" size={16}>{`
$ curl -i -X POST http://localhost:3000/api/recipes \\
    -H "Content-Type: application/json" \\
    -d '{"name":"Sneaky Soup 2","cuisine":"None","minutes":5,"tags":[]}'

HTTP/1.1 401 Unauthorized
{"error":"Log in first"}
`}</Code>
        <Check title="Checkpoint 2">
          <ul>
            <li>The sneaky request gets <b>401</b>.</li>
            <li>Logged in on the site, adding a recipe still works.</li>
            <li>Logged out, reading recipes still works.</li>
          </ul>
        </Check>
        <Ask>Explain to your neighbor: what changed between the first Sneaky Soup and this one? Which file did it?</Ask>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 24 */
  {
    title: "When it breaks: Part 3",
    part: "fix",
    notes: `
      TIME: Use only if needed.
      SAY: For anything with tokens, the Network tab is the first place to look. Is the header there? Then the problem is on the API side. Is it missing? Then it is on the React side.
    `,
    body: () => (
      <S kicker="When it breaks" title="Part 3 problems">
        <Table
          widths={["40%", "60%"]}
          head={["You see", "Check this"]}
          rows={[
            ["401 even though you are logged in", <>Network tab, the request, Request Headers. No <C>authorization</C> line? Step A is missing. It must be exactly <C>Bearer</C>, one space, then the token.</>],
            ["401 Invalid or expired token", "recipe-web and recipe-api are pointing at two different Supabase projects. Compare the two URLs."],
            ["500 and a TypeError about reading 'auth'", <>The API has no Supabase keys, so <C>supabase</C> is <C>null</C>. Add them to <C>recipe-api/.env</C> and restart.</>],
            ["Cannot find module ... require-auth", <>The import path. From <C>routes/</C> it is <C>../middleware/require-auth.js</C>, with <C>.js</C>.</>],
            ["The request never finishes", <>Did every path in the bouncer either <C>return res...</C> or call <C>next()</C>?</>],
            ["Everything gets 401, even the list", <>The bouncer is on a <C>GET</C> route or on <C>app.use</C>. Put it only on the routes that change data.</>],
          ]}
        />
      </S>
    ),
  },

  /* ------------------------------------------------------------ 25 */
  {
    title: "Part 4: whose recipe is it?",
    part: "p4",
    steps: 1,
    notes: `
      TIME: 1:52
      SAY: Right now any logged-in person can delete anyone's recipe. We know who is asking. We do not yet know who owns each recipe.
      ASK: What is missing from the recipes table? A column that says who made each row.
      DO: Supabase dashboard, SQL Editor, run the two lines. Old recipes get an empty user_id. That is fine.
      ASK: Predict box. This is the security question of the day. Give it a minute and make them pick.
      SAY: Never trust the body for identity. Anyone can type any id into a request body. The token is the only thing in the request that cannot be faked.
    `,
    body: () => (
      <S kicker="Part 4" title="Whose recipe is it?">
        <Cols split="1.15fr 1fr" gap={24}>
          <Stack>
            <Ask>Ben is logged in. Can Ben delete Ana's recipe right now? What would the table need so we could tell?</Ask>
            <Code lang="sql" title="Supabase dashboard: SQL Editor" size={17}>{`
alter table recipes
  add column user_id uuid references auth.users (id);
`}</Code>
            <Callout title="What that says">Every recipe can point at one account. <C>auth.users</C> is where Supabase keeps the accounts you saw under Authentication.</Callout>
          </Stack>
          <Stack>
            <Predict>
              When someone adds a recipe, where should the API get the <C>user_id</C> from?
              <ul>
                <li><b>A.</b> <C>req.body.user_id</C>, sent by the site</li>
                <li><b>B.</b> <C>req.user.id</C>, set by the bouncer</li>
              </ul>
            </Predict>
            <Reveal>
              <Callout kind="warn" title="B. Always B.">Anyone can type any id into a body. The token is the only part of a request that <b>cannot be faked</b>.</Callout>
            </Reveal>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 26 */
  {
    title: "Part 4: stamp it, then check it",
    part: "p4",
    steps: 1,
    notes: `
      TIME: 1:57
      DO: Two small edits in recipe-api. Function names in their route and service files will differ. Show the pattern in your own files.
      ASK: Question 1. If the two parts on line 3 were swapped, a user_id in the body would overwrite the real one. Order matters in a spread.
      ASK: Question 2. Zero rows match, so nothing is deleted. Our service already turns "nothing deleted" into a 404.
      SAY: Our API uses the secret key, which skips every database rule. That means the API is the only guard. Tuesday's track split shows the database enforcing the same rule itself, with Row Level Security.
      CHECK: Checkpoint 3. Two accounts. Add a recipe as one, log in as the other, try to delete it. Go back to the simulator on slide 22 and run the Ben and Ana DELETE rows.
      IF BEHIND: Demo this on the projector only. It is the Gold tier for today and we return to it Tuesday.
    `,
    body: () => (
      <S kicker="Part 4" title="Stamp it, then check it">
        <Cols split="1.3fr 1fr" gap={24}>
          <Stack>
            <Code title="recipe-api: the POST route" size={16} nums mark={[3]}>{`
// inside your create handler
const recipe = await createRecipe(
  { ...req.body, user_id: req.user.id });
res.status(201).json(recipe);
`}</Code>
            <Code title="recipe-api: the delete in your service" size={16} mark={[5]}>{`
const { data, error } = await supabase
  .from("recipes")
  .delete()
  .eq("id", id)
  .eq("user_id", userId)   // only if it is yours
  .select();
`}</Code>
          </Stack>
          <Stack gap={12}>
            <Ask n={1}>What if line 3 were <C>{"{ user_id: req.user.id, ...req.body }"}</C> instead?</Ask>
            <Ask n={2}>Ben tries to delete Ana's recipe. How many rows match both <C>.eq</C> lines? What does Ben get back?</Ask>
            <Reveal>
              <Callout kind="why">Zero rows, so <b>404</b>. Pass <C>req.user.id</C> from the route into the service as <C>userId</C>.</Callout>
            </Reveal>
            <Check title="Checkpoint 3">Two accounts. You can delete your own recipe, not the other one's.</Check>
          </Stack>
        </Cols>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 27 */
  {
    title: "Going live with auth",
    part: "wrap",
    steps: 1,
    notes: `
      TIME: 2:05
      SAY: Same three moves as Tuesday: deploy, set an environment variable, redeploy.
      ASK: Predict box. The deployed site has no .env.development, so the two VITE_SUPABASE_ values are missing and the page crashes at createClient. Same lesson as VITE_API_URL on Tuesday.
      ASK: Does recipe-api need a new variable? No. It already has SUPABASE_URL and SUPABASE_SECRET_KEY, and CORS already allows the site.
      SAY: Do this at home tonight or in Tuesday's studio time. It is part of Project 5.
    `,
    body: () => (
      <S kicker="Wrap up" title="Going live with auth">
        <Predict>You deploy recipe-web right now without touching any settings. What does the live site do? (Think back to Tuesday.)</Predict>
        <Reveal>
          <Table
            widths={["24%", "46%", "30%"]}
            head={["Project", "Environment variables", "Then"]}
            rows={[
              [<b>recipe-web</b>, <><C>VITE_SUPABASE_URL</C> and <C>VITE_SUPABASE_PUBLISHABLE_KEY</C> (new)<br /><C>VITE_API_URL</C> (from Tuesday)</>, "Redeploy the site"],
              [<b>recipe-api</b>, <>Nothing new. <C>SUPABASE_URL</C>, <C>SUPABASE_SECRET_KEY</C> and <C>CORS_ORIGINS</C> are already there.</>, "Redeploy to ship the bouncer"],
            ]}
          />
        </Reveal>
        <Ask>The publishable key goes on the site's project and the secret key stays on the API's project. Say why, in one sentence.</Ask>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 28 */
  {
    title: "Today is most of Project 5",
    part: "wrap",
    notes: `
      TIME: 2:08
      SAY: Project 5 is due Tuesday, November 24. Everything on the left is a requirement in the brief. Everything on the right is something you typed today.
      SAY: Bronze is Checkpoint 1, Silver is Checkpoint 2, Gold is Checkpoint 3 plus deployed. Submit where you got to on Brightspace.
      SAY: Next Tuesday is the track split. Track A goes deeper on database rules. Track B streams AI responses. Thursday is studio time for Project 5.
    `,
    body: () => (
      <S kicker="Wrap up" title="Today is most of Project 5">
        <Cols split="1.2fr 1fr" gap={24}>
          <Table
            widths={["52%", "48%"]}
            head={["Project 5 asks for", "Today"]}
            rows={[
              ["Sign up, log in, log out", "Part 1"],
              ["The header shows who is logged in", "Part 1, step 5"],
              ["A page or feature that needs a login", "Part 2"],
              ["Per-user data, enforced on the server", "Part 3 and Part 4"],
              ["Environment variables on both ends", "Setup 3 and Going live"],
            ]}
          />
          <Table
            widths={["24%", "76%"]}
            head={["Tier", "Today's goal"]}
            rows={[
              [<b>Bronze</b>, "Checkpoint 1: sign up, log in, log out, email on the page"],
              [<b>Silver</b>, "Checkpoint 2: the API answers 401 without a token"],
              [<b>Gold</b>, "Checkpoint 3, and both ends deployed with auth working"],
              [<b>Bonus</b>, <>A "My recipes" view, or swap <C>getUser</C> for <C>getClaims</C> and explain the difference</>],
            ]}
          />
        </Cols>
        <Callout title="Due">Project 5: <b>Tuesday, November 24</b>. Next Tuesday: track split day. Next Thursday: Project 5 studio.</Callout>
      </S>
    ),
  },

  /* ------------------------------------------------------------ 29 */
  {
    title: "Say it back",
    part: "wrap",
    notes: `
      TIME: 2:10
      DO: Pairs, two minutes each way. One explains, the other only asks "why?". Then swap. Listen in on two or three pairs.
      SAY: If you can explain these three to someone, you understand auth better than most people who use it every day.
      DO: Last minute: submit your tier on Brightspace, and remind them the publishable key is the only Supabase key that belongs in recipe-web.
    `,
    body: () => (
      <S kicker="Wrap up" title="Say it back">
        <p className="big">Turn to your neighbor. Explain each one out loud. Your neighbor's only job is to ask <b>"why?"</b></p>
        <Ask n={1}>When you log in, where does your password go? Which of our programs never sees it?</Ask>
        <Ask n={2}>What is in the token? Who can read it? Who can make one?</Ask>
        <Ask n={3}>We hid the form in Part 2. Why was that not enough, and which file fixed it?</Ask>
        <Callout title="Before you leave">Submit the tier you reached on Brightspace.</Callout>
      </S>
    ),
  },
];
