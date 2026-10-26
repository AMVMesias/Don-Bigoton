/** Arrange the ten leaves into the same six views as the desktop reader. */
export function arrangeSpreads(container: HTMLElement, sheets: HTMLElement[], prefix: string) {
  const groups=[sheets.slice(0,1)];
  for(let index=1;index<sheets.length-1;index+=2) groups.push(sheets.slice(index,Math.min(index+2,sheets.length-1)));
  groups.push(sheets.slice(-1));
  let folio=1;
  return groups.map(group=>{
    const spread=document.createElement('section');
    spread.className=prefix+' '+prefix+'-'+(group.length===1 ? 'single' : 'double');
    spread.dataset.pages=group.map((_,index)=>folio+index).join(',');
    spread.setAttribute('aria-label',group.length===1 ? 'Página '+folio : 'Páginas '+folio+' y '+(folio+1));
    spread.append(...group);
    container.append(spread);
    folio+=group.length;
    return spread;
  });
}
