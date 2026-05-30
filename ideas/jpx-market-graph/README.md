# JPX 市場別 時価総額・売買高・売買代金グラフ

JPXの公開Excelをブラウザから自動取得し、「市場別時価総額」と「売買高・売買代金」を1枚のグラフで比較する静的Webアプリです。

- 自動取得: JPXページから最新Excelリンクを探し、Excelを読み込んで描画
- 棒グラフ: 時価総額（兆円）と売買代金（兆円）
- 折れ線グラフ: 売買高（億株）
- 下部カード: 合計時価総額、合計売買代金、合計売買高、時価総額比
- 予備機能: 自動取得に失敗した場合、保存済みExcelを手動アップロードして描画

## 起動方法

このリポジトリのルート（`Idea-Sandbox`）で次を実行します。

```bash
python3 -m http.server 8000
```

ブラウザで以下を開きます。

- `http://localhost:8000/ideas/jpx-market-graph/`

GitHub Pagesでは以下のURLで確認できます。

- `https://git333-20260310.github.io/Idea-Sandbox/ideas/jpx-market-graph/`

## 確認方法

1. ページを開く。
2. 「JPXページから最新Excelリンクを探しています...」の後、自動取得が成功するとグラフと表が更新されることを確認する。
3. 失敗した場合は、JPXから以下のExcelを保存して「Excelを手動で読み込む」へ指定する。
   - 市場別時価総額
   - 売買高・売買代金の「Stocks and Bonds」
4. iPhoneでは表とグラフを横スクロールして確認する。

## JPXデータの参照先

- 市場別時価総額: <https://www.jpx.co.jp/markets/statistics-equities/misc/02.html>
- 売買高・売買代金: <https://www.jpx.co.jp/markets/statistics-equities/misc/>

## 注意点

- GitHub Pagesだけで動かすため、データ取得・Excel解析はすべてブラウザ内で行います。
- JPX側がCORSを許可しない場合に備えて、公開CORSプロキシを順番に試します。
- JPXのExcelレイアウトが変わると、抽出に失敗する場合があります。その場合も手動Excel読込で同じ解析を試せます。
- 初期表示や取得失敗時のサンプル値は動作確認用で、JPXの公式値ではありません。

## 次に足すとよい機能

- JPXのExcelレイアウト変更に強い専用パーサー
- 月次推移を保存して、時系列グラフにする機能
- 取得した元ファイル名・抽出行を画面上で詳しく確認する機能
