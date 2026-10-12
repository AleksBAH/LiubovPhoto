'use client';

import React, { useState, useEffect } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Calendar, Clock, Camera, DollarSign, Tag, Link2, Bell, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export function EditProjectClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { data: project } = useFetch<any>(`/api/projects/${projectId}`);
  const { data: sourceTags } = useFetch<any[]>('/api/source-tags');
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  useEffect(() => {
    if (project && !form) {
      setForm({
        clientName: project?.clientName ?? '',
        sessionDate: project?.sessionDate ? format(new Date(project.sessionDate), 'yyyy-MM-dd') : '',
        deadlineDate: project?.deadlineDate ? format(new Date(project.deadlineDate), 'yyyy-MM-dd') : '',
        photosCount: project?.photosCount ?? 0,
        price: project?.price ?? 0,
        packageName: project?.packageName ?? '',
        category: project?.category ?? '',
        reminderDays: project?.reminderDays ?? 3,
        photoLink: project?.photoLink ?? '',
        notes: project?.notes ?? '',
      });
      setSelectedSources((project?.sourceTag ?? '').split(', ').filter(Boolean));
    }
  }, [project, form]);

  if (!form) {
    return <div className="p-4 text-center text-muted-foreground">Загрузка...</div>;
  }

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...(prev ?? {}), [key]: value }));
  };

  const toggleSource = (tag: string) => {
    setSelectedSources((prev) =>
      prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sessionDate: new Date(form.sessionDate).toISOString(),
          deadlineDate: new Date(form.deadlineDate).toISOString(),
          sourceTag: selectedSources.join(', '),
        }),
      });
      toast.success('Проект обновлён!');
      router.push(`/projects/${projectId}`);
    } catch {
      toast.error('Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/projects/${projectId}`} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <h1 className="font-display text-xl font-bold tracking-tight">Редактировать проект</h1>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><User className="w-4 h-4" /> Имя клиента</Label>
          <Input value={form.clientName ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('clientName', e.target.value)} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4" /> Дата съёмки</Label>
          <Input type="date" value={form.sessionDate ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('sessionDate', e.target.value)} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /> Дата дедлайна</Label>
          <Input type="date" value={form.deadlineDate ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('deadlineDate', e.target.value)} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Camera className="w-4 h-4" /> Фото</Label>
          <Input type="number" value={form.photosCount ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('photosCount', parseInt(e.target.value) || 0)} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4" /> Цена (NZD)</Label>
          <Input type="number" value={form.price ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('price', parseFloat(e.target.value) || 0)} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Tag className="w-4 h-4" /> Источник</Label>
          <div className="flex gap-2 flex-wrap">
            {(sourceTags ?? []).map((t: any) => (
              <button key={t?.id} type="button" onClick={() => toggleSource(t?.name ?? '')} className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedSources.includes(t?.name ?? '') ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
                {t?.name ?? ''}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Bell className="w-4 h-4" /> Напоминание</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 7].map((d) => (
              <button key={d} type="button" onClick={() => updateField('reminderDays', d)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${form.reminderDays === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>{d} дн.</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Link2 className="w-4 h-4" /> Ссылка на фото</Label>
          <Input value={form.photoLink ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('photoLink', e.target.value)} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4" /> Заметки</Label>
          <Textarea value={form.notes ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('notes', e.target.value)} rows={3} className="rounded-xl" />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl text-base font-semibold">
          Сохранить
        </Button>
      </div>
    </div>
  );
}
