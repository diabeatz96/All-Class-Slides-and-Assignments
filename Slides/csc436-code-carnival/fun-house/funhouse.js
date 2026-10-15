// BOOTH 2 GOLD: make each prize button play an Animate.css animation when clicked.
// Do the warm-up in index.html first. The yellow "How to earn Gold" box on the page walks through each step.
//
// How Animate.css works: an element animates when it has BOTH classes
//   animate__animated   (turns the system on)
//   animate__tada       (which animation to play; try bounce, rubberBand, jello, heartBeat)
// Browse every animation (click one to preview it): https://animate.style/
//
// classList is how JavaScript adds or removes classes on an element:
//   element.classList.add('a', 'b')      element.classList.remove('a', 'b')

// Find every element with class="prize" (the three buttons)
const prizes = document.querySelectorAll('.prize');

for (const prize of prizes) {
  prize.addEventListener('click', () => {
    // TODO GOLD step 1: turn the animation on. Uncomment the next line, save, and click a prize.
    // prize.classList.add('animate__animated', 'animate__tada');

    // Now click the SAME prize again. Nothing happens! The classes are already there,
    // so the browser thinks the animation is finished.

    // TODO GOLD step 2: when the animation ends, take the classes off so the next click can replay it.
    // Uncomment these 3 lines, save, and click the same prize a few times:
    // prize.addEventListener('animationend', () => {
    //   prize.classList.remove('animate__animated', 'animate__tada');
    // }, { once: true }); // once: true means "only listen for the next animation, then stop"
  });
}

// STUCK?
//   Nothing moves at all  -> is step 1 still commented out? Check the spelling: two underscores in animate__
//   It only plays once    -> do step 2
//   Red text in the Console (Cmd+Option+J or Ctrl+Shift+J) -> it tells you the line number
//
// BONUS: give each prize a different animation.
//   1. In index.html, add a data-anim attribute to each prize:
//        <button class="prize btn btn-lg btn-accent" data-anim="jello">Teddy Bear</button>
//   2. Here, read it with prize.dataset.anim and build the class name:
//        const name = 'animate__' + prize.dataset.anim;
//      then use `name` instead of 'animate__tada' in both steps.
