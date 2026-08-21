import{El as e}from"./editor.api-D7OB3-Nf.js";var t=e({ToastManager:()=>n}),n={_container:null,_getContainer(){return this._container||(this._container=document.createElement(`div`),this._container.id=`toast-container`,this._container.style.cssText=`
        position: fixed;
        bottom: 40px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `,document.body.appendChild(this._container)),this._container},show(e,t=`info`,n=3e3){let r=this._getContainer(),i={success:`✓`,error:`✕`,warning:`⚠`,info:`ℹ`},a={success:{bg:`#1a3a1a`,border:`#2ea043`,text:`#79c0ff`,icon:`#3fb950`},error:{bg:`#3a1a1a`,border:`#f85149`,text:`#ffa198`,icon:`#f85149`},warning:{bg:`#3a2a00`,border:`#d29922`,text:`#e3b341`,icon:`#d29922`},info:{bg:`#0d1a2d`,border:`#388bfd`,text:`#79c0ff`,icon:`#58a6ff`}},o=document.body.dataset.theme!==void 0&&![``,`github-light`,`Solarized-light`,`Tomorrow`,`Dawn`,`Clouds`,`Textmate (Mac Classic)`,`Katzenmilch`,`Dreamweaver`,`Chrome DevTools`,`Xcode_default`].includes(document.body.dataset.theme||``),s=a[t]||a.info,c=document.createElement(`div`);c.style.cssText=`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: var(--bg-secondary, ${o?`#1c1c1c`:`#f0f0f0`});
      border: 1px solid ${s.border};
      border-left: 4px solid ${s.border};
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      font-family: 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      color: var(--text-primary, #ccc);
      max-width: 380px;
      pointer-events: all;
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    `;let l=document.createElement(`span`);l.style.cssText=`color: ${s.border}; font-size: 14px; font-weight: bold; flex-shrink: 0;`,l.textContent=i[t]||i.info;let u=document.createElement(`span`);u.style.cssText=`flex: 1; line-height: 1.4;`,u.textContent=e;let d=document.createElement(`button`);d.style.cssText=`
      background: none; border: none; color: var(--text-primary, #999);
      cursor: pointer; font-size: 16px; line-height: 1; padding: 0;
      opacity: 0.5; flex-shrink: 0;
    `,d.textContent=`×`,d.onclick=()=>f(),c.appendChild(l),c.appendChild(u),c.appendChild(d),t===`error`&&(c.style.cursor=`pointer`,c.title=`Clic para copiar el error`,c.onclick=async t=>{if(t.target!==d)try{await navigator.clipboard.writeText(e),this.success(`Error copiado`,2e3)}catch(e){console.error(`No se pudo copiar`,e)}}),r.appendChild(c),requestAnimationFrame(()=>{c.style.opacity=`1`,c.style.transform=`translateX(0)`});let f=()=>{c.style.opacity=`0`,c.style.transform=`translateX(20px)`,setTimeout(()=>c.remove(),200)};return n>0&&setTimeout(f,n),{dismiss:f}},success(e,t){return this.show(e,`success`,t)},error(e,t=1e4){return this.show(e,`error`,t)},warning(e,t){return this.show(e,`warning`,t)},info(e,t){return this.show(e,`info`,t)}};export{t as n,n as t};