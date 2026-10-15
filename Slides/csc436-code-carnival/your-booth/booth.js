// GRAND FINALE: BUILD YOUR OWN BOOTH
// A minimal Three.js stage that fits inside #stage instead of the whole window.
// Copy pieces from the Ring Toss and Safety Inspector booths as you need them.
// Stuck or blank stage? Press F12 > Console and read the red error. It gives the line number.

import * as THREE from 'three';

const stage = document.querySelector('#stage');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1f3b);

const camera = new THREE.PerspectiveCamera(60, stage.clientWidth / stage.clientHeight, 0.1, 100);
camera.position.set(0, 1.5, 6);
camera.lookAt(0, 0, 0); // point the audience at the center of the stage

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
stage.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1.4);
light.position.set(3, 5, 4);
scene.add(light);

// =====================================================================
// SILVER: YOUR THREE.JS ATTRACTION
//   1. Delete the placeholder `prize` below (and its two lines in animate()).
//   2. Build at least 2 meshes of your own: Mesh(geometry, material), set position, scene.add().
//      Shapes to try: BoxGeometry, SphereGeometry, ConeGeometry, CylinderGeometry, TorusGeometry.
//      The stage center is (0, 0, 0). Keep x between -4 and 4 and y between -2 and 2 so it stays in view.
//   3. Make at least one of them move inside animate() (rotate it, bob it with Math.sin(elapsed)).
//   DONE WHEN: the stage shows 2+ of your own meshes and at least one moves.
// =====================================================================

// Placeholder attraction: a spinning prize. Replace it with your own.
const prize = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.2, 0),
  new THREE.MeshStandardMaterial({ color: 0xf4b400, flatShading: true })
);
scene.add(prize);

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime(); // seconds since the page loaded, handy for Math.sin(elapsed)

  prize.rotation.y += 0.01;
  prize.rotation.x += 0.005;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

addEventListener('resize', () => {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
});

// =====================================================================
// GOLD: A SAFE VISITOR WALL
//   The form is already in index.html. These four lines grab its pieces for you:
const visitorForm = document.querySelector('#visitor-form');
const visitorInput = document.querySelector('#visitor-input');
const visitorError = document.querySelector('#visitor-error');
const visitorList = document.querySelector('#visitor-list');
//
//   G1. Below, add a submit listener:  visitorForm.addEventListener('submit', (event) => { ... });
//   G2. First line inside it:  event.preventDefault();  (stops the page from reloading)
//   G3. Read and trim the text:  const text = visitorInput.value.trim();
//   G4. Validate. If text is '' OR text.length > 100:
//         visitorError.textContent = 'Posts must be 1 to 100 characters.';  then  return;
//   G5. Otherwise clear the error (visitorError.textContent = ''), then make the post SAFELY:
//         const li = document.createElement('li');
//         li.textContent = text;          // textContent, NEVER innerHTML
//         visitorList.append(li);
//         visitorForm.reset();
//   DONE WHEN: a blank post shows the error, a 101+ character post shows the error,
//              and posting <b>hi</b> shows the tags as plain text.
//   (Same pattern as safety-inspector/guestbook.js. Look there if you get stuck.)
// =====================================================================

// your Gold code goes here


// =====================================================================
// BONUS: MAKE THE 3D AND THE PAGE TALK (pick ONE recipe)
//
//   Recipe A: click a 3D object -> the page changes
//     1. Copy the Raycaster code from ring-toss/main.js (the click listener).
//     2. Change `innerWidth` / `innerHeight` / `event.clientX` to use the stage instead:
//          const box = renderer.domElement.getBoundingClientRect();
//          mouse.x = ((event.clientX - box.left) / box.width) * 2 - 1;
//          mouse.y = -((event.clientY - box.top) / box.height) * 2 + 1;
//     3. Listen on the canvas only:  renderer.domElement.addEventListener('click', ...)
//     4. When something is hit, change the page, for example:
//          document.querySelector('#booth-name').textContent = 'WINNER!';
//
//   Recipe B: submit the form -> the 3D scene changes
//     At the end of your Gold submit handler (after the post is added), change a mesh, for example:
//          myMesh.scale.multiplyScalar(1.2);                 // grows with every post (Cotton Candy!)
//          myMesh.material.color.set(Math.random() * 0xffffff); // new random color
//
//   DONE WHEN: one interaction crosses between the 3D stage and the regular page.
// =====================================================================
