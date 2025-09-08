import type { EmotionParams } from '@lyricgenius/shared-types';
import { createSupabaseClient } from '../lib/supabase';
import type { Env } from '../types/env';

export class PromptService {
  constructor(private env: Env) {}

  async generateLyricsPrompt(
    theme: string,
    emotionParams: EmotionParams,
    personaId?: string,
  ): Promise<string> {
    const [baseRule, persona] = await Promise.all([
      this.getBaseRule(),
      personaId ? this.getPersona(personaId) : Promise.resolve(null),
    ]);
    const emotionDescription = this.buildEmotionDescription(emotionParams);

    return `
あなたは優秀な作詞家です。以下の条件で歌詞を作成してください。

【基本ルール】
${baseRule}

${persona ? `【ペルソナ設定】\n${persona.name}: ${persona.prompt}` : ''}

【テーマ】
${theme}

【感情の方向性】
${emotionDescription}

【出力形式】
以下のJSON形式で出力してください。マークダウンや説明文、コードブロック（例: JSONのコードフェンス）は絶対に付与せず、純粋なJSONのみを返してください：
{
  "lyrics": "歌詞本文（改行含む）",
  "titles": ["タイトル案1", "タイトル案2", "タイトル案3", "タイトル案4", "タイトル案5"]
}

【指示の優先順位】
1. ペルソナ設定（設定されている場合）
2. 基本ルール
3. 感情の方向性
4. テーマ

上記の順序で指示に従い、一貫性のある歌詞を作成してください。

【追加の注意事項】
- 基本ルールを最優先で守ってください
- 指定された感情が伝わるような表現を心がけてください
- タイトル案は歌詞の内容に合った魅力的なものを5つ提案してください
- 日本語として自然で美しい表現を使用してください
 - 出力は上記のJSONのみとし、余分な文字や空行、バッククォートは一切含めないでください
`;
  }

  // ストリーミング表示に最適化したプロンプト
  // 仕様: まず歌詞のみを LYRICS_START/LYRICS_END で囲って逐次出力し、
  // 続いて最終的なJSONを1回だけ出力（純粋なJSONのみ）。
  async generateLyricsStreamingPrompt(
    theme: string,
    emotionParams: EmotionParams,
    personaId?: string,
  ): Promise<string> {
    const [baseRule, persona] = await Promise.all([
      this.getBaseRule(),
      personaId ? this.getPersona(personaId) : Promise.resolve(null),
    ]);
    const emotionDescription = this.buildEmotionDescription(emotionParams);

    return `
あなたは優秀な作詞家です。以下の条件で歌詞を作成してください。

【基本ルール】
${baseRule}

${persona ? `【ペルソナ設定】\n${persona.name}: ${persona.prompt}` : ''}

【テーマ】
${theme}

【感情の方向性】
${emotionDescription}

【出力手順（重要・厳守）】
1) 最初に歌詞本文のみを、次のマーカーで囲んで逐次出力してください。
   行頭に「LYRICS_START」だけを出力し、その次の行から歌詞を開始し、最後に行頭に「LYRICS_END」だけを出力して歌詞終了を示します。
   歌詞本文にはマーカー文字列（LYRICS_START/LYRICS_END）を含めないでください。

2) 歌詞の出力が完全に終わったら、改行後に純粋なJSONのみを1回だけ出力してください。マークダウンや説明文、コードブロックは禁止です。
{
  "lyrics": "上で出力した歌詞本文（改行含む）をそのまま格納",
  "titles": ["タイトル案1", "タイトル案2", "タイトル案3", "タイトル案4", "タイトル案5"]
}

【指示の優先順位】
1. ペルソナ設定（設定されている場合）
2. 基本ルール
3. 感情の方向性
4. テーマ

【追加の注意事項】
- 歌詞部分とJSON部分を必ずこの順に出力してください（歌詞→JSON）。
- JSONは余分な文字や空行、バッククォートを一切含めない純粋なJSONのみ。
- タイトル案は歌詞の内容に合った魅力的なものを5つ。
`;
  }

  private async getPersona(personaId: string): Promise<{ name: string; prompt: string } | null> {
    try {
      const supabase = createSupabaseClient(this.env);
      const { data } = await supabase
        .from('sws_personas')
        .select('name, prompt')
        .eq('id', personaId)
        .single();
      return data ?? null;
    } catch (e) {
      console.error('Failed to fetch persona:', e);
      return null;
    }
  }
  private async getBaseRule(): Promise<string> {
    try {
      const supabase = createSupabaseClient(this.env);
      const { data } = await supabase.from('sws_rules').select('prompt').eq('id', 1).single();
      return data?.prompt ?? 'J-POPの一般的な構成（Aメロ→Bメロ→サビ）を意識して作詞してください。';
    } catch (e) {
      console.error('Failed to fetch base rule:', e);
      return 'J-POPの一般的な構成（Aメロ→Bメロ→サビ）を意識して作詞してください。';
    }
  }

  private buildEmotionDescription(params: EmotionParams): string {
    const emotions: string[] = [];
    if (params.bright > 50) emotions.push(`明るい雰囲気(強度: ${params.bright})`);
    if (params.sad > 50) emotions.push(`切ない雰囲気(強度: ${params.sad})`);
    if (params.sadness > 50) emotions.push(`悲しさの強い雰囲気(強度: ${params.sadness})`);
    if (params.dark > 50) emotions.push(`ダークな雰囲気(強度: ${params.dark})`);
    if (params.despair > 50) emotions.push(`絶望的な雰囲気(強度: ${params.despair})`);
    if (params.hope > 50) emotions.push(`希望に満ちた雰囲気(強度: ${params.hope})`);
    if (params.nostalgic > 50) emotions.push(`ノスタルジックな雰囲気(強度: ${params.nostalgic})`);
    if (params.grand > 50) emotions.push(`壮大な雰囲気(強度: ${params.grand})`);
    if (params.fantasy > 50) emotions.push(`幻想的な雰囲気(強度: ${params.fantasy})`);
    if (params.passionate > 50) emotions.push(`情熱的な雰囲気(強度: ${params.passionate})`);

    return emotions.length > 0 ? emotions.join('、') : '特に指定なし';
  }
}
