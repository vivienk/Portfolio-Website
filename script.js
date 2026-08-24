const nav = document.querySelector('.nav');
addEventListener('scroll', () => nav.style.boxShadow = scrollY > 16 ? '0 8px 30px rgba(0,0,0,.45)' : 'none', {passive:true});

document.querySelectorAll('.project').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.transform = `perspective(700px) rotateX(${(r.top+r.height/2-e.clientY)/40}deg) rotateY(${(e.clientX-r.left-r.width/2)/40}deg) translateY(-7px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
});
