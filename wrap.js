/* 日本語の改行位置：文節の途中で折り返さない（BudouX）。読み込めない環境では何もしない */
(function () {
  try {
    if (!window.budoux || !budoux.loadDefaultJapaneseParser) return;
    var parser = budoux.loadDefaultJapaneseParser();
    var targets = document.querySelectorAll('main h1, main h2, main h3, main p, main li, main td, main th, main figcaption, main label, main legend, .conclusion, .fb-text, .closing h2, .closing p, .cta-lead, .cta-sub, .cta-title');
    targets.forEach(function (el) {
      if (el.closest('.f-field input, textarea, .num')) return;
      parser.applyToElement(el);
    });
  } catch (e) {}
})();
