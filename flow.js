/* 地続きの構成：パート番号・現在パート表示・進行バー・パート単位の切り替え */
(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section.section'));
  if (!sections.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* パート番号を eyebrow の前に差し込む */
  var total = sections.length;
  sections.forEach(function (s, i) {
    var eb = s.querySelector('.sec-head .eyebrow');
    if (!eb) return;
    var n = document.createElement('i');
    n.className = 'partno';
    n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    eb.parentNode.insertBefore(n, eb);
    s.setAttribute('data-part', String(i + 1));
  });

  /* ヘッダーの現在パート表示と進行バー */
  var header = document.querySelector('.site-header');
  var nowEl = null, progEl = null;
  if (header) {
    var wrap = header.querySelector('.wrap');
    nowEl = document.createElement('div');
    nowEl.className = 'now';
    nowEl.innerHTML = '<b></b><span></span>';
    nowEl.hidden = true;
    var nav = header.querySelector('.nav');
    if (nav) wrap.insertBefore(nowEl, nav); else wrap.appendChild(nowEl);
    header.style.position = 'sticky';
    progEl = document.createElement('div');
    progEl.className = 'progress';
    progEl.innerHTML = '<i></i>';
    header.appendChild(progEl);
  }

  var current = -1;
  function setCurrent(i) {
    if (i === current) return;
    current = i;
    sections.forEach(function (s, k) {
      s.classList.toggle('is-past', k < i);
      s.classList.toggle('is-current', k === i);
      s.classList.toggle('is-ahead', k > i);
    });
    if (nowEl) {
      var h2 = sections[i].querySelector('.sec-head h2');
      nowEl.querySelector('b').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      nowEl.querySelector('span').textContent = h2 ? h2.textContent : '';
      nowEl.hidden = false;
    }
  }

  /* 画面の上から40%の位置を「読んでいる位置」として、そこに掛かるパートを現在にする */
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.innerHeight * 0.4;
    var idx = -1;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { idx = i; break; }
    }
    if (idx === -1) {
      /* パートの外（ヒーローやクロージング）にいるとき */
      var first = sections[0].getBoundingClientRect();
      if (first.top > y) { sections.forEach(function (s) { s.classList.remove('is-past', 'is-current', 'is-ahead'); }); current = -1; if (nowEl) nowEl.hidden = true; }
      else { idx = sections.length - 1; }
    }
    if (idx !== -1) setCurrent(idx);
    if (progEl) {
      var doc = document.documentElement;
      var p = doc.scrollHeight > doc.clientHeight ? window.scrollY / (doc.scrollHeight - doc.clientHeight) : 0;
      progEl.firstChild.style.width = Math.min(100, Math.max(0, p * 100)) + '%';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  if (!reduce) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  } else {
    update();
  }
})();

/* フローティングバナー：ヒーローを過ぎたら表示、申込フォームが見えている間は隠す */
(function () {
  var fb = document.getElementById('floatBanner'); if (!fb) return;
  var hero = document.querySelector('.hero'); var start = document.getElementById('start');
  function tick() {
    var pastHero = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 400;
    var r = start ? start.getBoundingClientRect() : null;
    var onForm = r ? (r.top < window.innerHeight * 0.6 && r.bottom > 0) : false;
    fb.hidden = !(pastHero && !onForm);
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(tick); }, { passive: true });
  window.addEventListener('resize', tick);
  tick();
})();
