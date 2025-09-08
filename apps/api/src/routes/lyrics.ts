import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types/env';
import { PromptService } from '../services/promptService';
import { OpenAIService } from '../services/openaiService';
import { createSupabaseClient } from '../lib/supabase';

export const lyricsRouter = new Hono<{ Bindings: Env }>();

const emotionSchema = z.object({
  bright: z.number().min(0).max(100),
  sad: z.number().min(0).max(100),
  sadness: z.number().min(0).max(100),
  dark: z.number().min(0).max(100),
  despair: z.number().min(0).max(100),
  hope: z.number().min(0).max(100),
  nostalgic: z.number().min(0).max(100),
  grand: z.number().min(0).max(100),
  fantasy: z.number().min(0).max(100),
  passionate: z.number().min(0).max(100),
});

const generateLyricsSchema = z.object({
  theme: z.string().min(1, 'テーマは必須です'),
  emotion_params: emotionSchema,
  persona_id: z.string().uuid().optional(),
});

// ストリーミング対応のエンドポイント
lyricsRouter.post('/stream', zValidator('json', generateLyricsSchema), async (c) => {
  try {
    const { theme, emotion_params, persona_id } = c.req.valid('json');

    // プロンプト生成（ストリーミング最適化版: 歌詞→JSONの順で出力）
    const promptService = new PromptService(c.env);
    const prompt = await promptService.generateLyricsStreamingPrompt(theme, emotion_params, persona_id);

    // OpenAI ストリーミング生成
    const apiKey = c.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY が未設定です');
    const model = c.env.OPENAI_MODEL || 'gpt-5-mini';
    const openaiService = new OpenAIService(apiKey, model);

    // ストリーミングレスポンス（SSE）
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let pending = '';
          let inLyrics = false;

          // GPT-5ストリーミングからリアルタイムでチャンクを送信
          for await (const chunk of openaiService.generateLyricsStream(prompt)) {
            fullContent += chunk;
            pending += chunk;

            const START = 'LYRICS_START';
            const END = 'LYRICS_END';

            // まだ歌詞開始前なら、開始トークン検出を試みる
            if (!inLyrics) {
              const sIdx = pending.indexOf(START);
              if (sIdx !== -1) {
                // マーカー以降に進める（トークンと直後の改行を捨てる）
                pending = pending.slice(sIdx + START.length).replace(/^\r?\n/, '');
                inLyrics = true;
              } else {
                // トークン検出のために末尾を維持（無限肥大防止）
                pending = pending.slice(-START.length);
                continue;
              }
            }

            // 歌詞出力中: 終了トークン or JSON開始らしき地点までを送出
            if (inLyrics) {
              const eIdx = pending.indexOf(END);

              // JSON開始のフェイルセーフ検出（モデルが誤ってEND前にJSONを出し始める場合）
              let jsonStartIdx = -1;
              const braceIdx = pending.indexOf('{');
              if (braceIdx !== -1) {
                // 近傍に "lyrics" または "titles" があれば JSON とみなす
                const window = pending.slice(braceIdx, braceIdx + 300);
                if (window.includes('"lyrics"') || window.includes('"titles"')) {
                  jsonStartIdx = braceIdx;
                }
              }

              // 上記候補のうち最も手前を境界とする
              let boundary = -1;
              if (eIdx !== -1 && jsonStartIdx !== -1) boundary = Math.min(eIdx, jsonStartIdx);
              else boundary = eIdx !== -1 ? eIdx : jsonStartIdx;

              // 安全な送出長を計算（境界未検出時は末尾にテイルを残して次チャンクと合わせて判定）
              let toEmit = '';
              if (boundary !== -1) {
                toEmit = pending.slice(0, boundary);
              } else {
                const TAIL_RESERVE = Math.max(END.length, 64);
                const safeLen = Math.max(0, pending.length - TAIL_RESERVE);
                if (safeLen > 0) toEmit = pending.slice(0, safeLen);
              }

              // 1文字ずつの間隔を作りながら送出
              for (let i = 0; i < toEmit.length; i++) {
                const char = toEmit[i];
                const data = `data: ${JSON.stringify({ chunk: char, type: 'content' })}\n\n`;
                controller.enqueue(new TextEncoder().encode(data));
                await new Promise((resolve) => setTimeout(resolve, 20));
              }

              // 送出済み部分を pending から削除
              if (boundary !== -1) {
                pending = pending.slice(boundary);
                // END で終わった場合はマーカーを捨てる
                if (boundary === eIdx) {
                  pending = pending.slice(END.length);
                }
                // どちらの場合でも以降は歌詞ではない（JSON等）とみなして終了
                inLyrics = false;
              } else {
                // テイル分は残し、次チャンクと併せてマーカー検出する
                pending = pending.slice(toEmit.length);
              }
            }
          }

          // 生成完了時にJSONパースを試行（歌詞→JSONの順で入っている想定）
          try {
            const parsed = openaiService.parseJsonContent(fullContent);
            const normalized = openaiService.normalizeSchema(parsed);

            if (normalized) {
              // DB保存
              const supabase = createSupabaseClient(c.env);
              const { data, error } = await supabase
                .from('sws_lyrics')
                .insert({
                  theme,
                  emotion_params,
                  generated_lyrics: normalized.lyrics,
                  generated_titles: normalized.titles,
                  status: '未使用',
                  persona_id: persona_id ?? null,
                })
                .select()
                .single();

              if (!error) {
                const completeData = `data: ${JSON.stringify({ type: 'complete', data })}\n\n`;
                controller.enqueue(new TextEncoder().encode(completeData));
              }
            }
          } catch (parseError) {
            console.error('Parse error:', parseError);
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = `data: ${JSON.stringify({ type: 'error', error: '生成に失敗しました' })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      }
    });

    // ヘッダを明示的に付与してSSEとして扱わせ、
    // 中間プロキシの変換/バッファリングを抑止
    const headers = new Headers({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });
    return new Response(stream, { headers });
  } catch (err: any) {
    console.error('Lyrics streaming error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

// 従来の非ストリーミング版（後方互換性のため残す）
lyricsRouter.post('/', zValidator('json', generateLyricsSchema), async (c) => {
  try {
    const { theme, emotion_params, persona_id } = c.req.valid('json');

    // プロンプト生成
    const promptService = new PromptService(c.env);
    const prompt = await promptService.generateLyricsPrompt(theme, emotion_params, persona_id);

    // OpenAI 生成
    const apiKey = c.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY が未設定です');
    const model = c.env.OPENAI_MODEL || 'gpt-5-mini';
    const openaiService = new OpenAIService(apiKey, model);
    const generated = await openaiService.generateLyrics(prompt);

    // DB 保存
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('sws_lyrics')
      .insert({
        theme,
        emotion_params,
        generated_lyrics: generated.lyrics,
        generated_titles: generated.titles,
        status: '未使用',
        persona_id: persona_id ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return c.json({ success: true, data });
  } catch (err: any) {
    console.error('Lyrics generation error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

lyricsRouter.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('sws_lyrics')
      .select('id, theme, status, created_at, generated_titles')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

lyricsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('sws_lyrics')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return c.json({ success: false, error: '歌詞が見つかりません' }, 404);
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

const updateStatusSchema = z.object({ status: z.enum(['未使用', '使用済み']) });

lyricsRouter.patch('/:id', zValidator('json', updateStatusSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = c.req.valid('json');
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('sws_lyrics')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});
