/* Questão de Ética: recursos de estudo extra (editado à mão).
   Ouvir, citar, imprimir, destaques e anotações, compartilhar trecho, quiz de início, simulador de debate,
   mapas, linha do tempo, comparador de teorias e Minha jornada. Tudo salvo só no navegador. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var BASE = document.body.dataset.base || '';
  /* idioma: português na raiz, inglês em /en/ */
  var EN = /^en/i.test(document.documentElement.lang);
  function L(pt, en) { return EN ? en : pt; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dados(id) { var el = document.getElementById(id); return el ? JSON.parse(el.textContent) : null; }
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (x) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }
  };
  function mistura(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function copiar(txt, btn) {
    var ok = function () { if (btn) { var o = btn.textContent; btn.textContent = L('Copiado ✓', 'Copied ✓'); setTimeout(function () { btn.textContent = o; }, 1600); } };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, function () {});
    else { var t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (x) {} t.remove(); }
  }
  function baixar(nome, conteudo, tipo) {
    var b = conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- janela (modal) simples ---------- */
  var dlg;
  function modal(titulo, html) {
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'janela';
      dlg.innerHTML = '<div class="jan-cab"><h2></h2><button type="button" class="jan-x" aria-label="' + L('Fechar', 'Close') + '">×</button></div><div class="jan-corpo"></div>';
      document.body.appendChild(dlg);
      $('.jan-x', dlg).addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
    }
    $('h2', dlg).textContent = titulo; $('.jan-corpo', dlg).innerHTML = html;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    return $('.jan-corpo', dlg);
  }

  /* ---------- imprimir ---------- */
  window.addEventListener('beforeprint', function () { $$('details.gaveta').forEach(function (d) { d.dataset.antes = d.open ? '1' : ''; d.open = true; }); });
  window.addEventListener('afterprint', function () { $$('details.gaveta').forEach(function (d) { d.open = d.dataset.antes === '1'; }); });
  $$('[data-imprimir], [data-acao="imprimir"]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* =====================================================================  página de capítulo */
  var art = $('article.cap'), orig = $('#original'), acoes = $('.acoes-cap');
  if (art && orig && acoes) {
    var capId = art.dataset.cap;
    var cabK = $('.cap-cab .kicker'), titulo = $('.cap-cab h1').textContent.trim();
    var local = (cabK ? cabK.textContent.trim() : '');
    var blocos = function () { return $$('p:not(.selo-original), li, blockquote', orig).filter(function (b) { return !b.closest('.tabela'); }); };

    /* ----- como citar ----- */
    var MES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    var MES_EN = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
    $('[data-acao="citar"]', acoes).addEventListener('click', function () {
      var d = new Date(), hoje = EN ? d.getDate() + ' ' + MES_EN[d.getMonth()] + ' ' + d.getFullYear() : d.getDate() + ' ' + MES[d.getMonth()] + ' ' + d.getFullYear();
      var abnt = acoes.dataset.abnt ? acoes.dataset.abnt.replace('{ACESSO}', hoje) : '', apa = acoes.dataset.apa;
      var limpo = function (h) { var t = document.createElement('div'); t.innerHTML = h; return t.textContent; };
      var blocoAbnt = abnt ? '<div class="cit-bloco"><p class="cit-ti">' + L('ABNT', 'MLA') + '</p><p class="cit-txt">' + abnt + '</p><button type="button" class="btn alt" data-c="abnt">' + L('Copiar ABNT', 'Copy MLA') + '</button></div>' : '';
      var blocoApa = '<div class="cit-bloco"><p class="cit-ti">APA</p><p class="cit-txt">' + apa + '</p><button type="button" class="btn alt" data-c="apa">' + L('Copiar APA', 'Copy APA') + '</button></div>';
      var c = modal(L('Como citar este texto', 'How to cite this text'), '<p class="fino">' + L('Referência do capítulo, com o link desta página. Confira as normas exigidas pela sua instituição.', 'Reference for this chapter, with the link to this page. Check the style your institution requires.') + '</p>' +
        (EN ? blocoApa + blocoAbnt : blocoAbnt + blocoApa));
      var bAbnt = $('[data-c="abnt"]', c);
      if (bAbnt) bAbnt.addEventListener('click', function () { copiar(limpo(abnt), this); });
      $('[data-c="apa"]', c).addEventListener('click', function () { copiar(limpo(apa), this); });
    });

    /* ----- ouvir ----- */
    var bOuvir = $('[data-acao="ouvir"]', acoes);
    if (!('speechSynthesis' in window)) bOuvir.hidden = true;
    else {
      var synth = window.speechSynthesis, fila = [], pos = 0, tocando = false, vel = 1, atual = null;
      var bParar = document.createElement('button'); bParar.type = 'button'; bParar.innerHTML = '<span aria-hidden="true">■</span> ' + L('Parar', 'Stop'); bParar.hidden = true;
      var bVel = document.createElement('button'); bVel.type = 'button'; bVel.textContent = '1×'; bVel.title = L('Velocidade da leitura', 'Reading speed'); bVel.hidden = true;
      bOuvir.after(bParar, bVel);
      /* escolhe uma voz em português do Brasil (ou em inglês nas páginas em inglês); as vozes chegam depois do carregamento em vários navegadores */
      var vozPt = null;
      var escolheVoz = function () {
        var vs = synth.getVoices(); if (!vs.length) return;
        var nota = EN ? function (v) {
          var l = (v.lang || '').replace('_', '-').toLowerCase(), n = (v.name || '').toLowerCase();
          if (l.indexOf('en') !== 0) return 0;
          return (l === 'en-us' ? 20 : l === 'en-gb' ? 15 : 10) + (/natural|online|neural/.test(n) ? 4 : 0) + (/google/.test(n) ? 3 : 0) + (/microsoft/.test(n) ? 2 : 0) + (v.localService ? 0 : 1);
        } : function (v) {
          var l = (v.lang || '').replace('_', '-').toLowerCase(), n = (v.name || '').toLowerCase();
          if (l !== 'pt-br' && !/portugu[eê]s.*brasil|brazil/.test(n)) return l.indexOf('pt') === 0 ? 1 : 0;
          return 10 + (/natural|online|neural/.test(n) ? 4 : 0) + (/google/.test(n) ? 3 : 0) + (/microsoft/.test(n) ? 2 : 0) + (v.localService ? 0 : 1);
        };
        var melhor = vs.map(function (v) { return [nota(v), v]; }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; })[0];
        vozPt = melhor ? melhor[1] : null;
      };
      escolheVoz();
      if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', escolheVoz);
      var voz = function () { if (!vozPt) escolheVoz(); return vozPt; };
      var monta = function () {
        fila = [];
        $$('h2, h3, h4, p:not(.selo-original), li, blockquote', orig).forEach(function (b) {
          if (b.closest('.tabela')) return;
          var c = b.cloneNode(true); $$('sup', c).forEach(function (s) { s.remove(); });
          var t = c.textContent.replace(/\s+/g, ' ').trim(); if (!t) return;
          (t.match(/[^.!?;]+[.!?;]*\s*/g) || [t]).reduce(function (acc, f) {
            if (acc.length && (acc[acc.length - 1] + f).length < 220) acc[acc.length - 1] += f; else acc.push(f);
            return acc;
          }, []).forEach(function (pedaco) { fila.push([b, pedaco]); });
        });
      };
      var marca = function (b) {
        if (atual) atual.classList.remove('lendo');
        atual = b; if (!b) return; b.classList.add('lendo');
        var r = b.getBoundingClientRect(); if (r.top < 80 || r.bottom > innerHeight) b.scrollIntoView({ block: 'center', behavior: 'smooth' });
      };
      var fala = function () {
        if (pos >= fila.length) { para(); return; }
        var it = fila[pos], u = new SpeechSynthesisUtterance(it[1]);
        var v = voz(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = EN ? 'en-US' : 'pt-BR'; u.rate = vel;
        u.onend = function () { if (!tocando) return; pos++; fala(); };
        marca(it[0]); synth.speak(u);
      };
      var estado = function () {
        bOuvir.setAttribute('aria-pressed', String(tocando));
        bOuvir.innerHTML = tocando ? '<span aria-hidden="true">❚❚</span> ' + L('Pausar', 'Pause') : '<span aria-hidden="true">▶</span> ' + (pos > 0 ? L('Continuar', 'Resume') : L('Ouvir', 'Listen'));
        bParar.hidden = bVel.hidden = !(tocando || pos > 0);
      };
      var para = function () { tocando = false; synth.cancel(); pos = 0; marca(null); estado(); };
      bOuvir.addEventListener('click', function () {
        if (!tocando && !voz() && !bOuvir.dataset.avisou) {
          bOuvir.dataset.avisou = '1';
          if (EN) modal('English voice not found', '<p>Your browser or system does not have an English voice installed, so the reading may come out with another language’s accent.</p><p class="fino">On Windows: Settings → Time &amp; language → Speech → Add voices → English (United States). On Android and iPhone, English voices are usually in the accessibility or text-to-speech settings. Chrome and Edge already include English voices on most computers.</p>');
          else modal('Voz em português não encontrada', '<p>Seu navegador ou sistema não tem uma voz em português do Brasil instalada, então a leitura pode sair com sotaque de outra língua.</p><p class="fino">No Windows: Configurações → Hora e idioma → Fala → Adicionar vozes → Português (Brasil). No Android e no iPhone, a voz em português costuma vir nas configurações de acessibilidade ou de texto para fala. O Chrome e o Edge já trazem vozes em português na maioria dos computadores.</p>');
        }
        if (tocando) { tocando = false; synth.cancel(); estado(); return; }
        if (!fila.length) monta();
        tocando = true; estado(); fala();
      });
      bParar.addEventListener('click', para);
      bVel.addEventListener('click', function () {
        var vs = [1, 1.25, 1.5, 0.85]; vel = vs[(vs.indexOf(vel) + 1) % vs.length]; bVel.textContent = (EN ? String(vel) : String(vel).replace('.', ',')) + '×';
        if (tocando) { synth.cancel(); setTimeout(fala, 60); }
      });
      window.addEventListener('pagehide', function () { synth.cancel(); });
    }

    /* ----- destaques e anotações ----- */
    var TODOS = ls.get('jea-dest', {});
    var meus = function () { return TODOS[capId] || []; };
    var salva = function (lista) { if (lista.length) TODOS[capId] = lista; else delete TODOS[capId]; ls.set('jea-dest', TODOS); };
    var envolve = function (bloco, ini, fim, id, nota) {
      var w = document.createTreeWalker(bloco, NodeFilter.SHOW_TEXT), n, p = 0, alvos = [];
      while ((n = w.nextNode())) {
        var a = p, b = p + n.data.length; p = b;
        if (b <= ini || a >= fim) continue;
        alvos.push([n, Math.max(0, ini - a), Math.min(n.data.length, fim - a)]);
      }
      alvos.forEach(function (x) {
        var node = x[0];
        if (x[2] < node.data.length) node.splitText(x[2]);
        if (x[1] > 0) node = node.splitText(x[1]);
        if (!node.data.trim()) return;
        var m = document.createElement('mark'); m.className = 'dest' + (nota ? ' com-nota' : ''); m.dataset.id = id;
        if (nota) m.title = nota;
        node.parentNode.insertBefore(m, node); m.appendChild(node);
      });
    };
    var aplica = function (h) {
      var bl = blocos()[h.b]; if (!bl) return;
      var txt = bl.textContent, o = txt.substr(h.o, h.t.length) === h.t ? h.o : txt.indexOf(h.t);
      if (o < 0) return;
      envolve(bl, o, o + h.t.length, h.id, h.n);
    };
    var remove = function (id) {
      $$('mark.dest[data-id="' + id + '"]', orig).forEach(function (m) { var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); m.remove(); p.normalize(); });
      salva(meus().filter(function (h) { return h.id !== id; }));
    };
    meus().forEach(aplica);

    /* barra que aparece ao selecionar */
    var barra = document.createElement('div'); barra.className = 'sel-barra'; barra.hidden = true; barra.setAttribute('role', 'toolbar'); barra.setAttribute('aria-label', L('Ações para o trecho selecionado', 'Actions for the selected passage'));
    barra.innerHTML = '<button type="button" data-s="destacar">' + L('Destacar', 'Highlight') + '</button><button type="button" data-s="anotar">' + L('Anotar', 'Add note') + '</button><button type="button" data-s="compartilhar">' + L('Compartilhar', 'Share') + '</button><button type="button" data-s="copiar">' + L('Copiar com a fonte', 'Copy with source') + '</button>';
    document.body.appendChild(barra);
    var selAtual = null;
    var leSel = function () {
      var s = window.getSelection(); if (!s || s.isCollapsed || !s.rangeCount) return null;
      var r = s.getRangeAt(0), t = s.toString().replace(/\s+/g, ' ').trim(); if (t.length < 3) return null;
      var bs = blocos(), bl = null, i;
      for (i = 0; i < bs.length; i++) if (bs[i].contains(r.startContainer)) { bl = bs[i]; break; }
      if (!bl) return null;
      var pre = document.createRange(); pre.setStart(bl, 0); pre.setEnd(r.startContainer, r.startOffset);
      var o = pre.toString().length;
      var fim = bl.contains(r.endContainer) ? (function () { var x = document.createRange(); x.setStart(bl, 0); x.setEnd(r.endContainer, r.endOffset); return x.toString().length; })() : bl.textContent.length;
      return { b: i, o: o, t: bl.textContent.slice(o, fim), bloco: bl, rect: r.getBoundingClientRect(), txt: t };
    };
    var mostra = function () {
      selAtual = leSel();
      if (!selAtual || !selAtual.t.trim()) { barra.hidden = true; return; }
      barra.hidden = false;
      var r = selAtual.rect, w = barra.offsetWidth;
      barra.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + scrollX + 'px';
      barra.style.top = (r.top + scrollY - barra.offsetHeight - 10 < scrollY + 70 ? r.bottom + scrollY + 10 : r.top + scrollY - barra.offsetHeight - 10) + 'px';
    };
    var tSel;
    document.addEventListener('selectionchange', function () { clearTimeout(tSel); tSel = setTimeout(mostra, 220); });
    barra.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    var novoDest = function (nota) {
      var s = selAtual; if (!s) return;
      var h = { id: Date.now().toString(36), b: s.b, o: s.o, t: s.t, n: nota || '', d: new Date().toISOString().slice(0, 10) };
      var l = meus(); l.push(h); salva(l); aplica(h);
      window.getSelection().removeAllRanges(); barra.hidden = true;
    };
    var editaNota = function (txtInicial, ao) {
      var c = modal(L('Anotação', 'Note'), '<p class="fino">' + L('A anotação fica salva só neste navegador e aparece em <a href="' + BASE + 'minha-jornada.html">Minha jornada</a>.', 'The note is saved only in this browser and appears in <a href="' + BASE + 'minha-jornada.html">My journey</a>.') + '</p><textarea class="nota-campo" rows="5" placeholder="' + L('O que você pensou sobre este trecho?', 'What did you think about this passage?') + '">' + esc(txtInicial || '') + '</textarea><p><button type="button" class="btn">' + L('Salvar', 'Save') + '</button></p>');
      var ta = $('textarea', c); ta.focus();
      $('.btn', c).addEventListener('click', function () { ao(ta.value.trim()); dlg.close(); });
    };
    var credito = function () { return 'Luciano Carlos Cunha, ' + local.replace(/ · /g, ', ') + '. ' + location.origin + location.pathname; };
    barra.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !selAtual) return;
      var s = selAtual;
      if (b.dataset.s === 'destacar') novoDest('');
      else if (b.dataset.s === 'anotar') { editaNota('', function (n) { selAtual = s; novoDest(n); }); }
      else if (b.dataset.s === 'copiar') { copiar('“' + s.txt + '”\n— ' + credito(), b); }
      else if (b.dataset.s === 'compartilhar') { compartilha(s.txt); barra.hidden = true; }
    });
    orig.addEventListener('click', function (ev) {
      var m = ev.target.closest('mark.dest'); if (!m) return;
      var h = meus().filter(function (x) { return x.id === m.dataset.id; })[0]; if (!h) return;
      var c = modal(L('Seu destaque', 'Your highlight'), '<blockquote class="dest-cit">' + esc(h.t) + '</blockquote>' + (h.n ? '<p class="dest-nota">' + esc(h.n) + '</p>' : '') +
        '<p class="jan-btns"><button type="button" class="btn alt" data-d="nota">' + (h.n ? L('Editar anotação', 'Edit note') : L('Adicionar anotação', 'Add note')) + '</button><button type="button" class="btn alt" data-d="comp">' + L('Compartilhar', 'Share') + '</button><button type="button" class="btn alt" data-d="rem">' + L('Remover destaque', 'Remove highlight') + '</button></p>');
      $('[data-d="rem"]', c).addEventListener('click', function () { remove(h.id); dlg.close(); });
      $('[data-d="comp"]', c).addEventListener('click', function () { compartilha(h.t); });
      $('[data-d="nota"]', c).addEventListener('click', function () {
        editaNota(h.n, function (n) {
          var l = meus(); l.forEach(function (x) { if (x.id === h.id) x.n = n; }); salva(l);
          $$('mark.dest[data-id="' + h.id + '"]', orig).forEach(function (mm) { mm.classList.toggle('com-nota', !!n); mm.title = n; });
        });
      });
    });

    /* ----- compartilhar trecho: imagem e link direto ----- */
    var linkTrecho = function (t) {
      var enc = function (x) { return encodeURIComponent(x).replace(/-/g, '%2D').replace(/,/g, '%2C'); };
      var p = t.split(/\s+/);
      var frag = p.length > 12 ? enc(p.slice(0, 5).join(' ')) + ',' + enc(p.slice(-4).join(' ')) : enc(t);
      return location.origin + location.pathname + '#:~:text=' + frag;
    };
    var desenha = function (cv, t) {
      var x = cv.getContext('2d'), W = cv.width, H = cv.height;
      var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0b0a6b'); g.addColorStop(1, '#2a2ba8'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.strokeStyle = '#4bbbe8'; x.lineWidth = 9; x.lineCap = 'round';
      x.lineWidth = 11; x.beginPath(); x.arc(140, 150, 47, 0, 2 * Math.PI); x.stroke(); x.fillStyle = '#4bbbe8'; x.save(); x.translate(140 - 20 * 3.01, 150 - 20 * 3.01); x.scale(3.01, 3.01); x.fill(new Path2D('M27.78 20.51A7.8 7.8 0 1 0 20.51 27.78A5.4 5.4 0 0 1 27.78 20.51Z')); x.restore();
      x.fillStyle = '#4bbbe8'; x.font = '700 150px Fraunces, Georgia, serif'; x.fillText('“', 820, 250);
      var tam = 60, linhas, lim = 980;
      var quebra = function () { var ps = t.split(' '), ls_ = [], l = ''; x.font = '600 ' + tam + 'px Fraunces, Georgia, serif'; ps.forEach(function (p) { var tst = l ? l + ' ' + p : p; if (x.measureText(tst).width > 900 && l) { ls_.push(l); l = p; } else l = tst; }); if (l) ls_.push(l); return ls_; };
      do { linhas = quebra(); tam -= 4; } while (linhas.length * tam * 1.3 > 760 && tam > 30);
      tam += 4; var alt = tam * 1.3, max = Math.floor(lim * 0.78 / alt);
      if (linhas.length > max) { linhas = linhas.slice(0, max); linhas[max - 1] = linhas[max - 1].replace(/\s+\S*$/, '') + '…'; }
      x.fillStyle = '#ffffff'; x.font = '600 ' + tam + 'px Fraunces, Georgia, serif';
      var y0 = 300 + (760 - linhas.length * alt) / 2 + tam;
      linhas.forEach(function (l, k) { x.fillText(l, 90, y0 + k * alt); });
      x.fillStyle = '#4bbbe8'; x.fillRect(90, 1110, 80, 6);
      x.fillStyle = '#ffffff'; x.font = '700 34px "Plus Jakarta Sans", Arial, sans-serif'; x.fillText('Luciano Carlos Cunha', 90, 1170);
      x.fillStyle = '#bfe8fa'; x.font = '500 28px "Plus Jakarta Sans", Arial, sans-serif';
      var loc = local.length > 60 ? local.slice(0, 58) + '…' : local; x.fillText(loc, 90, 1215);
      x.fillText('Questão de Ética · questaodeetica.biblioverse.org', 90, 1275);
    };
    var compartilha = function (t) {
      var c = modal(L('Compartilhar trecho', 'Share passage'), '<canvas class="cv-trecho" width="1080" height="1350" aria-label="' + L('Imagem com o trecho', 'Image with the passage') + '"></canvas><p class="jan-btns"><button type="button" class="btn" data-k="img">' + L('Baixar imagem', 'Download image') + '</button><button type="button" class="btn alt" data-k="link">' + L('Copiar link do trecho', 'Copy link to passage') + '</button>' + (navigator.share ? '<button type="button" class="btn alt" data-k="share">' + L('Compartilhar…', 'Share…') + '</button>' : '') + '</p><p class="fino">' + L('O link abre esta página já rolada e com o trecho destacado (nos navegadores que aceitam esse recurso).', 'The link opens this page scrolled to the passage, with it highlighted (in browsers that support this feature).') + '</p>');
      var cv = $('canvas', c);
      var f = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('600 60px Fraunces'), document.fonts.load('700 34px "Plus Jakarta Sans"')]) : Promise.resolve();
      f.then(function () { desenha(cv, t); }, function () { desenha(cv, t); });
      $('[data-k="img"]', c).addEventListener('click', function () { cv.toBlob(function (b) { baixar(L('trecho-questao-de-etica.png', 'passage-questao-de-etica.png'), b); }); });
      $('[data-k="link"]', c).addEventListener('click', function () { copiar(linkTrecho(t), this); });
      var sh = $('[data-k="share"]', c);
      if (sh) sh.addEventListener('click', function () {
        cv.toBlob(function (b) {
          var arq = new File([b], L('trecho.png', 'passage.png'), { type: 'image/png' }), dadosS = { title: titulo, text: '“' + t + '” — ' + credito(), url: linkTrecho(t) };
          if (navigator.canShare && navigator.canShare({ files: [arq] })) dadosS.files = [arq];
          navigator.share(dadosS).catch(function () {});
        });
      });
    };
  }

  /* =====================================================================  por onde começar */
  var qi = $('#quiz-ini');
  if (qi) {
    var tr = dados('dados-trilhas'), resp = {};
    var EXTRA = {
      estudante: [[L('Cartões de estudo', 'Flashcards'), 'cartoes.html'], [L('Testes e revisão', 'Tests and review'), 'testes.html']],
      univ: [[L('Comparador de teorias éticas', 'Ethical theory comparator'), 'teorias.html'], [L('Todas as referências', 'All references'), 'referencias.html']],
      prof: [[L('Área do professor', 'Teachers’ area'), 'professores.html'], [L('Simulador de debate', 'Debate simulator'), 'simulador.html']],
      ativista: [[L('Simulador de debate', 'Debate simulator'), 'simulador.html'], [L('Mapa dos argumentos', 'Argument map'), 'mapa-argumentos.html']],
      curioso: [[L('Desbancando objeções', 'Debunking objections'), 'desbancando.html'], [L('Ferramentas', 'Tools'), 'ferramentas.html']]
    };
    var calcula = function () {
      var m = { entender: 'especismo', responder: 'veganismo', morte: 'morte', natureza: 'natureza', agir: 'ativismo', teoria: 'teorias', futuro: 'futuro' }[resp.quer];
      if (resp.quer === 'entender' && resp.nivel === 'nada') m = 'essencial';
      if (resp.quer === 'entender' && resp.nivel === 'muito') m = 'senciencia';
      var t = tr[m], caps = resp.tempo === 'curto' ? t.caps.slice(0, 1) : resp.tempo === 'tarde' ? t.caps.slice(0, 3) : t.caps;
      var mins = caps.reduce(function (a, c) { return a + c[3]; }, 0);
      var plano = EN
        ? (resp.tempo === 'curto' ? 'In 15 minutes, read the “Before you read” layer and the beginning of the text. Come back later to finish.' : resp.tempo === 'tarde' ? 'An afternoon is enough for these three texts. Do the “Practice” questions at the end of each one.' : 'Follow the whole path, one or two texts a day, and take the volume test at the end.')
        : (resp.tempo === 'curto' ? 'Em 15 minutos, leia a camada “Antes de ler” e o começo do texto. Volte depois para terminar.' : resp.tempo === 'tarde' ? 'Uma tarde dá para estes três textos. Faça as perguntas de “Pratique” ao fim de cada um.' : 'Siga a trilha inteira, um ou dois textos por dia, e faça o teste do volume no fim.');
      var simp = resp.nivel === 'nada';
      var link = function (u) { return BASE + (simp ? u.replace('/', '/simples/') : u); };
      if (simp) plano = L('Como você está começando, os links levam às versões simplificadas, em linguagem bem simples. No fim de cada uma há um botão para o texto completo do autor. ', 'Since you are just starting out, the links lead to the simplified versions, written in very plain language. At the end of each one there is a button to the author’s full text. ') + plano;
      var r = $('#qi-res');
      r.innerHTML = '<p class="kicker">' + L('Seu caminho', 'Your path') + '</p><h2>' + esc(t.t) + '</h2><p>' + esc(t.d) + '</p><p class="fino">' + plano + L(' Cerca de ' + mins + ' min de leitura.', ' About ' + mins + ' min of reading.') + '</p>' +
        '<ol class="lista-caps">' + caps.map(function (c) { return '<li><a href="' + link(c[2]) + '" data-cap="' + c[0] + '">' + esc(c[1]) + '</a> <span class="fino">' + c[3] + ' min</span></li>'; }).join('') + '</ol>' +
        '<p><a class="btn" href="' + link(caps[0][2]) + '">' + L('Começar a ler', 'Start reading') + '</a> <a class="btn alt" href="' + BASE + 'trilhas.html#' + m + '">' + L('Ver a trilha completa', 'See the full path') + '</a></p>' +
        '<p class="mapa-ti">' + L('Também para você', 'Also for you') + '</p><div class="chips temas-g">' + (EXTRA[resp.quem] || []).map(function (x) { return '<a class="chip" href="' + BASE + x[1] + '">' + x[0] + '</a>'; }).join('') + '<a class="chip" href="' + BASE + 'minha-jornada.html">' + L('Minha jornada', 'My journey') + '</a></div>' +
        '<p><button type="button" class="btn alt" id="qi-de-novo">' + L('Refazer as perguntas', 'Retake the questions') + '</button></p>';
      r.hidden = false;
      $('#qi-de-novo').addEventListener('click', function () { resp = {}; r.hidden = true; $$('.pq', qi).forEach(function (f, i) { f.hidden = i > 0; $$('.op-q', f).forEach(function (b) { b.classList.remove('on'); }); }); });
    };
    qi.addEventListener('click', function (ev) {
      var b = ev.target.closest('.op-q'); if (!b) return;
      resp[b.dataset.q] = b.dataset.v; b.classList.add('on');
      var f = b.closest('.pq'), prox = f.nextElementSibling;
      setTimeout(function () { f.hidden = true; if (prox && prox.classList.contains('pq')) { prox.hidden = false; var x = $('.op-q', prox); if (x) x.focus(); } else calcula(); }, 180);
    });
  }

  /* =====================================================================  simulador de debate */
  var sim = $('#sim');
  if (sim) {
    var D = dados('dados-sim'), RODADAS = 8, rod, pts, ordem;
    var caixa = $('#sim-caixa', sim);
    var inicia = function () { ordem = mistura(D.o).slice(0, RODADAS); rod = 0; pts = 0; mostra(); };
    var mostra = function () {
      $('#sim-n', sim).textContent = L('Rodada ', 'Round ') + (rod + 1) + L(' de ', ' of ') + RODADAS; $('#sim-pts', sim).textContent = pts + L(' ponto', ' point') + (pts === 1 ? '' : 's');
      var o = ordem[rod];
      var outra = mistura(D.o.filter(function (x) { return x[3] !== o[3]; }))[0];
      var fraca = D.f[Math.floor(Math.random() * D.f.length)];
      var ops = mistura([{ t: o[1], k: 'certa' }, { t: outra[1], k: 'outra', ref: outra[0] }, { t: fraca[0], k: 'fraca', ex: fraca[1] }]);
      caixa.innerHTML = '<div class="sim-fala"><span class="sim-quem">' + L('Alguém diz', 'Someone says') + '</span><p>' + esc(o[0]) + '</p></div><p class="mapa-ti">' + L('Qual é a melhor resposta?', 'What is the best reply?') + '</p><ul class="ops">' +
        ops.map(function (x, i) { return '<li><button type="button" class="op" data-i="' + i + '">' + esc(x.t) + '</button></li>'; }).join('') + '</ul><div class="sim-fb" hidden></div>';
      $$('.op', caixa).forEach(function (b) {
        b.addEventListener('click', function () {
          if (caixa.dataset.feito) return; caixa.dataset.feito = '1';
          var x = ops[+b.dataset.i], fb = $('.sim-fb', caixa);
          $$('.op', caixa).forEach(function (bb) { if (ops[+bb.dataset.i].k === 'certa') bb.classList.add('certa'); bb.disabled = true; });
          if (x.k !== 'certa') b.classList.add('errada'); else pts++;
          var msg = x.k === 'certa' ? '<p class="ok">' + L('<strong>Boa resposta.</strong> Ela vai direto ao ponto que a objeção levanta.', '<strong>Good reply.</strong> It goes straight to the point the objection raises.') + '</p>'
            : x.k === 'outra' ? '<p class="no">' + L('<strong>Boa resposta, mas para outra objeção.</strong> Ela responde a: “' + esc(x.ref) + '”. No debate, é preciso responder ao que foi dito.', '<strong>A good reply, but to a different objection.</strong> It answers: “' + esc(x.ref) + '”. In a debate, you need to respond to what was actually said.') + '</p>'
            : '<p class="no"><strong>' + L('Resposta fraca.', 'Weak reply.') + '</strong> ' + esc(x.ex) + '</p>';
          fb.innerHTML = msg + '<details class="gaveta" open><summary>' + L('Resposta completa do autor', 'The author’s full reply') + '</summary><div class="original">' + o[2] + '</div>' +
            (o[4].length ? '<p class="fino">' + L('Aprofunde: ', 'Go deeper: ') + o[4].map(function (r) { return '<a href="' + BASE + r[1] + '">' + r[0] + '</a>'; }).join(' · ') + '</p>' : '') + '</details>' +
            '<p><button type="button" class="btn">' + (rod + 1 < RODADAS ? L('Próxima objeção →', 'Next objection →') : L('Ver resultado', 'See result')) + '</button></p>';
          fb.hidden = false; $('#sim-pts', sim).textContent = pts + L(' ponto', ' point') + (pts === 1 ? '' : 's');
          $('.btn', fb).addEventListener('click', function () { delete caixa.dataset.feito; rod++; if (rod < RODADAS) { mostra(); sim.scrollIntoView({ block: 'start', behavior: 'smooth' }); } else fim(); });
        });
      });
    };
    var fim = function () {
      var nota = EN
        ? (pts >= 7 ? 'Excellent: you recognize the right reply to each objection.' : pts >= 5 ? 'Very good. Review the objections you missed in Debunking objections.' : 'Keep practicing: read the full replies and try again.')
        : (pts >= 7 ? 'Excelente: você reconhece a resposta certa para cada objeção.' : pts >= 5 ? 'Muito bom. Revise as objeções em que errou em Desbancando objeções.' : 'Continue treinando: leia as respostas completas e tente de novo.');
      caixa.innerHTML = '<p class="placar">' + pts + L(' de ', ' of ') + RODADAS + '</p><p>' + nota + '</p><p><button type="button" class="btn">' + L('Jogar de novo', 'Play again') + '</button> <a class="btn alt" href="' + BASE + 'desbancando.html">' + L('Desbancando objeções', 'Debunking objections') + '</a></p>';
      $('#sim-n', sim).textContent = L('Resultado', 'Result');
      $('.btn', caixa).addEventListener('click', inicia);
    };
    inicia();
  }

  /* =====================================================================  mapa dos argumentos */
  var mapa = $('#mapa');
  if (mapa) {
    var M = dados('dados-mapa'), svg = $('.mapa-svg', mapa), cO = $('#mapa-obj'), cC = $('#mapa-cap'), tema = 0;
    var desenhaLinhas = function () {
      var box = mapa.getBoundingClientRect(); svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
      if (getComputedStyle(svg).display === 'none') return;
      var h = '';
      $$('.m-obj', cO).forEach(function (o) {
        var a = o.getBoundingClientRect();
        JSON.parse(o.dataset.l).forEach(function (k) {
          var c = cC.children[k + 1]; if (!c) return; var b = c.getBoundingClientRect();
          var x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top, x2 = b.left - box.left, y2 = b.top + b.height / 2 - box.top, mx = (x1 + x2) / 2;
          h += '<path data-o="' + o.dataset.i + '" data-c="' + k + '" d="M' + x1 + ' ' + y1 + 'C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>';
        });
      });
      svg.innerHTML = h;
    };
    var foca = function (i) {
      mapa.classList.toggle('focado', i !== null);
      var o = i === null ? null : cO.querySelector('.m-obj[data-i="' + i + '"]'), ls_ = o ? JSON.parse(o.dataset.l) : [];
      $$('.m-obj', cO).forEach(function (x) { x.classList.toggle('ativo', x === o); });
      $$('.m-cap', cC).forEach(function (x, k) { x.classList.toggle('ativo', ls_.indexOf(k) >= 0); });
      $$('path', svg).forEach(function (p) { p.classList.toggle('ativo', o && p.dataset.o === String(i)); });
    };
    var monta = function () {
      var t = M[tema];
      cO.innerHTML = '<p class="mapa-ti">' + L('Objeções', 'Objections') + '</p>' + t[1].map(function (o, i) { return '<button type="button" class="m-obj" data-i="' + i + '" data-l="' + JSON.stringify(o[1]) + '">' + esc(o[0]) + '<span class="m-tags">' + o[1].map(function (k) { return t[2][k][1]; }).join(' · ') + '</span></button>'; }).join('');
      cC.innerHTML = '<p class="mapa-ti">' + L('Onde a coleção responde', 'Where the collection responds') + '</p>' + t[2].map(function (c) { return '<a class="m-cap" href="' + BASE + c[3] + '"><span>' + c[1] + '</span>' + esc(c[2]) + '</a>'; }).join('');
      foca(null); setTimeout(desenhaLinhas, 30);
    };
    cO.addEventListener('mouseover', function (ev) { var o = ev.target.closest('.m-obj'); if (o) foca(+o.dataset.i); });
    cO.addEventListener('focusin', function (ev) { var o = ev.target.closest('.m-obj'); if (o) foca(+o.dataset.i); });
    cO.addEventListener('click', function (ev) { var o = ev.target.closest('.m-obj'); if (o) foca(+o.dataset.i); });
    mapa.addEventListener('mouseleave', function () { foca(null); });
    $$('#mapa-temas .chip').forEach(function (b) {
      b.addEventListener('click', function () { $$('#mapa-temas .chip').forEach(function (x) { x.classList.toggle('on', x === b); }); tema = +b.dataset.m; monta(); });
    });
    window.addEventListener('resize', function () { clearTimeout(mapa._t); mapa._t = setTimeout(desenhaLinhas, 120); });
    monta();
    window.addEventListener('load', desenhaLinhas);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenhaLinhas);
  }

  /* =====================================================================  mapa dos conceitos */
  var mc = $('#mconc');
  if (mc) {
    var C = dados('dados-mc'), N = C.n, sv = $('.mc-svg', mc), def = $('#mc-def'), sel = $('#mc-sel');
    var usadoPor = N.map(function () { return []; });
    N.forEach(function (n, i) { n[3].forEach(function (j) { usadoPor[j].push(i); }); });
    var no = function (i, x, y, cls) {
      var t = N[i][0], w = Math.min(230, t.length * 7.4 + 26);
      return '<g class="mc-no ' + cls + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(t) + '"><rect x="' + (x - w / 2) + '" y="' + (y - 17) + '" width="' + w + '" height="34" rx="17"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + esc(t.length > 30 ? t.slice(0, 29) + '…' : t) + '</text></g>';
    };
    var arco = function (lista, lado) {
      var max = 11, ls_ = lista.slice(0, max), out = [], n = ls_.length;
      ls_.forEach(function (j, k) {
        var ang = n === 1 ? 0 : (-70 + 140 * k / (n - 1)) * Math.PI / 180;
        out.push([j, 450 + lado * (300 * Math.cos(ang)), 280 + 230 * Math.sin(ang)]);
      });
      return { pts: out, resto: lista.length - ls_.length };
    };
    var vai = function (i) {
      var n = N[i], esq = arco(n[3], -1), dir = arco(usadoPor[i].filter(function (j) { return n[3].indexOf(j) < 0; }), 1), h = '';
      esq.pts.forEach(function (p) { h += '<path class="mc-l usa" d="M450 280L' + p[1] + ' ' + p[2] + '"/>'; });
      dir.pts.forEach(function (p) { h += '<path class="mc-l usado" d="M450 280L' + p[1] + ' ' + p[2] + '"/>'; });
      esq.pts.forEach(function (p) { h += no(p[0], p[1], p[2], 'usa'); });
      dir.pts.forEach(function (p) { h += no(p[0], p[1], p[2], 'usado'); });
      if (!esq.pts.length) h += '<text class="mc-vazio" x="170" y="285" text-anchor="middle">' + L('Definição sem outros termos do glossário', 'Definition uses no other glossary terms') + '</text>';
      if (!dir.pts.length) h += '<text class="mc-vazio" x="730" y="285" text-anchor="middle">' + L('Nenhum outro conceito depende deste', 'No other concept depends on this one') + '</text>';
      if (esq.resto) h += '<text class="mc-vazio" x="150" y="540" text-anchor="middle">' + L('e mais ', 'and ') + esq.resto + L('', ' more') + '</text>';
      if (dir.resto) h += '<text class="mc-vazio" x="750" y="540" text-anchor="middle">' + L('e mais ', 'and ') + dir.resto + L('', ' more') + '</text>';
      h += no(i, 450, 280, 'centro');
      sv.innerHTML = h; sel.value = String(i);
      def.innerHTML = '<p class="kicker">' + esc(C.g[n[2]] || '') + '</p><h2>' + esc(n[0]) + '</h2><p>' + esc(n[1]) + '</p><p class="fino"><a href="' + BASE + 'glossario.html#' + n[4] + '">' + L('No glossário', 'In the glossary') + '</a>' + (n[5] ? ' · <a href="' + BASE + n[5] + '">' + n[6] + ' →</a>' : '') + '</p>';
    };
    sv.addEventListener('click', function (ev) { var g = ev.target.closest('.mc-no'); if (g) vai(+g.dataset.i); });
    sv.addEventListener('keydown', function (ev) { var g = ev.target.closest('.mc-no'); if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); vai(+g.dataset.i); } });
    sel.addEventListener('change', function () { vai(+sel.value); });
    var ini = +(location.hash.slice(1) ? (N.findIndex ? N.findIndex(function (n) { return n[4] === location.hash.slice(1); }) : -1) : -1);
    vai(ini >= 0 ? ini : +mc.dataset.ini);
  }

  /* =====================================================================  linha do tempo */
  var lt = $('#lt-filtro');
  if (lt) {
    lt.addEventListener('click', function (ev) {
      var b = ev.target.closest('.chip'); if (!b) return;
      $$('.chip', lt).forEach(function (x) { x.classList.toggle('on', x === b); });
      var g = b.dataset.lt;
      $$('.lt-i').forEach(function (i) { i.hidden = g !== '*' && i.dataset.g !== g; });
      $$('.lt-faixa').forEach(function (f) { f.hidden = !$$('.lt-i', f).some(function (i) { return !i.hidden; }); });
    });
  }

  /* =====================================================================  comparador de teorias */
  var tc = $('#t-comp');
  if (tc) {
    var T = dados('dados-teorias'), asp = 'ideia';
    var desenhaT = function () {
      var marc = $$('#t-sel input:checked').map(function (x) { return T.t[+x.value]; });
      var as = asp === '*' ? T.a : T.a.filter(function (a) { return a[0] === asp; });
      if (!marc.length) { tc.innerHTML = '<p class="fino">' + L('Escolha pelo menos uma teoria.', 'Choose at least one theory.') + '</p>'; return; }
      tc.style.setProperty('--n', marc.length);
      tc.innerHTML = marc.map(function (t) {
        return '<article class="tcol"><header><span class="ttipo">' + esc(t.tipo) + '</span><h3>' + esc(t.t) + '</h3></header>' +
          as.map(function (a) { return '<div class="tcel"><p class="tasp">' + esc(a[1]) + '</p><p>' + esc(t[a[0]]) + '</p></div>'; }).join('') +
          '<a class="tlink" href="' + BASE + t.url + '">' + L('Ler no texto original →', 'Read in the original text →') + '</a></article>';
      }).join('');
    };
    $('#t-sel').addEventListener('change', function (ev) {
      if ($$('#t-sel input:checked').length > 4) { ev.target.checked = false; }
      desenhaT();
    });
    $$('#t-asp .chip').forEach(function (b) { b.addEventListener('click', function () { $$('#t-asp .chip').forEach(function (x) { x.classList.toggle('on', x === b); }); asp = b.dataset.a; desenhaT(); }); });
    desenhaT();
  }

  /* =====================================================================  minha jornada */
  var jr = $('#jor-resumo');
  if (jr) {
    var J = dados('dados-jor'), lidos = ls.get('jea-lidos', {}), dest = ls.get('jea-dest', {});
    var total = Object.keys(J.c).length, nl = Object.keys(lidos).filter(function (k) { return lidos[k] && J.c[k]; }).length;
    var nd = 0, nn = 0; Object.keys(dest).forEach(function (k) { dest[k].forEach(function (h) { nd++; if (h.n) nn++; }); });
    var pc = Math.round(100 * nl / total);
    jr.innerHTML = '<div class="jor-n"><strong>' + nl + '</strong><span>' + L('de ' + total + ' textos lidos', 'of ' + total + ' texts read') + '</span></div><div class="jor-n"><strong>' + pc + '%</strong><span>' + L('da coleção', 'of the collection') + '</span></div><div class="jor-n"><strong>' + nd + '</strong><span>' + L('destaques', 'highlights') + '</span></div><div class="jor-n"><strong>' + nn + '</strong><span>' + L('anotações', 'notes') + '</span></div>';
    $('#jor-vols').innerHTML = J.v.map(function (v) {
      var n = Object.keys(lidos).filter(function (k) { return lidos[k] && k.split('-')[0] === String(v[0]); }).length;
      return '<a class="jor-vol" href="' + BASE + v[3] + '/"><span class="nv">' + v[1] + '</span><span class="jt">' + esc(v[2]) + '</span><span class="jb"><i style="width:' + (100 * n / v[4]) + '%"></i></span><span class="jc">' + n + '/' + v[4] + '</span></a>';
    }).join('');
    var lista = function () {
      dest = ls.get('jea-dest', {});
      var ks = Object.keys(dest).filter(function (k) { return J.c[k] && dest[k].length; }).sort(function (a, b) { var x = a.split('-'), y = b.split('-'); return (x[0] - y[0]) || (x[1] - y[1]); });
      $('#jor-dest').innerHTML = ks.length ? ks.map(function (k) {
        var c = J.c[k];
        return '<section class="jor-cap"><h3><a href="' + BASE + c[1] + '">' + esc(c[0]) + '</a> <span class="fino">Vol. ' + c[2] + (c[3] ? L(', cap. ', ', ch. ') + c[3] : '') + '</span></h3>' +
          dest[k].map(function (h) { return '<div class="jor-d"><blockquote>' + esc(h.t) + '</blockquote>' + (h.n ? '<p class="dest-nota">' + esc(h.n) + '</p>' : '') + '<p class="fino">' + esc(h.d || '') + ' · <button type="button" class="link-btn" data-k="' + k + '" data-id="' + h.id + '">' + L('remover', 'remove') + '</button></p></div>'; }).join('') + '</section>';
      }).join('') : '<p class="vazio">' + L('Você ainda não tem destaques. Abra um texto, selecione um trecho e escolha <strong>Destacar</strong>.', 'You have no highlights yet. Open a text, select a passage and choose <strong>Highlight</strong>.') + '</p>';
    };
    lista();
    $('#jor-dest').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-id]'); if (!b) return;
      dest[b.dataset.k] = dest[b.dataset.k].filter(function (h) { return h.id !== b.dataset.id; }); if (!dest[b.dataset.k].length) delete dest[b.dataset.k];
      ls.set('jea-dest', dest); lista();
    });
    $('#jor-exp').addEventListener('click', function () {
      var md = L('# Meus destaques · Questão de Ética\n\nTextos de Luciano Carlos Cunha, coleção Uma Jornada pela Ética Animal.\n\n', '# My highlights · Questão de Ética\n\nTexts by Luciano Carlos Cunha, from the collection A Journey Through Animal Ethics.\n\n');
      Object.keys(dest).forEach(function (k) {
        var c = J.c[k]; if (!c) return;
        md += '## ' + c[0] + ' (Vol. ' + c[2] + (c[3] ? L(', cap. ', ', ch. ') + c[3] : '') + ')\n' + location.origin + location.pathname.replace(/minha-jornada\.html$/, '') + c[1] + '\n\n';
        dest[k].forEach(function (h) { md += '> ' + h.t + '\n\n' + (h.n ? L('Nota: ', 'Note: ') + h.n + '\n\n' : ''); });
      });
      baixar(L('meus-destaques-questao-de-etica.md', 'my-highlights-questao-de-etica.md'), md, 'text/markdown;charset=utf-8');
    });
    $('#jor-limpa').addEventListener('click', function () { if (window.confirm(L('Apagar todos os destaques e anotações deste navegador?', 'Delete all highlights and notes stored in this browser?'))) { ls.set('jea-dest', {}); lista(); } });
  }
})();
