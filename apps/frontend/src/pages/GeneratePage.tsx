import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { EmotionParams, Persona } from '@lyricgenius/shared-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const GeneratePage: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [emotions, setEmotions] = useState<EmotionParams>({
    bright: 0,
    sad: 0,
    sadness: 0,
    dark: 0,
    despair: 0,
    hope: 0,
    nostalgic: 0,
    grand: 0,
    fantasy: 0,
    passionate: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [streamingText, setStreamingText] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/personas');
        const data = await res.json();
        if (data.success) setPersonas(data.data);
      } catch (e) {
        console.error('Failed to fetch personas:', e);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setStreamingText('');

    try {
      const response = await fetch('/api/lyrics/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, emotion_params: emotions, persona_id: selectedPersonaId || undefined }),
      });

      if (!response.body) {
        throw new Error('ストリーミングレスポンスが取得できませんでした');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // CRLF を LF に正規化
        buffer = buffer.replace(/\r\n/g, '\n');

        // SSE の区切りは空行(\n\n)。完全なイベント単位で処理する
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const eventChunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const lines = eventChunk.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            try {
              const data = JSON.parse(payload);
              if (data.type === 'content') {
                setStreamingText((prev) => prev + (data.chunk ?? ''));
              } else if (data.type === 'complete') {
                setResult(data.data);
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              // イベントが分割されて届く可能性に備え、bufferへ戻す選択肢もあるが、
              // \n\n 区切りで切り出しているため通常は発生しない想定。
              console.warn('JSON解析エラー:', parseError, payload);
            }
          }
        }
      }
    } catch (error) {
      console.error('ストリーミングエラー:', error);
      alert('エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsGenerating(false);
    }
  };

  const updateEmotion = (key: keyof EmotionParams, value: number) => {
    setEmotions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>歌詞生成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">テーマ</label>
            <Textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="歌詞のテーマ（キーワード、情景、ストーリーの断片など）を自由に入力してください"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ペルソナ（任意）</label>
            <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
              <SelectTrigger>
                <SelectValue placeholder="未選択（基本ルールのみ適用）" value={personas.find(p => p.id === selectedPersonaId)?.name} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">未選択</SelectItem>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(emotions).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">{getEmotionLabel(key)} ({value})</label>
                <Slider value={[value]} onValueChange={([v]) => updateEmotion(key as keyof EmotionParams, v)} max={100} step={1} />
              </div>
            ))}
          </div>

          <Button onClick={handleGenerate} disabled={!theme.trim() || isGenerating} className="w-full">
            {isGenerating ? 'ストリーミング生成中...' : '歌詞を生成'}
          </Button>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>🚀 リアルタイム生成中...</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-medium mb-2">生成中の歌詞</h3>
              <Textarea value={streamingText} readOnly className="min-h-[300px]" />
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>✅ 生成完了</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">タイトル案</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.generated_titles.map((title: string, index: number) => (
                    <li key={index}>{title}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">歌詞</h3>
                <Textarea value={result.generated_lyrics} readOnly className="min-h-[300px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function getEmotionLabel(key: string): string {
  const labels: Record<string, string> = {
    bright: '明るい',
    sad: '切ない',
    sadness: '悲しさ',
    dark: 'ダーク',
    despair: '絶望的',
    hope: '希望',
    nostalgic: 'ノスタルジック',
    grand: '壮大',
    fantasy: '幻想的',
    passionate: '情熱的',
  };
  return labels[key] ?? key;
}
