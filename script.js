(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* スクロールで表示（JSが動くときだけ初期状態を隠す） */
  if ('IntersectionObserver' in window && !reduce) {
    root.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    /* 保険：3秒経っても表示されていない要素は表示する */
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); io.unobserve(el); });
    }, 3000);
  }

  /* 数字のカウントアップ */
  function format(n, dec) {
    return n.toLocaleString('ja-JP', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (isNaN(target) || reduce) { el.textContent = format(target, dec); return; }
    var start = null, dur = 1100;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased, dec);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = format(target, dec);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* 成果バー（50%を上限） */
  var bars = document.getElementById('bars');
  if (bars) {
    function fill() {
      bars.querySelectorAll('i[data-w]').forEach(function (i) {
        i.style.width = Math.min(100, parseFloat(i.getAttribute('data-w')) / 50 * 100) + '%';
      });
    }
    if ('IntersectionObserver' in window && !reduce) {
      var bio = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { fill(); bio.disconnect(); }
      }, { threshold: 0.3 });
      bio.observe(bars);
    } else { fill(); }
  }

  /* Instagram IDのコピー */
  var btn = document.getElementById('copyHandle');
  var handle = document.getElementById('handle');
  if (btn && handle) {
    btn.addEventListener('click', function () {
      var text = handle.textContent.trim();
      var done = function () { btn.textContent = 'コピーしました'; setTimeout(function () { btn.textContent = 'コピー'; }, 1800); };
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents(handle);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = '選択しました';
        setTimeout(function () { btn.textContent = 'コピー'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else { fallback(); }
    });
  }
})();
