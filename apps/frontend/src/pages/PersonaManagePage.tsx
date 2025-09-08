import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { Persona, PersonaTemplate } from '@lyricgenius/shared-types';
import { PersonaFormDialog } from '@/components/PersonaFormDialog';
import { PersonaTemplateDialog } from '@/components/PersonaTemplateDialog';

export const PersonaManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [templates, setTemplates] = useState<PersonaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [templateData, setTemplateData] = useState<{ name: string; prompt: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/personas'),
        fetch('/api/personas/templates'),
      ]);
      const pData = await pRes.json();
      const tData = await tRes.json();
      if (pData.success) setPersonas(pData.data);
      if (tData.success) setTemplates(tData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const groupedTemplates = useMemo(() => {
    return templates.reduce<Record<string, PersonaTemplate[]>>((acc, t) => {
      (acc[t.category] ||= []).push(t);
      return acc;
    }, {});
  }, [templates]);

  const handleFormSubmit = async (data: { name: string; prompt: string }) => {
    try {
      if (editingPersona) {
        const res = await fetch(`/api/personas/${editingPersona.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) return alert('更新に失敗しました: ' + json.error);
      } else {
        const res = await fetch('/api/personas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) return alert('作成に失敗しました: ' + json.error);
      }
      setShowForm(false);
      setEditingPersona(null);
      setTemplateData(undefined);
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert('保存中にエラーが発生しました');
    }
  };

  const handleTemplateSelect = (tpl: PersonaTemplate) => {
    setTemplateData({ name: tpl.name, prompt: tpl.prompt });
    setEditingPersona(null);
    setShowTemplates(false);
    setShowForm(true);
  };

  const handleDelete = async (persona: Persona) => {
    if (!confirm(`ペルソナ「${persona.name}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/personas/${persona.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) return alert('削除に失敗しました: ' + json.error);
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert('削除中にエラーが発生しました');
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">ペルソナ管理</h1>
          <p className="text-gray-600">歌詞生成時に適用する作詞スタイルや前提条件を管理できます。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            テンプレートから作成
          </Button>
          <Button onClick={() => setShowForm(true)}>新規作成</Button>
          <Button variant="ghost" onClick={() => navigate('/settings')}>戻る</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{persona.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{persona.prompt}</p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">{new Date(persona.created_at).toLocaleDateString()}</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPersona(persona);
                      setTemplateData(undefined);
                      setShowForm(true);
                    }}
                  >
                    編集
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(persona)}>
                    削除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {personas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">まだペルソナが作成されていません</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              テンプレートから作成
            </Button>
            <Button onClick={() => setShowForm(true)}>新規作成</Button>
          </div>
        </div>
      )}

      <PersonaFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        persona={editingPersona}
        onSubmit={handleFormSubmit}
        templateData={templateData}
      />

      <PersonaTemplateDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        templates={groupedTemplates}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

