const steps=[['Set expectations before asking for data','A clear first screen explains the short verification process and reinforces security, privacy, and the no-impact credit check.','“Why do you need this?”','Explain the benefit and purpose of requested information before the form begins.','Step completion and exits before first input.'],['Verify identity with context','Name and identity inputs are grouped into one focused moment, supported by purpose-led microcopy.','Sensitive data without a reason feels risky.','Keep the form focused and surface security reassurance beside the request.','Completion through identity verification.'],['Confirm the delivery address','Address verification continues the same sequence instead of appearing as an unrelated application task.','The customer cannot see how this step connects to the product.','Use progress and context to show what is complete and what comes next.','Address-step completion and recovery.'],['Keep the customer informed','Phone number collection is framed around account updates rather than a generic required field.','Another data request can feel like unnecessary effort.','Use a concise explanation tied to a concrete customer benefit.','Phone-step completion and form errors.'],['Finish with secure access','Two-factor authentication closes the flow with an explicit security benefit and a clear finish state.','A final security step can create unexpected abandonment.','Prepare the customer for the final action and preserve their session if they leave.','2FA completion and resumed sessions.']];const buttons=[...document.querySelectorAll('[data-step]')];const set=(i)=>{let s=steps[i];buttons.forEach((b,n)=>{const active=n===i;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});document.querySelector('#number').textContent=`${String(i+1).padStart(2,'0')} / 05`;['title','body','friction','decision','proof'].forEach((id,n)=>document.querySelector('#'+id).textContent=s[n]);};buttons.forEach((b,i)=>{b.onclick=()=>set(i);b.addEventListener('keydown',(event)=>{if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;event.preventDefault();const next=(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;set(next);buttons[next].focus();});});set(0);

const flowLightbox=document.querySelector('.flowLightbox');
if(flowLightbox){
  const image=flowLightbox.querySelector('img');
  const title=flowLightbox.querySelector('#flowLightboxTitle');
  document.querySelectorAll('[data-flow-src]').forEach((trigger)=>trigger.addEventListener('click',()=>{
    image.src=trigger.dataset.flowSrc;
    image.alt=`${trigger.dataset.flowTitle} enlarged`;
    title.textContent=trigger.dataset.flowTitle;
    flowLightbox.showModal();
  }));
  flowLightbox.querySelector('.flowMinimize').addEventListener('click',()=>flowLightbox.close());
  flowLightbox.addEventListener('click',(event)=>{if(event.target===flowLightbox)flowLightbox.close();});
  flowLightbox.addEventListener('close',()=>image.removeAttribute('src'));
}

const processRail = document.querySelector('.processRail');
const problemSection = document.querySelector('#problem');
if (processRail && problemSection) {
  const links = [...processRail.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute('href')));
  let frame;
  let activeHref;
  const updateRail = () => {
    frame = undefined;
    processRail.classList.toggle('isVisible', scrollY + innerHeight * .36 >= problemSection.offsetTop);
    let current = sections[0];
    sections.forEach((section) => {
      if (section && section.getBoundingClientRect().top <= innerHeight * .42) current = section;
    });
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${current?.id}`;
      link.classList.toggle('isActive', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (matchMedia('(max-width: 1119px)').matches && current && activeHref !== `#${current.id}`) {
      const activeLink = links.find((link) => link.getAttribute('href') === `#${current.id}`);
      if (activeLink) processRail.scrollTo({left:activeLink.parentElement.offsetLeft - (processRail.clientWidth - activeLink.parentElement.clientWidth) / 2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
    activeHref = current ? `#${current.id}` : undefined;
  };
  const queueRailUpdate = () => { if (!frame) frame = requestAnimationFrame(updateRail); };
  addEventListener('scroll', queueRailUpdate, {passive:true});
  addEventListener('resize', queueRailUpdate);
  queueRailUpdate();
}

document.querySelectorAll('.screenCarousel').forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('.carouselSlide')];
  const pauseButton = carousel.querySelector('.carouselPause');
  const count = carousel.querySelector('.carouselCount');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = false;
  let timer;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('isActive', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };
  const stop = () => { clearInterval(timer); timer = undefined; };
  const start = () => {
    stop();
    if (!paused && !reducedMotion.matches && !document.hidden) timer = setInterval(() => show(index + 1), 2500);
  };
  carousel.querySelector('.carouselPrev').addEventListener('click', () => { show(index - 1); start(); });
  carousel.querySelector('.carouselNext').addEventListener('click', () => { show(index + 1); start(); });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
    pauseButton.setAttribute('aria-pressed', String(paused));
    start();
  });
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  addEventListener('pagehide', stop, {once:true});
  show(0);
  start();
});

const beforeVideo = document.querySelector('.beforeEvidence video');
if (beforeVideo) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const syncVideoMotion = () => {
    if (reducedMotion.matches) beforeVideo.pause();
    else if (beforeVideo.paused) beforeVideo.play().catch((error) => console.warn('Onboarding video could not autoplay:', error));
  };
  reducedMotion.addEventListener('change', syncVideoMotion);
  syncVideoMotion();
}
