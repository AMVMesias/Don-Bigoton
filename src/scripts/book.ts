import { PageFlip } from 'page-flip';
import type { SizeType } from 'page-flip';

const bookElement = document.querySelector<HTMLElement>('#book')!;
const main = document.querySelector<HTMLElement>('#reader-main')!;
const viewportElement = document.querySelector<HTMLElement>('#book-viewport')!;
const pages = Array.from(bookElement.querySelectorAll<HTMLElement>('.sheet'));
const prev = document.querySelector<HTMLButtonElement>('#prev-page')!;
const next = document.querySelector<HTMLButtonElement>('#next-page')!;
const status = document.querySelector<HTMLOutputElement>('#page-status')!;
const slider = document.querySelector<HTMLInputElement>('#page-slider')!;
const hint = document.querySelector<HTMLElement>('#reader-hint')!;
const mode = document.querySelector<HTMLElement>('#reading-mode')!;
const zoomButton = document.querySelector<HTMLButtonElement>('#zoom-toggle')!;
const indexToggle = document.querySelector<HTMLButtonElement>('#index-toggle')!;
const indexMenu = document.querySelector<HTMLElement>('#book-index')!;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const ambientMotion = document.querySelector<HTMLButtonElement>('#ambient-motion');
ambientMotion?.addEventListener('click', () => {
  const paused = document.body.classList.toggle('ambient-paused');
  const label = paused ? 'Reanudar animaciones de la revista' : 'Pausar animaciones de la revista';
  ambientMotion.setAttribute('aria-pressed',String(paused));
  ambientMotion.setAttribute('aria-label',label);
  ambientMotion.title=label;
});
let zoomed = false;
let busy = false;
let pageWidth = 540;
let book: PageFlip;

function sizeBook() {
  const desktop = window.innerWidth >= 820;
  const availableHeight = viewportElement.clientHeight - 36;
  const byHeight = Math.max(280, availableHeight * 540 / 760);
  const availableWidth = Math.max(280, document.documentElement.clientWidth - (desktop ? 100 : 28));
  pageWidth = zoomed ? 540 : Math.floor(Math.min(540, byHeight, availableWidth / (desktop ? 2 : 1)));
  bookElement.style.width = `${pageWidth * (desktop ? 2 : 1)}px`;
  bookElement.style.height = `${pageWidth * 760 / 540}px`;
  bookElement.style.setProperty('--page-scale', String(pageWidth / 540));
  if (book) {
    book.getUI().update();
    bookElement.style.setProperty('--page-scale',String(book.getBoundsRect().pageWidth/540));
  }
}
document.body.classList.add('reader-ready');
sizeBook();

// El contenido se compone en un lienzo editorial constante y se escala como una página impresa.
// Solo las páginas de entrevista más densas usan el ajuste tipográfico previsto para ellas.
pages.forEach(page => {
  const content = page.querySelector<HTMLElement>('.page-content');
  if (content && page.classList.contains('qa-page') && content.scrollHeight > content.clientHeight + 1) page.classList.add('dense');
});

function closeIndex() { indexMenu.hidden = true; indexToggle.setAttribute('aria-expanded','false'); }
indexToggle.addEventListener('click', () => {
  const willOpen = indexMenu.hidden;
  indexMenu.hidden = !willOpen;
  indexToggle.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) indexMenu.querySelector<HTMLButtonElement>('[data-goto]')?.focus();
});
document.querySelector('#index-close')?.addEventListener('click', () => { closeIndex(); indexToggle.focus(); });
document.addEventListener('click', event => {
  const target = event.target as Element;
  if (!indexMenu.hidden && !indexMenu.contains(target) && !indexToggle.contains(target)) closeIndex();
});

