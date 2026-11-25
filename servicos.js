(function () {
  'use strict';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- Diagnóstico na prática: revela os valores conforme a rolagem ----
  var cardEls = $$('[data-card]');
  if (!cardEls.length) return;

  var fmt = function (v) { return 'R$ ' + v.toLocaleString('pt-BR'); };
  var zero = function (t) { return t.replace(/\d/g, '0'); };
  var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
  var decode = function (t, q) {
    var nd = (t.match(/\d/g) || []).length, lock = Math.floor(q * nd + 0.000001), k = 0;
    return t.replace(/\d/g, function (ch) { return (k++ < lock) ? ch : String(Math.floor(Math.random() * 10)); });
  };

  var D = 900, R = 500, STEP = 1500, TOT0 = 3 * STEP + D + R + 250, TR = 700;
  var defs = [412380, 1276540, 2894210, 638900];
  var names = ['INSS sobre a folha', 'PIS e COFINS não cumulativo', 'ICMS na base do PIS e COFINS', 'Subvenção de ICMS'];
  var sum = defs.reduce(function (a, d) { return a + d; }, 0);
  var tFinal = fmt(sum);

  var tVal = $('#t-val');
  var cStatus = $('#c-status'), cDot = $('#c-dot'), cSkip = $('#c-skip');
  var st = { now: 0, seq: null };

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
  }

  function set(o) { for (var k in o) st[k] = o[k]; st.now = Date.now(); render(); }

  if (reduce) { st.seq = Date.now() - 600000; render(); return; }

  // Loop de atualização enquanto a sequência anima
  setInterval(function () {
    var n = Date.now();
    if (typeof st.seq === 'number' && n - st.seq < 9000) { st.now = n; render(); }
  }, 60);

  // Dispara conforme a rolagem (e de novo a cada recarga)
  function measure() {
    var first = $('#nb-creditos .nb-card'); if (!first) return;
    var vh = window.innerHeight || 800, top = first.getBoundingClientRect().top;
    if (top < vh * 0.72 && top > -4000) {
      if (st.seq === null || st.seq === 'wait') set({ seq: Date.now() });
    } else if (top > vh * 1.05) {
      if (st.seq !== 'wait') set({ seq: 'wait' });
    }
  }
  var raf = 0;
  var onScroll = function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; measure(); }); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  measure();

  cSkip.addEventListener('click', function () { set({ seq: Date.now() - 600000 }); });
})();
