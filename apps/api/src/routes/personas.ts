import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createSupabaseClient } from '../lib/supabase';
import { PersonaTemplateService } from '../services/personaTemplateService';
import type { Env } from '../types/env';

export const personasRouter = new Hono<{ Bindings: Env }>();

personasRouter.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('sws_personas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return c.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('Personas fetch error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

// テンプレート取得
personasRouter.get('/templates', (c) => {
  const templates = PersonaTemplateService.getTemplates();
  return c.json({ success: true, data: templates });
});

personasRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase.from('sws_personas').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return c.json({ success: false, error: 'ペルソナが見つかりません' }, 404);
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

const createPersonaSchema = z.object({
  name: z.string().min(1, 'ペルソナ名は必須です').max(100, 'ペルソナ名は100文字以内で入力してください'),
  prompt: z
    .string()
    .min(1, '指示内容は必須です')
    .max(2000, '指示内容は2000文字以内で入力してください'),
});

personasRouter.post('/', zValidator('json', createPersonaSchema), async (c) => {
  try {
    const { name, prompt } = c.req.valid('json');
    const supabase = createSupabaseClient(c.env);

    // 同名チェック
    const { data: existing } = await supabase
      .from('sws_personas')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    if (existing) {
      return c.json({ success: false, error: '同じ名前のペルソナが既に存在します' }, 400);
    }

    const { data, error } = await supabase
      .from('sws_personas')
      .insert({ name, prompt })
      .select()
      .single();
    if (error) throw error;
    return c.json({ success: true, data });
  } catch (err: any) {
    console.error('Persona creation error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

const updatePersonaSchema = createPersonaSchema;

personasRouter.put('/:id', zValidator('json', updatePersonaSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const { name, prompt } = c.req.valid('json');
    const supabase = createSupabaseClient(c.env);
    const { data: existing } = await supabase
      .from('sws_personas')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .maybeSingle();
    if (existing) {
      return c.json({ success: false, error: '同じ名前のペルソナが既に存在します' }, 400);
    }
    const { data, error } = await supabase
      .from('sws_personas')
      .update({ name, prompt })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return c.json({ success: false, error: 'ペルソナが見つかりません' }, 404);
    return c.json({ success: true, data });
  } catch (err: any) {
    console.error('Persona update error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});

personasRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = createSupabaseClient(c.env);
    const { data: usedLyrics, error: checkError } = await supabase
      .from('sws_lyrics')
      .select('id')
      .eq('persona_id', id)
      .limit(1);
    if (checkError) throw checkError;
    if (usedLyrics && usedLyrics.length > 0) {
      return c.json(
        {
          success: false,
          error:
            'このペルソナは既に歌詞生成で使用されているため削除できません。歌詞の履歴を先に削除してください。',
        },
        400,
      );
    }
    const { error } = await supabase.from('sws_personas').delete().eq('id', id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (err: any) {
    console.error('Persona deletion error:', err);
    return c.json({ success: false, error: err.message ?? 'Internal Error' }, 500);
  }
});