function updateReader() {
  if (!book) return;
  const index = book.getCurrentPageIndex();
  const portrait = book.getOrientation() === 'portrait';
  const isFront = index === 0;
  const isBack = index === pages.length - 1;
  bookElement.dataset.position = isFront ? 'front' : isBack ? 'back' : 'spread';
  bookElement.dataset.orientation = portrait ? 'portrait' : 'landscape';
  const end = portrait || isFront || isBack ? index : Math.min(index + 1,pages.length - 1);
  const formatted = String(index + 1).padStart(2,'0');
  status.textContent = isFront ? `PORTADA / ${pages.length}` : isBack ? `CONTRAPORTADA / ${pages.length}` : `${formatted}${end !== index ? `–${String(end+1).padStart(2,'0')}` : ''} / ${pages.length}`;
  slider.value = String(index + 1);
  slider.setAttribute('aria-valuetext',status.textContent);
  prev.disabled = isFront || busy;
  next.disabled = isBack || busy;
  mode.textContent = portrait ? 'UNA PÁGINA' : 'DOBLE PÁGINA';
  hint.innerHTML = isFront ? '<span aria-hidden="true">↳</span> Abre la revista. Hay una historia detrás de cada sabor.' : portrait ? 'Desliza para pasar la página · Usa Ampliar para leer más cerca.' : 'Pasa la página desde una esquina o utiliza las flechas del teclado.';
  pages.forEach((page,i) => { const active = i >= index && i <= end; page.inert = !active; page.setAttribute('aria-hidden',String(!active)); });
  // Los acentos se animan una vez al abrir la doble página, sin mover los párrafos.
  if (!reduced.matches) pages.slice(index,end+1).forEach(page => page.querySelectorAll<HTMLElement>('.turn-flower,.cat-star').forEach(flower => {
    flower.animate([{transform:'rotate(-35deg)',opacity:.4},{transform:'rotate(0)',opacity:1}],{duration:850,easing:'cubic-bezier(.2,.7,.3,1)'});
  }));
  if (!reduced.matches) pages.slice(index,end+1).forEach(page => {
    if (page.dataset.animated === 'true') return;
    page.dataset.animated='true';
    page.querySelectorAll<HTMLElement>('.book-questions blockquote').forEach((quote,i)=>{
      quote.animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:100+i*120,easing:'ease-out'});
    });
  });
  history.replaceState(null,'',`#pagina-${index+1}`);
}
function forward() { if (book && !busy && book.getCurrentPageIndex() < pages.length-1) reduced.matches ? book.turnToNextPage() : book.flipNext(); }
function backward() { if (book && !busy && book.getCurrentPageIndex() > 0) reduced.matches ? book.turnToPrevPage() : book.flipPrev(); }
document.addEventListener('click', event => {
  const target = event.target as Element;
  const jump = target.closest<HTMLElement>('[data-goto]');
  if (jump && book) { event.preventDefault(); book.turnToPage(Number(jump.dataset.goto)); closeIndex(); updateReader(); }
  if (target.closest('[data-next]')) { event.preventDefault(); forward(); }
});
prev.addEventListener('click',backward);
next.addEventListener('click',forward);
slider.addEventListener('input', () => { if (book) { book.turnToPage(Number(slider.value)-1); updateReader(); } });
document.addEventListener('keydown',event => {
  if (event.key === 'Escape') { closeIndex(); if (zoomed) zoomButton.click(); return; }
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || !indexMenu.hidden) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); forward(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); backward(); }
});
zoomButton.addEventListener('click', () => {
  zoomed = !zoomed;
  main.classList.toggle('zoomed',zoomed);
  zoomButton.textContent = zoomed ? 'Reducir −' : 'Ampliar ＋';
  zoomButton.setAttribute('aria-pressed',String(zoomed));
  sizeBook();
  window.dispatchEvent(new Event('resize'));
});
['touchstart','touchmove','mousedown'].forEach(type=>viewportElement.addEventListener(type,event=>{
  if(zoomed && !(event.target as Element).closest('a,button')) event.stopPropagation();
},{capture:true,passive:true}));

async function startBook() {
  await document.fonts.ready;
  pages.forEach(page => {
    const content = page.querySelector<HTMLElement>('.page-content');
    const layout = page.querySelector<HTMLElement>('.page-layout');
    if (content && page.classList.contains('qa-page') && content.scrollHeight > content.clientHeight+1) page.classList.add('dense');
    if (content && layout && !page.classList.contains('book-cover') && !page.classList.contains('portrait-page')) {
      let fit = 1;
      while (content.scrollHeight > content.clientHeight+1 && fit > .78) {
        fit = Math.round((fit-.015)*1000)/1000;
        layout.style.zoom=String(fit);
      }
      page.dataset.contentFit=String(fit);
    }
    if (content) page.dataset.contentOverflow=String(Math.max(0,content.scrollHeight-content.clientHeight));
  });
  const requested = Number(location.hash.match(/^#pagina-(\d+)$/)?.[1] || 1)-1;
  book = new PageFlip(bookElement, {
    width:540,height:760,size:'stretch' as SizeType,minWidth:280,maxWidth:540,minHeight:394,maxHeight:760,
    showCover:true,usePortrait:true,autoSize:false,startPage:Math.max(0,Math.min(pages.length-1,requested)),
    drawShadow:true,maxShadowOpacity:.3,flippingTime:reduced.matches?1:850,mobileScrollSupport:false,
    useMouseEvents:true,clickEventForward:true,disableFlipByClick:true,swipeDistance:35,
  });
  book.on('init',()=>{document.body.classList.add('reader-ready');updateReader();});
  book.on('flip',updateReader);
  book.on('changeOrientation',updateReader);
  book.on('changeState',event=>{busy=event.data==='flipping';if(!busy)updateReader();});
  document.body.classList.add('reader-ready');
  book.loadFromHTML(pages);
  sizeBook();
  updateReader();
  window.addEventListener('resize',()=>{sizeBook();requestAnimationFrame(updateReader);});
}
startBook().catch(error=>{
  document.body.classList.remove('reader-ready');
  hint.textContent='Abre la versión de lectura continua si tu navegador no admite el visor.';
  console.error('No se pudo iniciar el visor de revista',error);
});
