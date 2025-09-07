-- ペルソナテーブル
CREATE TABLE IF NOT EXISTS sws_personas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 歌詞テーブル
CREATE TABLE IF NOT EXISTS sws_lyrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    theme TEXT NOT NULL,
    emotion_params JSONB NOT NULL,
    generated_lyrics TEXT NOT NULL,
    generated_titles JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT '未使用',
    persona_id UUID REFERENCES sws_personas(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 基本ルールテーブル
CREATE TABLE IF NOT EXISTS sws_rules (
    id INTEGER DEFAULT 1 PRIMARY KEY,
    prompt TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 基本ルールの初期データ挿入
INSERT INTO sws_rules (id, prompt)
VALUES (1, 'J-POPの構成（Aメロ→Bメロ→サビ）を意識すること')
ON CONFLICT (id) DO NOTHING;

