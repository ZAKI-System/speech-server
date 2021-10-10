@echo off
REM このファイルをUTF-8として設定しました

chcp 65001
echo 送信テストします
curl -X POST -H "Content-Type: application/json" -d @jsondata.txt http://localhost/post
echo.

echo 何かキーを押すと終了します
pause >NUL