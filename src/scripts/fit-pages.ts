export function fitMagazinePages(pages: HTMLElement[]) {
  for (const page of pages) {
    const content=page.querySelector<HTMLElement>('.page-content');
    const layout=page.querySelector<HTMLElement>('.page-layout');
    if (!content || !layout) continue;
    if (!page.classList.contains('book-cover')) {
      let fit=1;
      layout.style.zoom='1';
      while(content.scrollHeight>content.clientHeight+1 && fit>.78) {
        fit=Math.round((fit-.015)*1000)/1000;
        layout.style.zoom=String(fit);
      }
      page.dataset.contentFit=String(fit);
    }
    page.dataset.contentOverflow=String(Math.max(0,content.scrollHeight-content.clientHeight));
  }
}
