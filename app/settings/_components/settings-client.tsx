'use client';

import React, { useState } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Package, Tag, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { translateCategory } from '@/lib/helpers';

export function SettingsClient() {
  const { data: packages, refetch: refetchPkgs } = useFetch<any[]>('/api/packages');
  const { data: sourceTags, refetch: refetchTags } = useFetch<any[]>('/api/source-tags');
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [newTag, setNewTag] = useState('');
  const [newPkg, setNewPkg] = useState({ name: '', category: 'Newborn', days: 10, photosCount: 5, price: 180, description: '' });
  const [showNewPkg, setShowNewPkg] = useState(false);

  const updatePackage = async (id: string, data: any) => {
    try {
      await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success('Пакет обновлён!');
      setEditingPkg(null);
      refetchPkgs();
    } catch {
      toast.error('Ошибка');
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Удалить пакет?')) return;
    try {
      await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      toast.success('Удалено');
      refetchPkgs();
    } catch {
      toast.error('Ошибка');
    }
  };

  const createPackage = async () => {
    if (!newPkg.name.trim()) { toast.error('Укажите название'); return; }
    try {
      await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg),
      });
      toast.success('Пакет создан!');
      setShowNewPkg(false);
      setNewPkg({ name: '', category: 'Newborn', days: 10, photosCount: 5, price: 180, description: '' });
      refetchPkgs();
    } catch {
      toast.error('Ошибка');
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    try {
      await fetch('/api/source-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim() }),
      });
      setNewTag('');
      refetchTags();
      toast.success('Тег добавлен!');
    } catch {
      toast.error('Ошибка');
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Удалить тег?')) return;
    try {
      await fetch(`/api/source-tags/${id}`, { method: 'DELETE' });
      refetchTags();
      toast.success('Удалено');
    } catch {
      toast.error('Ошибка');
    }
  };

  // Group packages by category
  const grouped = (packages ?? []).reduce((acc: Record<string, any[]>, p: any) => {
    const cat = p?.category ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-muted transition-colors lg:hidden">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight">Настройки</h1>
      </div>

      {/* Packages */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" strokeWidth={1.5} /> Пакеты
          </h2>
          <Button onClick={() => setShowNewPkg(!showNewPkg)} variant="outline" size="sm" className="rounded-xl">
            <Plus className="w-4 h-4 mr-1" /> Новый
          </Button>
        </div>

        {showNewPkg && (
          <div className="bg-card rounded-2xl p-4 mb-4 space-y-3" style={{ boxShadow: 'var(--shadow-md)' }}>
            <Input placeholder="Название пакета" value={newPkg.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPkg({ ...newPkg, name: e.target.value })} className="h-10 rounded-xl" />
            <div className="flex gap-2">
              {['Newborn', 'Maternity', 'Smash Cake'].map((c) => (
                <button key={c} onClick={() => setNewPkg({ ...newPkg, category: c })} className={`px-3 py-1.5 rounded-xl text-xs font-medium ${newPkg.category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{translateCategory(c)}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Дни" value={newPkg.days} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPkg({ ...newPkg, days: parseInt(e.target.value) || 10 })} className="h-10 rounded-xl" />
              <Input type="number" placeholder="Фото" value={newPkg.photosCount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPkg({ ...newPkg, photosCount: parseInt(e.target.value) || 0 })} className="h-10 rounded-xl" />
              <Input type="number" placeholder="Цена" value={newPkg.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPkg({ ...newPkg, price: parseFloat(e.target.value) || 0 })} className="h-10 rounded-xl" />
            </div>
            <Input placeholder="Описание" value={newPkg.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPkg({ ...newPkg, description: e.target.value })} className="h-10 rounded-xl" />
            <Button onClick={createPackage} className="w-full h-10 rounded-xl">Создать пакет</Button>
          </div>
        )}

        {Object.entries(grouped).map(([cat, pkgs]: [string, any[]]) => (
          <div key={cat} className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateCategory(cat)}</p>
            <div className="space-y-2">
              {(pkgs ?? []).map((pkg: any) => (
                <div key={pkg?.id} className="bg-card rounded-xl p-3 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  {editingPkg?.id === pkg?.id ? (
                    <div className="flex-1 space-y-2">
                      <Input value={editingPkg.name ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPkg({ ...editingPkg, name: e.target.value })} className="h-8 rounded-lg text-sm" />
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" value={editingPkg.days ?? 10} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPkg({ ...editingPkg, days: parseInt(e.target.value) || 10 })} className="h-8 rounded-lg text-sm" />
                        <Input type="number" value={editingPkg.photosCount ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPkg({ ...editingPkg, photosCount: parseInt(e.target.value) || 0 })} className="h-8 rounded-lg text-sm" />
                        <Input type="number" value={editingPkg.price ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPkg({ ...editingPkg, price: parseFloat(e.target.value) || 0 })} className="h-8 rounded-lg text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updatePackage(editingPkg.id, editingPkg)} size="sm" className="rounded-lg"><Save className="w-3 h-3 mr-1" /> Сохранить</Button>
                        <Button onClick={() => setEditingPkg(null)} size="sm" variant="ghost" className="rounded-lg">Отмена</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium">{pkg?.name ?? ''}</p>
                        <p className="text-xs text-muted-foreground">{pkg?.photosCount ?? 0} фото · {pkg?.days ?? 0} дн. · ${pkg?.price ?? 0}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingPkg({ ...pkg })} className="p-1.5 text-muted-foreground hover:text-foreground rounded">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => deletePackage(pkg?.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Source Tags */}
      <div>
        <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-primary" strokeWidth={1.5} /> Теги источников
        </h2>
        <div className="flex gap-2 flex-wrap mb-3">
          {(sourceTags ?? []).map((t: any) => (
            <div key={t?.id} className="flex items-center gap-1 bg-muted rounded-xl px-3 py-2">
              <span className="text-sm">{t?.name ?? ''}</span>
              <button onClick={() => deleteTag(t?.id)} className="p-0.5 text-muted-foreground hover:text-destructive rounded">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newTag} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)} placeholder="Название тега" className="h-10 rounded-xl flex-1" />
          <Button onClick={addTag} variant="outline" className="h-10 rounded-xl">Добавить</Button>
        </div>
      </div>
    </div>
  );
}
