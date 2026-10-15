// BOOTH 1: THE RING TOSS (Three.js)
// ESM only. Use import, never require().
//
// HOW TO WORK THIS BOOTH
//   1. Keep `npm run dev` running and this page open in the browser.
//   2. Search this file for "TODO BRONZE", then "TODO SILVER", then "TODO GOLD".
//   3. Save the file after every change. Vite reloads the page for you.
//   4. Stuck or blank screen? Open DevTools (F12) > Console. The red error tells you the line number.
//   Each tier ends with "DONE WHEN". Show the volunteer that exact thing to collect your tickets.
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
//   x, y, z   - x = left(-)/right(+), y = down(-)/up(+), z = away(-)/toward you(+)
//   rotation  - measured in radians. Math.PI is half a turn, Math.PI * 2 is a full turn
//   colors    - written as 0x + six hex digits, like 0xff0000 (red). Pick one at htmlcolorcodes.com
//               and swap the "#" for "0x":  #8e44ad  ->  0x8e44ad
//
// Every Three.js app is the same three ingredients:
//   1. A SCENE   (the stage)
//   2. A CAMERA  (the audience's eyes)
//   3. A RENDERER (the projector that draws the scene from the camera)
// Then an animation loop redraws it about 60 times a second.

import * as THREE from 'three';
// BONUS A (OrbitControls) step 1: uncomment the next line
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- 1. SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1f3b); // night sky over the midway

// ---------- 2. CAMERA ----------
// PerspectiveCamera(fieldOfView, aspectRatio, nearClip, farClip)
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 3, 14);
camera.lookAt(0, 2, 0);

// ---------- 3. RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ---------- LIGHTS ----------
// MeshStandardMaterial is black without light. Forgetting lights is the #1 "my scene is empty" bug.
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
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

// =====================================================================
// TODO BRONZE (1 ticket): RE-TUNE THE FERRIS WHEEL
//   Make all three changes below. Each one is marked "BRONZE".
//   B1. Rim color:  change 0xf4b400 on the RIM_COLOR line to any other color (see "colors" above).
//   B2. Car count:  change CAR_COUNT from 8 to 12.
//   B3. Spin:       in animate() near the bottom, change 0.3 to 1.0 (faster) or -0.3 (backwards).
//   DONE WHEN: the wheel has a new rim color, 12 evenly spaced cars, and spins at a new speed
//              or direction.
// =====================================================================

// ---------- THE FERRIS WHEEL ----------
// A Group lets us spin many meshes together as one object.
const wheel = new THREE.Group();
wheel.position.set(-5, 5, -4);
scene.add(wheel);

const RIM_COLOR = 0xf4b400; // BRONZE B1: change this color
const rim = new THREE.Mesh(
  new THREE.TorusGeometry(3.5, 0.12, 12, 48),
  new THREE.MeshStandardMaterial({ color: RIM_COLOR })
);
wheel.add(rim);

const CAR_COUNT = 8; // BRONZE B2: change to 12
const carColors = [0xd62839, 0x1fa7a0, 0xfff4dc, 0xf4b400];
const cars = []; // saved so the BONUS can keep each car upright

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
  cars.push(car);
}

// ---------- THE RING TOSS PEGS ----------
// Three red pegs at x = 2, 4, 6. Each is 1.5 tall, so the top of a peg is at y = 1.5.
const pegs = [];
for (let i = 0; i < 3; i++) {
  const peg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xd62839 })
  );
  peg.position.set(2 + i * 2, 0.75, 0);
  scene.add(peg);
  pegs.push(peg);
}

// =====================================================================
// TODO SILVER (2 tickets): BUILD A STRIPED TENT
//   Write your code right below this box. Follow the same 3 steps used for every object above:
//   make a Mesh(geometry, material), set its position, then scene.add() it.
//
//   S1. Tent body: a BoxGeometry(3, 2, 3) in any color.
//       Position it at (0, 1, -3). Why y = 1? A box is centered on its position,
//       so a box 2 tall needs y = 1 to sit on the ground instead of sinking halfway in.
//   S2. Tent roof: a ConeGeometry(2.4, 1.5, 4) in a different color.
//       Position it at (0, 2.75, -3). That is the body's top (2) plus half the cone's height (0.75).
//   S3. The 4-sided cone starts turned diagonally. Set roof.rotation.y = Math.PI / 4 so it lines up
//       with the box.
//   DONE WHEN: a two-color tent stands on the grass between the Ferris wheel and the pegs,
//              and the roof sits flat on the body with no gap or overlap.
//   Stretch: add a sign (a thin BoxGeometry) or a flag (a small ConeGeometry on top).
// =====================================================================

