import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import type { Rule } from '@lyricgenius/shared-types';

export const RuleSettingPage: React.FC = () => {
  const [rule, setRule] = useState<Rule | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRule();
  }, []);

  useEffect(() => {
    if (rule) setHasChanges(prompt !== rule.prompt);
  }, [prompt, rule]);

  const fetchRule = async () => {
    try {
      const res = await fetch('/api/rule');
      const data = await res.json();
      if (data.success) {
        setRule(data.data);
        setPrompt(data.data.prompt);
      } else {
        alert('基本ルールの取得に失敗しました: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('基本ルールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async () => {
    if (!prompt.trim()) {
      alert('基本ルールを入力してください');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/rule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setRule(data.data);
        setHasChanges(false);
        alert('基本ルールを保存しました');
      } else {
        alert('保存に失敗しました: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm('変更が保存されていません。戻りますか？')) navigate('/');
    } else {
      navigate('/');
    }
  };

  if (loading) return <div className="container mx-auto p-6">読み込み中...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex gap-2">
        <Button variant="outline" onClick={handleBack}>戻る</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本ルール設定</CardTitle>
          <p className="text-sm text-gray-600">
            全ての歌詞生成に共通で適用される基本的なルールを設定できます。
            作詞スタイルや構成、表現方法などの指示を記述してください。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              基本ルール
              <span className="text-gray-500 ml-2">({prompt.length}/2000文字)</span>
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例：J-POPの一般的な構成（Aメロ→Bメロ→サビ）を意識して作詞してください。自然で美しい日本語を使用し、聴き手の心に響く歌詞を心がけてください。"
              className="min-h-[200px]"
              maxLength={2000}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">設定のヒント</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 楽曲の構成に関する指示（Aメロ、Bメロ、サビなど）</li>
              <li>• 言葉遣いや文体に関する指示（敬語、関西弁など）</li>
              <li>• 表現技法に関する指示（比喩表現、韻を踏むなど）</li>
              <li>• 避けたい表現や内容に関する指示</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPrompt(rule?.prompt || '')} disabled={!hasChanges}>
              リセット
            </Button>
            <Button onClick={saveRule} disabled={saving || !hasChanges || !prompt.trim()}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>

          {rule && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">最終更新: {new Date(rule.updated_at).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>プレビュー</CardTitle>
          <p className="text-sm text-gray-600">現在の設定で生成される歌詞のプロンプトの一部をプレビューできます。</p>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">【基本ルール】</h4>
            <p className="text-sm whitespace-pre-wrap">{prompt || '（基本ルールが設定されていません）'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

