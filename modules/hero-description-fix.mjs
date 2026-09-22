// The hero's tagline paragraph ("Finding meaningful signals...") sits inside
// a React-hydrated RichTextContainer. Editing its static HTML text directly
// gets silently discarded once React reconciles that subtree — same pattern
// as the Projects section and hero canvas elsewhere in this codebase — so
// the replacement text is (re)applied here at runtime instead, self-healing
// via MutationObserver + a short poll in case React corrects it more than
// once.
const OLD_TEXTS = [
  'Finding meaningful signals in complexity, turn them into better metrics.',
  'I design systems that turn messy signals into better decisions, creating stronger signals over time.',
];
const NEW_TEXT = 'Designing systems that turn messy signals into better decisions, creating stronger signals over time.';

function patch() {
  for (const em of document.querySelectorAll('em.framer-text')) {
    if (OLD_TEXTS.includes(em.textContent.trim())) {
      em.innerHTML = NEW_TEXT.split(' ').map(word => `<span class="framer-text">${word}</span>`).join(' ');
    }
  }
}

let pending = false;
function schedule() {
  if (pending) return;
  pending = true;
  setTimeout(() => { pending = false; patch(); }, 0);
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
patch();
let attempts = 0;
const poll = setInterval(() => {
  patch();
  if (++attempts > 20) clearInterval(poll);
}, 500);
