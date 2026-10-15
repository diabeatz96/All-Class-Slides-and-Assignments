// BOOTH 1: THE RING TOSS (Three.js)
// ESM only. Use import, never require().
//
// WORDS YOU WILL SEE (plain English)
//   Three.js  - a JavaScript library that draws 3D graphics in the browser
//   Scene     - the tent. A container that holds everything in your 3D world
//   Camera    - the audience's eyes. Decides what part of the world shows on screen
//   Renderer  - the projector. Draws what the camera sees onto a <canvas> on the page
//   Geometry  - the SHAPE of a thing (box, sphere, donut)
//   Material  - the LOOK of a thing (color, shiny or matte)
//   Mesh      - a shape + a look = an actual object you can put in the scene and move
//   Light     - without one, most materials look pitch black
//   x, y, z   - left/right, up/down, toward you/away from you
//   rotation  - measured in radians. Math.PI is half a turn, Math.PI * 2 is a full turn
//
// Every Three.js app is the same three ingredients:
//   1. A SCENE   (the stage)
//   2. A CAMERA  (the audience's eyes)
//   3. A RENDERER (the projector that draws the scene from the camera)
// Then an animation loop redraws it about 60 times a second.
//
// GETTING STARTED
//   1. In the terminal, in the csc436-code-carnival folder:  npm run dev
//   2. Open the link it prints and click "Booth 1". Keep that browser tab open.
//   3. Edit this file and SAVE. The browser updates by itself, no refresh needed.
//   4. Uncomment a line: select it and press Cmd+/ (Mac) or Ctrl+/ (Windows).
//   5. Something broke? Open the browser Console: Cmd+Option+J (Mac) or Ctrl+Shift+J (Windows).
//      Red text names the file and LINE NUMBER of the problem. Undo (Cmd/Ctrl+Z) is your friend.
//
// YOUR TICKETS (do them in order; use Cmd/Ctrl+F to jump to each one)
//   BRONZE - change numbers and colors        search for: TODO BRONZE   (4 spots)
//   SILVER - build a tent next to the booth   search for: TODO SILVER
//   GOLD   - clicking a peg tosses a ring     search for: TODO GOLD     (4 steps)
//
// RESOURCES (the Three.js docs: every shape, with a live preview and sliders)
//   TorusGeometry (the ring)  https://threejs.org/docs/#api/en/geometries/TorusGeometry
//   ConeGeometry  (tent roof) https://threejs.org/docs/#api/en/geometries/ConeGeometry
//   BoxGeometry   (tent wall) https://threejs.org/docs/#api/en/geometries/BoxGeometry
//   Mesh                      https://threejs.org/docs/#api/en/objects/Mesh
//   MeshStandardMaterial      https://threejs.org/docs/#api/en/materials/MeshStandardMaterial
//   Color picker for hex codes: Google "color picker", then swap the # for 0x  (#ff69b4 -> 0xff69b4)
//   Inspiration: https://threejs.org/examples/

import * as THREE from 'three';
// BONUS: uncomment to let the audience walk around the midway
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- 1. SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1f3b); // night sky over the midway

// ---------- 2. CAMERA ----------
// PerspectiveCamera(fieldOfView, aspectRatio, nearClip, farClip)
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 4, 14);
camera.lookAt(0, 2.5, 0);

// ---------- 3. RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ---------- LIGHTS ----------
// MeshStandardMaterial is black without light. Forgetting lights is the #1 "my scene is empty" bug.
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const spotlight = new THREE.DirectionalLight(0xffffff, 1.5);
spotlight.position.set(5, 10, 7);
scene.add(spotlight);

// ---------- GROUND ----------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
);
ground.rotation.x = -Math.PI / 2; // planes start vertical, lay it flat
scene.add(ground);

// ---------- THE FERRIS WHEEL ----------
// A Group lets us spin many meshes together as one object.
const wheel = new THREE.Group();
wheel.position.set(-5, 5, -4);
scene.add(wheel);

