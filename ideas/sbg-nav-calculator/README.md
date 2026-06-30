# SBG NAV Calculator

SoftBank Group（SBG）のNAV（Net Asset Value）を、主要上場持分の株価変動と為替を使って概算するWebアプリです。

## 起動方法

サーバー不要の静的アプリです。iPhoneから確認する場合は、このフォルダで簡易サーバーを起動してください。

```bash
cd ideas/sbg-nav-calculator
python3 -m http.server 5173
```

同じWi-FiのiPhoneで `http://<PCのIPアドレス>:5173/` を開きます。

## 確認方法

1. 「最新価格を取得」を押すと、StooqのCSV APIから株価・為替を取得します。
2. 取得できない銘柄は手入力できます。
3. ベースライン、株数、純有利子負債、発行済株式数を編集して「NAVを再計算」を押します。

## 初期値について

- 初期値はSoftBank Group公式IRの「2026年3月31日時点 NAV per Share 7,029円」をベースラインにしています。
- 主要上場持分（Arm、SoftBank Corp.、T-Mobile、Deutsche Telekom、Alibaba）は株価変動で時価更新します。
- Vision Fund等の非上場・その他資産と純有利子負債は、初期値ではベースライン固定の手入力項目です。
- 投資判断用ではなく、試算用のプロトタイプです。

## 次に足すとよい機能

- 公式IR資料から株数・純有利子負債を自動更新する機能
- 非上場資産の四半期更新履歴
- シナリオ保存と感応度チャート
