/* 日本語の改行ルール（ページ内の文字を持つ要素すべてに適用）
   1. 短い文章（90字以下）で文が複数あるものは、文（。）ごとにまとまりを作り、
      行に収まらないときは「。」の後で改行する（「、」の後では改行しない）
   2. すべての文章で、熟語・単語・文節の途中では折り返さない（Google BudouX）
   読み込めない環境では何もしない */
(async function () {
  try {
    var mod = await import('https://cdn.jsdelivr.net/npm/budoux@0.6.2/+esm');
    var parser = mod.loadDefaultJapaneseParser();
    var SHORT = 90;
    var SKIP = { SCRIPT: 1, STYLE: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1, SVG: 1, svg: 1, IMG: 1, NOSCRIPT: 1 };

    function groupSentences(el) {
      var text = el.textContent;
      var parts = text.match(/[^。]*。|[^。]+$/g);
      if (!parts || parts.filter(function (s) { return s.trim(); }).length < 2) return;
      el.textContent = '';
      parts.forEach(function (s) {
        if (!s) return;
        var sp = document.createElement('span'); sp.className = 'sent'; sp.textContent = s; el.appendChild(sp);
      });
    }
    function walk(el) {
      if (SKIP[el.tagName]) return;
      if (el.children.length === 0) {
        if (el.textContent.replace(/\s/g, '').length <= SHORT) groupSentences(el);
        return;
      }
      /* 要素と文字が混ざる箱：文字部分だけ span に包んで文単位にする */
      Array.prototype.slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && /。/.test(n.textContent) && n.textContent.replace(/\s/g, '').length <= SHORT) {
          var sp = document.createElement('span'); sp.textContent = n.textContent; el.replaceChild(sp, n); groupSentences(sp);
        }
      });
      Array.prototype.forEach.call(el.children, walk);
    }
    walk(document.body);
    parser.applyToElement(document.body);
  } catch (e) {}
})();