const rim = new THREE.Mesh(
  new THREE.TorusGeometry(3.5, 0.12, 12, 48),
  new THREE.MeshStandardMaterial({ color: 0xf4b400 }) // TODO BRONZE: change the rim color
);
wheel.add(rim);

const CAR_COUNT = 8; // TODO BRONZE: try 12 cars
const carColors = [0xd62839, 0x1fa7a0, 0xfff4dc, 0xf4b400];

for (let i = 0; i < CAR_COUNT; i++) {
  const angle = (i / CAR_COUNT) * Math.PI * 2;

  // spoke from center to rim
  const spoke = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 3.5),
    new THREE.MeshStandardMaterial({ color: 0xfff4dc })
  );
  spoke.position.set(Math.cos(angle) * 1.75, Math.sin(angle) * 1.75, 0);
  spoke.rotation.z = angle - Math.PI / 2;
  wheel.add(spoke);

  // little car on the rim
  const car = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.5, 0.6),
    new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length] })
  );
  car.position.set(Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0);
  wheel.add(car);
}

// ---------- THE RING TOSS BOOTH ----------
// A wooden counter close to the audience, with three pegs standing on top.
const COUNTER_TOP = 1; // the y height of the counter's top surface

const counter = new THREE.Mesh(
  new THREE.BoxGeometry(6, COUNTER_TOP, 2),
  new THREE.MeshStandardMaterial({ color: 0x8d5a2b }) // wood
);
counter.position.set(2.5, COUNTER_TOP / 2, 5); // boxes are centered, so lift it half its height
scene.add(counter);

const PEG_HEIGHT = 1.6;
const pegs = [];       // the red pegs you see
const pegTargets = []; // bigger invisible "click zones" around each peg (easier to hit)

for (let i = 0; i < 3; i++) {
  const peg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, PEG_HEIGHT),
    new THREE.MeshStandardMaterial({ color: 0xd62839 }) // TODO BRONZE: recolor the pegs
  );
  peg.position.set(1 + i * 1.5, COUNTER_TOP + PEG_HEIGHT / 2, 5); // standing on the counter
  peg.userData.ringsOnPeg = 0; // userData is a free backpack for your own info
  scene.add(peg);
  pegs.push(peg);

  // A fat cylinder that is NOT drawn (visible: false), but the raycaster can still hit it.
  // Real games do this all the time so small things are easy to click.
  const target = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, PEG_HEIGHT + 0.6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  target.userData.peg = peg; // remember which peg this click zone belongs to
  peg.add(target);           // child of the peg, so it moves with it
  pegTargets.push(target);
}

// TODO SILVER: build a tent next to the booth (the empty grass on the left).
//
// STEP 1. The walls: a box. Uncomment these 5 lines and save. A cream box should appear.
// const tentWalls = new THREE.Mesh(
//   new THREE.BoxGeometry(2, 2, 2),                       // width, height, depth
//   new THREE.MeshStandardMaterial({ color: 0xfff4dc })   // cream
// );
// tentWalls.position.set(-3, 1, 5);                       // y = 1 is half its height, so it sits ON the grass
// scene.add(tentWalls);
//
// STEP 2. The roof: your turn! Make a second Mesh the same way, but:
//   - shape:    new THREE.ConeGeometry(1.8, 1.5, 4)   (radius, height, number of sides)
//   - color:    red, 0xd62839
//   - position: same x and z as the walls, y = 2.75 (on top of the 2-tall walls)
//   - bonus:    roof.rotation.y = Math.PI / 4  lines the 4-sided cone up with the box
//
// STEP 3 (extra): a flag on top (a thin CylinderGeometry pole + a small BoxGeometry flag),
//   or a prize shelf behind the counter. Stuck on a shape? Try the sliders on its docs page (top of file).
// Hint: there is empty space at x = -4, z = 5 (left of the camera). Try it there!

