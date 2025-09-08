import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/')}>メインに戻る</Button>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">設定</h1>
        <p className="text-gray-600">歌詞生成の基本設定とペルソナを管理できます。</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>基本ルール設定</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">全ての歌詞生成に共通で適用される基本的なルールを設定します。</p>
            <Button asChild>
              <Link to="/settings/rule">設定を開く</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>ペルソナ管理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">作詞スタイルや前提条件を定義するペルソナを管理します。</p>
            <Button asChild>
              <Link to="/settings/personas">管理画面を開く</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

