(() => {
  document.documentElement.classList.add('js');
  const text = document.getElementById('text');
  const progress = document.getElementById('progress');
  const timeLeft = document.getElementById('timeLeft');
  const sticky = document.getElementById('stickyBuy');
  const end = document.getElementById('ende');
  const sizeBtns = [...document.querySelectorAll('[data-fs]')];
  const words = (text.textContent.match(/\S+/g) || []).length;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { return null; } }
  };

  const applySize = (v) => {
    text.style.setProperty('--fs', v);
    sizeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fs === v)));
  };
  applySize(store.get('lp-fs') || '1');
  sizeBtns.forEach((b) => b.addEventListener('click', () => { applySize(b.dataset.fs); store.set('lp-fs', b.dataset.fs); }));

  let ticking = false;
  const update = () => {
    const r = text.getBoundingClientRect();
    const total = r.height - window.innerHeight * 0.5;
    const read = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / Math.max(1, total)));
    progress.style.setProperty('--p', read.toFixed(4));
    const min = Math.max(0, Math.ceil((words * (1 - read)) / 230));
    timeLeft.textContent = read >= 0.99 ? 'Ende der Leseprobe erreicht' : `noch ca. ${Math.max(1, min)} Min.`;
    const endTop = end.getBoundingClientRect().top;
    const show = read > 0.2 && endTop > window.innerHeight;
    sticky.classList.toggle('on', show);
    sticky.inert = !show;
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.1 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('is-in'));
  }
})();
