(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nav */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menuBtn = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.textContent = open ? 'Sluiten' : 'Menu';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); menuBtn.textContent = 'Menu';
    }));
  }

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* belregister */
  const rows = document.getElementById('reg-rows');
  if (rows) {
    const calls = [
      ['07:52', 'Nieuwe patiënt, met verwijzing', 'voor de praktijk open is', 'Intake geboekt · do 08:30'],
      ['10:14', 'Vraag over vergoeding', 'tijdens behandeling', 'Vraag beantwoord'],
      ['11:37', 'Afspraak verzetten', 'tijdens behandeling', 'Verzet naar vr 15:00'],
      ['13:05', 'Afspraak afzeggen', 'in de lunchpauze', 'Plek vrijgegeven'],
      ['15:20', 'Nieuwe patiënt, rugklachten', 'tijdens behandeling', 'Intake geboekt · ma 11:00'],
      ['18:46', 'Afspraak maken', 'na sluitingstijd', 'Geboekt · di 09:15'],
      ['21:12', 'Vraag over openingstijden', 'na sluitingstijd', 'Vraag beantwoord'],
      ['23:04', 'Acute klacht, knie', 'na sluitingstijd', 'Voorrang · wo 08:00'],
    ];
    const clock = document.getElementById('reg-clock');
    const count = document.getElementById('reg-count');
    const VISIBLE = 5;
    let i = 0, handled = 0;
    const make = (c, ringing) => {
      const li = document.createElement('li');
      li.className = 'reg-row';
      li.innerHTML = `<span class="t">${c[0]}</span><span class="who">${c[1]}<small>${c[2]}</small></span>` +
        (ringing ? '<span class="chip ring">Gaat over</span>' : `<span class="chip ok">${c[3]}</span>`);
      return li;
    };
    const settle = (li, c) => { li.lastElementChild.outerHTML = `<span class="chip ok">${c[3]} ✓</span>`; handled++; count.textContent = handled; };
    const step = () => {
      const c = calls[i % calls.length];
      if (i % calls.length === 0 && i > 0) { handled = 0; count.textContent = 0; }
      const li = make(c, true);
      rows.prepend(li);
      while (rows.children.length > VISIBLE) rows.lastElementChild.remove();
      clock.textContent = c[0];
      setTimeout(() => settle(li, c), 1500);
      i++;
    };
    if (reduce) {
      calls.slice(-VISIBLE).reverse().forEach(c => rows.append(make(c, false)));
      count.textContent = calls.length; clock.textContent = '23:04';
    } else {
      // begin met drie al afgehandelde gesprekken, zodat het register meteen gevuld is
      calls.slice(0, 3).forEach(c => { rows.prepend(make(c, false)); rows.firstElementChild.lastElementChild.textContent += ' ✓'; });
      handled = 3; count.textContent = 3; i = 3;
      step();
      let timer = setInterval(step, 3200);
      document.addEventListener('visibilitychange', () => {
        clearInterval(timer); if (!document.hidden) timer = setInterval(step, 3200);
      });
    }
  }

  /* dagstrook */
  const strip = document.getElementById('strip');
  if (strip) {
    const START = 7, END = 23, span = END - START;
    const pct = h => ((h - START) / span) * 100;
    const blocks = [[8, 10], [10.25, 12.5], [13.5, 15.75], [16, 18]];
    const closed = [[7, 8], [18, 23]];
    const calls = [7.6, 8.4, 9.2, 10.1, 10.9, 11.6, 12.9, 13.9, 14.5, 15.3, 15.9, 16.6, 17.4, 18.8, 19.9, 21.3, 22.4];
    closed.forEach(([a, b]) => strip.insertAdjacentHTML('beforeend', `<div class="closed" style="left:${pct(a)}%;width:${pct(b) - pct(a)}%"></div>`));
    blocks.forEach(([a, b]) => strip.insertAdjacentHTML('beforeend', `<div class="blk" style="left:${pct(a)}%;width:${pct(b) - pct(a)}%" title="Behandelblok"></div>`));
    let busy = 0;
    calls.forEach(h => {
      const during = blocks.some(([a, b]) => h >= a && h <= b) || closed.some(([a, b]) => h >= a && h <= b);
      if (during) busy++;
      const hh = Math.floor(h), mm = String(Math.round((h - hh) * 60)).padStart(2, '0');
      strip.insertAdjacentHTML('beforeend', `<span class="ping${during ? ' during' : ''}" style="left:${pct(h)}%;color:var(--muted-on-navy)" title="Oproep ${hh}:${mm}"></span>`);
    });
    const hours = document.getElementById('hours');
    for (let h = START; h <= END; h += 2) hours.insertAdjacentHTML('beforeend', `<span style="left:${pct(h)}%">${String(h).padStart(2, '0')}:00</span>`);
    const total = document.getElementById('d-total'), miss = document.getElementById('d-miss'), missLbl = document.getElementById('d-miss-lbl');
    total.textContent = calls.length;
    const set = mode => {
      const without = mode === 'without';
      strip.classList.toggle('without', without);
      document.querySelectorAll('.toggle button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === mode));
      miss.textContent = without ? busy : 0;
      miss.classList.toggle('signal', without);
      missLbl.textContent = without
        ? 'oproepen vallen tijdens een behandeling of na sluitingstijd. Niemand neemt op.'
        : 'gemiste oproepen. Elke beller krijgt direct antwoord en een SMS-bevestiging.';
    };
    document.querySelectorAll('.toggle button').forEach(b => b.addEventListener('click', () => set(b.dataset.mode)));
    set('without');
  }

  /* gesprekssimulator */
  const log = document.getElementById('call-log');
  if (log) {
    const choicesEl = document.getElementById('call-choices');
    const stateEl = document.getElementById('call-state');
    const timerEl = document.getElementById('call-timer');
    const agenda = document.getElementById('agenda');
    const phone = document.getElementById('phone-screen');
    const agendaHTML = agenda.innerHTML, phoneHTML = phone.innerHTML;
    const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
    let t0 = 0, tick = null, token = 0;

    // Gespreksboom. say = wat de AI zegt; opts = keuzes van de beller [label, volgende stap].
    const S = {
      start: { say: 'Goedemiddag, praktijk Van Dijk, je spreekt met de digitale assistent. Waarmee kan ik je helpen?',
        opts: [['Ik wil een afspraak maken', 'nieuw'], ['Ik wil mijn afspraak verzetten', 'verzet'], ['Wat zijn jullie openingstijden?', 'tijden'], ['Ik heb acute pijn', 'spoed']] },
      nieuw: { say: 'Fijn! Is het je eerste afspraak bij ons, of ben je al patiënt?',
        opts: [['Eerste keer, ik heb een verwijzing', 'intake'], ['Ik ben al patiënt', 'vervolg']] },
      intake: { say: 'Welkom! Voor een intake heb ik nog plek op donderdag om 08:30 of vrijdag om 14:00. Wat past jou het best?',
        opts: [['Donderdag 08:30', ['do 08:30', 'Intake']], ['Vrijdag 14:00', ['vr 14:00', 'Intake']]] },
      vervolg: { say: 'Prima. Ik zie nog plek op woensdag om 16:15 of donderdag om 09:00. Welke wil je?',
        opts: [['Woensdag 16:15', ['wo 16:15', 'Behandeling']], ['Donderdag 09:00', ['do 09:00', 'Behandeling']]] },
      verzet: { say: 'Natuurlijk. Ik zie je afspraak op dinsdag om 10:30 staan. Ik kan hem verzetten naar woensdag 16:15 of vrijdag 11:00.',
        opts: [['Woensdag 16:15', ['wo 16:15', 'Controle', 'di 10:30']], ['Vrijdag 11:00', ['vr 11:00', 'Controle', 'di 10:30']]] },
      tijden: { say: 'We zijn open van maandag tot en met vrijdag, van 08:00 tot 18:00. Ik plan ook buiten die tijden afspraken in. Wil je meteen een afspraak maken?',
        opts: [['Ja, graag', 'nieuw'], ['Nee, dank je wel', 'klaar']] },
      spoed: { say: 'Vervelend om te horen. Is de pijn vandaag ontstaan, of heb je er al langer last van?',
        opts: [['Sinds vanochtend', ['morgen 08:00', 'Spoed · voorrang']], ['Al een paar dagen', ['wo 08:30', 'Voorrang']]] },
      klaar: { say: 'Graag gedaan. Fijne dag nog!', end: true },
    };

    const scroll = () => { log.scrollTop = log.scrollHeight; };
    const add = (cls, html) => { const d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = html; log.append(d); scroll(); return d; };
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const aiSay = async (text, my) => {
      const typing = add('ai typing', '<i></i><i></i><i></i>');
      await wait(Math.min(1500, 450 + text.length * 12));
      if (my !== token) return false;
      typing.className = 'msg ai';
      typing.innerHTML = `<span class="meta">Assistent</span>${text}`;
      scroll();
      return true;
    };

    const showChoices = (opts, my) => {
      choicesEl.innerHTML = '';
      opts.forEach(([label, next]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'choice'; b.textContent = label;
        b.addEventListener('click', () => {
          if (my !== token) return;
          choicesEl.innerHTML = '';
          add('me', `<span class="meta">Jij</span>${label}`);
          if (Array.isArray(next)) book(next, my); else go(next, my);
        });
        choicesEl.append(b);
      });
    };

    const go = async (key, my) => {
      const s = S[key];
      if (!(await aiSay(s.say, my))) return;
      if (s.end) return hangup(my, 'Vraag beantwoord, geen afspraak nodig.');
      showChoices(s.opts, my);
    };

    const book = async ([slot, kind, oldSlot], my) => {
      const moved = !!oldSlot;
      const text = moved
        ? `Gelukt: je afspraak is verzet naar ${slot}. Je oude plek op ${oldSlot} is weer vrij voor iemand anders. Je krijgt zo een bevestiging per SMS.`
        : `Staat genoteerd: ${slot}. Je krijgt zo een SMS-bevestiging, en de avond ervoor een herinnering.`;
      if (!(await aiSay(text, my))) return;
      // agenda bijwerken
      let who = 'Nieuwe beller · ' + kind.toLowerCase();
      if (oldSlot) [...agenda.children].forEach(li => {
        if (li.firstElementChild.textContent === oldSlot) { li.classList.add('gone'); who = li.lastElementChild.textContent; }
      });
      const li = document.createElement('li');
      li.className = 'new';
      li.innerHTML = `<span class="mono">${slot}</span><span>${who}</span>`;
      agenda.append(li);
      await wait(900); if (my !== token) return;
      phone.querySelector('.phone-empty')?.remove();
      const sms = document.createElement('div');
      sms.className = 'sms';
      sms.innerHTML = `<span class="meta">Praktijk Van Dijk · SMS</span>${moved ? 'Je afspraak is verzet' : 'Je afspraak staat'}: ${slot}. Tot dan! Verzetten kan altijd telefonisch.`;
      phone.append(sms);
      await wait(400);
      hangup(my, moved ? 'Afspraak verzet, agenda bijgewerkt, SMS verstuurd.' : 'Afspraak geboekt, agenda bijgewerkt, SMS verstuurd.');
    };

    const hangup = (my, summary) => {
      if (my !== token) return;
      clearInterval(tick);
      stateEl.className = 'call-state'; stateEl.textContent = 'Gesprek beëindigd';
      add('sys', `✓ ${summary}`);
      choicesEl.innerHTML = '';
      const again = document.createElement('button');
      again.type = 'button'; again.className = 'choice ghost'; again.textContent = '↻ Nog een keer bellen';
      again.addEventListener('click', () => start());
      choicesEl.append(again);
    };

    const start = async () => {
      const my = ++token;
      clearInterval(tick);
      log.innerHTML = ''; choicesEl.innerHTML = '';
      agenda.innerHTML = agendaHTML; phone.innerHTML = phoneHTML;
      stateEl.className = 'call-state ringing'; stateEl.textContent = 'Gaat over…';
      timerEl.textContent = '0:00';
      await wait(1100); if (my !== token) return;
      stateEl.className = 'call-state live'; stateEl.textContent = 'In gesprek · direct opgenomen';
      t0 = Date.now();
      tick = setInterval(() => { timerEl.textContent = fmt(Math.floor((Date.now() - t0) / 1000)); }, 1000);
      add('sys', 'Opgenomen na 1 keer overgaan');
      go('start', my);
    };

    log.addEventListener('click', e => { if (e.target.closest('#dial')) start(); });
  }

  /* rekenhulp */
  const sCalls = document.getElementById('s-calls');
  if (sCalls) {
    const sShare = document.getElementById('s-share'), sValue = document.getElementById('s-value');
    const eur = n => '€ ' + Math.round(n).toLocaleString('nl-NL');
    const PRICE = 149, NOCALLBACK = .85, WEEKS = 4.33;
    const paint = el => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
    const calc = () => {
      [sCalls, sShare, sValue].forEach(paint);
      const calls = +sCalls.value, share = +sShare.value / 100, value = +sValue.value;
      const appts = calls * WEEKS * NOCALLBACK * share;
      const loss = appts * value;
      document.getElementById('o-calls').textContent = calls;
      document.getElementById('o-share').textContent = Math.round(share * 100) + '%';
      document.getElementById('o-value').textContent = eur(value);
      document.getElementById('c-loss').textContent = eur(loss);
      document.getElementById('c-appts').textContent = Math.round(appts);
      document.getElementById('c-break').textContent = Math.ceil(PRICE / value);
      const max = Math.max(loss, PRICE);
      document.getElementById('b-loss').style.width = (loss / max) * 100 + '%';
      document.getElementById('b-cost').style.width = (PRICE / max) * 100 + '%';
    };
    [sCalls, sShare, sValue].forEach(el => el.addEventListener('input', calc));
    calc();
  }

  /* demo-formulier → mailto */
  const form = document.querySelector('form.demo');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const body = `Naam: ${d.naam}\nBedrijf: ${d.bedrijf}\nBranche: ${d.branche}\nTelefoon: ${d.telefoon}\n\n${d.bericht || ''}`;
      location.href = `mailto:olivier@camposautomation.nl?subject=${encodeURIComponent('Demo-aanvraag: ' + d.bedrijf)}&body=${encodeURIComponent(body)}`;
      form.querySelector('.form-ok').style.display = 'block';
    });
  }

  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
