import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createSupabaseClient } from '../lib/supabase';
import type { Env } from '../types/env';

export const ruleRouter = new Hono<{ Bindings: Env }>();

ruleRouter.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    let { data, error } = await supabase.from('sws_rules').select('*').eq('id', 1).single();

    // レコードが存在しない場合はデフォルトを作成
    if (error) {
      const defaultRule = {
        id: 1,
        prompt:
          'J-POPの一般的な構成（Aメロ→Bメロ→サビ）を意識して作詞してください。自然で美しい日本語を使用し、聴き手の心に響く歌詞を心がけてください。',
        updated_at: new Date().toISOString(),
      };
      const { data: insertData, error: insertError } = await supabase
        .from('sws_rules')
        .upsert(defaultRule)
        .select()
        .single();
      if (insertError) throw insertError;
      data = insertData;
    }

    return c.json({ success: true, data });
  } catch (err: any) {
    console.error('Rule fetch error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

const updateRuleSchema = z.object({
  prompt: z
    .string()
    .min(1, '基本ルールは必須です')
    .max(2000, '基本ルールは2000文字以内で入力してください'),
});

ruleRouter.put('/', zValidator('json', updateRuleSchema), async (c) => {
  try {
    const { prompt } = c.req.valid('json');
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('sws_rules')
      .upsert({ id: 1, prompt, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return c.json({ success: true, data });
  } catch (err: any) {
    console.error('Rule update error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

