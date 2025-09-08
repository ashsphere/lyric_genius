import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types/env';
import { lyricsRouter } from './routes/lyrics';
import { ruleRouter } from './routes/rule';
import { personasRouter } from './routes/personas';

const app = new Hono<{ Bindings: Env }>();

// CORS (フロントのローカル開発用)
app.use('*', cors());

// ヘルスチェック
app.get('/api/health', (c) => c.json({ ok: true }));

// ルート例: 仮のエンドポイント
app.route('/api/lyrics', lyricsRouter);
app.route('/api/rule', ruleRouter);
app.route('/api/personas', personasRouter);

export default app;