// ---------- CLICK DETECTION (done for you) ----------
// A Raycaster shoots an invisible laser from the camera through the mouse position
// and tells you what it hit. This is how 3D apps make objects clickable.
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const scoreEl = document.querySelector('#score');
const hintEl = document.querySelector('#hint');
let ringers = 0;
let tossesThisClick = 0;

// Returns the peg under the mouse, or null if the laser hit nothing.
function pegUnderMouse(event) {
  // convert pixel coords to "normalized device coords" (-1 to +1)
  // (this works because the canvas fills the whole window; see your-booth/booth.js for a smaller canvas)
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(pegTargets);
  return hits.length > 0 ? hits[0].object.userData.peg : null;
}

// Hovering: the peg glows and the mouse turns into a pointing hand.
let hoveredPeg = null;
// (listening on the canvas, not the window, so clicks on the help card don't throw rings)
renderer.domElement.addEventListener('pointermove', (event) => {
  const peg = pegUnderMouse(event);
  if (peg === hoveredPeg) return;
  if (hoveredPeg) hoveredPeg.material.emissive.set(0x000000); // stop glowing
  if (peg) peg.material.emissive.set(0x663300);               // start glowing
  hoveredPeg = peg;
  document.body.style.cursor = peg ? 'pointer' : 'default';
});

renderer.domElement.addEventListener('click', (event) => {
  const peg = pegUnderMouse(event);
  if (!peg) return;

  peg.userData.wobble = 1; // little "boing" so you know the click landed
  tossesThisClick = 0;

  onPegClicked(peg);

  if (tossesThisClick === 0) {
    hintEl.textContent = 'You hit a peg! Now open ring-toss/main.js and finish TODO GOLD to toss a ring.';
  }
});

// ---------- GOLD: CLICK A PEG TO TOSS A RING ----------
// This runs every time someone clicks a peg. `peg` is the peg they clicked.
function onPegClicked(peg) {
  // TODO GOLD: toss a ring onto the peg that was clicked. Uncomment each step as you go.
  //
  // STEP 1. Make the ring. A Mesh is a shape + a look, exactly like the pegs above.
  //   Uncomment these 4 lines, then replace each ??? with:
  //     first ???  (the shape, a donut):  new THREE.TorusGeometry(0.3, 0.06, 12, 32)
  //     second ??? (the look, any color): new THREE.MeshStandardMaterial({ color: 0xf4b400 })
  //
  // const ring = new THREE.Mesh(
  //   ???,
  //   ???
  // );
  //
  // STEP 2. A torus starts standing up like a tire. Tip it a quarter turn so it lies flat:
  // ring.rotation.x = Math.PI / 2;
  //
  // STEP 3. Nothing is drawn until it is in the scene:
  // scene.add(ring);
  //
  // STEP 4. Throw it! tossRing is already written for you below. It flies, stacks, and scores.
  // tossRing(ring, peg);
  //
  // CHECK: save, then click a peg. The ring flies in, slides down, and Ringers goes up.
  //
  // STUCK? Match what you see:
  //   Nothing happens + red "Unexpected token" in the Console -> a ??? is still there, or a comma is missing
  //   Ring lands standing up like a wheel                     -> step 2 is still commented out
  //   Ringers goes up but you never see a ring                -> step 3 is still commented out
  //   Hint still says "finish TODO GOLD"                      -> step 4 is still commented out
  //
  // DONE? Try: a random color for every ring (see BONUS IDEAS at the bottom), or a fatter ring
  //   (0.3 is the ring size, 0.06 is how thick the dough is; the docs page has sliders).
}

// ---------- RING PHYSICS (done for you) ----------
// You do not need to change anything below to finish GOLD. Read it if you are curious!
const MAX_RINGS_PER_PEG = 8;
const RING_THICKNESS = 0.12; // 2 x the tube size (0.06) in the TorusGeometry
const flyingRings = [];

