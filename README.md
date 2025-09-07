# LyricGenius

個人向けの歌詞生成ツール「LyricGenius」のモノレポです。フロントエンド(React + Vite) と バックエンド(Hono on Cloudflare Workers)、共有型定義、CI 設定を含みます。

## ワークスペース

- `apps/frontend`: フロントエンド (React + Vite + Tailwind)
- `apps/api`: バックエンド (Hono + Cloudflare Workers)
- `packages/shared-types`: 共有の TypeScript 型

## セットアップ

1. Node.js は `.nodenv` に記載のバージョン (>=20.14) を使用
2. pnpm を利用 (Corepack で有効化することを推奨)
3. ルートで依存関係をインストール: `pnpm install`

## スクリプト

- 開発 (フロントエンド): `pnpm dev`
- ビルド (全体): `pnpm build`
- 型チェック (全体): `pnpm typecheck`
- Lint (全体): `pnpm lint`

## 環境変数

`.env.example` を参考に各パッケージに必要な値を設定してください。

## ライセンス

Private
