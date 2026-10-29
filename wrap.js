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

    /* 短い文章：文（。）→ 節（、）の順にまとまりを作る。行に収まらないときは「。」、次に「、」の後で改行する */
    function clauseSpans(sentence) {
      var frag = document.createDocumentFragment();
      var cls = sentence.match(/[^、]*、|[^、]+$/g) || [sentence];
      if (cls.length < 2) { frag.appendChild(document.createTextNode(sentence)); return frag; }
      cls.forEach(function (c) { if (!c) return; var sp = document.createElement('span'); sp.className = 'cl'; sp.textContent = c; frag.appendChild(sp); });
      return frag;
    }
    function groupSentences(el) {
      var text = el.textContent;
      var parts = (text.match(/[^。]*。|[^。]+$/g) || [text]).filter(function (s) { return s.length; });
      el.textContent = '';
      if (parts.length < 2) { el.appendChild(clauseSpans(text)); return; }
      parts.forEach(function (s) {
        var sp = document.createElement('span'); sp.className = 'sent'; sp.appendChild(clauseSpans(s)); el.appendChild(sp);
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
        if (n.nodeType === 3 && /[。、]/.test(n.textContent) && n.textContent.replace(/\s/g, '').length <= SHORT) {
          var sp = document.createElement('span'); sp.textContent = n.textContent; el.replaceChild(sp, n); groupSentences(sp);
        }
      });
      Array.prototype.forEach.call(el.children, walk);
    }
    walk(document.body);
    parser.applyToElement(document.body);
  } catch (e) {}
})();
