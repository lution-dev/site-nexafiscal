(function () {
  'use strict';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- Marquee: duplica os logos para o loop infinito ----
  var track = $('#nb-track');
  if (track) {
    var orig = $$('.nb-logo', track);
    orig.forEach(function (n) {
      var c = n.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      var im = c.querySelector('img'); if (im) { im.alt = ''; im.removeAttribute('loading'); }
      track.appendChild(c);
    });
  }

  // ---- Cabeçalho claro sobre seções escuras ----
  var head = $('#nb-head'), hd = false, rafH = 0;
  function headCheck() {
    if (!head) return;
    var r = head.getBoundingClientRect(), y = (r.top + r.bottom) / 2;
    var els = ['nb-dor', 'nb-creditos', 'nb-quem'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
    ['.nb-cta-box', '.nb-foot'].forEach(function (s) { var e = $(s); if (e) els.push(e); });
    var dark = els.some(function (e) { var b = e.getBoundingClientRect(); return b.top <= y && b.bottom >= y; });
    if (dark !== hd) { hd = dark; head.classList.toggle('nb-head-lt', dark); }
  }
  function onHead() {
    if (rafH) return;
    rafH = requestAnimationFrame(function () { rafH = 0; headCheck(); });
  }
  window.addEventListener('scroll', onHead, { passive: true });
  window.addEventListener('resize', onHead);
  headCheck();

  // ---- Animações dos valores ----
  var fmt = function (v) { return 'R$ ' + v.toLocaleString('pt-BR'); };
  var zero = function (t) { return t.replace(/\d/g, '0'); };
  var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
  var decode = function (t, q) {
    var nd = (t.match(/\d/g) || []).length, lock = Math.floor(q * nd + 0.000001), k = 0;
    return t.replace(/\d/g, function (ch) { return (k++ < lock) ? ch : String(Math.floor(Math.random() * 10)); });
  };
  var ease = function (p) { p = clamp01(p); return 1 - Math.pow(1 - p, 3); };

  var D = 900, R = 500, STEP = 1500, TOT0 = 3 * STEP + D + R + 250, TR = 700;
  var defs = [412380, 1276540, 2894210, 638900];
  var names = ['INSS sobre a folha', 'PIS e COFINS não cumulativo', 'ICMS na base do PIS e COFINS', 'Subvenção de ICMS'];
  var sum = defs.reduce(function (a, d) { return a + d; }, 0);
  var tFinal = fmt(sum), hFinal = fmt(1276540);

  var cardEls = $$('[data-card]');
  var hSteps = $$('[data-hstep]');
  var hVal = $('#h-val'), hBar = $('#h-bar'), hFill = $('#h-fill'), hDot = $('#h-dot');
  var tVal = $('#t-val');
  var cStatus = $('#c-status'), cDot = $('#c-dot'), cSkip = $('#c-skip');
  var statEls = $$('[data-stat]');
  var statFinals = ['R$ 650 mi', '+20 anos', '60 meses', '100%'];
  var check = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F2747" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"></path></svg>';

  var st = { now: 0, sStart: null, seq: null, hStart: null };

  function stage(t, value, hiddenCls, scrCls, doneCls, dur) {
    var final = fmt(value);
    if (t < 0) return { display: zero(final), valCls: hiddenCls, blur: 8, op: 0.35, pct: 0, status: 'Na fila', chipCls: 'nb-chip nb-chip-wait', on: false, run: false };
    if (t < D) return { display: zero(final), valCls: hiddenCls, blur: 8, op: 0.35, pct: Math.round(t / D * 100), status: 'Analisando', chipCls: 'nb-chip nb-chip-run', on: false, run: true };
    if (t < D + dur) {
      var q = clamp01((t - D) / dur);
      return { display: decode(final, q), valCls: scrCls, blur: Math.round(8 * (1 - clamp01(q * 2)) * 10) / 10, op: Math.round((0.35 + 0.65 * clamp01(q * 2)) * 100) / 100, pct: 100, status: 'Calculando', chipCls: 'nb-chip nb-chip-run', on: false, run: true };
    }
    return { display: final, valCls: doneCls, blur: 0, op: 1, pct: 100, status: 'Identificado', chipCls: 'nb-chip nb-chip-ok', on: true, run: false };
  }

  function setVal(el, cls, text, blur, op) {
    el.className = cls; el.textContent = text;
    el.style.filter = blur ? 'blur(' + blur + 'px)' : '';
    el.style.opacity = op === 1 ? '' : String(op);
  }

  function render() {
    var now = st.now || Date.now(), seq = st.seq;
    var e = typeof seq === 'number' ? now - seq : (seq === 'wait' ? -1 : 1e9);
    var current = -1;

    cardEls.forEach(function (el, i) {
      var p = stage(e - i * STEP, defs[i], 'nb-val nb-hidden', 'nb-val nb-scr', 'nb-val nb-shown', R);
      if (p.run && current < 0) current = i;
      el.className = (p.on ? 'nb-card nb-card-on' : 'nb-card') + ' nb-cut-m';
      var chip = el.querySelector('[data-chip]'); chip.className = p.chipCls; chip.textContent = p.status;
      setVal(el.querySelector('[data-val]'), p.valCls, p.display, p.blur, p.op);
      el.querySelector('[data-bar]').setAttribute('aria-valuenow', p.pct);
      el.querySelector('[data-fill]').style.width = p.pct + '%';
    });

    var tt = e - TOT0, total;
    if (tt < 0) total = { display: zero(tFinal), cls: 'nb-val nb-tot-hidden', blur: 8, op: 0.35 };
    else if (tt < TR) { var tq = clamp01(tt / TR); total = { display: decode(tFinal, tq), cls: 'nb-val nb-tot-scr', blur: Math.round(8 * (1 - clamp01(tq * 2)) * 10) / 10, op: Math.round((0.35 + 0.65 * clamp01(tq * 2)) * 100) / 100 }; }
    else total = { display: tFinal, cls: 'nb-val nb-tot-shown', blur: 0, op: 1 };
    tVal.className = total.cls + ' nb-total-val'; tVal.textContent = total.display;
    tVal.style.filter = total.blur ? 'blur(' + total.blur + 'px)' : ''; tVal.style.opacity = total.op === 1 ? '' : String(total.op);

    var done = e >= TOT0 + TR, running = !done && e >= 0;
    cStatus.textContent = done ? 'Diagnóstico concluído' : (running ? (current >= 0 ? 'Analisando: ' + names[current] : 'Consolidando o total') : 'Role até aqui para iniciar o diagnóstico');
    cDot.className = running ? 'nb-dot nb-dot-live' : 'nb-dot';
    cSkip.hidden = !running;

    // estatísticas
    var se = st.sStart === null ? -1 : now - st.sStart, sp = se < 0 ? 0 : ease(se / 1500);
    var sTexts = ['R$ ' + Math.round(650 * sp) + ' mi', '+' + Math.round(20 * sp) + ' anos', Math.round(60 * sp) + ' meses', Math.round(100 * sp) + '%'];
    statEls.forEach(function (el, i) { el.textContent = sTexts[i]; });

    // hero
    var hT = st.hStart === null ? -1 : now - st.hStart;
    hSteps.forEach(function (el, i) {
      var s = hT >= (i + 1) * 900 ? 2 : (hT >= i * 900 ? 1 : 0);
      el.className = s === 0 ? 'nb-step nb-step-wait' : 'nb-step';
      var ico = el.children[0]; ico.className = s === 2 ? 'nb-ico nb-ico-done' : (s === 1 ? 'nb-ico nb-ico-run' : 'nb-ico');
      ico.innerHTML = s === 2 ? check : '';
      el.children[2].textContent = s === 2 ? 'Concluído' : (s === 1 ? 'Em andamento' : 'Aguardando');
    });
    var hq = clamp01((hT - 2700) / 700), h;
    if (hT < 2700) h = { display: zero(hFinal), cls: 'nb-val nb-hidden', blur: 8, op: 0.35 };
    else if (hT < 3400) h = { display: decode(hFinal, hq), cls: 'nb-val nb-scr', blur: Math.round(8 * (1 - clamp01(hq * 2)) * 10) / 10, op: Math.round((0.35 + 0.65 * clamp01(hq * 2)) * 100) / 100 };
    else h = { display: hFinal, cls: 'nb-val nb-shown', blur: 0, op: 1 };
    hVal.className = h.cls + ' nb-hero-val'; hVal.textContent = h.display;
    hVal.style.filter = h.blur ? 'blur(' + h.blur + 'px)' : ''; hVal.style.opacity = h.op === 1 ? '' : String(h.op);
    var hp = Math.round(clamp01(hT / 2700) * 100);
    hBar.setAttribute('aria-valuenow', hp); hFill.style.width = hp + '%';
    hDot.className = (hT >= 0 && hT < 3400) ? 'nb-dot nb-dot-live' : 'nb-dot';
  }

  function set(o) { for (var k in o) st[k] = o[k]; st.now = Date.now(); render(); }

  // Estado inicial da animação do hero
  if (reduce) {
    st.hStart = Date.now() - 600000; st.sStart = Date.now() - 600000;
    render();
  } else {
    st.hStart = null;
    render(); // mostra hero zerado
    setTimeout(function () { set({ hStart: Date.now() }); }, 500);
  }

  // Loop de atualização enquanto algo está animando
  setInterval(function () {
    var n = Date.now();
    var sA = st.sStart !== null && n - st.sStart < 1800;
    var qA = typeof st.seq === 'number' && n - st.seq < 9000;
    var hA = st.hStart !== null && n - st.hStart < 4200;
    if (sA || qA || hA) { st.now = n; render(); }
  }, 60);

  // Números: começam quando a faixa entra na tela
  var stats = $('#nb-stats');
  if (!reduce) {
    try {
      if (!stats || !('IntersectionObserver' in window)) throw new Error('no-io');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting && st.sStart === null) { set({ sStart: Date.now() }); io.disconnect(); } });
      }, { threshold: 0.2 });
      io.observe(stats);
    } catch (err) { set({ sStart: Date.now() }); }
  }

  // Diagnóstico por seção: dispara conforme a rolagem
  function measure() {
    var first = $('#nb-creditos .nb-card'); if (!first) return;
    var vh = window.innerHeight || 800, top = first.getBoundingClientRect().top;
    if (top < vh * 0.72 && top > -4000) {
      if (st.seq === null || st.seq === 'wait') set({ seq: Date.now() });
    } else if (top > vh * 1.05) {
      if (st.seq !== 'wait') set({ seq: 'wait' });
    }
  }
  if (!reduce) {
    var raf = 0;
    var onScroll = function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; measure(); }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
  }

  cSkip.addEventListener('click', function () { set({ seq: Date.now() - 600000 }); });
})();

/* Logo do topo: na home, volta ao início sem recarregar nem pôr hash na URL */
(function () {
  var a = document.querySelector('a.nb-home');
  if (!a) return;
  a.addEventListener('click', function (e) {
    if (location.pathname !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    if (location.hash) history.replaceState(null, '', '/');
    window.scrollTo(0, 0);
  });
})();
