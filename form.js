/* ---------- 申込フォーム ---------- */
(function () {
  /* 送信先。自社サイトに設置するときは、ここにフォーム受信用のURL（Google Apps Script など）を入れる。
     空のときは Artifact の保存機能（db）に記録し、それも使えない環境ではコピー用の文面を表示する。 */
  var FORM_ENDPOINT = '';

  var form = document.getElementById('applyForm');
  if (!form) return;
  var done = document.getElementById('applyDone');
  var fallback = document.getElementById('applyFallback');
  var status = document.getElementById('f-status');
  var submitBtn = document.getElementById('f-submit');
  var refWrap = document.getElementById('f-referrer-wrap');
  var refInput = document.getElementById('f-referrer');

  function val(id) { return (document.getElementById(id).value || '').trim(); }
  function source() { var r = form.querySelector('input[name="source"]:checked'); return r ? r.value : ''; }
  function setErr(key, msg) {
    var el = document.getElementById('err-' + key); if (el) el.textContent = msg || '';
    var field = el && el.closest('.f-field'); if (field) field.classList.toggle('invalid', !!msg);
  }

  /* 紹介を選んだときだけ紹介者名を必須にする */
  form.querySelectorAll('input[name="source"]').forEach(function (r) {
    r.addEventListener('change', function () {
      var isRef = source() === '紹介';
      refWrap.hidden = !isRef;
      refInput.required = isRef;
      if (!isRef) { refInput.value = ''; setErr('referrer', ''); }
      setErr('source', '');
      if (isRef) refInput.focus();
    });
  });
  ['name', 'tel', 'email', 'referrer'].forEach(function (k) {
    var el = document.getElementById('f-' + k);
    if (el) el.addEventListener('input', function () { setErr(k, ''); });
  });

  function validate() {
    var ok = true;
    var name = val('f-name'), tel = val('f-tel'), email = val('f-email'), src = source(), ref = val('f-referrer');
    if (!name) { setErr('name', 'お名前を入力してください。'); ok = false; }
    if (!tel) { setErr('tel', '電話番号を入力してください。'); ok = false; }
    else if (!/^[0-9０-９+()\-\s]{10,}$/.test(tel)) { setErr('tel', '電話番号の形式を確認してください（例：090-1234-5678）。'); ok = false; }
    if (!email) { setErr('email', 'メールアドレスを入力してください。'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'メールアドレスの形式を確認してください。'); ok = false; }
    if (!src) { setErr('source', '知ったきっかけを選んでください。'); ok = false; }
    if (src === '紹介' && !ref) { setErr('referrer', '紹介者のお名前を入力してください。'); ok = false; }
    return ok;
  }

  function payload() {
    var src = source();
    return {
      name: val('f-name'), tel: val('f-tel'), email: val('f-email'),
      source: src, referrer: src === '紹介' ? val('f-referrer') : '',
      submittedAt: new Date().toISOString(), page: 'masuda-method-lp'
    };
  }
  function summaryText(p) {
    return ['【増田メソッド 個人コンサルティング 申込】',
      'お名前：' + p.name, '電話番号：' + p.tel, 'メールアドレス：' + p.email,
      '知ったきっかけ：' + p.source + (p.referrer ? '（紹介者：' + p.referrer + '）' : '')].join('\n');
  }

  async function sendEndpoint(p) {
    var res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p) });
    if (!res.ok) throw new Error('endpoint ' + res.status);
  }
  async function sendDb(p) {
    if (!window.claude || typeof window.claude.use !== 'function') throw new Error('no claude');
    var db = await window.claude.use('db');
    if (!db) throw new Error('db unavailable');
    await db.collection('applications').add(p);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validate()) {
      var first = form.querySelector('.f-field.invalid');
      if (first) { var inp = first.querySelector('input'); if (inp) inp.focus(); }
      return;
    }
    var p = payload();
    submitBtn.disabled = true; status.textContent = '送信しています…';
    var sent = false;
    try {
      if (FORM_ENDPOINT) { await sendEndpoint(p); sent = true; }
      else { await sendDb(p); sent = true; }
    } catch (err) { sent = false; }
    submitBtn.disabled = false; status.textContent = '';
    if (sent) {
      form.hidden = true; done.hidden = false;
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      document.getElementById('f-copytext').value = summaryText(p);
      fallback.hidden = false;
      fallback.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  var copyBtn = document.getElementById('f-copy');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var ta = document.getElementById('f-copytext');
    var ok = function () { copyBtn.textContent = 'コピーしました'; setTimeout(function () { copyBtn.textContent = '内容をコピー'; }, 1800); };
    var fb = function () { ta.focus(); ta.select(); copyBtn.textContent = '選択しました'; setTimeout(function () { copyBtn.textContent = '内容をコピー'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(ok).catch(fb); else fb();
  });
})();
