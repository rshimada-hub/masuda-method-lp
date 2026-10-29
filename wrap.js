/* 日本語の改行位置：文節の途中で折り返さない（Google BudouX）。読み込めない環境では何もしない */
(async function () {
  try {
    var mod = await import('https://cdn.jsdelivr.net/npm/budoux@0.6.2/+esm');
    var parser = mod.loadDefaultJapaneseParser();
    var sel = 'main h1, main h2, main h3, main p, main li, main td, main th, main figcaption, main label, main legend, .conclusion, .fb-text, .closing h2, .closing p';
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.querySelector('input, textarea, select')) return;
      parser.applyToElement(el);
    });
  } catch (e) {}
})();