function tossRing(ring, peg) {
  tossesThisClick++;

  if (!ring.parent) {
    console.warn('Ring Toss: your ring is not in the scene. Did you forget scene.add(ring)?');
  }
  if (peg.userData.ringsOnPeg >= MAX_RINGS_PER_PEG) {
    hintEl.textContent = 'That peg is full! Try another one.';
    scene.remove(ring);
    return;
  }

  // Save a spot on the peg now, so two fast clicks never land in the same place.
  const slot = peg.userData.ringsOnPeg++;

  // Start just below the camera, like it left your hand.
  const start = camera.localToWorld(new THREE.Vector3(0, -1.5, -2));
  ring.position.copy(start);

  flyingRings.push({
    ring,
    peg,
    start,
    // 1) fly to just above the peg's tip
    above: new THREE.Vector3(peg.position.x, COUNTER_TOP + PEG_HEIGHT + 0.4, peg.position.z),
    // 2) then slide down and stack on top of earlier rings
    restY: COUNTER_TOP + RING_THICKNESS / 2 + slot * RING_THICKNESS,
    phase: 'fly',
    time: 0,
  });
  hintEl.textContent = 'Nice throw!';
}

const FLIGHT_SECONDS = 0.7;
const ARC_HEIGHT = 2.5;

function updateRings(dt) {
  for (let i = flyingRings.length - 1; i >= 0; i--) {
    const toss = flyingRings[i];
    const ring = toss.ring;
    toss.time += dt;

    if (toss.phase === 'fly') {
      const t = Math.min(toss.time / FLIGHT_SECONDS, 1); // 0 = just thrown, 1 = above peg
      ring.position.lerpVectors(toss.start, toss.above, t);
      ring.position.y += Math.sin(t * Math.PI) * ARC_HEIGHT; // the arc
      ring.rotation.y = Math.sin(t * Math.PI * 4) * 0.4 * (1 - t); // wobble, settles flat

      if (t === 1) {
        toss.phase = 'drop';
        toss.speed = 0;
      }
    } else {
      toss.speed += 25 * dt; // gravity
      ring.position.y -= toss.speed * dt;

      if (ring.position.y <= toss.restY) {
        ring.position.y = toss.restY;
        ring.rotation.y = 0;
        flyingRings.splice(i, 1); // done moving
        scoreRinger(toss.peg);
      }
    }
  }
}

function scoreRinger(peg) {
  ringers++;
  scoreEl.textContent = ringers;
  hintEl.textContent = `RINGER! That's ${ringers}.`;
  peg.userData.wobble = 1;
}

// ---------- ANIMATION LOOP ----------
const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.1); // seconds since last frame (capped if the tab was hidden)
  const elapsed = clock.elapsedTime;           // seconds since the page loaded

  wheel.rotation.z = elapsed * 0.3; // TODO BRONZE: speed it up or reverse it

  updateRings(dt);

  // pegs "boing" when clicked or when a ring lands
  for (const peg of pegs) {
    const w = peg.userData.wobble || 0;
    peg.rotation.z = Math.sin(elapsed * 30) * 0.08 * w;
    peg.userData.wobble = w * 0.9; // fade out
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// keep the canvas sized to the window
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix(); // forget this and resizing stretches everything
  renderer.setSize(innerWidth, innerHeight);
});

// BONUS IDEAS
// - OrbitControls so you can drag to look around (see import at top)
//     const controls = new OrbitControls(camera, renderer.domElement);
// - Make each Ferris wheel car stay upright while the wheel turns (counter-rotate it)
// - Give each ring a random color: new THREE.Color().setHSL(Math.random(), 0.8, 0.55)
// - Make it harder: sometimes the ring misses (if Math.random() < 0.2, don't call tossRing)
// - Add a PointLight that blinks on and off like marquee bulbs
// - Load a free .glb model with GLTFLoader from 'three/addons/loaders/GLTFLoader.js'
