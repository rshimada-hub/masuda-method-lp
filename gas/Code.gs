/**
 * 増田メソッド 個人コンサルティング 申込フォーム 受信用 Apps Script
 *
 * 役割：
 *   1. ページの申込フォームから送られた内容を、このスプレッドシートの「申込」シートに1行追加する
 *   2. 反響通知メールを NOTIFY_TO の宛先に送る
 *
 * 設置先：スプレッドシート「増田メソッド 個人コンサルティング 申込一覧」
 *        拡張機能 → Apps Script に、このファイルの内容をそのまま貼る
 * デプロイ：デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *        実行ユーザー「自分」／アクセスできるユーザー「全員」 → デプロイ
 *        表示された「ウェブアプリのURL」を form.js の FORM_ENDPOINT に貼る
 */

var SHEET_NAME = '申込';
var NOTIFY_TO = ['m.masuda@pure-growth.net', 'r.shimada@pure-growth.net'];
var MAIL_SUBJECT_PREFIX = '【増田メソッド 申込】';

function doPost(e) {
  var out = { ok: false };
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var p = JSON.parse(raw);

    var name = clean_(p.name), tel = clean_(p.tel), email = clean_(p.email);
    var source = clean_(p.source), referrer = clean_(p.referrer), page = clean_(p.page);
    if (!name || !tel || !email || !source) throw new Error('必須項目が足りません');
    if (source === '紹介' && !referrer) throw new Error('紹介者名が足りません');

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['受付日時', 'お名前', '電話番号', 'メールアドレス', '知ったきっかけ', '紹介者名', '送信元ページ', '対応状況', 'メモ']);
    }
    var now = new Date();
    sheet.appendRow([now, name, "'" + tel, email, source, referrer, page, '未対応', '']);

    sendNotify_({ now: now, name: name, tel: tel, email: email, source: source, referrer: referrer, sheetUrl: ss.getUrl() });
    out.ok = true;
  } catch (err) {
    out.error = String(err && err.message ? err.message : err);
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/* ブラウザでURLを開いたときの動作確認用 */
function doGet() {
  return ContentService.createTextOutput('masuda-method-form: ok').setMimeType(ContentService.MimeType.TEXT);
}

function sendNotify_(d) {
  var when = Utilities.formatDate(d.now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  var subject = MAIL_SUBJECT_PREFIX + d.name + ' 様（' + d.source + (d.referrer ? '・紹介者 ' + d.referrer : '') + '）';
  var body = [
    '増田メソッド 個人コンサルティングに、新しいお申し込みがありました。',
    '',
    '受付日時：' + when,
    'お名前：' + d.name,
    '電話番号：' + d.tel,
    'メールアドレス：' + d.email,
    '知ったきっかけ：' + d.source + (d.referrer ? '（紹介者：' + d.referrer + '）' : ''),
    '',
    '申込一覧シート：' + d.sheetUrl,
    '',
    'このメールは申込フォームから自動送信されています。'
  ].join('\n');
  MailApp.sendEmail({ to: NOTIFY_TO.join(','), subject: subject, body: body, name: '増田メソッド 申込フォーム' });
}

function clean_(v) {
  return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, 500);
}

/* 動作テスト：Apps Script の画面でこの関数を選んで「実行」すると、テスト行が1行入り、通知メールが届く */
function testPost() {
  var e = { postData: { contents: JSON.stringify({ name: 'テスト 太郎', tel: '090-0000-0000', email: 'test@example.com', source: '紹介', referrer: '山田 太郎', page: 'test' }) } };
  Logger.log(doPost(e).getContent());
}
