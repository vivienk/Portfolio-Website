// Keep sans-serif headings intact, including Framer's hydrated variants.
const headings = 'h1,h2,h3,h4,h5,h6,[role="heading"]';
function applySerifHeadings() {
  document.querySelectorAll(headings).forEach(heading => {
    if (heading.classList.contains('case-serif-heading')) return;
    const family = getComputedStyle(heading).fontFamily;
    if (/(?:^|,)\s*serif\s*(?:,|$)|Sigurd|Garamond|Georgia|Times|Baskerville|Didot|Bodoni|Playfair|Cormorant/i.test(family)) {
      heading.classList.add('case-serif-heading');
    }
  });
}
applySerifHeadings();
let scheduled = false;
new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; applySerifHeadings(); });
}).observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class','style']});
