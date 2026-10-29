import { PageFlip } from 'page-flip';
import { fitMagazinePages } from './fit-pages';
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
document.documentElement.classList.add('magazine-reader');
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
  pages.forEach((page,i) => {
    const active=i>=index&&i<=end;
    page.inert=!active;
    page.setAttribute('aria-hidden',String(!active));
    if(!active) page.querySelectorAll<HTMLIFrameElement>('[data-interview-player]').forEach(frame=>{
      frame.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), 'https://www.youtube-nocookie.com');
    });
  });
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
function turnPage(direction: 'forward' | 'backward') {
  if (!book || busy) return;
  const index=book.getCurrentPageIndex();
  if (direction==='forward' ? index>=pages.length-1 : index<=0) return;
  if (reduced.matches) {
    direction==='forward' ? book.turnToNextPage() : book.turnToPrevPage();
    return;
  }
  // StPageFlip applies its corner hit test even to flipPrev() requested by a button.
  // Its synthetic back corner lies outside the visible half in portrait mode.
  // Explicit navigation already has a direction; only free clicks need that test.
  const settings=book.getSettings();
  const cornerClicksOnly=settings.disableFlipByClick;
  settings.disableFlipByClick=false;
  try {
    direction==='forward' ? book.flipNext() : book.flipPrev();
  } finally {
    settings.disableFlipByClick=cornerClicksOnly;
  }
}
function forward() { turnPage('forward'); }
function backward() { turnPage('backward'); }

// Handle portrait swipes independently of the library's 250 ms gesture deadline.
// Starting over links, buttons or the video leaves those controls usable.
let swipeStart: {x:number;y:number} | null=null;
const interactiveTarget=(target: EventTarget | null)=>target instanceof Element && !!target.closest('a,button,input,select,textarea,iframe');
viewportElement.addEventListener('touchstart',event=>{
  swipeStart=null;
  if (!book || zoomed || book.getOrientation()!=='portrait' || interactiveTarget(event.target)) return;
  if (!(event.target instanceof Node) || !bookElement.contains(event.target)) return;
  event.stopPropagation();
  if (event.touches.length===1 && !busy) {
    swipeStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
  }
},{capture:true,passive:true});
viewportElement.addEventListener('touchmove',event=>{
  if (!swipeStart) return;
  event.stopPropagation();
  if (event.touches.length!==1) { swipeStart=null; return; }
  const dx=event.touches[0].clientX-swipeStart.x;
  const dy=event.touches[0].clientY-swipeStart.y;
  if (Math.abs(dx)>10 && Math.abs(dx)>Math.abs(dy)*1.35 && event.cancelable) event.preventDefault();
},{capture:true,passive:false});
viewportElement.addEventListener('touchend',event=>{
  if (!swipeStart) return;
  event.stopPropagation();
  const start=swipeStart;
  swipeStart=null;
  if (event.touches.length || !event.changedTouches.length) return;
  const dx=event.changedTouches[0].clientX-start.x;
  const dy=event.changedTouches[0].clientY-start.y;
  if (Math.abs(dx)<40 || Math.abs(dx)<=Math.abs(dy)*1.35) return;
  if (event.cancelable) event.preventDefault();
  dx>0 ? backward() : forward();
},{capture:true,passive:false});
viewportElement.addEventListener('touchcancel',()=>{swipeStart=null;},{capture:true,passive:true});
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
  fitMagazinePages(pages);
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
  document.documentElement.classList.remove('magazine-reader');
  document.body.classList.remove('reader-ready');
  hint.textContent='Abre la versión de lectura continua si tu navegador no admite el visor.';
  console.error('No se pudo iniciar el visor de revista',error);
});
