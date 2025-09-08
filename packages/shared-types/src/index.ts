export interface Persona {
  id: string;
  name: string;
  prompt: string;
  created_at: string;
}

export interface EmotionParams {
  bright: number; // 明るい (0-100)
  sad: number; // 切ない (0-100)
  sadness: number; // 悲しさ (0-100)
  dark: number; // ダーク (0-100)
  despair: number; // 絶望的 (0-100)
  hope: number; // 希望 (0-100)
  nostalgic: number; // ノスタルジック (0-100)
  grand: number; // 壮大 (0-100)
  fantasy: number; // 幻想的 (0-100)
  passionate: number; // 情熱的 (0-100)
}

export interface Lyrics {
  id: string;
  theme: string;
  emotion_params: EmotionParams;
  generated_lyrics: string;
  generated_titles: string[];
  status: '未使用' | '使用済み';
  persona_id?: string;
  created_at: string;
}

export interface Rule {
  id: number;
  prompt: string;
  updated_at: string;
}

export interface PersonaTemplate {
  name: string;
  prompt: string;
  description: string;
  category: string;
}
