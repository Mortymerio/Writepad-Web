import { marked } from 'marked';
import linpeasMd from '../data/linpeas.md?raw';
import winpeasMd from '../data/winpeas.md?raw';

export const PeasWiki = {
  renderSidebar(container, type) {
    const rawMd = type === 'linpeas' ? linpeasMd : winpeasMd;
    const htmlContent = marked.parse(rawMd);
    
    container.innerHTML = `
      <div class="peas-wiki-container" style="padding: 10px; overflow-y: auto; height: 100%; color: var(--text-primary); font-family: sans-serif; line-height: 1.5;">
        ${htmlContent}
      </div>
    `;
    
    // Some basic styling fixes for Markdown elements inside the container
    const wikiContainer = container.querySelector('.peas-wiki-container');
    const headings = wikiContainer.querySelectorAll('h1, h2, h3');
    headings.forEach(h => {
        h.style.marginTop = '15px';
        h.style.marginBottom = '10px';
        h.style.borderBottom = h.tagName === 'H1' || h.tagName === 'H2' ? '1px solid var(--border-color)' : 'none';
        h.style.paddingBottom = '5px';
    });
    
    const pres = wikiContainer.querySelectorAll('pre');
    pres.forEach(pre => {
        pre.style.background = '#0d1117';
        pre.style.color = '#c9d1d9';
        pre.style.padding = '10px';
        pre.style.borderRadius = '5px';
        pre.style.overflowX = 'auto';
        pre.style.fontSize = '0.85em';
    });
    
    const codes = wikiContainer.querySelectorAll('code');
    codes.forEach(code => {
        if(code.parentElement.tagName !== 'PRE') {
            code.style.background = 'var(--bg-active)';
            code.style.padding = '2px 4px';
            code.style.borderRadius = '3px';
            code.style.fontSize = '0.9em';
        }
    });
    
    const lists = wikiContainer.querySelectorAll('ul, ol');
    lists.forEach(list => {
        list.style.paddingLeft = '20px';
        list.style.marginBottom = '15px';
    });
  }
};
