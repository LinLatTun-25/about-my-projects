Focus Trail
JavaScript科目認定試験 提出作品

概要:
学習タスクをJSONから読み込み、検索、絞り込み、削除、進捗管理、集中タイマー、表示変更、メモ保存ができるWebアプリです。

ファイル:
- index.html
- css/style.css
- js/app.js
- data/study-data.json
- assets/study-visual.png

採点項目への対応:
- HTMLファイル、CSSファイル、JavaScriptファイル、JSONファイルを分けています。
- js/app.jsでfetch()を使い、data/study-data.jsonをAJAXで読み込んでいます。
- JSON読み込みとlocalStorage処理にtry...catchを使っています。
- 配列はfilter、map、reduce、sort、forEachなどで処理しています。
- JSONから読み込んだタスクも画面上で削除できます。削除状態はlocalStorageに保存されます。
- 「今日の目標」「目標表示」「一言」は画面上で変更できます。変更内容はlocalStorageに保存されます。
- インデント、コメント量、変数名、関数名は読みやすさを意識しています。

起動:
index.htmlをブラウザで開くと動作します。
AJAX読み込みを確認する場合は、VS CodeのLive Serverなどのローカルサーバーから開いてください。
