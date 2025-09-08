# LyricGenius

個人向けの歌詞生成ツール「LyricGenius」のモノレポです。フロントエンド(React + Vite) と バックエンド(Hono on Cloudflare Workers)、共有型定義、CI 設定を含みます。

## ワークスペース

- `apps/frontend`: フロントエンド (React + Vite + Tailwind)
- `apps/api`: バックエンド (Hono + Cloudflare Workers)
- `packages/shared-types`: 共有の TypeScript 型

## セットアップ

1. Node.js は `.nodenv` に記載のバージョン (>=20.14) を使用
2. npm を利用
3. ルートで依存関係をインストール: `npm ci`（初回/CI） or `npm install`

## スクリプト

- 開発 (フロントエンド): `npm run dev`
- 開発 (API): `npm run dev:api`
- 開発 (両方同時): `npm run dev:all`
- ビルド (全体): `npm run build --workspaces --if-present`
- 型チェック (全体): `npm run typecheck --workspaces --if-present`
- Lint (全体): `npm run lint --workspaces --if-present`

## 環境変数

`.env.example` を参考に各パッケージに必要な値を設定してください。

- API(Workers) ローカル開発では `apps/api/.dev.vars` を使用できます（例を `apps/api/.dev.vars.example` に追加済み）。
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY`（歌詞生成を試す場合）
  - `.dev.vars` は Git 管理外にしてください。

## ライセンス

Private
