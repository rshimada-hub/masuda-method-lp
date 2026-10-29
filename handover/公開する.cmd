@echo off
chcp 65001 >nul
echo ============================================================
echo  増田メソッド 個人コンサルティング ページを Cloudflare に公開します
echo  ブラウザが開いたら Cloudflare にログインして「Allow」を押してください
echo ============================================================
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js が見つかりません。https://nodejs.org から LTS をインストールしてから、もう一度このファイルをダブルクリックしてください。& pause & exit /b 1)
call npx wrangler@latest login
call npx wrangler@latest pages deploy . --project-name masuda-method --branch main
echo.
echo 上に表示された https://....pages.dev が公開URLです。
pause
