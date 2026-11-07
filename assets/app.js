/* Uma Jornada pela Ética Animal — interações (editado à mão) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var base = document.body.getAttribute('data-base') || '';
  /* idioma: português na raiz, inglês em /en/ */
  var LG = /^es/i.test(document.documentElement.lang) ? 'es' : /^en/i.test(document.documentElement.lang) ? 'en' : 'pt';
  var EN = LG === 'en', ES = LG === 'es';
  /* textos da interface: L(português, inglês[, espanhol]); sem o espanhol, usa o dicionário assets/i18n-es.js (chave = texto em inglês) */
  function L(pt, en, es) { return LG === 'pt' ? pt : LG === 'en' ? en : (es !== undefined ? es : ((window.QE_ES || {})[en] || en)); }
  /* páginas montadas no JavaScript: nome lógico (português) -> nome real no idioma da página */
  var PG = {
    en: { 'pensadores.html': 'who-is-who.html', 'glossario.html': 'glossary.html', 'minha-jornada.html': 'my-journey.html', 'trilhas.html': 'reading-paths.html',
      'cartoes.html': 'flashcards.html', 'testes.html': 'quizzes.html', 'teorias.html': 'theory-comparator.html', 'referencias.html': 'references.html',
      'professores.html': 'teachers.html', 'simulador.html': 'debate-simulator.html', 'mapa-argumentos.html': 'argument-map.html',
      'desbancando.html': 'debunking-objections.html', 'ferramentas.html': 'tools.html' },
    es: { 'pensadores.html': 'quien-es-quien.html', 'glossario.html': 'glosario.html', 'minha-jornada.html': 'mi-recorrido.html', 'trilhas.html': 'rutas-de-lectura.html',
      'cartoes.html': 'fichas.html', 'testes.html': 'pruebas.html', 'teorias.html': 'comparador-de-teorias.html', 'referencias.html': 'referencias.html',
      'professores.html': 'area-docente.html', 'simulador.html': 'simulador-de-debate.html', 'mapa-argumentos.html': 'mapa-de-argumentos.html',
      'desbancando.html': 'desmontando-objeciones.html', 'ferramentas.html': 'herramientas.html' }
  };
  function pg(n) { return (PG[LG] || {})[n] || n; }
  window.qePg = pg;
  var SIMPLES = { pt: 'simples', en: 'simplified', es: 'simplificada' }[LG];
  var assets = document.body.getAttribute('data-assets') || (base + 'assets/');
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[LG]); }
  function dec(s) { return EN ? s : s.replace('.', ','); }
  function num(n, d) { return dec(n.toFixed(d === undefined ? 1 : d)); }
  /* gráfico de barras simples: linhas = [[rótulo, valor, texto, classe]] */
  function grafico(el, linhas, max) {
    if (!el) return;
    max = max || Math.max.apply(null, linhas.map(function (l) { return l[1]; })) || 1;
    if (el.children.length !== linhas.length) el.innerHTML = linhas.map(function () { return '<div class="bl"><span></span><span class="bx"><i></i></span><b></b></div>'; }).join('');
    linhas.forEach(function (l, i) {
      var r = el.children[i]; r.className = 'bl ' + (l[3] || '');
      r.children[0].textContent = l[0]; r.children[2].textContent = l[2];
      r.children[1].firstChild.style.width = Math.max(1.5, 100 * l[1] / max) + '%';
    });
  }

  /* ---------- menus ---------- */
  $$('.drop>button').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var m = document.getElementById(b.getAttribute('aria-controls'));
      var abrir = m.hidden;
      $$('.drop .mega').forEach(function (x) { x.hidden = true; });
      $$('.drop>button').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
      m.hidden = !abrir; b.setAttribute('aria-expanded', String(abrir));
    });
  });
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest('.drop')) { $$('.drop .mega').forEach(function (x) { x.hidden = true; }); $$('.drop>button').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); }); }
  });
  var hamb = $('.hamb');
  if (hamb) hamb.addEventListener('click', function () { var m = $('.menu'); var a = m.classList.toggle('aberto'); hamb.setAttribute('aria-expanded', String(a)); });

  /* ---------- tema e fonte ---------- */
  var bt = $('.btema');
  if (bt) bt.addEventListener('click', function () {
    var atual = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var novo = atual === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem('jea-tema', novo); } catch (e) {}
  });
  $$('.prefs [data-f]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = parseInt(document.documentElement.dataset.fonte || '0', 10);
      f = Math.max(-1, Math.min(2, f + (b.dataset.f === '+' ? 1 : -1)));
      document.documentElement.dataset.fonte = String(f);
      try { localStorage.setItem('jea-fonte', String(f)); } catch (e) {}
    });
  });
  var bfoco = $('.prefs [data-modo="foco"]');
  if (bfoco) {
    var foco = ls.get('jea-foco', false);
    var aplica = function () { document.body.classList.toggle('foco', foco); bfoco.setAttribute('aria-pressed', String(foco)); };
    aplica();
    bfoco.addEventListener('click', function () { foco = !foco; ls.set('jea-foco', foco); aplica(); });
  }

  /* ---------- progresso de leitura ---------- */
  var lidos = ls.get('jea-lidos', {});
  function atualizaLidos() {
    $$('[data-cap]').forEach(function (a) { if (a.tagName === 'A') a.classList.toggle('lido', !!lidos[a.dataset.cap]); });
    $$('.prog[data-vol]').forEach(function (p) {
      var v = p.dataset.vol, t = parseInt(p.dataset.total, 10), n = 0;
      Object.keys(lidos).forEach(function (k) { if (lidos[k] && k.split('-')[0] === v) n++; });
      var i = $('.barra i', p); if (i) i.style.width = (100 * n / t) + '%';
      var s = $(':scope > span:not(.barra)', p); if (s) s.textContent = n + L(' de ', ' of ') + t + L(' lidos', ' read');
    });
    $$('button.lido').forEach(function (b) { var on = !!lidos[b.dataset.cap]; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? L('Lido ✓', 'Read ✓') : L('Marcar como lido', 'Mark as read'); });
  }
  $$('button.lido').forEach(function (b) {
    b.addEventListener('click', function () { lidos[b.dataset.cap] = !lidos[b.dataset.cap]; if (!lidos[b.dataset.cap]) delete lidos[b.dataset.cap]; ls.set('jea-lidos', lidos); atualizaLidos(); });
  });
  atualizaLidos();

  /* ---------- índice do capítulo: seção atual ---------- */
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var mapa = {};
    tocLinks.forEach(function (a) { mapa[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting && mapa[en.target.id]) { tocLinks.forEach(function (a) { a.classList.remove('at'); }); mapa[en.target.id].classList.add('at'); } });
    }, { rootMargin: '-80px 0px -70% 0px' });
    Object.keys(mapa).forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
  }

  /* ---------- abas ---------- */
  $$('[role=tablist]').forEach(function (tl) {
    var tabs = $$('[role=tab]', tl);
    function ativa(t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
      t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { ativa(t); });
      t.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowRight') { ev.preventDefault(); ativa(tabs[(i + 1) % tabs.length]); }
        if (ev.key === 'ArrowLeft') { ev.preventDefault(); ativa(tabs[(i - 1 + tabs.length) % tabs.length]); }
      });
    });
  });

  /* ---------- quizzes ---------- */
  function ligaQuiz(q, cb) {
    var fb = $('.fb', q);
    $$('.op', q).forEach(function (b) {
      b.addEventListener('click', function () {
        if (q.dataset.feito) return;
        q.dataset.feito = '1';
        var ok = b.dataset.ok === '1';
        b.classList.add(ok ? 'certa' : 'errada');
        if (!ok) $$('.op', q).forEach(function (x) { if (x.dataset.ok === '1') x.classList.add('certa'); });
        fb.hidden = false; fb.className = 'fb ' + (ok ? 'ok' : 'no');
        fb.innerHTML = (ok ? L('<strong>Isso.</strong> ', '<strong>That’s right.</strong> ') : L('<strong>Não exatamente.</strong> ', '<strong>Not quite.</strong> ')) + esc(fb.dataset.expl || '') + (fb.dataset.link || '');
        if (cb) cb(ok);
      });
    });
  }
  $$('.quiz[data-q]').forEach(function (q) { ligaQuiz(q); });

  /* ---------- pop-ups: notas, referências, autores e termos ---------- */
  var pop = $('#pop');
  var dados = {};
  var dp = $('#dados-pop');
  if (dp) { try { dados = JSON.parse(dp.textContent); } catch (e) {} }
  var origem = null;
  function mostra(el, html) {
    if (!pop) return;
    pop.innerHTML = '<button type="button" class="fechar" aria-label="' + L('Fechar', 'Close') + '">×</button>' + html;
    pop.hidden = false;
    var r = el.getBoundingClientRect();
    var w = Math.min(440, window.innerWidth - 24);
    var x = Math.max(12, Math.min(window.scrollX + r.left - 20, window.scrollX + window.innerWidth - w - 12));
    pop.style.left = x + 'px';
    pop.style.top = (window.scrollY + r.bottom + 8) + 'px';
    var ph = pop.offsetHeight;
    if (r.bottom + ph + 16 > window.innerHeight && r.top > ph + 16) pop.style.top = (window.scrollY + r.top - ph - 8) + 'px';
    origem = el;
    $('.fechar', pop).addEventListener('click', fecha);
    var lk = $('a', pop); if (lk && lk.classList.contains('primeiro')) lk.focus();
  }
  function fecha() { if (pop) pop.hidden = true; if (origem) { origem.focus({ preventScroll: true }); origem = null; } }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('sup.nr a, a.cit, button.pens, button.gl');
    if (a) {
      ev.preventDefault();
      if (a.matches('sup.nr a')) {
        var li = document.getElementById('n' + a.dataset.n);
        if (li) { var c = li.cloneNode(true); $$('.volta', c).forEach(function (x) { x.remove(); }); mostra(a, '<p class="ptipo">' + L('Nota ', 'Note ') + esc(a.dataset.n) + '</p><div>' + c.innerHTML.replace(/<span class="nn">\d+<\/span>/, '') + '</div><p class="fino"><a href="#n' + a.dataset.n + '">' + L('Ir para as notas', 'Go to the notes') + '</a></p>'); }
      } else if (a.matches('a.cit')) {
        var r = (dados.r || {})[a.dataset.r];
        if (r) mostra(a, '<p class="ptipo">' + L('Referência', 'Reference') + '</p><p>' + r + '</p><p class="fino"><a href="' + a.getAttribute('href') + '">' + L('Ver nas referências do volume', 'See in the volume’s references') + '</a></p>');
        else location.href = a.getAttribute('href');
      } else if (a.matches('button.pens')) {
        var p = (dados.p || {})[a.dataset.p];
        if (p) mostra(a, '<p class="ptipo">' + L('Quem é', 'Who is') + '</p><p class="pt">' + esc(p[0]) + '</p><p class="fino">' + esc(p[1]) + '</p><p>' + esc(p[2]) + '</p><p class="fino"><a href="' + base + pg('pensadores.html') + '#' + a.dataset.p + '">' + L('Mais em Quem é quem', 'More in Who’s who') + '</a> · ' + L('contexto escrito para este site', 'context written for this site') + '</p>');
      } else {
        var g = (dados.g || {})[a.dataset.g];
        if (g) mostra(a, '<p class="ptipo">' + L('Glossário', 'Glossary') + '</p><p class="pt">' + esc(g[0]) + '</p><p>' + esc(g[1]) + '</p><p class="fino"><a href="' + base + pg('glossario.html') + '#' + a.dataset.g + '">' + L('Ver no glossário', 'See in the glossary') + '</a></p>');
      }
      return;
    }
    if (pop && !pop.hidden && !ev.target.closest('#pop')) fecha();
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { fecha(); fechaBusca(); } });

  /* ---------- busca ---------- */
  var bx = $('#busca'), bq = $('#busca-q'), br = $('#busca-r'), idx = null, sel = 0;
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function abreBusca() {
    if (!bx) return; bx.hidden = false; bq.value = ''; br.innerHTML = ''; bq.focus();
    if (!idx) fetch(assets + (LG === 'pt' ? 'busca.json' : 'busca_' + LG + '.json')).then(function (r) { return r.json(); }).then(function (j) { idx = j.map(function (x) { x.n = norm(x.t + ' ' + (x.s || []).join(' ')); x.nt = norm(x.t); return x; }); if (bq && bq.value) bq.dispatchEvent(new Event('input')); });
  }
  function fechaBusca() { if (bx && !bx.hidden) bx.hidden = true; }
  $$('.bbusca').forEach(function (b) { b.addEventListener('click', abreBusca); });
  document.addEventListener('keydown', function (ev) { if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); abreBusca(); } });
  if (bx) bx.addEventListener('click', function (ev) { if (ev.target === bx) fechaBusca(); });
  if (bq) {
    bq.addEventListener('input', function () {
      if (!idx) return;
      var t = norm(bq.value.trim()); sel = 0;
      if (t.length < 2) { br.innerHTML = ''; return; }
      var ps = t.split(/\s+/);
      var res = idx.filter(function (x) { return ps.every(function (p) { return x.n.indexOf(p) >= 0; }); })
        .sort(function (a, b) { return (b.nt.indexOf(t) >= 0) - (a.nt.indexOf(t) >= 0); }).slice(0, 30);
      br.innerHTML = res.map(function (x, i) { return '<a href="' + ((base + x.u.replace(/(^|\/)index\.html(?=$|#)/, '$1')) || './') + '"' + (i === 0 ? ' class="sel"' : '') + '>' + esc(x.t) + '<small>' + esc(x.k) + '</small></a>'; }).join('') || '<p class="fino">' + L('Nada encontrado.', 'Nothing found.') + '</p>';
    });
    bq.addEventListener('keydown', function (ev) {
      var as = $$('a', br); if (!as.length) return;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); as[sel].classList.remove('sel'); sel = (sel + (ev.key === 'ArrowDown' ? 1 : -1) + as.length) % as.length; as[sel].classList.add('sel'); as[sel].scrollIntoView({ block: 'nearest' }); }
      if (ev.key === 'Enter') { ev.preventDefault(); location.href = as[sel].href; }
    });
  }

  /* ---------- filtros de listas ---------- */
  $$('.filtro').forEach(function (f) {
    var alvo = $(f.dataset.alvo); if (!alvo) return;
    var sel_ = f.dataset.item || 'li, details, .kart';
    f.addEventListener('input', function () {
      var t = norm(f.value.trim());
      $$(sel_, alvo).forEach(function (it) { if (it.parentElement.closest('details') && it.tagName === 'LI') return; it.hidden = t && norm(it.textContent).indexOf(t) < 0; });
      $$('h2.grupo', alvo).forEach(function (h) { var n = h.nextElementSibling, vis = false; while (n && !n.matches('h2.grupo')) { if (!n.hidden && (n.matches(sel_) ? true : $$(sel_, n).some(function (x) { return !x.hidden; }))) vis = true; n = n.nextElementSibling; } h.hidden = !!t && !vis; });
    });
  });
  $$('.chips[data-alvo]').forEach(function (cs) {
    var alvo = $(cs.dataset.alvo);
    $$('.chip', cs).forEach(function (c) {
      c.addEventListener('click', function () {
        $$('.chip', cs).forEach(function (x) { x.classList.toggle('on', x === c); });
        $$('[data-t]', alvo).forEach(function (it) { it.hidden = c.dataset.f !== '*' && it.dataset.t !== c.dataset.f; });
      });
    });
  });
  $$('.chips[data-cards]').forEach(function (cs) {
    var alvo = $(cs.dataset.cards);
    $$('.chip', cs).forEach(function (c) {
      c.addEventListener('click', function () {
        $$('.chip', cs).forEach(function (x) { x.classList.toggle('on', x === c); });
        var n = 0;
        $$('.ccard', alvo).forEach(function (k) {
          var mostra = c.dataset.v === '*' || k.dataset.v === c.dataset.v;
          k.hidden = !mostra; k.classList.remove('entra', 'rv');
          if (mostra) { k.style.setProperty('--i', Math.min(n++, 18)); void k.offsetWidth; k.classList.add('entra'); }
        });
      });
    });
  });
  $$('[data-abre-todos]').forEach(function (b) {
    b.addEventListener('click', function () { var ds = $$(b.dataset.abreTodos); var abrir = ds.some(function (d) { return !d.open; }); ds.forEach(function (d) { d.open = abrir; }); b.textContent = abrir ? L('Fechar todos', 'Close all') : L('Abrir todos', 'Open all'); });
  });

  /* ---------- movimento: entrada ao rolar, topo que encolhe, progresso de leitura ---------- */
  var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calmo && 'IntersectionObserver' in window) {
    var grupos = {};
    var obsRv = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); obsRv.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.ccard, .vcard, .cartao, .caixa, .kart, .quiz, .trilha, .pessoa, .termo, .sumvol, .caps li, .tabela, .fig, .autor-box, .pager, .grupo, .gaveta, .cta, .cab-sec, .pensar').forEach(function (el) {
      if (el.hidden || el.closest('.hero') || el.getBoundingClientRect().top < window.innerHeight * .9) return;
      var pai = el.parentElement; var k = grupos[pai && pai.dataset ? (pai.id || pai.className) : ''] = ((grupos[pai.id || pai.className] || 0) + 1);
      el.style.setProperty('--i', (k - 1) % 6);
      el.classList.add('rv'); obsRv.observe(el);
    });
  }
  var barra = $('.progresso i'), art = $('.original');
  var aoRolar = function () {
    document.body.classList.toggle('rolado', window.scrollY > 30);
    if (barra && art) {
      var r = art.getBoundingClientRect(), total = r.height - window.innerHeight * .6;
      var p = Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
      barra.style.transform = 'scaleX(' + p + ')';
    }
  };
  window.addEventListener('scroll', aoRolar, { passive: true }); aoRolar();
  var tocD = $('.toc details');
  if (tocD && window.innerWidth < 980) tocD.open = false;
  $$('.toc a').forEach(function (a) { a.addEventListener('click', function () { if (tocD && window.innerWidth < 980) tocD.open = false; }); });

  /* ---------- gavetas: abrir notas e fontes quando um link aponta para dentro delas ---------- */
  function abreAlvo(hash) {
    if (!hash || hash.length < 2) return;
    var alvo = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!alvo) return;
    var d = alvo.tagName === 'DETAILS' ? alvo : alvo.closest('details');
    if (d && !d.open) { d.open = true; setTimeout(function () { alvo.scrollIntoView({ block: 'start' }); }, 30); }
  }
  window.addEventListener('hashchange', function () { abreAlvo(location.hash); });
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a[href^="#"]');
    if (a) abreAlvo(a.getAttribute('href'));
  });
  abreAlvo(location.hash);

  /* ---------- testes ---------- */
  var dt = $('#dados-teste');
  if (dt) {
    var banco = JSON.parse(dt.textContent);
    var caixa = $('#teste');
    var embaralha = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    var inicia = function (v) {
      var pool = v === 'todos' ? Object.keys(banco).reduce(function (a, k) { return a.concat(banco[k]); }, []) : (banco[v] || []);
      if (!pool.length) { caixa.innerHTML = '<p class="fino">' + L('As perguntas deste volume ainda estão em preparação.', 'The questions for this volume are still being prepared.') + '</p>'; return; }
      var qs = embaralha(pool).slice(0, 10), pts = 0, feitas = 0;
      caixa.innerHTML = '<p class="placar">0' + L(' de ', ' of ') + qs.length + '</p>' + qs.map(function (q, i) {
        return '<div class="quiz" data-i="' + i + '"><p class="qp">' + (i + 1) + '. ' + q[0] + '</p><ul class="ops">' + q[1].map(function (o, j) { return '<li><button type="button" class="op" data-ok="' + (j === q[2] ? 1 : 0) + '">' + o + '</button></li>'; }).join('') + '</ul><p class="fb" hidden data-expl="' + esc(q[3]) + '"></p></div>';
      }).join('');
      $$('.quiz', caixa).forEach(function (el, i) {
        $('.fb', el).dataset.link = ' <a href="' + base + qs[i][4] + '">' + L('Rever: ', 'Review: ') + esc(qs[i][5]) + '</a>';
        ligaQuiz(el, function (ok) { feitas++; if (ok) pts++; $('.placar', caixa).textContent = pts + L(' de ', ' of ') + qs.length + (feitas === qs.length ? ' · ' + (pts >= 8 ? L('Ótimo!', 'Great!') : pts >= 5 ? L('Bom, revise os que errou.', 'Good. Review the ones you missed.') : L('Vale reler os capítulos indicados.', 'It’s worth rereading the chapters indicated.')) : ''); });
      });
    };
    $$('[data-teste]').forEach(function (b) { b.addEventListener('click', function () { $$('[data-teste]').forEach(function (x) { x.classList.toggle('on', x === b); }); inicia(b.dataset.teste); }); });
    if (location.hash && /^#v\d+$/.test(location.hash)) { var bb = $('[data-teste="' + location.hash.slice(2) + '"]'); if (bb) bb.click(); }
  }

  /* ---------- cartões ---------- */
  var dc = $('#dados-cartoes');
  if (dc) {
    var bc0 = $('[data-cartao]');
    var todos = JSON.parse(dc.textContent), tipo = bc0 ? bc0.dataset.cartao : 'Objeção', lista = [], k = 0;
    var fc = $('.cartao-fc'), ff = $('.fc-f'), fbk = $('.fc-b'), fn = $('.fc-n');
    var monta = function () { lista = todos.filter(function (c) { return c.t === tipo; }).sort(function () { return Math.random() - .5; }); k = 0; mostraC(); };
    var mostraC = function () { var c = lista[k]; ff.hidden = false; fbk.hidden = true; ff.innerHTML = '<p class="ptipo">' + esc(c.t) + '</p><p>' + esc(c.f) + '</p>'; fbk.innerHTML = '<p>' + esc(c.b) + '</p>'; fn.textContent = (k + 1) + L(' de ', ' of ') + lista.length; };
    var vira = function () { ff.hidden = !ff.hidden; fbk.hidden = !fbk.hidden; };
    fc.addEventListener('click', vira); fc.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); vira(); } });
    $$('[data-fc]').forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.fc === 'virar') vira(); else { k = (k + (b.dataset.fc === 'prox' ? 1 : -1) + lista.length) % lista.length; mostraC(); } }); });
    $$('[data-cartao]').forEach(function (b) { b.addEventListener('click', function () { $$('[data-cartao]').forEach(function (x) { x.classList.toggle('on', x === b); }); tipo = b.dataset.cartao; monta(); }); });
    monta();
  }

  /* ---------- ferramentas ---------- */
  var F = $('.ferr');
  var tipoF = F && F.dataset.ferr;

  if (tipoF === 'especismo') {
    var resp = {}, prat = $('#esp-pratica'), outra = $('#esp-outra'), outraL = $('#esp-outra-l');
    prat.addEventListener('change', function () { outraL.hidden = prat.value !== 'outra'; calc(); });
    var calc = function () {
      var n = Object.keys(resp).length, nao = Object.keys(resp).filter(function (k) { return resp[k] === 'n'; }).length;
      var nome = prat.value === 'outra' ? (outra.value || L('essa prática', 'this practice')) : prat.value.toLowerCase();
      var out = $('#esp-res');
      if (n < 4) { out.textContent = L('Responda às quatro perguntas (' + n + ' de 4).', 'Answer all four questions (' + n + ' of 4).', 'Responde las cuatro preguntas (' + n + ' de 4).'); out.className = 'fb'; return; }
      if (nao === 0) { out.className = 'fb ok'; out.innerHTML = L('<strong>Pelas suas respostas, sua atitude sobre “' + esc(nome) + '” não depende da espécie dos afetados.</strong> Vale conferir se você aceitaria mesmo cada prejuízo envolvido, como pede a quarta pergunta.', '<strong>Based on your answers, your attitude toward “' + esc(nome) + '” does not depend on the species of those affected.</strong> It’s worth checking whether you would really accept each harm involved, as the fourth question asks.', '<strong>Según tus respuestas, tu actitud sobre “' + esc(nome) + '” no depende de la especie de los afectados.</strong> Vale la pena verificar si de verdad aceptarías cada perjuicio involucrado, como pide la cuarta pregunta.'); }
      else { out.className = 'fb no'; out.innerHTML = L('<strong>Em ' + nao + ' de 4 perguntas a sua decisão sobre “' + esc(nome) + '” mudaria se mudasse a espécie dos afetados ou a sua posição.</strong> Segundo o Volume II, isso indica uma atitude especista: o peso dado aos prejuízos depende de quem os sofre, e não do tamanho deles.', '<strong>In ' + nao + ' of 4 questions, your decision about “' + esc(nome) + '” would change if the species of those affected, or your own position, changed.</strong> According to Volume II, this points to a speciesist attitude: the weight given to harms depends on who suffers them, not on how great they are.', '<strong>En ' + nao + ' de 4 preguntas, tu decisión sobre “' + esc(nome) + '” cambiaría si cambiara la especie de los afectados o tu propia posición.</strong> Según el Volumen II, esto indica una actitud especista: el peso que se da a los perjuicios depende de quién los sufre, y no de su magnitud.'); }
    };
    $$('.sn button', F).forEach(function (b) { b.addEventListener('click', function () { resp[b.dataset.i] = b.dataset.r; $$('.sn button[data-i="' + b.dataset.i + '"]', F).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); calc(); }); });
    if (outra) outra.addEventListener('input', calc);
  }

  if (tipoF === 'loteria') {
    var LOT = JSON.parse($('#dados-lot').textContent), tot = LOT.reduce(function (a, x) { return a + x[1]; }, 0);
    var barras = function (eu) {
      $('#lot-barras').innerHTML = LOT.map(function (x, i) { var p = 100 * x[1] / tot; return '<div class="bl' + (i === eu ? ' eu' : '') + '"><span>' + esc(x[0]) + '</span><span class="bx"><i style="width:' + Math.max(.4, p) + '%"></i></span><span>' + (p < 1 ? p.toFixed(2) : p.toFixed(1)) + '%</span></div>'; }).join('');
    };
    barras(-1);
    $('#lot-sortear').addEventListener('click', function () {
      var r = Math.random() * tot, i = 0; while (r > LOT[i][1]) { r -= LOT[i][1]; i++; }
      var p = 100 * LOT[i][1] / tot, pc_ = dec(p < 1 ? p.toFixed(2) : p.toFixed(1)), mam = dec((100 * LOT[LOT.length - 1][1] / tot).toFixed(2));
      $('#lot-res').innerHTML = ES
        ? '<strong>Naciste como: ' + esc(LOT[i][0].toLowerCase()) + '.</strong> Probabilidad: ' + pc_ + '%. Muertos por año: ' + esc(LOT[i][2]) + '. La probabilidad de nacer mamífero o ave, los animales en los que más se piensa, es del ' + mam + '%.'
        : EN
        ? '<strong>You were born as: ' + esc(LOT[i][0].toLowerCase()) + '.</strong> Chance: ' + pc_ + '%. Killed per year: ' + esc(LOT[i][2]) + '. The chance of being born a mammal or a bird, the animals people think of most, is ' + mam + '%.'
        : '<strong>Você nasceu como: ' + esc(LOT[i][0].toLowerCase()) + '.</strong> Chance: ' + pc_ + '%. São mortos por ano ' + esc(LOT[i][2]) + '. A chance de nascer mamífero ou ave, os animais mais lembrados, é de ' + mam + '%.';
      barras(i);
    });
  }

  if (tipoF === 'ano') {
    var s = $('#ano-sel'), cal = $('#ano-cal'), zoom = $('#ano-zoom');
    var c = ''; for (var d = 0; d < 365; d++) c += '<i' + (d === 364 ? ' class="ult"' : '') + '></i>'; cal.innerHTML = c;
    var niveis = [[L('1 ano', '1 year'), 365 * 86400], [L('Último dia (31/12)', 'Last day (Dec. 31)'), 86400], [L('Última hora', 'Last hour'), 3600], [L('Último minuto', 'Last minute'), 60]];
    zoom.innerHTML = niveis.map(function (n) { return '<div class="zl"><span>' + n[0] + '</span><span class="zb"><i></i></span><b></b></div>'; }).join('');
    var upd = function () {
      var q = parseInt(s.value, 10), selv = q * 1e18, exp = 434e9, seg = 365 * 24 * 3600 * exp / (selv + exp);
      $('#ano-v').textContent = q + L(q === 1 ? ' quintilhão' : ' quintilhões', ' quintillion', q === 1 ? ' trillón' : ' trillones');
      $('#ano-exp').style.width = Math.max(.3, 100 * exp / (selv + exp)) + '%';
      niveis.forEach(function (n, i) {
        var pc = 100 * seg / n[1], z = zoom.children[i];
        z.querySelector('i').style.width = Math.min(100, pc) + '%';
        z.querySelector('b').textContent = pc >= 0.1 ? dec(pc.toFixed(pc >= 10 ? 0 : 1)) + '%' : L('invisível', 'invisible');
      });
      var ini = 60 - seg, hh = Math.floor(ini);
      cal.dataset.hora = '';
      $('#ano-txt').dataset.ini = '23:59:' + String(Math.max(0, hh)).padStart(2, '0');
      var dur = seg >= 1 ? dec(seg.toFixed(1)) + L(' segundos', ' seconds') : (seg * 1000).toFixed(0) + L(' milissegundos', ' milliseconds');
      $('#ano-txt').innerHTML = ES
        ? 'Los animales criados para la explotación ocuparían <strong>' + dur + '</strong> del año: empezarían a aparecer el <strong>31 de diciembre, a las ' + $('#ano-txt').dataset.ini + '</strong>. Todo el resto del año sería de los animales en la naturaleza.'
        : EN
        ? 'Animals bred for exploitation would take up <strong>' + dur + '</strong> of the year: they would start to appear on <strong>December 31, at ' + $('#ano-txt').dataset.ini + '</strong>. All the rest of the year would belong to animals in the wild.'
        : 'Os animais criados para exploração seriam <strong>' + dur + '</strong> do ano: eles começariam a aparecer em <strong>31 de dezembro, às ' + $('#ano-txt').dataset.ini + '</strong>. Todo o resto do ano seria dos animais na natureza.';
    };
    s.addEventListener('input', upd); upd();
  }

  if (tipoF === 'duvida') {
    var upd2 = function () {
      var p = $('#dv-p').value / 100, h = +$('#dv-h').value, c = +$('#dv-c').value;
      $('#dv-pv').textContent = Math.round(p * 100) + '%'; $('#dv-hv').textContent = h; $('#dv-cv').textContent = c;
      $('#dv-a1').textContent = L('Custo: ', 'Cost: ') + c + L(' (nossa precaução)', ' (our precaution)'); $('#dv-a2').textContent = L('Custo: ', 'Cost: ') + c + L(' (precaução desnecessária)', ' (unnecessary precaution)');
      $('#dv-b1').textContent = L('Dano: ', 'Harm: ') + h + L(' (ele é prejudicado)', ' (they are harmed)'); $('#dv-b2').textContent = L('Custo: 0', 'Cost: 0');
      var ea = c, eb = p * h, out = $('#dv-res');
      grafico($('#dv-graf'), [[L('Tratar como senciente', 'Treat as sentient'), ea, num(ea), ea <= eb ? 'bom' : 'mau'], [L('Tratar como objeto', 'Treat as an object'), eb, num(eb), ea <= eb ? 'mau' : 'bom']], 100);
      out.className = 'fb ' + (ea <= eb ? 'ok' : 'no');
      out.innerHTML = L('Custo esperado de tratar como senciente: <strong>', 'Expected cost of treating as sentient: <strong>') + ea.toFixed(1) + L('</strong>. Custo esperado de tratar como objeto: <strong>', '</strong>. Expected cost of treating as an object: <strong>') + eb.toFixed(1) + '</strong>. ' + (ea <= eb ? L('A precaução é a melhor escolha.', 'Precaution is the better choice.') : L('Com estes números, a precaução custaria mais do que o dano esperado. Note que, para a maioria das práticas (como comer ou não um animal), o custo da precaução é baixo e o dano possível é enorme.', 'With these numbers, precaution would cost more than the expected harm. Note that for most practices (such as whether or not to eat an animal), the cost of precaution is low and the possible harm is enormous.'));
    };
    $$('#dv-p,#dv-h,#dv-c').forEach(function (x) { x.addEventListener('input', upd2); }); upd2();
  }

  if (tipoF === 'morte') {
    var ex = $('#dm-ex');
    var upd3 = function () {
      var a = +$('#dm-a').value, v = +$('#dm-v').value, q = $('#dm-q').value / 100;
      $('#dm-qv').textContent = num(q, 2);
      var perd = Math.max(0, v - a), avaq = perd * q, pct = v > 0 ? Math.min(100, 100 * a / v) : 0;
      var vd = $('#dm-vida').children; vd[0].style.width = pct + '%'; vd[1].style.width = (100 - pct) + '%';
      $('#dm-res').innerHTML = ES
        ? 'Años de vida perdidos: <strong>' + num(perd) + '</strong>. AVAC perdidos: <strong>' + num(avaq) + '</strong>. El individuo vivió el ' + num(pct) + '% de la vida que podría haber tenido. Cuanto antes llega la muerte, mayor es la pérdida, aunque sea indolora.'
        : EN
        ? 'Years of life lost: <strong>' + num(perd) + '</strong>. QALYs lost: <strong>' + num(avaq) + '</strong>. The individual lived ' + num(pct) + '% of the life they could have had. The earlier the death, the greater the loss, even if it is painless.'
        : 'Anos de vida perdidos: <strong>' + num(perd) + '</strong>. AVAQs perdidos: <strong>' + num(avaq) + '</strong>. O indivíduo viveu ' + num(pct) + '% da vida que poderia ter. Quanto mais cedo a morte, maior a perda, mesmo que ela seja indolor.';
    };
    ex.addEventListener('change', function () { var o = ex.selectedOptions[0]; if (o.dataset.a) { $('#dm-a').value = o.dataset.a; $('#dm-v').value = o.dataset.v; } upd3(); });
    $$('#dm-a,#dm-v,#dm-q').forEach(function (x) { x.addEventListener('input', upd3); }); upd3();
  }

  if (tipoF === 'prior') {
    var g = function (id) { return Math.max(0, +$('#' + id).value || 0); };
    var upd4 = function () {
      var r = ['a', 'b'].map(function (k) {
        var n = g('p' + k + '-n'), gr = g('p' + k + '-g'), t = Math.min(g('p' + k + '-t'), n), b = g('p' + k + '-b'), pe = g('p' + k + '-p');
        return { grav: n * gr, bem: t * b, neg: 1 / (1 + pe) };
      });
      var o = $('#pr-res');
      var pc = function (x, y) { var m = Math.max(x, y) || 1; return [100 * x / m, 100 * y / m]; };
      var g1 = pc(r[0].grav, r[1].grav), g2 = pc(r[0].bem, r[1].bem), g3 = pc(r[0].neg, r[1].neg);
      var gv = L('Gravidade', 'Severity'), bf = L('Benefício', 'Benefit'), ng = L('Negligência', 'Neglect'), mr = L('maior', 'higher');
      grafico($('#pr-graf'), [[gv + ' · A', g1[0], fmt(r[0].grav)], [gv + ' · B', g1[1], fmt(r[1].grav), 'mau'], [bf + ' · A', g2[0], fmt(r[0].bem)], [bf + ' · B', g2[1], fmt(r[1].bem), 'mau'], [ng + ' · A', g3[0], r[0].neg >= r[1].neg ? mr : ''], [ng + ' · B', g3[1], r[1].neg > r[0].neg ? mr : '', 'mau']], 100);
      var mg = r[0].grav >= r[1].grav ? 'A' : 'B', mb = r[0].bem >= r[1].bem ? 'A' : 'B', mn = r[0].neg >= r[1].neg ? 'A' : 'B';
      o.innerHTML = ES
        ? '<strong>Gravedad total</strong> (víctimas × qué tan grave): A = ' + fmt(r[0].grav) + ', B = ' + fmt(r[1].grav) + ' → más grave: ' + mg + '.<br><strong>Beneficio con este recurso</strong> (víctimas ayudadas × mejora): A = ' + fmt(r[0].bem) + ', B = ' + fmt(r[1].bem) + ' → mayor beneficio: ' + mb + '.<br><strong>Desatención</strong>: más desatendido: ' + mn + '. ' + (mg !== mb ? 'Fíjate: el problema más grave no es necesariamente donde el recurso hace más bien. El libro discute cómo sopesar estos criterios.' : '')
        : EN
        ? '<strong>Total severity</strong> (victims × how bad): A = ' + fmt(r[0].grav) + ', B = ' + fmt(r[1].grav) + ' → more severe: ' + mg + '.<br><strong>Benefit from this resource</strong> (victims helped × improvement): A = ' + fmt(r[0].bem) + ', B = ' + fmt(r[1].bem) + ' → greater benefit: ' + mb + '.<br><strong>Neglect</strong>: more neglected: ' + mn + '. ' + (mg !== mb ? 'Notice: the most severe problem is not necessarily where the resource does the most good. The book discusses how to weigh these criteria.' : '')
        : '<strong>Gravidade total</strong> (vítimas × quão ruim): A = ' + fmt(r[0].grav) + ', B = ' + fmt(r[1].grav) + ' → mais grave: ' + mg + '.<br><strong>Benefício com este recurso</strong> (vítimas ajudadas × melhora): A = ' + fmt(r[0].bem) + ', B = ' + fmt(r[1].bem) + ' → maior benefício: ' + mb + '.<br><strong>Negligência</strong>: mais negligenciado: ' + mn + '. ' + (mg !== mb ? 'Repare: o problema mais grave não é necessariamente onde o recurso faz mais bem. O livro discute como pesar esses critérios.' : '');
    };
    $$('input', F).forEach(function (x) { x.addEventListener('input', upd4); }); upd4();
  }

  function sequencia(caixa, cont, itens, monta_) {
    var i = 0, pts = 0;
    var prox = function () {
      if (i >= itens.length) { caixa.innerHTML = '<p class="placar">' + L('Você acertou ' + pts + ' de ' + itens.length + '.', 'You got ' + pts + ' of ' + itens.length + ' right.', 'Acertaste ' + pts + ' de ' + itens.length + '.') + '</p><p><button type="button" class="btn">' + L('Recomeçar', 'Start over') + '</button></p>'; $('button', caixa).addEventListener('click', function () { i = 0; pts = 0; prox(); }); cont.textContent = ''; return; }
      var it = monta_(itens[i]);
      caixa.innerHTML = '<p class="qp">' + esc(it.p) + '</p><ul class="ops">' + it.ops.map(function (o) { return '<li><button type="button" class="op" data-ok="' + (o === it.certa ? 1 : 0) + '">' + esc(o) + '</button></li>'; }).join('') + '</ul><p class="fb" hidden data-expl="' + esc(it.ex) + '"></p><p><button type="button" class="btn alt seg" hidden>' + L('Próxima →', 'Next →') + '</button></p>';
      cont.textContent = (i + 1) + L(' de ', ' of ') + itens.length;
      delete caixa.dataset.feito;
      ligaQuiz(caixa, function (ok) { if (ok) pts++; var s2 = $('.seg', caixa); s2.hidden = false; s2.addEventListener('click', function () { i++; prox(); }); s2.focus(); });
    };
    prox();
  }
  var mistura = function (a) { return a.slice().sort(function () { return Math.random() - .5; }); };
  if (tipoF === 'ident') {
    var frs = JSON.parse($('#dados-ident').textContent), tps = JSON.parse($('#dados-tipos').textContent);
    sequencia($('#id-q'), $('#id-n'), mistura(frs), function (f) {
      var outras = mistura(tps.filter(function (t) { return t !== f[1]; })).slice(0, 3);
      return { p: f[0], ops: mistura(outras.concat([f[1]])), certa: f[1], ex: f[2] };
    });
  }
  if (tipoF === 'vieses') {
    var vz = JSON.parse($('#dados-vieses').textContent);
    sequencia($('#vz-q'), $('#vz-n'), mistura(vz), function (x) { return { p: x[0], ops: mistura(x[2]), certa: x[1], ex: L('O viés aqui é: ' + x[1] + '. Veja a descrição no Volume X.', 'The bias here is: ' + x[1] + '. See the description in Volume X.', 'El sesgo aquí es: ' + x[1] + '. Mira la descripción en el Volumen X.') }; });
  }

  if (tipoF === 'riscos') {
    var rs = JSON.parse($('#dados-rs').textContent);
    var lista_ = $('#rs-lista');
    lista_.innerHTML = rs.map(function (r, i) { return '<div class="rs-item"><strong>' + esc(r[0]) + '</strong><label>' + L('Gravidade', 'Severity') + ': <output>' + r[1] + '</output><input type="range" min="1" max="10" value="' + r[1] + '" data-i="' + i + '" data-k="g"/></label><label>' + L('Probabilidade', 'Probability') + ': <output>' + r[2] + '%</output><input type="range" min="0" max="100" value="' + r[2] + '" data-i="' + i + '" data-k="p"/></label></div>'; }).join('');
    var quad = $('#rs-quad');
    quad.innerHTML = rs.map(function (r) { return '<figure><div class="q"><i></i><span></span></div><figcaption>' + esc(r[0]) + '</figcaption></figure>'; }).join('');
    var upd5 = function () {
      $$('input', lista_).forEach(function (x) { rs[x.dataset.i][x.dataset.k === 'g' ? 1 : 2] = +x.value; });
      $$('input', lista_).forEach(function (x) { x.previousElementSibling.textContent = x.value + (x.dataset.k === 'p' ? '%' : ''); });
      rs.forEach(function (r, i) { var q = quad.children[i].firstChild; q.firstChild.style.width = (r[1] * 10) + '%'; q.firstChild.style.height = r[2] + '%'; q.lastChild.textContent = num(r[1] * r[2] / 100, 2); });
      var ord = rs.map(function (r) { return [r[0], r[1] * r[2] / 100]; }).sort(function (a, b) { return b[1] - a[1]; });
      grafico($('#rs-graf'), ord.map(function (r, i) { return [(i + 1) + '. ' + r[0], r[1], num(r[1], 2), i === 0 ? 'mau' : '']; }));
      $('#rs-res').innerHTML = '<strong>' + L('Ordem pelo desvalor esperado:', 'Ranked by expected disvalue:') + '</strong><ol>' + ord.map(function (r) { return '<li>' + esc(r[0]) + ': ' + num(r[1], 2) + '</li>'; }).join('') + '</ol>';
    };
    $$('input', lista_).forEach(function (x) { x.addEventListener('input', upd5); }); upd5();
  }

  if (tipoF === 'veu') {
    /* véu da imparcialidade: cenários em #dados-veu (tools/veu.py); sorteio pelo peso p de cada posição */
    var DV = JSON.parse($('#dados-veu').textContent), cen = null;
    var bReg = $$('[data-veu]', F), oV = $('#veu-res');
    var mostraCen = function (s) {
      cen = DV.c.filter(function (c) { return c.s === s; })[0];
      $$('[data-cen]', F).forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.cen === s)); });
      $('#veu-i').textContent = cen.i;
      var iguais = cen.pos.every(function (x) { return x.p === 1; });
      $('#veu-s').textContent = iguais ? DV.simples : '';
      $('#veu-s').hidden = !iguais;
      bReg.forEach(function (b, k) { b.textContent = cen.r[k]; b.setAttribute('aria-pressed', 'false'); });
      oV.innerHTML = ''; oV.className = 'fb';
    };
    $$('[data-cen]', F).forEach(function (b) { b.addEventListener('click', function () { mostraCen(b.dataset.cen); }); });
    bReg.forEach(function (b) {
      b.addEventListener('click', function () {
        if (!cen) return;
        bReg.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var k = +b.dataset.veu, tot = cen.pos.reduce(function (a, x) { return a + x.p; }, 0), r = Math.random() * tot, pos = cen.pos[cen.pos.length - 1];
        for (var i = 0, ac = 0; i < cen.pos.length; i++) { ac += cen.pos[i].p; if (r < ac) { pos = cen.pos[i]; break; } }
        var ruim = k === 0 && pos !== cen.pos[0];
        var h = '<strong>' + L('Você nasceu como ', 'You were born as ', 'Naciste como ') + esc(pos.n) + '.</strong> ' + esc(k === 0 ? pos.a : pos.b);
        if (ruim) h += ' ' + L('Você escolheria essa regra de novo?', 'Would you choose this rule again?', '¿Volverías a elegir esta regla?');
        h += ' <span class="fino">' + L('A chance de cair nesta posição era de ', 'The chance of ending up in this position was ', 'La probabilidad de caer en esta posición era del ') + num(100 * pos.p / tot) + '%.</span>';
        if (cen.nota) h += '<p class="veu-nota"><strong>' + L('E os animais?', 'And animals?', '¿Y los animales?') + '</strong> ' + esc(cen.nota) + '</p>';
        oV.innerHTML = h;
        oV.className = 'fb ' + (k === 1 ? 'ok' : 'no');
      });
    });
    mostraCen(DV.c[0].s);
  }

  /* ---------- calculadora das teorias (Vol. XI, cap. 3) ---------- */
  if (tipoF === 'teorias') {
    var N_ = null;
    var EXS = [
      { t: L('Soma igual, distribuição diferente (Vol. XI, cap. 3)', 'Same sum, different distribution (Vol. XI, ch. 3)'), n: L('O exemplo do livro: S1 e S2 têm a mesma soma, mas S2 é igualitária. S3 e S4 testam até onde vai o peso da igualdade.', 'The book’s example: S1 and S2 have the same sum, but S2 is equal. S3 and S4 test how far the weight of equality goes.'), s: [[20, 10], [15, 15], [15, 14], [14, 14]] },
      { t: L('Utilitarismo clássico (artigo, item 2)', 'Classical utilitarianism (article, section 2)'), n: L('S2 tem o maior saldo total, embora as duas situações tenham indivíduos sofrendo.', 'S2 has the larger overall total, although both situations include individuals who suffer.'), s: [[-8, 9, -12, 3], [-2, 3, -10, 5]] },
      { t: L('Vidas positivas e média (artigo, item 3)', 'Positive lives and the average (article, section 3)'), n: L('S1 e S2 empatam na soma e na média, mas S2 tem mais vidas positivas. S3 tem soma menor e ainda assim mais vidas positivas que S1.', 'S1 and S2 tie on the sum and the average, but S2 has more positive lives. S3 has a smaller sum and still more positive lives than S1.'), s: [[10, -1, -2, -3], [8, 2, -3, -3], [7, 2, -3, -3]] },
      { t: L('Maximin (artigo, item 4)', 'Maximin (article, section 4)'), n: L('Soma, média e vidas positivas empatam. O maximin prefere S2, onde quem está pior (−4) está melhor que em S1 (−5).', 'Sum, average and positive lives all tie. Maximin prefers S2, where the worst off (−4) is better off than in S1 (−5).'), s: [[6, 4, -5, -1], [8, 2, -4, -2]] },
      { t: L('Maximin contra prioritarismo (artigo, item 5.1)', 'Maximin versus prioritarianism (article, section 5.1)'), n: L('O maximin prefere S1, porque o pior nível é mais alto. Em S2, porém, um dos dois sofre muito menos.', 'Maximin prefers S1, because the lowest level is higher. In S2, though, one of the two suffers much less.'), s: [[-48, -49], [-50, -30]] },
      { t: L('Prioritarismo e igualitarismo (artigo, itens 5 e 6)', 'Prioritarianism and egalitarianism (article, sections 5 and 6)'), n: L('S1 e S2 têm a mesma soma; em S2 o benefício vai para quem está pior. S3 tem soma um pouco menor e muito menos desigualdade.', 'S1 and S2 have the same sum; in S2 the benefit goes to the worse off. S3 has a slightly smaller sum and much less inequality.'), s: [[25, -10], [20, -5], [15, -1]] },
      { t: L('Igualação por baixo (artigo, item 6.2)', 'Leveling down (article, section 6.2)'), n: L('S2 é perfeitamente igual, mas todos estão muito pior. Só o aspecto da igualdade a prefere.', 'S2 is perfectly equal, but everyone is much worse off. Only the equality aspect prefers it.'), s: [[14, 15], [1, 1]] },
      { t: L('Utilitarismo negativo (artigo, item 8.1)', 'Negative utilitarianism (article, section 8.1)'), n: L('S1 tem o maior saldo total; S2 tem muito menos sofrimento.', 'S1 has the larger overall total; S2 has far less suffering.'), s: [[100, -70, -20, 30], [-2, -4, 10, 20]] },
      { t: L('Versões negativas (artigo, item 8.2)', 'Negative versions (article, section 8.2)'), n: L('O sofrimento total é o mesmo. As versões negativas do prioritarismo e do igualitarismo preferem dividir o fardo (S2).', 'Total suffering is the same. The negative versions of prioritarianism and egalitarianism prefer sharing the burden (S2).'), s: [[-1, -19], [-9, -11]] },
      { t: L('Mais indivíduos, média menor (exemplo do site)', 'More individuals, lower average (site’s example)'), n: L('Em S1, C não existe. S2 tem soma maior e mais vidas positivas; S1 tem média maior.', 'In S1, C does not exist. S2 has a larger sum and more positive lives; S1 has a higher average.'), s: [[10, 10, N_], [8, 8, 8]] }
    ];
    var sel = $('#tc-ex'), grade = $('#tc-grade'), dados = [];
    sel.innerHTML = EXS.map(function (e_, i) { return '<option value="' + i + '">' + esc(e_.t) + '</option>'; }).join('');
    var LET = 'ABCDEF';
    var ni = function () { return dados[0].length; };
    var monta = function () {
      var h = '<table><thead><tr><th scope="col">' + L('Situação', 'Situation') + '</th>';
      for (var j = 0; j < ni(); j++) h += '<th scope="col">' + LET[j] + '</th>';
      h += '</tr></thead><tbody>';
      dados.forEach(function (lin, i) {
        h += '<tr><th scope="row">S' + (i + 1) + '</th>';
        lin.forEach(function (v, j) { h += '<td><input type="number" step="1" data-i="' + i + '" data-j="' + j + '" value="' + (v === null ? '' : v) + '" aria-label="' + L('Bem-estar de ', 'Well-being of ') + LET[j] + L(' em S', ' in S') + (i + 1) + '"/></td>'; });
        h += '</tr>';
      });
      grade.innerHTML = h + '</tbody></table>';
      $$('input', grade).forEach(function (x) {
        x.addEventListener('input', function () { var v = x.value.trim(); dados[+x.dataset.i][+x.dataset.j] = v === '' || isNaN(+v) ? null : +v; calc(); });
      });
      $('#tc-mi').disabled = ni() >= 6; $('#tc-menosi').disabled = ni() <= 2; $('#tc-ms').disabled = dados.length >= 4; $('#tc-menoss').disabled = dados.length <= 2;
      calc();
    };
    var carrega = function (i) { dados = EXS[i].s.map(function (l) { return l.slice(); }); $('#tc-exn').textContent = EXS[i].n; monta(); };
    /* valor prioritarista ilustrativo: côncavo, crescente, f(0) = 0 */
    var kf = function () { return +$('#tc-k').value / 100; };
    var f = function (b) { var k = kf(); return (1 - Math.exp(-k * b)) / k; };
    var soma = function (a) { return a.reduce(function (s, x) { return s + x; }, 0); };
    var desig = function (a) { if (a.length < 2) return 0; var t = 0, c = 0; for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) { t += Math.abs(a[i] - a[j]); c++; } return t / c; };
    var sinal = function (x) { return (x > 0 ? '+' : '') + num(x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 1); };
    var TEO = [
      { n: L('Utilitarismo clássico', 'Classical utilitarianism'), c: L('maior soma total', 'largest total sum'), v: function (a) { return soma(a); } },
      { n: L('Utilitarismo médio', 'Average utilitarianism'), c: L('maior média', 'highest average'), v: function (a) { return a.length ? soma(a) / a.length : 0; } },
      { n: L('Vidas positivas', 'Positive lives'), c: L('mais indivíduos com bem-estar positivo', 'more individuals with positive well-being'), v: function (a) { return a.filter(function (x) { return x > 0; }).length; }, m: function (x) { return String(x); } },
      { n: L('Utilitarismo negativo', 'Negative utilitarianism'), c: L('menor sofrimento total', 'least total suffering'), v: function (a) { return soma(a.map(function (x) { return Math.min(x, 0); })); } },
      { n: 'Maximin', c: L('melhor nível de quem está pior', 'best level for the worst off'), v: function (a) { return Math.min.apply(null, a); } },
      { n: L('Nível máximo', 'Maximum level'), c: L('melhor nível de quem está melhor', 'best level for the best off'), v: function (a) { return Math.max.apply(null, a); } },
      { n: L('Prioritarismo', 'Prioritarianism'), c: L('soma em que cada ponto vale mais para quem está pior', 'sum in which each point counts more for the worse off'), v: function (a) { return soma(a.map(f)); } },
      { n: L('Igualitarismo', 'Egalitarianism'), c: L('menor desigualdade (diferença média entre pares)', 'least inequality (average gap between pairs)'), v: function (a) { return -desig(a); }, m: function (x) { return num(-x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 1); } },
      { n: L('Suficientismo', 'Sufficientarianism'), c: L('menos falta para chegar à linha, com prioridade a quem está mais longe', 'smallest shortfall from the threshold, with priority to those furthest below'), v: function (a) { var lim = +$('#tc-lim').value || 0; return soma(a.map(function (x) { return f(Math.min(x - lim, 0)); })); },
        m: function (x, a) { var lim = +$('#tc-lim').value || 0; return sinal(x) + '<small>' + a.filter(function (y) { return y >= lim; }).length + L(' de ', ' of ') + a.length + L(' na linha', ' at the line') + '</small>'; } },
      { n: L('Prioritarismo negativo', 'Negative prioritarianism'), c: L('menos sofrimento, pesando mais o de quem sofre mais', 'less suffering, weighting most the suffering of those who suffer most'), v: function (a) { return soma(a.map(function (x) { return f(Math.min(x, 0)); })); } },
      { n: L('Igualitarismo negativo', 'Negative egalitarianism'), c: L('sofrimento mais bem dividido', 'suffering more evenly shared'), v: function (a) { return -desig(a.map(function (x) { return Math.min(x, 0); })); }, m: function (x) { return num(-x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 1); } }
    ];
    var calc = function () {
      $('#tc-kv').textContent = $('#tc-k').value;
      var sits = dados.map(function (l) { return l.filter(function (x) { return x !== null; }); });
      var ok = sits.every(function (a) { return a.length > 0; });
      var res = $('#tc-res');
      if (!ok) { res.innerHTML = '<p class="fino">' + L('Cada situação precisa de pelo menos um indivíduo.', 'Each situation needs at least one individual.') + '</p>'; $('#tc-resumo').textContent = ''; return; }
      var h = '<table><thead><tr><th scope="col">' + L('Teoria ou aspecto', 'Theory or aspect') + '</th>' + sits.map(function (_, i) { return '<th scope="col">S' + (i + 1) + '</th>'; }).join('') + '<th scope="col">' + L('Prefere', 'Prefers') + '</th></tr></thead><tbody>';
      var por = {};
      TEO.forEach(function (t) {
        var vs = sits.map(function (a) { return t.v(a); });
        var mx = Math.max.apply(null, vs), tol = 1e-9 * Math.max(1, Math.abs(mx));
        var melhores = vs.map(function (v, i) { return Math.abs(v - mx) <= tol ? i : -1; }).filter(function (i) { return i >= 0; });
        var emp = melhores.length === vs.length;
        var pref = emp ? L('empate', 'tie') : melhores.map(function (i) { return 'S' + (i + 1); }).join(L(' e ', ' and '));
        if (!emp) melhores.forEach(function (i) { (por['S' + (i + 1)] = por['S' + (i + 1)] || []).push(t.n); });
        h += '<tr><th scope="row">' + esc(t.n) + '<small>' + esc(t.c) + '</small></th>' + vs.map(function (v, i) {
          return '<td class="' + (!emp && melhores.indexOf(i) >= 0 ? 'tc-sim' : '') + '">' + (t.m ? t.m(v, sits[i]) : sinal(v)) + '</td>';
        }).join('') + '<td class="tc-pref' + (emp ? ' tc-emp' : '') + '">' + pref + '</td></tr>';
      });
      res.innerHTML = h + '</tbody></table>';
      var ks = Object.keys(por).sort();
      $('#tc-resumo').innerHTML = ks.length > 1
        ? L('<strong>As teorias se dividem.</strong> ', '<strong>The theories disagree.</strong> ') + ks.map(function (k) { return k + ': ' + esc(por[k].join(', ')); }).join('. ') + '.'
        : ks.length === 1 ? L('<strong>Todas as que têm preferência escolhem ' + ks[0] + '.</strong>', '<strong>Every theory with a preference chooses ' + ks[0] + '.</strong>', '<strong>Todas las que tienen preferencia eligen ' + ks[0] + '.</strong>') : L('Todas as teorias empatam.', 'All theories tie.');
    };
    sel.addEventListener('change', function () { carrega(+sel.value); });
    $('#tc-mi').addEventListener('click', function () { dados.forEach(function (l) { l.push(0); }); monta(); });
    $('#tc-menosi').addEventListener('click', function () { dados.forEach(function (l) { l.pop(); }); monta(); });
    $('#tc-ms').addEventListener('click', function () { dados.push(dados[dados.length - 1].slice()); monta(); });
    $('#tc-menoss').addEventListener('click', function () { dados.pop(); monta(); });
    $$('#tc-lim,#tc-k').forEach(function (x) { x.addEventListener('input', calc); });
    carrega(0);
  }
})();
