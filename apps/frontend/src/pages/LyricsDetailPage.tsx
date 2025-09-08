import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import type { Lyrics, Persona } from '@lyricgenius/shared-types';

export const LyricsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lyric, setLyric] = useState<Lyrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    if (id) fetchLyric(id);
  }, [id]);

  const fetchLyric = async (lyricsId: string) => {
    try {
      const response = await fetch(`/api/lyrics/${lyricsId}`);
      const data = await response.json();
      if (data.success) {
        setLyric(data.data);
        if (data.data.persona_id) {
          try {
            const res = await fetch(`/api/personas/${data.data.persona_id}`);
            const pj = await res.json();
            if (pj.success) setPersona(pj.data);
          } catch {}
        }
      }
    } catch (error) {
      console.error('Failed to fetch lyric:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('コピーしました');
    } catch (error) {
      alert('コピーに失敗しました');
    }
  };

  const updateStatus = async (newStatus: '未使用' | '使用済み') => {
    if (!lyric) return;
    try {
      const response = await fetch(`/api/lyrics/${lyric.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) setLyric((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      alert('ステータスの更新に失敗しました');
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (!lyric) return <div className="p-6">歌詞が見つかりません</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/history')}>
          一覧に戻る
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{lyric.theme}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">作成日: {new Date(lyric.created_at).toLocaleDateString()}</p>
              {persona && (
                <p className="text-sm text-gray-600 mt-1">ペルソナ: {persona.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={lyric.status === '使用済み' ? 'secondary' : 'default'}>{lyric.status}</Badge>
              <Button variant="outline" size="sm" onClick={() => updateStatus(lyric.status === '使用済み' ? '未使用' : '使用済み')}>
                {lyric.status === '使用済み' ? '未使用に戻す' : '使用済みにする'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>タイトル案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lyric.generated_titles.map((title, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span>{title}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(title)}>
                    コピー
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>歌詞</CardTitle>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(lyric.generated_lyrics)}>
                コピー
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea value={lyric.generated_lyrics} readOnly className="min-h-[400px] resize-none" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
