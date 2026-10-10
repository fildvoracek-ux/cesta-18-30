// Cesta od 18 do 30: logika hry. Texty jsou v content.js, nastavení v config.js, výběr zastávek v balance.js.
(function () {
  'use strict';
  var C = window.CONFIG, T = window.CONTENT, B = window.Balance;

  // ---------- Parametry URL ----------
  var qs = new URLSearchParams(location.search);
  var SRC = (qs.get('src') || '').replace(/[^\w.\-]/g, '').slice(0, 40) || 'primo';
  var TEST = !!C.TEST_MODE || qs.get('test') === '1';

  // ---------- Pomocné funkce ----------
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function evById(id) { return T.events.filter(function (e) { return e.id === id; })[0]; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bez úložiště to jde i tak */ } }
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Stav ----------
  var S = {
    id: uuid(), start: Date.now(), a: {}, selected: [], kontrola: false, pickSig: null,
    stops: [], price: null, finished: false, aborted: false, counts: null
  };
  var steps = [], idx = 0, pickIndex = -1, dynBuilt = false, head = [], tail = [];

  // ---------- Počty z Apps Scriptu (vyvažování) ----------
  var countsReady = (function () {
    if (!C.APPS_SCRIPT_URL) return Promise.resolve(null);
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, C.COUNTS_TIMEOUT_MS || 2000);
    return fetch(C.APPS_SCRIPT_URL + '?action=counts', { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(timer); return j && j.ok && j.counts ? j.counts : null; })
      .catch(function () { clearTimeout(timer); return null; });
  })().then(function (c) { S.counts = c; return c; });

  // ---------- Odesílání (fronta, opakování, bez ztráty) ----------
  var Q_KEY = 'fmb_queue_v1', memQ = {}, sending = false, fails = 0, retryTimer = null;
  try { memQ = JSON.parse(lsGet(Q_KEY) || '{}') || {}; } catch (e) { memQ = {}; }
  function persistQ() { lsSet(Q_KEY, JSON.stringify(memQ)); }
  function enqueue(p) { memQ[p.respondent.id] = p; persistQ(); flush(); }
  function scheduleRetry() {
    if (retryTimer || fails > 8) return;
    retryTimer = setTimeout(function () { retryTimer = null; flush(); }, Math.min(60000, 3000 * Math.pow(2, fails)));
  }
  function flush() {
    var ids = Object.keys(memQ);
    if (!ids.length) return;
    if (!C.APPS_SCRIPT_URL) { if (TEST && window.console) console.info('[test] data k odeslání (bez Apps Scriptu zůstávají lokálně)', memQ[ids[0]]); return; }
    if (sending) return;
    var id = ids[0], body = JSON.stringify(memQ[id]);
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    sending = true;
    fetch(C.APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        clearTimeout(to);
        if (!j || !j.ok) throw new Error('server');
        fails = 0; sending = false;
        if (JSON.stringify(memQ[id]) === body) { delete memQ[id]; persistQ(); }
        flush();
      })
      .catch(function () { clearTimeout(to); sending = false; fails++; scheduleRetry(); });
  }
  window.addEventListener('online', function () { fails = 0; flush(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'hidden') return;
    if (!S.aborted && !S.finished && S.stops.some(function (s) { return s.done || s.skipped; })) {
      var p = buildPayload('castecne'); memQ[S.id] = p; persistQ();
      if (C.APPS_SCRIPT_URL && navigator.sendBeacon) {
        try { navigator.sendBeacon(C.APPS_SCRIPT_URL, new Blob([JSON.stringify(p)], { type: 'text/plain;charset=UTF-8' })); } catch (e) { /* zůstane ve frontě */ }
      }
    }
  });

  function buildPayload(status) {
    var a = S.a, r = {
      id: S.id, cas: new Date(S.start).toISOString(), src: SRC, test: TEST,
      trvani_s: Math.round((Date.now() - S.start) / 1000), vek_pasmo: a.vek || '', status: status,
      cinnost: a.cinnost || '', hlavni_banka: a.banka || '', dalsi_ucet: a.dalsiUcet || '',
      dalsi_banka: a.dalsiUcet === 'ano' && a.dalsiKde ? JSON.stringify(a.dalsiKde) : '',
      udalosti_vybrane: JSON.stringify(S.selected), kontrola_nic: S.kontrola,
      hypo_udalost: (S.kontrola ? '' : (S.stops.filter(function (s) { return s.hypo; })[0] || {}).id) || '',
      zakladni_cetnost: a.cetnost || '', novy_produkt: a.novyProdukt || '',
      novy_produkt_kde: a.novyProdukt === 'ano' ? (a.novyProduktKde || '') : '',
      investovani: a.investovani || '', cena_zobrazena: a.cena != null && S.price != null ? S.price : '',
      ochota_platit: a.cena || '', vnimana_hodnota: a.hodnota || '', duvera_rada: a.duvera || '',
      duvera_zvysi: a.duveraZvysi ? JSON.stringify(a.duveraZvysi) : '', duvera_podvody: a.podvody || '',
      sdileni_dat: a.sdileni ? JSON.stringify(a.sdileni) : '', ai_obava_1_5: a.aiObava || '',
      ai_odlozeni: a.aiOdlozeni || '', otevrena: a.otevrena || '', mimo_cilovku: a.vek === 'jine'
    };
    T.events.forEach(function (e) {
      var s = S.selected.filter(function (x) { return x.id === e.id; })[0];
      r['ev_' + e.id] = s ? s.mode : '';
    });
    var stops = S.stops.filter(function (s) { return s.done || s.skipped; }).map(function (s) {
      var q = s.ans;
      return {
        respondent_id: S.id, cas: new Date(s.t || Date.now()).toISOString(), udalost: s.id, rezim: s.mode, poradi: s.poradi,
        pozornost_1_5: s.skipped ? '' : q.a1 || '', co_delam: s.skipped ? '' : JSON.stringify(q.a2 || []),
        prvni_zastavka: s.skipped ? '' : q.a3 || '', vyrizeni: s.skipped ? '' : q.a4 || '',
        prekazka_text: s.skipped ? '' : q.a5text || '', prekazka_kod: s.skipped ? '' : q.a5kod || '',
        kdo_pomuze: s.skipped ? '' : JSON.stringify(q.a6 || []), dokonceno: !!s.done && !s.skipped, preskoceno: !!s.skipped, test: TEST
      };
    });
    return { v: 1, respondent: r, stops: stops };
  }
  function save(status) { if (!S.aborted) enqueue(buildPayload(status)); }

  // ---------- Stavba kroků ----------
  function optText(o, mode) {
    if (typeof o.t === 'string') return o.t;
    return o.t[mode === 'zkusenost' ? 'z' : mode === 'plan' ? 'p' : 'h'];
  }
  function ansStep(id, type, key, q, opts, extra) {
    return Object.assign({
      id: id, type: type, q: q, options: opts,
      get: function () { return S.a[key]; }, set: function (v) { S.a[key] = v; }
    }, extra || {});
  }

  function buildHead() {
    var bk = T.base, banksOpts = T.banks.concat(bk.banka.extra);
    head = [
      { id: 'intro', type: 'intro' },
      ansStep('vek', 'single', 'vek', bk.vek.q, bk.vek.options, {
        after: function (v) {
          if (v === 'pod18') { S.aborted = true; renderEnd(T.under18); return 'halt'; }
        }
      }),
      ansStep('cinnost', 'single', 'cinnost', bk.cinnost.q, bk.cinnost.options),
      ansStep('banka', 'single', 'banka', bk.banka.q, banksOpts),
      ansStep('dalsiUcet', 'single', 'dalsiUcet', bk.dalsiUcet.q, bk.dalsiUcet.options),
      ansStep('dalsiKde', 'multi', 'dalsiKde', bk.dalsiKde.q,
        function () { return T.banks.filter(function (b) { return b.v !== S.a.banka; }); },
        { show: function () { return S.a.dalsiUcet === 'ano'; } }),
      {
        id: 'pick', type: 'pick',
        get: function () { return S.selected; },
        set: function () { },
        after: function () { buildDynamic(); }
      }
    ];
    pickIndex = head.length - 1;
  }

  function stopSteps(stop, n, m) {
    var e = evById(stop.id), Q = T.stopQ, mode = stop.mode, mk = mode === 'zkusenost' ? 'z' : mode === 'plan' ? 'p' : 'h';
    var ctx = { stop: stop, n: n, m: m };
    function a(key) { return { get: function () { return stop.ans[key]; }, set: function (v) { stop.ans[key] = v; }, stop: ctx }; }
    var barrierOpts = stop.barrierOrder.map(function (k) {
      var b = e.barriers.filter(function (x) { return x.k === k; })[0];
      return { v: b.k, t: b.t };
    });
    if (T.noBarrier) barrierOpts.push({ v: '0', t: T.noBarrier.t, x: true });
    var list = [
      Object.assign({ id: 'scene_' + stop.id, type: 'scene', ev: e }, a('scene')),
      Object.assign({ id: 'a1_' + stop.id, type: 'scale', q: Q.a1.q[mk](e), lo: Q.a1.lo, hi: Q.a1.hi }, a('a1')),
      Object.assign({ id: 'a2_' + stop.id, type: 'multi', q: Q.a2.q[mk], options: Q.a2.options, mode: mode }, a('a2')),
      Object.assign({ id: 'a3_' + stop.id, type: 'single', q: Q.a3.q[mk], options: Q.a3.options }, a('a3')),
      Object.assign({ id: 'a4_' + stop.id, type: 'single', q: Q.a4.q[mk], options: Q.a4.options }, a('a4')),
      Object.assign({ id: 'a5_' + stop.id, type: 'single', q: Q.a5.q[mk], options: barrierOpts, noShuffle: true }, a('a5kod'), {
        set: function (v) {
          stop.ans.a5kod = v === '0' ? '' : v;
          stop.ans.a5text = (barrierOpts.filter(function (o) { return o.v === v; })[0] || {}).t || '';
          stop.ans.a5raw = v;
        },
        get: function () { return stop.ans.a5raw; }
      }),
      Object.assign({ id: 'a6_' + stop.id, type: 'multi', q: Q.a6.q, options: Q.a6.options }, a('a6'), {
        after: function () {
          stop.done = true; stop.skipped = false; stop.t = Date.now();
          save('castecne'); toast(T.toastNextStop);
        }
      })
    ];
    list.forEach(function (s) { s.stopCtx = ctx; });
    return list;
  }

  function buildTail() {
    var c = T.common;
    function pr() {
      if (S.price == null) S.price = c.cenaPrices[Math.floor(Math.random() * c.cenaPrices.length)];
      return S.price;
    }
    tail = [
      { id: 'commonIntro', type: 'info', title: T.commonIntro.title, text: T.commonIntro.text, button: T.commonIntro.button },
      ansStep('cetnost', 'single', 'cetnost', c.cetnost.q, c.cetnost.options),
      ansStep('novyProdukt', 'single', 'novyProdukt', c.novyProdukt.q, c.novyProdukt.options),
      ansStep('novyProduktKde', 'single', 'novyProduktKde', c.novyProduktKde.q, c.novyProduktKde.options,
        { show: function () { return S.a.novyProdukt === 'ano'; } }),
      ansStep('investovani', 'single', 'investovani', c.investovani.q, c.investovani.options),
      ansStep('cena', 'single', 'cena', function () { return c.cenaQ(pr()); }, c.cenaOptions, { box: c.cenaScenar }),
      ansStep('hodnota', 'single', 'hodnota', c.hodnota.q, c.hodnota.options),
      ansStep('duvera', 'single', 'duvera', c.duvera.q, c.duvera.options),
      ansStep('duveraZvysi', 'multi', 'duveraZvysi', c.duveraZvysi.q, c.duveraZvysi.options),
      ansStep('podvody', 'single', 'podvody', c.podvody.q, c.podvody.options),
      ansStep('sdileni', 'multi', 'sdileni', c.sdileni.q, c.sdileni.options),
      ansStep('aiObava', 'scale', 'aiObava', c.aiObava.q, null, { lo: c.aiObava.lo, hi: c.aiObava.hi }),
      ansStep('aiOdlozeni', 'single', 'aiOdlozeni', c.aiOdlozeni.q, c.aiOdlozeni.options),
      ansStep('otevrena', 'text', 'otevrena', c.otevrena.q, null, {
        placeholder: c.otevrena.placeholder, button: c.otevrena.button,
        after: function () { finish(); return 'halt'; }
      })
    ];
  }

  function assemble(dyn) { steps = head.concat(dyn || [], tail); }

  function buildDynamic() {
    var sig = JSON.stringify(S.selected);
    if (S.pickSig === sig && dynBuilt) { assemble(S.dyn); return; }
    var res = B.selectStops({
      selected: S.selected, allIds: T.events.map(function (e) { return e.id; }),
      counts: S.counts, target: C.TARGET_PER_EVENT
    });
    S.pickSig = sig; S.kontrola = res.kontrola;
    S.stops = res.stops.map(function (s, i) {
      return {
        id: s.id, mode: s.mode, hypo: s.hypo, poradi: i + 1, ans: {}, done: false, skipped: false,
        barrierOrder: shuffle(['K', 'T', 'P', 'S'])
      };
    });
    var dyn = [{ id: 'notice', type: 'info', title: T.notice.title, text: T.notice.text, button: T.notice.button }];
    S.stops.forEach(function (s, i) { dyn = dyn.concat(stopSteps(s, i + 1, S.stops.length)); });
    S.dyn = dyn; dynBuilt = true;
    assemble(dyn);
  }

  // ---------- Navigace ----------
  function isVisible(s) { return !s.show || s.show(); }
  function nextIdx(from) { for (var i = from + 1; i < steps.length; i++) if (isVisible(steps[i])) return i; return -1; }
  function prevIdx(from) { for (var i = from - 1; i >= 0; i--) if (isVisible(steps[i])) return i; return -1; }
  function goNext() { var n = nextIdx(idx); if (n < 0) { finish(); return; } idx = n; render(); }
  function goBack() { var p = prevIdx(idx); if (p < 0) return; idx = p; render(); }
  function skipStop(ctx) {
    var stop = ctx.stop;
    stop.skipped = true; stop.done = false; stop.ans = {}; stop.t = Date.now();
    save('castecne');
    var last = idx;
    steps.forEach(function (s, i) { if (s.stopCtx === ctx) last = i; });
    idx = last; goNext();
  }
  function answer(step, v) {
    step.set(v);
    var r = step.after && step.after(v);
    if (r === 'halt') return;
    goNext();
  }
  function finish() {
    S.finished = true;
    save('dokonceno');
    renderEnd(T.ending, true);
  }

  // ---------- Průběh a časová osa ----------
  var PER_STEP_S = 6;
  function progress() {
    var vis = [];
    steps.forEach(function (s, i) { if (isVisible(s)) vis.push(i); });
    var pos = vis.filter(function (i) { return i <= idx; }).length - 1;
    var total = vis.length, extra = dynBuilt ? 0 : 3 * 7 + 1;
    total += extra;
    var rem = Math.max(0, total - 1 - pos);
    return { p: Math.min(1, pos / Math.max(1, total - 1)), rem: rem };
  }
  function updateTimeline(p, rem, done) {
    var age = Math.round(18 + 12 * p);
    document.getElementById('fill').style.width = (p * 100) + '%';
    document.getElementById('marker').style.left = (p * 100) + '%';
    document.getElementById('age').textContent = T.timeline.ageLabel + ' ' + age;
    var mins = Math.ceil(rem * PER_STEP_S / 60);
    document.getElementById('eta').textContent = done ? '' : (mins >= 2 ? 'ještě asi ' + mins + ' min' : 'už jen chvilka');
    document.getElementById('bar').setAttribute('aria-valuenow', String(Math.round(p * 100)));
  }

  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1500);
  }

  // ---------- Vykreslení ----------
  var stage = document.getElementById('stage'), actions = document.getElementById('actions');

  function resolve(v) { return typeof v === 'function' ? v() : v; }

  function stopChip(ctx) {
    var e = evById(ctx.stop.id);
    var kids = [el('span', { class: 'chip-ic', 'aria-hidden': 'true', text: e.icon }),
      el('span', { text: 'Zastávka ' + ctx.n + ' z ' + ctx.m + ' · ' + e.short })];
    if (ctx.stop.hypo) kids.push(el('span', { class: 'tag', text: 'jen představa' }));
    return el('div', { class: 'chip' }, kids);
  }

  function frame(step, opts) {
    stage.textContent = ''; actions.textContent = '';
    var card = el('section', { class: 'card' + (REDUCED ? '' : ' enter'), 'aria-live': 'polite' });
    stage.appendChild(card);
    if (step.stopCtx) card.appendChild(stopChip(step.stopCtx));
    return card;
  }
  function heading(card, text) {
    var h = el('h1', { id: 'q', tabindex: '-1', text: text });
    card.appendChild(h);
    return h;
  }
  function buildActions(step, extraBtns) {
    var left = [];
    if (prevIdx(idx) >= 0 && step.type !== 'intro') {
      left.push(el('button', { class: 'ghost', type: 'button', onclick: goBack, text: '← ' + T.back }));
    }
    if (step.stopCtx) {
      left.push(el('button', { class: 'ghost skip', type: 'button', onclick: function () { skipStop(step.stopCtx); }, text: T.skip }));
    }
    (extraBtns || []).forEach(function (b) { actions.appendChild(b); });
    if (left.length) actions.appendChild(el('div', { class: 'secondary' }, left));
  }

  function render() {
    var step = steps[idx], pr = progress();
    updateTimeline(pr.p, pr.rem, false);
    var h;
    var fn = { intro: rIntro, info: rInfo, single: rSingle, multi: rMulti, scale: rScale, text: rText, pick: rPick, scene: rScene }[step.type];
    h = fn(step);
    window.scrollTo(0, 0);
    if (h && idx > 0) { try { h.focus({ preventScroll: true }); } catch (e) { /* ok */ } }
  }

  function primary(text, onclick, disabled) {
    return el('button', { class: 'primary', type: 'button', onclick: onclick, text: text, disabled: disabled ? true : null });
  }

  function rIntro() {
    var card = frame({}), I = T.intro;
    card.appendChild(el('div', { class: 'hero', 'aria-hidden': 'true', text: '🚶' }));
    var h = heading(card, I.title);
    I.paragraphs.forEach(function (p) { card.appendChild(el('p', { class: 'lead', text: p })); });
    card.appendChild(el('ul', { class: 'facts' }, I.privacy.map(function (t) { return el('li', { text: t }); })));
    actions.appendChild(primary(I.button, function () { idx = nextIdx(idx); render(); }));
    return h;
  }

  function rInfo(step) {
    var card = frame(step);
    var h = heading(card, step.title);
    card.appendChild(el('p', { class: 'lead', text: step.text }));
    buildActions(step, [primary(step.button, goNext)]);
    return h;
  }

  function rScene(step) {
    var card = frame(step), e = step.ev, stop = step.stopCtx.stop;
    card.appendChild(el('div', { class: 'hero', 'aria-hidden': 'true', text: e.icon }));
    var h = heading(card, e.title);
    if (stop.hypo) card.appendChild(el('p', { class: 'ribbon', text: T.hypoRibbon }));
    card.appendChild(el('p', { class: 'lead', text: e.scene }));
    card.appendChild(el('p', { class: 'money' }, [el('strong', { text: T.moneyChanges + ' ' }), e['mění']]));
    buildActions(step, [primary(T.sceneGo, goNext)]);
    return h;
  }

  function questionCard(step) {
    var card = frame(step);
    var h = heading(card, resolve(step.q));
    if (step.box) card.insertBefore(el('p', { class: 'box', text: step.box }), h);
    return { card: card, h: h };
  }

  function rSingle(step) {
    var qc = questionCard(step), mode = step.stopCtx ? step.stopCtx.stop.mode : null;
    var cur = step.get(), locked = false;
    var opts = resolve(step.options);
    var list = el('div', { class: 'opts', role: 'radiogroup', 'aria-labelledby': 'q' });
    opts.forEach(function (o) {
      var isSel = cur === o.v;
      var b = el('button', {
        class: 'opt' + (isSel ? ' sel' : ''), type: 'button', role: 'radio', 'aria-checked': isSel ? 'true' : 'false',
        onclick: function () {
          if (locked) return; locked = true;
          b.classList.add('sel'); b.setAttribute('aria-checked', 'true');
          setTimeout(function () { answer(step, o.v); }, REDUCED ? 0 : 170);
        }
      }, [el('span', { class: 'dot', 'aria-hidden': 'true' }), el('span', { text: optText(o, mode) })]);
      list.appendChild(b);
    });
    qc.card.appendChild(list);
    var extra = cur != null ? [primary(T.next, function () { answer(step, cur); })] : [];
    buildActions(step, extra);
    return qc.h;
  }

  function rMulti(step) {
    var qc = questionCard(step), mode = step.stopCtx ? step.stopCtx.stop.mode : null;
    var opts = resolve(step.options), sel = (step.get() || []).slice();
    var list = el('div', { class: 'opts', role: 'group', 'aria-labelledby': 'q' });
    var btns = {};
    var next = primary(T.next, function () { if (sel.length) answer(step, sel); }, !sel.length);
    function paint() {
      opts.forEach(function (o) {
        var on = sel.indexOf(o.v) >= 0;
        btns[o.v].classList.toggle('sel', on);
        btns[o.v].setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      next.disabled = !sel.length;
    }
    opts.forEach(function (o) {
      var b = el('button', {
        class: 'opt multi', type: 'button', 'aria-pressed': 'false',
        onclick: function () {
          var i = sel.indexOf(o.v);
          if (i >= 0) sel.splice(i, 1);
          else if (o.x) sel = [o.v];
          else {
            sel = sel.filter(function (v) { var oo = opts.filter(function (z) { return z.v === v; })[0]; return !(oo && oo.x); });
            sel.push(o.v);
          }
          paint();
        }
      }, [el('span', { class: 'box', 'aria-hidden': 'true' }), el('span', { text: optText(o, mode) })]);
      btns[o.v] = b; list.appendChild(b);
    });
    qc.card.appendChild(list);
    paint();
    buildActions(step, [next]);
    return qc.h;
  }

  function rScale(step) {
    var qc = questionCard(step), cur = step.get(), locked = false;
    var row = el('div', { class: 'scale', role: 'radiogroup', 'aria-labelledby': 'q' });
    for (var i = 1; i <= 5; i++) (function (n) {
      var b = el('button', {
        class: 'sc' + (cur === n ? ' sel' : ''), type: 'button', role: 'radio', 'aria-checked': cur === n ? 'true' : 'false',
        'aria-label': n + ' z 5' + (n === 1 ? ', ' + step.lo : n === 5 ? ', ' + step.hi : ''), text: String(n),
        onclick: function () {
          if (locked) return; locked = true; b.classList.add('sel');
          setTimeout(function () { answer(step, n); }, REDUCED ? 0 : 170);
        }
      });
      row.appendChild(b);
    })(i);
    qc.card.appendChild(row);
    qc.card.appendChild(el('div', { class: 'scale-lab', 'aria-hidden': 'true' }, [el('span', { text: '1 = ' + step.lo }), el('span', { text: '5 = ' + step.hi })]));
    buildActions(step, cur != null ? [primary(T.next, function () { answer(step, cur); })] : []);
    return qc.h;
  }

  function rText(step) {
    var qc = questionCard(step);
    var ta = el('textarea', { class: 'ta', rows: '4', maxlength: '400', placeholder: step.placeholder, 'aria-labelledby': 'q' });
    ta.value = step.get() || '';
    qc.card.appendChild(ta);
    buildActions(step, [primary(step.button, function () { step.set(ta.value.trim().slice(0, 400)); answer(step, ta.value.trim().slice(0, 400)); })]);
    return qc.h;
  }

  function rPick(step) {
    var card = frame(step), P = T.pick;
    var h = heading(card, P.q);
    card.appendChild(el('p', { class: 'hint', text: P.hint }));
    var sel = {}, none = false;
    S.selected.forEach(function (s) { sel[s.id] = s.mode; });
    none = S.pickSig !== null && !S.selected.length;
    var grid = el('div', { class: 'cards' });
    var msg = el('p', { class: 'warn', role: 'status' });
    var next = primary(T.next, commit);
    var noneBtn = el('button', { class: 'opt multi none', type: 'button', 'aria-pressed': 'false', onclick: function () { none = !none; if (none) sel = {}; paint(); } },
      [el('span', { class: 'box', 'aria-hidden': 'true' }), el('span', { text: P.none })]);
    var nodes = {};
    T.events.forEach(function (e) {
      var tog = el('button', { class: 'ev', type: 'button', 'aria-pressed': 'false', onclick: function () {
        if (sel[e.id] !== undefined) delete sel[e.id]; else { sel[e.id] = null; none = false; }
        paint();
      } }, [
        el('span', { class: 'ev-ic', 'aria-hidden': 'true', text: e.icon }),
        el('span', { class: 'ev-tx' }, [el('strong', { text: e.title }), el('span', { class: 'sub', text: e.card })])
      ]);
      var modes = el('div', { class: 'modes', role: 'radiogroup', 'aria-label': e.title + ': kdy se to děje' },
        P.modes.map(function (m) {
          return el('button', { class: 'mode', type: 'button', role: 'radio', 'aria-checked': 'false', 'data-m': m.v, text: m.t, onclick: function () { sel[e.id] = m.v; paint(); } });
        }));
      var wrap = el('div', { class: 'evwrap' }, [tog, modes]);
      nodes[e.id] = { wrap: wrap, tog: tog, modes: modes };
      grid.appendChild(wrap);
    });
    card.appendChild(grid);
    card.appendChild(noneBtn);
    card.appendChild(msg);
    function paint() {
      var ids = Object.keys(sel), missing = ids.filter(function (i) { return !sel[i]; });
      T.events.forEach(function (e) {
        var n = nodes[e.id], on = sel[e.id] !== undefined;
        n.wrap.classList.toggle('on', on);
        n.tog.setAttribute('aria-pressed', on ? 'true' : 'false');
        Array.prototype.forEach.call(n.modes.children, function (b) {
          var is = sel[e.id] === b.getAttribute('data-m');
          b.classList.toggle('sel', is); b.setAttribute('aria-checked', is ? 'true' : 'false');
        });
      });
      noneBtn.classList.toggle('sel', none); noneBtn.setAttribute('aria-pressed', none ? 'true' : 'false');
      var ok = (none || ids.length) && !missing.length;
      next.disabled = !ok;
      msg.textContent = missing.length ? P.needMode : (!ids.length && !none ? P.needAny : '');
    }
    function commit() {
      var picks = none ? [] : T.events.filter(function (e) { return sel[e.id]; }).map(function (e) { return { id: e.id, mode: sel[e.id] }; });
      if (!none && !picks.length) return;
      S.selected = picks;
      if (none) S.pickSig = S.pickSig || '[]';
      // Počty už zpravidla dorazily; kdyby ne, počkáme maximálně do vypršení timeoutu.
      countsReady.then(function () { buildDynamic(); goNext(); });
    }
    paint();
    buildActions(step, [next]);
    return h;
  }

  function renderEnd(c, withShare) {
    stage.textContent = ''; actions.textContent = '';
    updateTimeline(withShare ? 1 : 0, 0, true);
    var card = el('section', { class: 'card' + (REDUCED ? '' : ' enter') });
    card.appendChild(el('div', { class: 'hero', 'aria-hidden': 'true', text: withShare ? '🎉' : '👋' }));
    var h = el('h1', { tabindex: '-1', text: c.title }); card.appendChild(h);
    (c.paragraphs || [c.text]).forEach(function (p) { card.appendChild(el('p', { class: 'lead', text: p })); });
    if (withShare) {
      var linkBox = el('input', { class: 'linkbox', type: 'text', readonly: true, 'aria-label': 'Odkaz na hru', hidden: true });
      var btn = primary(c.share, function () { share(btn, linkBox); });
      actions.appendChild(btn);
      card.appendChild(linkBox);
      card.appendChild(el('p', { class: 'hint', text: c.note }));
    }
    stage.appendChild(card);
    try { h.focus({ preventScroll: true }); } catch (e) { /* ok */ }
  }

  function shareUrl() {
    var base = C.SITE_URL && C.SITE_URL.indexOf('GITHUB_USER') < 0 ? C.SITE_URL : location.origin + location.pathname;
    return base + '?src=sdileno';
  }
  function share(btn, box) {
    var url = shareUrl(), E = T.ending;
    if (navigator.share) {
      navigator.share({ title: T.intro.title, text: E.shareText, url: url }).catch(function () { /* zrušeno */ });
      return;
    }
    function fallback() { box.hidden = false; box.value = url; box.focus(); box.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast(E.copied); }, fallback);
    } else fallback();
  }

  // ---------- Start ----------
  buildHead(); buildTail(); assemble([]);
  flush(); // odešle případná nedoručená data z minulé návštěvy
  if (TEST) window.__FMB = { S: S, steps: function () { return steps; }, payload: buildPayload, go: function () { return idx; }, queue: function () { return memQ; } };
  if (TEST) document.getElementById('testbadge').hidden = false;
  render();
})();
