import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types/env';

export function createSupabaseClient(env: Env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabaseの環境変数が未設定です');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

