import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PersonaTemplate } from '@lyricgenius/shared-types';

type GroupedTemplates = Record<string, PersonaTemplate[]>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: GroupedTemplates;
  onSelect: (tpl: PersonaTemplate) => void;
}

export const PersonaTemplateDialog: React.FC<Props> = ({ open, onOpenChange, templates, onSelect }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>テンプレートから作成</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-6">
          {Object.entries(templates).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-medium mb-3">{category}</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((tpl) => (
                  <div key={tpl.name} className="border rounded p-3">
                    <div className="font-medium mb-1">{tpl.name}</div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{tpl.description}</p>
                    <Button size="sm" onClick={() => onSelect(tpl)}>
                      このテンプレートを使う
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

