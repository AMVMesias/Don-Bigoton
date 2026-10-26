import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const progress = document.querySelector<HTMLElement>('.reading-progress span');
let scrollPending = false;
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const mobileNav = document.querySelector<HTMLElement>('#mobile-nav');
function closeMenu() {
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (mobileNav) mobileNav.hidden = true;
}
menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  if (mobileNav) mobileNav.hidden = expanded;
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuToggle.focus();
  }
});

const ingredients = [
  { title: 'La sazón', copy: 'La fundadora aporta su experiencia en cocina y el sabor que ha perfeccionado con práctica y cursos.', word: 'experiencia.', symbol: '✳' },
  { title: 'El impulso', copy: 'Uno de sus hijos aportó el capital. Empezar desde casa les permitió probar la idea sin la presión de pagar un arriendo.', word: 'decisión.', symbol: '↗' },
  { title: 'La identidad', copy: 'Su hijo formado en marketing diseñó la marca. La familia también suma publicidad, tarjetas y apoyo con fotos y videos.', word: 'creatividad.', symbol: '✦' },
  { title: 'La confianza', copy: 'Hermanos, vecinos y clientes recomiendan la comida. En el grupo de emprendimientos, la experiencia de uno anima al siguiente.', word: 'comunidad.', symbol: '◎' },
];
const ingredientButtons = document.querySelectorAll<HTMLButtonElement>('[data-ingredient]');
ingredientButtons.forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.ingredient);
  const ingredient = ingredients[index];
  if (!ingredient) return;
  ingredientButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const setText = (selector: string, value: string) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
  setText('#ingredient-title', ingredient.title);
  setText('#ingredient-copy', ingredient.copy);
  setText('#ingredient-word', ingredient.word);
  setText('.recipe-number', `0${index + 1}`);
  setText('.recipe-symbol', ingredient.symbol);
  if (!reducedMotion.matches) gsap.fromTo('.recipe-center', { opacity: .35, y: 8 }, { opacity: 1, y: 0, duration: .35, overwrite: true });
}));

// Cada tema mantiene su texto completo en el documento; la navegación solo acompaña la lectura.
const interviewObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = (entry.target as HTMLElement).dataset.interviewGroup;
    document.querySelectorAll<HTMLAnchorElement>('[data-interview-link]').forEach(link => {
      if (link.dataset.interviewLink === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
document.querySelectorAll('[data-interview-group]').forEach(group => interviewObserver.observe(group));
const chapterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach(link => {
      if (link.dataset.nav === entry.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
document.querySelectorAll('#historia, #sabores, #entrevista, #futuro').forEach(section => chapterObserver.observe(section));

const gallery = document.querySelector<HTMLDialogElement>('.gallery-dialog');
const galleryImage = document.querySelector<HTMLImageElement>('#gallery-image');
const galleryTitle = document.querySelector('#gallery-title');
const galleryCount = document.querySelector('#gallery-count');
const photos = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-gallery]'));
let photoIndex = 0;
let lastGalleryTrigger: HTMLButtonElement | undefined;
function showPhoto(index: number) {
  photoIndex = (index + photos.length) % photos.length;
  const trigger = photos[photoIndex];
  const image = trigger?.querySelector('img');
  const title = trigger?.closest('article')?.querySelector('h3')?.textContent || 'Fotografía';
  if (!image || !galleryImage) return;
  galleryImage.src = image.currentSrc || image.src;
  galleryImage.alt = image.alt;
  if (galleryTitle) galleryTitle.textContent = title;
  if (galleryCount) galleryCount.textContent = `${photoIndex + 1} / ${photos.length}`;
}
photos.forEach((button,index) => button.addEventListener('click', () => {
  showPhoto(index); lastGalleryTrigger = button;
  gallery?.showModal(); document.body.classList.add('dialog-open');
}));
document.querySelector('.gallery-close')?.addEventListener('click', () => gallery?.close());
document.querySelector('.gallery-prev')?.addEventListener('click', () => showPhoto(photoIndex - 1));
document.querySelector('.gallery-next')?.addEventListener('click', () => showPhoto(photoIndex + 1));
gallery?.addEventListener('click', event => { if (event.target === gallery) gallery.close(); });
gallery?.addEventListener('close', () => { document.body.classList.remove('dialog-open'); lastGalleryTrigger?.focus(); });
gallery?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
});

gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.cover-heading h1', { y: 24, opacity: .35, duration: 1.1, ease: 'power3.out', clearProps: 'all' });
  gsap.from('.hero-food', { y: 35, rotation: 3, opacity: .3, duration: 1.25, delay: .12, ease: 'power3.out', clearProps: 'all' });
  gsap.to('.hero-food', { y: -24, rotation: 3, ease: 'none', scrollTrigger: { trigger: '.cover-stage', start: 'top center', end: 'bottom top', scrub: 1 } });
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
    gsap.from(element, { y: 22, opacity: .35, duration: .75, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true }, clearProps: 'all' });
  });
  gsap.utils.toArray<HTMLElement>('.sticky-flower').forEach(element => {
    gsap.to(element, { rotation: 150, ease: 'none', scrollTrigger: { trigger: element.closest('.interview-group'), start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });
  gsap.utils.toArray<HTMLElement>('.answer-quote').forEach(element => {
    gsap.fromTo(element, { color: '#8d7c68', x: 0 }, { color: '#a34227', x: 4, ease: 'none', scrollTrigger: { trigger: element, start: 'top 80%', end: 'top 48%', scrub: true } });
  });
  gsap.to('.neighbor-star', { rotation: 130, ease: 'none', scrollTrigger: { trigger: '.neighbor', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.brand-art-star', { rotation: 90, ease: 'none', scrollTrigger: { trigger: '.brand-story', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.from('.flow-line', { scaleY: 0, stagger: .2, duration: .6, scrollTrigger: { trigger: '.digital-flow', start: 'top 75%', once: true } });
  gsap.from('.scroll-quote em', { color: '#38281f', scrollTrigger: { trigger: '.final-quote', start: 'top 65%', end: 'center 55%', scrub: true } });
});
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => { ScrollTrigger.refresh(); updateProgress(); }));
document.fonts.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => { ScrollTrigger.refresh(); updateProgress(); });
