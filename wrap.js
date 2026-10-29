/* 日本語の改行ルール（全文に適用）
   1. 文が複数あり、全体が短い文章（カードの説明・リストの補足など）は、文（。）ごとにまとまりを作り、
      行が足りないときは「。」の後で改行する（「、」の後では改行しない）
   2. それ以外の長い文章は、文節の途中で折り返さない（Google BudouX）
   読み込めない環境では何もしない */
(async function () {
  try {
    var mod = await import('https://cdn.jsdelivr.net/npm/budoux@0.6.2/+esm');
    var parser = mod.loadDefaultJapaneseParser();
    var sel = 'main h1, main h2, main h3, main p, main li, main td, main th, main figcaption, main label, main legend, .conclusion, .fb-text, .closing h2, .closing p';
    var SHORT = 90; /* この文字数以下なら文単位でまとめる */

    function groupSentences(el) {
      /* 子要素を持たない要素だけ対象。文ごとに inline-block の span に包む */
      if (el.children.length) return false;
      var text = el.textContent;
      var parts = text.match(/[^。]*。|[^。]+$/g);
      if (!parts || parts.length < 2) return false;
      el.textContent = '';
      parts.forEach(function (s) {
        if (!s) return;
        var sp = document.createElement('span');
        sp.className = 'sent';
        sp.textContent = s;
        el.appendChild(sp);
      });
      return true;
    }

    function process(el) {
      if (el.children.length === 0) {
        var len = el.textContent.replace(/\s/g, '').length;
        if (len <= SHORT) groupSentences(el);
        return;
      }
      /* 太字ラベル＋本文のように、要素と文字が混ざる場合は、文字部分を span に包んで文単位にする */
      Array.prototype.slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && /。/.test(n.textContent) && n.textContent.replace(/\s/g, '').length <= SHORT) {
          var sp = document.createElement('span'); sp.textContent = n.textContent; el.replaceChild(sp, n); groupSentences(sp);
        }
      });
      Array.prototype.forEach.call(el.children, function (c) {
        if (c.tagName === 'INPUT' || c.tagName === 'TEXTAREA' || c.tagName === 'SELECT' || c.tagName === 'SVG' || c.tagName === 'svg' || c.tagName === 'IMG') return;
        process(c);
      });
    }
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.querySelector('input, textarea, select')) return;
      process(el);
      parser.applyToElement(el);
    });
  } catch (e) {}
})();
