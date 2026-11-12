(() => {
  const endpoint = 'https://n8n.top-beraternetzwerk.de/webhook/termine';
  const page = /^https?:$/.test(location.protocol) ? location.origin + location.pathname : 'https://ki-fachbuecher.de/';

  const builders = {
    kontakt: (d) => {
      const name = d.name || d.email;
      const org = d.organisation || '-';
      const msg = d.message || '-';
      return {
        name,
        email: d.email,
        organisation: d.organisation,
        request_type: d.topic,
        message: 'Kontaktanfrage KI-Fachbücher\nName: ' + name + '\nOrganisation: ' + org + '\nE-Mail: ' + d.email + '\nAnliegen: ' + d.topic + '\nNachricht: ' + msg + '\nQuelle: KI-Fachbücher Landingpage\nSeite: ' + page,
        source: 'ki-fachbuecher-kontakt',
        page,
        interest: 'Kontaktanfrage KI-Fachbücher',
        platform: d.topic + (d.message ? ' - ' + d.message : '')
      };
    },
    updates: (d) => {
      const name = d.name || d.email;
      const rolle = d.rolle || '-';
      const buch = d.buch || '-';
      return {
        name,
        email: d.email,
        message: 'KI-Fachbücher Praxis-Updates\nName: ' + name + '\nE-Mail: ' + d.email + '\nRolle: ' + rolle + '\nBuch: ' + buch + '\nQuelle: KI-Fachbücher Landingpage\nSeite: ' + page,
        source: 'ki-fachbuecher-updates',
        page,
        interest: 'KI-Fachbücher Praxis-Updates',
        platform: rolle
      };
    }
  };

  const menu = document.getElementById('menu');
  const menuOpen = document.getElementById('menuOpen');
  if (menu && menuOpen && typeof menu.showModal === 'function') {
    menuOpen.addEventListener('click', () => menu.showModal());
    document.getElementById('menuClose').addEventListener('click', () => menu.close());
    menu.addEventListener('click', (ev) => { if (ev.target === menu || ev.target.closest('a')) menu.close(); });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (m) => { if (m.matches && menu.open) menu.close(); });
  } else if (menuOpen) {
    menuOpen.hidden = true;
  }

  const legal = /(impressum|datenschutz|barrierefreiheit)\.html$/;
  const titles = { impressum: 'Impressum', datenschutz: 'Datenschutz', barrierefreiheit: 'Barrierefreiheit' };
  let frame = null;
  const openFrame = (href, key) => {
    if (!frame) {
      frame = document.createElement('dialog');
      frame.className = 'frame';
      frame.setAttribute('aria-labelledby', 'frameTitle');
      frame.innerHTML = '<div class="frame-head"><span id="frameTitle"></span><button class="frame-close" type="button" aria-label="Schließen">×</button></div><iframe title=""></iframe>';
      document.body.append(frame);
      frame.querySelector('.frame-close').addEventListener('click', () => frame.close());
      frame.addEventListener('click', (ev) => { if (ev.target === frame) frame.close(); });
      frame.addEventListener('close', () => { frame.querySelector('iframe').src = 'about:blank'; });
    }
    frame.querySelector('#frameTitle').textContent = titles[key];
    const iframe = frame.querySelector('iframe');
    iframe.title = titles[key];
    iframe.src = href;
    frame.showModal();
  };
  if (typeof HTMLDialogElement === 'function') {
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[href]');
      if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
      const m = a.pathname.match(legal);
      if (!m) return;
      ev.preventDefault();
      openFrame(a.href, m[1]);
    });
  }

  document.querySelectorAll('[data-topic]').forEach((a) => {
    a.addEventListener('click', () => {
      const select = document.getElementById('k-topic');
      if (select) select.value = a.dataset.topic;
    });
  });

  document.querySelectorAll('form[data-form]').forEach((form) => {
    const status = form.querySelector('.status');
    const submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (submit.disabled) return;
      if (form.elements.website && form.elements.website.value) return;
      const fields = [...form.elements].filter((el) => el.name && el.name !== 'website');
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
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      submit.disabled = true;
      status.textContent = 'Wird übermittelt …';
      status.className = 'status';
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(builders[form.dataset.form](data)), signal: ctrl.signal });
        if (!res.ok) throw new Error('request_failed');
        form.reset();
        fields.forEach((el) => el.removeAttribute('aria-invalid'));
        status.textContent = form.dataset.success;
        status.className = 'status ok';
        if (window.umami && typeof window.umami.track === 'function') window.umami.track('formular-' + form.dataset.form);
      } catch (err) {
        status.textContent = 'Die Übermittlung hat gerade nicht funktioniert. Bitte versuchen Sie es später erneut oder schreiben Sie an rm@kostenmanager.net.';
        status.className = 'status err';
      } finally {
        clearTimeout(timer);
        submit.disabled = false;
      }
    });
  });
})();
