import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Item = {
  id: string;
  theme: string;
  status: '未使用' | '使用済み';
  created_at: string;
  generated_titles: string[];
};

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLyrics();
  }, []);

  const fetchLyrics = async () => {
    try {
      const response = await fetch('/api/lyrics');
      const data = await response.json();
      if (data.success) setLyrics(data.data);
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">歌詞履歴</h1>
        <Button onClick={() => navigate('/')}>新規作成</Button>
      </div>

      <div className="space-y-4">
        {lyrics.map((lyric) => (
          <Card key={lyric.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium mb-2">{lyric.theme}</h3>
                  <p className="text-sm text-gray-600 mb-2">作成日: {new Date(lyric.created_at).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-2">
                    {lyric.generated_titles.slice(0, 3).map((title, index) => (
                      <Badge key={index} variant="outline">{title}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={lyric.status === '使用済み' ? 'secondary' : 'default'}>{lyric.status}</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/lyrics/${lyric.id}`)}>
                    詳細
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lyrics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">まだ歌詞が生成されていません</p>
          <Button onClick={() => navigate('/')}>最初の歌詞を作成</Button>
        </div>
      )}
    </div>
  );
};

