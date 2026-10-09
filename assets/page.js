(() => {
  document.documentElement.classList.add('js');
  const endpoint = 'https://n8n.top-beraternetzwerk.de/webhook/termine';
  const progress = document.getElementById('progress');
  const mcta = document.getElementById('mCta');
  const hero = document.querySelector('.p-hero');
  const formEnd = document.getElementById('anfrage');

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    if (mcta && hero) {
      const past = hero.getBoundingClientRect().bottom < 0;
      const atForm = formEnd ? formEnd.getBoundingClientRect().top < window.innerHeight : false;
      const show = past && !atForm;
      mcta.classList.toggle('on', show);
      mcta.inert = !show;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('is-in'));
  }

  const builders = {
    'ki-kluft-updates': (d) => {
      const name = d.name || d.email;
      return { name, email: d.email, message: 'KI-Kluft Praxis-Updates\nName: ' + name + '\nE-Mail: ' + d.email + '\nQuelle: KI-Kluft Landingpage\nSeite: ' + location.href, source: 'ki-kluft-landingpage', page: location.href, interest: 'KI-Kluft Praxis-Updates' };
    },
    'verwaltung-updates': (d) => {
      const name = d.name || d.email;
      return { name, email: d.email, message: 'Verwaltungs-Praxis-Updates\nName: ' + name + '\nE-Mail: ' + d.email + '\nQuelle: Verwaltung Landingpage\nSeite: ' + location.href, source: 'verwaltung-landingpage-updates', page: location.href, interest: 'Verwaltungs-Praxis-Updates' };
    },
    'verwaltung-kurs': (d) => ({ name: d.name, email: d.email, organisation: d.organisation, request_type: d.typ, detail: d.detail, message: 'Kursanfrage Verwaltung / Bildungsträger\nAnsprechperson: ' + d.name + '\nOrganisation: ' + d.organisation + '\nAnfrageart: ' + d.typ + '\nTeilnehmerzahl oder Region: ' + d.detail + '\nE-Mail: ' + d.email + '\nSeite: ' + location.href, source: 'verwaltung-kursanfrage', page: location.href, interest: 'Kursanfrage Verwaltung / Bildungsträger' }),
    'verwaltung-lizenz': (d) => ({ name: d.name, email: d.email, organisation: d.organisation, seats: d.seats, message: 'Volumen-Lizenz-Anfrage zum Interaktiven Leitfaden\nName: ' + d.name + '\nOrganisation: ' + d.organisation + '\nE-Mail: ' + d.email + '\nGeschätzte Anzahl: ' + d.seats + '\nSeite: ' + location.href, source: 'verwaltung-volume-license', page: location.href, interest: 'Volumen-Lizenzen zum Interaktiven Leitfaden' })
  };

  document.querySelectorAll('form[data-form]').forEach((form) => {
    const status = form.querySelector('.status');
    const submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fields = [...form.elements].filter((el) => el.name);
      let firstInvalid = null;
      fields.forEach((el) => {
        el.value = el.value.trim();
        const bad = !el.checkValidity();
        el.setAttribute('aria-invalid', String(bad));
        if (bad && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) {
        status.textContent = 'Bitte prüfen Sie die markierten Pflichtfelder.';
        status.className = 'status err';
        firstInvalid.focus();
        return;
      }
      const data = Object.fromEntries(fields.map((el) => [el.name, el.value]));
      submit.disabled = true;
      status.textContent = 'Wird übermittelt …';
      status.className = 'status';
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(builders[form.dataset.form](data)) });
        if (!res.ok) throw new Error('request_failed');
        form.reset();
        fields.forEach((el) => el.removeAttribute('aria-invalid'));
        status.textContent = form.dataset.success;
        status.className = 'status ok';
      } catch (e) {
        status.textContent = 'Die Übermittlung hat gerade nicht funktioniert. Bitte versuchen Sie es später erneut oder schreiben Sie an rm@kostenmanager.net.';
        status.className = 'status err';
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