// your tent code goes here


// =====================================================================
// TODO GOLD (3 tickets): CLICK A PEG TO LAND A RINGER
//   The click detection (the "raycaster") is already done. When you click a peg, the
//   `if (hits.length > 0)` block below runs and `hits[0].object` is the peg you clicked.
//   You will make a ring appear above that peg and fall onto it.
//
//   G1. In the click handler below, make the ring:
//         const ring = new THREE.Mesh(
//           new THREE.TorusGeometry(0.4, 0.08, 8, 24),
//           new THREE.MeshStandardMaterial({ color: 0xf4b400 })
//         );
//   G2. Lay it flat:              ring.rotation.x = Math.PI / 2;
//   G3. Put it above the peg:     ring.position.set(peg.position.x, 5, peg.position.z);
//   G4. Show it and remember it:  scene.add(ring);  fallingRings.push(ring);
//   G5. In animate(), at the GOLD G5 comment, loop over fallingRings. For each ring:
//         if (ring.position.y > 0.1) ring.position.y -= 0.05;
//       (0.1 is just above the ground, so the ring slides down the peg and stops at the base.)
//   DONE WHEN: clicking any peg drops a gold ring from above that slides down the peg and stops
//              at the bottom, and the Ringers counter in the corner goes up by 1 for each click.
//   Stretch: give each ring a random color with  new THREE.Color(Math.random(), Math.random(), Math.random())
// =====================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const fallingRings = []; // GOLD: every ring you drop goes in here
let ringers = 0;

addEventListener('click', (event) => {
  // only count clicks on the 3D canvas (not on the instructions panel)
  if (event.target !== renderer.domElement) return;

  // convert pixel coords to "normalized device coords" (-1 to +1)
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(pegs);

  if (hits.length > 0) {
    const peg = hits[0].object; // the peg that was clicked

    // GOLD G1 to G4 go here


    ringers++;
    document.querySelector('#score').textContent = ringers;
  }
});

// BONUS A step 2 (and BONUS C setup) goes here, ABOVE the animation loop


// ---------- ANIMATION LOOP ----------
const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  wheel.rotation.z = elapsed * 0.3; // BRONZE B3: change 0.3 (try 1.0 or -0.3)

  // GOLD G5: lower every ring in fallingRings here


  // BONUS A (OrbitControls) step 3 goes here

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

// =====================================================================
// BONUS (5 tickets per team): pick ONE and finish it.
//   A. Drag to look around (OrbitControls)
//      1. Uncomment the OrbitControls import at the top of this file.
//      2. At the "BONUS A step 2" comment (just above the animation loop), add:
//           const controls = new OrbitControls(camera, renderer.domElement);
//           controls.target.set(0, 2, 0);
//      3. In animate(), at the "BONUS A step 3" comment, add:  controls.update();
//      DONE WHEN: dragging with the mouse circles the camera around the midway.
//      (If you see "Cannot access 'controls' before initialization", step 2 is below
//       animate(). Move it up to the step 2 comment.)
//   B. Upright cars
//      In animate(), after the wheel spins, loop over `cars` and set each
//      car.rotation.z = -wheel.rotation.z;
//      DONE WHEN: every car stays level, like a real Ferris wheel, while the wheel turns.
//   C. Blinking marquee bulb
//      At the "BONUS A step 2" comment (above the animation loop), add:
//        const bulb = new THREE.PointLight(0xffaa00, 20, 10);
//        bulb.position.set(0, 4, 2);
//        scene.add(bulb);
//      In animate(), add:  bulb.intensity = Math.sin(elapsed * 6) > 0 ? 20 : 0;
//      DONE WHEN: the pegs and tent flash on and off in a steady rhythm.
// =====================================================================
