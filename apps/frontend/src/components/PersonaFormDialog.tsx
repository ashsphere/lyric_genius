import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Persona } from '@lyricgenius/shared-types';

interface PersonaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona?: Persona | null;
  onSubmit: (data: { name: string; prompt: string }) => void;
  templateData?: { name: string; prompt: string };
}

export const PersonaFormDialog: React.FC<PersonaFormDialogProps> = ({
  open,
  onOpenChange,
  persona,
  onSubmit,
  templateData,
}) => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (open) {
      if (persona) {
        setName(persona.name);
        setPrompt(persona.prompt);
      } else if (templateData) {
        setName(templateData.name);
        setPrompt(templateData.prompt);
      } else {
        setName('');
        setPrompt('');
      }
    }
  }, [open, persona, templateData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) return;
    onSubmit({ name: name.trim(), prompt: prompt.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{persona ? 'ペルソナ編集' : 'ペルソナ作成'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ペルソナ名<span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：ポップス系、関西弁キャラ"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/100文字</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              指示内容<span className="text-red-500 ml-1">*</span>
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例：二人称は『君』、一人称は『僕』で統一..."
              className="min-h-[120px]"
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{prompt.length}/2000文字</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!name.trim() || !prompt.trim()}>
              {persona ? '更新' : '作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

