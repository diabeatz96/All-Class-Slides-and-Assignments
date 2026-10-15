// BOOTH 2, GOLD (3 tickets): make each prize button play an Animate.css animation when clicked.
//
// How Animate.css works: an element animates when it has BOTH classes
//   animate__animated   (turns the system on)
//   animate__tada       (which animation to play; also try animate__bounce, animate__rubberBand,
//                        animate__jello, animate__heartBeat. Full list at animate.style)
// A class only animates the moment it is ADDED. If it is already there, clicking again does nothing.
// So after the animation ends, we remove the classes. The next click can then add them again.
//
// DONE WHEN: clicking any prize plays an animation, and clicking the SAME prize again replays it.
// Stuck? Press F12 > Console. A typo in a class name gives no error, so check spelling first.

const prizes = document.querySelectorAll('.prize');

for (const prize of prizes) {
  prize.addEventListener('click', () => {
    // TODO GOLD G1: add both classes. Type this line exactly (remove the //):
    // prize.classList.add('animate__animated', 'animate__tada');

    // TODO GOLD G2: when the animation finishes, remove both classes so the next click can replay it.
    // Remove the // from all three lines below. The class names must match G1 exactly.
    // prize.addEventListener('animationend', () => {
    //   prize.classList.remove('animate__animated', 'animate__tada');
    // }, { once: true });
  });
}

// BONUS (Gold stretch, no extra tickets): give each prize its OWN animation.
//   1. In index.html, add a data-anim attribute to each prize button, for example:
//        <button class="prize btn btn-lg btn-accent" data-anim="jello">Teddy Bear</button>
//      Use three different names: jello, rubberBand, heartBeat (case matters).
//   2. Here, inside the click handler, build the class name from it:
//        const anim = 'animate__' + prize.dataset.anim;
//   3. Use `anim` in place of 'animate__tada' in BOTH G1 and G2.
//   DONE WHEN: each of the three prizes moves in a different way.
