(() => {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  if (btn && menu) {
    const label = btn.querySelector('.menu-lbl');
    const others = [...document.querySelectorAll('main, footer, .pill, .rail, .m-cta, .sticky-buy')];
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      if (label) label.textContent = open ? 'Schließen' : 'Menü';
      menu.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      others.forEach((el) => {
        if (open) { el.dataset.wasInert = el.inert ? '1' : ''; el.inert = true; }
        else { el.inert = el.dataset.wasInert === '1'; }
      });
      if (open) { const first = menu.querySelector('a'); if (first) first.focus(); }
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  }

  document.querySelectorAll('.snap').forEach((list) => {
    const items = [...list.children];
    if (items.length < 2) return;
    const dots = document.createElement('div');
    dots.className = 'dots';
    dots.setAttribute('aria-hidden', 'true');
    items.forEach(() => dots.appendChild(document.createElement('i')));
    list.after(dots);
    const marks = [...dots.children];
    const update = () => {
      const x = list.scrollLeft;
      const max = list.scrollWidth - list.clientWidth;
      let idx = 0;
      if (max > 0 && x >= max - 4) idx = items.length - 1;
      else items.forEach((it, i) => { if (it.offsetLeft - list.offsetLeft - 20 <= x) idx = i; });
      marks.forEach((m, i) => m.classList.toggle('on', i === idx));
    };
    list.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  });
})();

(() => {
  if (typeof HTMLDialogElement !== 'function') return;
  const sel = 'a[href$="impressum.html"], a[href$="datenschutz.html"], a[href$="barrierefreiheit.html"]';
  if (!document.querySelector(sel)) return;
  const dlg = document.createElement('dialog');
  dlg.className = 'legal-dlg';
  dlg.setAttribute('aria-labelledby', 'legalTitle');
  dlg.innerHTML = '<header><h2 id="legalTitle"></h2><button type="button" class="close">Schließen <span aria-hidden="true">×</span></button></header><iframe title=""></iframe>';
  document.body.appendChild(dlg);
  const title = dlg.querySelector('h2');
  const frame = dlg.querySelector('iframe');
  let opener = null;
  const close = () => dlg.close();
  dlg.querySelector('.close').addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    frame.removeAttribute('src');
    const back = opener && opener.offsetParent !== null ? opener : document.getElementById('menuBtn');
    if (back) back.focus();
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest(sel);
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    opener = a;
    const name = a.textContent.trim() || 'Rechtliches';
    title.textContent = name;
    frame.title = name;
    frame.src = a.href;
    document.documentElement.style.overflow = 'hidden';
    dlg.showModal();
    dlg.querySelector('.close').focus();
  });
})();
