# SBG NAV Official / Live v2

SoftBank Group（SBG）のNAV（Net Asset Value）を、公式発表ベースと現状反映ベースの2段で比較する静的Webアプリです。

- 画面上部: 公式NAV（公式NAV/株、公式NAV総額、公式前提のLTV・株価乖離）
- 画面下部: 現状反映NAV（主要上場持分の現在株価・為替を反映したNAV）

## 起動方法

サーバー不要の静的アプリです。iPhoneから確認する場合は、このフォルダで簡易サーバーを起動してください。

```bash
cd ideas/sbg-nav-calculator
python3 -m http.server 5173
```

同じWi-FiのiPhoneで `http://<PCのIPアドレス>:5173/` を開きます。

## 確認方法

1. 画面上部の「Official NAV」で公式発表ベースのNAVを確認します。
2. 画面下部の「Live-adjusted NAV」で現状反映NAVを確認します。
3. 「最新価格を取得」を押すと、StooqのCSV APIから株価・為替を取得します。
4. 取得できない銘柄や前提条件は手入力で調整できます。

## 初期値について

- 初期値はSoftBank Group公式IRの「2026年3月31日時点 NAV per Share 7,029円」をベースラインにしています。
- 主要上場持分（Arm、SoftBank Corp.、T-Mobile、Deutsche Telekom、Alibaba）は株価変動で時価更新します。
- Vision Fund等の非上場・その他資産と純有利子負債は、初期値ではベースライン固定の手入力項目です。
- 投資判断用ではなく、公式値と現状反映値の差を確認するためのプロトタイプです。

## 次に足すとよい機能

- 公式IR資料から株数・純有利子負債を自動更新する機能
- 非上場資産の四半期更新履歴
- 公式NAVと現状反映NAVの差分チャート
