// GRAND FINALE: BUILD YOUR OWN BOOTH
// A minimal Three.js stage that fits inside #stage instead of the whole window.
// Copy pieces from the Ring Toss and Safety Inspector booths as you need them.
//
// WHERE THINGS GO
//   SILVER - replace the placeholder prize below with your own attraction
//   GOLD   - uncomment the GOLD block at the bottom (and the form in index.html)
//   BONUS  - uncomment the BONUS block: clicking the 3D prize animates the page title

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

// ---------- SILVER: YOUR ATTRACTION ----------
// Placeholder attraction: a spinning prize. Replace it with your own.
// Ideas: copy the Ferris wheel (a Group of meshes), the pegs, or your Silver tent from ring-toss/main.js.
// The stage is smaller than the Ring Toss world: things around x -3..3, y -1.5..2 are in view.
const prize = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.2, 0),
  new THREE.MeshStandardMaterial({ color: 0xf4b400, flatShading: true })
);
scene.add(prize);

function animate() {
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

// ---------- BONUS: CLICK THE 3D PRIZE, THE PAGE REACTS ----------
// IMPORTANT: this canvas does NOT fill the window like the Ring Toss did, so the mouse math
// measures from the canvas's own corner (getBoundingClientRect). Copying the Ring Toss
// version (innerWidth / innerHeight) would make clicks miss.
//
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();
// const title = document.querySelector('#booth-name');
//
// renderer.domElement.addEventListener('click', (event) => {
//   const box = renderer.domElement.getBoundingClientRect();
//   mouse.x = ((event.clientX - box.left) / box.width) * 2 - 1;
//   mouse.y = -((event.clientY - box.top) / box.height) * 2 + 1;
//   raycaster.setFromCamera(mouse, camera);
//
//   if (raycaster.intersectObject(prize).length > 0) {
//     // 3D talks to CSS: play an Animate.css effect on the page title (same trick as the Fun House)
//     title.classList.add('animate__animated', 'animate__tada');
//     title.addEventListener('animationend', () => {
//       title.classList.remove('animate__animated', 'animate__tada');
//     }, { once: true });
//   }
// });
//
// Other direction (CSS talks to 3D): in the GOLD submit handler, change the scene, e.g.
//   prize.material.color.setHSL(Math.random(), 0.8, 0.55);   or   prize.scale.multiplyScalar(1.1);

// ---------- GOLD: A SAFE VISITOR INPUT ----------
// First uncomment the form in index.html (inside #visitor-area), then uncomment this block.
// It works as-is EXCEPT validate(): finish it the way you did in the Safety Inspector.
//
// const visitorForm = document.querySelector('#visitor-form');
// const visitorInput = document.querySelector('#visitor-input');
// const visitorError = document.querySelector('#visitor-error');
// const visitorList = document.querySelector('#visitor-list');
//
// function validate(text) {
//   // TODO GOLD: return an error sentence if text is empty or longer than 40 characters, else null
//   return null;
// }
//
// visitorForm.addEventListener('submit', (event) => {
//   event.preventDefault();
//   const text = visitorInput.value.trim();
//
//   const problem = validate(text);
//   if (problem) {
//     visitorError.textContent = problem;
//     return;
//   }
//   visitorError.textContent = '';
//
//   const item = document.createElement('li');
//   item.textContent = text; // textContent, never innerHTML: visitor text stays plain text
//   visitorList.append(item);
//   visitorForm.reset();
// });
