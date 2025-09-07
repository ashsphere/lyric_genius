import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS (フロントのローカル開発用)
app.use('*', cors());

// ヘルスチェック
app.get('/api/health', (c) => c.json({ ok: true }));

// ルート例: 仮のエンドポイント
app.get('/api/lyrics', (c) => c.json({ items: [], total: 0 }));

export default app;

