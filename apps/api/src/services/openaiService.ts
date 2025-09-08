import OpenAI from 'openai';

export type GeneratedContent = {
  lyrics: string;
  titles: string[];
};

export class OpenAIService {
  public client: OpenAI;
  public model: string;

  constructor(apiKey: string, model = 'gpt-5-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async *generateLyricsStream(prompt: string): AsyncGenerator<string> {
    try {
      console.log(`🔍 ストリーミング開始 - モデル: ${this.model}`);
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 4000,
        stream: true,
      });
      console.log('✅ ストリーミング接続成功');

      let fullContent = '';
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          yield delta;
        }
      }

      console.log('📝 ストリーミング完了 - 総文字数:', fullContent.length);
    } catch (error) {
      console.error('❌ ストリーミングエラー:', error);
      throw error;
    }
  }

  async generateLyrics(prompt: string): Promise<GeneratedContent> {
    try {
      let content = '';

      console.log('🚀 ストリーミング生成を開始します...');
      // ストリーミングで生成
      for await (const chunk of this.generateLyricsStream(prompt)) {
        content += chunk;
      }
      console.log('✅ ストリーミング生成が完了しました！');

      console.log('Content received:', content);
      if (!content) {
        console.error('No content generated - content is:', content);
        throw new Error('No content generated');
      }

      // マークダウンのコードブロックや前後の説明文を許容してJSONを抽出
      const parsed = this.parseJsonContent(content);
      const normalized = this.normalizeSchema(parsed);
      if (!normalized) {
        throw new Error('Invalid content schema');
      }
      return normalized;
    } catch (error) {
      console.error('ストリーミング生成エラー:', error);
      throw error;
    }
  }

  public parseJsonContent(content: string): any | null {
    // 1) ```json ... ``` or ``` ... ``` の中身を抜き出す
    const fencedJsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fencedJsonMatch ? fencedJsonMatch[1].trim() : content;

    // 2) 直接JSONとしてパースを試す
    try {
      return JSON.parse(candidate);
    } catch { }

    // 3) テキスト中の最初の '{' と最後の '}' を見つけてスライスし、バランスを取りながらパース
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const sliced = candidate.slice(start, end + 1);
      try {
        return JSON.parse(sliced);
      } catch { }
    }

    return null;
  }

  public normalizeSchema(input: any): GeneratedContent | null {
    if (!input || typeof input !== 'object') return null;

    // いくつかのバリエーションに寛容に対応
    let lyrics: unknown = input.lyrics ?? input['歌詞'] ?? input.content ?? input.text;
    let titles: unknown = input.titles ?? input['タイトル'] ?? input.title_candidates ?? input['titles_json'];

    // lyrics を文字列へ
    if (Array.isArray(lyrics)) {
      lyrics = lyrics.join('\n');
    }
    if (typeof lyrics !== 'string') return null;

    // titles を配列へ正規化
    if (typeof titles === 'string') {
      // 改行や箇条書きから抽出
      const items = titles
        .split(/\r?\n|,|・|・ |\u2022|\d+\.|^-\s+/gm)
        .map((s: string) => s.trim())
        .filter(Boolean);
      titles = items;
    }
    if (!Array.isArray(titles)) return null;
    titles = (titles as any[])
      .map((t) => (typeof t === 'string' ? t.trim() : ''))
      .filter((t) => t.length > 0)
      .slice(0, 5);
    if ((titles as string[]).length === 0) {
      // タイトルが空なら、先頭行から暫定タイトルを生成
      const firstLine = (lyrics as string).split(/\r?\n/).find((l) => l.trim().length > 0) || 'タイトル';
      titles = [firstLine.trim()].slice(0, 1);
    }

    return { lyrics: lyrics as string, titles: titles as string[] };
  }
}
