'use client';

import React, { useState, useEffect } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Camera, DollarSign, Tag, Link2, Bell, FileText, ArrowLeft } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { translateCategory } from '@/lib/helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function NewProjectClient() {
  const router = useRouter();
  const { data: packages } = useFetch<any[]>('/api/packages');
  const { data: sourceTags } = useFetch<any[]>('/api/source-tags');

  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientName: '',
    sessionDate: '',
    processingDays: 10,
    deadlineDate: '',
    photosCount: 0,
    price: 0,
    sourceTag: '',
    packageName: '',
    category: '',
    packageId: '',
    reminderDays: 3,
    photoLink: '',
    notes: '',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hydration-safe: set dates after mount
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      sessionDate: prev.sessionDate || format(new Date(), 'yyyy-MM-dd'),
      deadlineDate: prev.deadlineDate || format(addDays(new Date(), 10), 'yyyy-MM-dd'),
    }));
  }, []);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Group packages by category
  const grouped = (packages ?? []).reduce((acc: Record<string, any[]>, p: any) => {
    const cat = p?.category ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  const selectPackage = (pkg: any) => {
    setSelectedPkg(pkg?.id ?? null);
    setForm((prev) => ({
      ...prev,
      packageName: pkg?.name ?? '',
      category: pkg?.category ?? '',
      packageId: pkg?.id ?? '',
      photosCount: pkg?.photosCount ?? 0,
      price: pkg?.price ?? 0,
      processingDays: pkg?.days ?? 10,
      deadlineDate: format(addDays(new Date(prev.sessionDate), pkg?.days ?? 10), 'yyyy-MM-dd'),
    }));
  };

  const clearPackage = () => {
    setSelectedPkg(null);
    setForm((prev) => ({
      ...prev,
      packageName: '',
      category: '',
      packageId: '',
      photosCount: 0,
      price: 0,
    }));
  };

  const updateField = (key: string, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'sessionDate' || key === 'processingDays') {
        const session = key === 'sessionDate' ? value : prev.sessionDate;
        const days = key === 'processingDays' ? value : prev.processingDays;
        updated.deadlineDate = format(addDays(new Date(session), days), 'yyyy-MM-dd');
      }
      return updated;
    });
  };

  const quickDays = [7, 10, 14, 21, 30];

  const toggleSource = (tag: string) => {
    setSelectedSources((prev) =>
      prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]
    );
  };

  const addNewTag = async () => {
    if (!newTagInput.trim()) return;
    try {
      await fetch('/api/source-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagInput.trim() }),
      });
      setSelectedSources((prev) => [...prev, newTagInput.trim()]);
      setNewTagInput('');
      toast.success('Тег добавлен!');
    } catch {
      toast.error('Не удалось добавить тег');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      toast.error('Укажите имя клиента');
      return;
    }
    setShowPaymentModal(true);
  };

  const createProject = async (paid: boolean) => {
    setSaving(true);
    try {
      const body = {
        clientName: form.clientName,
        packageId: form.packageId || null,
        packageName: form.packageName,
        category: form.category,
        sessionDate: new Date(form.sessionDate).toISOString(),
        deadlineDate: new Date(form.deadlineDate).toISOString(),
        status: paid ? 'active' : 'awaiting_payment',
        photosCount: form.photosCount,
        price: form.price,
        paidAt: paid ? new Date().toISOString() : null,
        sourceTag: selectedSources.join(', '),
        notes: form.notes,
        photoLink: form.photoLink,
        reminderDays: form.reminderDays,
      };
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      toast.success('Проект создан!');
      setShowPaymentModal(false);
      router.push('/projects');
    } catch {
      toast.error('Не удалось создать проект');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">Новый проект</h1>
          <p className="text-xs text-muted-foreground">Выберите пакет или создайте свой</p>
        </div>
      </div>

      {/* Package selector */}
      <div className="mb-6">
        {Object.entries(grouped).map(([cat, pkgs]: [string, any[]]) => (
          <div key={cat} className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateCategory(cat)}</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
              {(pkgs ?? []).map((pkg: any) => (
                <button
                  key={pkg?.id}
                  onClick={() => selectPackage(pkg)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    selectedPkg === pkg?.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {pkg?.name ?? ''}
                  <span className="ml-1.5 opacity-70">${pkg?.price ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={clearPackage}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            selectedPkg === null && form.packageName === ''
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          Свой
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Client Name */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><User className="w-4 h-4" strokeWidth={1.5} /> Имя клиента</Label>
          <Input
            value={form.clientName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('clientName', e.target.value)}
            placeholder="Введите имя клиента"
            className="h-12 rounded-xl pl-4"
          />
        </div>

        {/* Session Date */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4" strokeWidth={1.5} /> Дата съёмки</Label>
          <Input
            type="date"
            value={form.sessionDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('sessionDate', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Processing Days */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" strokeWidth={1.5} /> Дней на обработку</Label>
          <div className="flex gap-2 flex-wrap">
            {quickDays.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => updateField('processingDays', d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  form.processingDays === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {d} дн.
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={form.processingDays}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('processingDays', parseInt(e.target.value) || 10)}
            min={1}
            max={60}
            className="h-12 rounded-xl mt-2"
          />
        </div>

        {/* Deadline (read-only calculated) */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4" strokeWidth={1.5} /> Дата дедлайна</Label>
          <Input
            type="date"
            value={form.deadlineDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('deadlineDate', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Photo Count */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Camera className="w-4 h-4" strokeWidth={1.5} /> Кол-во фото</Label>
          <Input
            type="number"
            value={form.photosCount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('photosCount', parseInt(e.target.value) || 0)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4" strokeWidth={1.5} /> Цена (NZD)</Label>
          <Input
            type="number"
            value={form.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('price', parseFloat(e.target.value) || 0)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Source Tags */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Tag className="w-4 h-4" strokeWidth={1.5} /> Источник</Label>
          <div className="flex gap-2 flex-wrap">
            {(sourceTags ?? []).map((t: any) => (
              <button
                key={t?.id}
                type="button"
                onClick={() => toggleSource(t?.name ?? '')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedSources.includes(t?.name ?? '')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {t?.name ?? ''}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={newTagInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagInput(e.target.value)}
              placeholder="Новый тег"
              className="h-10 rounded-xl flex-1"
            />
            <Button type="button" onClick={addNewTag} variant="outline" className="h-10 rounded-xl">
              Добавить
            </Button>
          </div>
        </div>

        {/* Reminder */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Bell className="w-4 h-4" strokeWidth={1.5} /> Напоминание (дней до дедлайна)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 7].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => updateField('reminderDays', d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  form.reminderDays === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {d} дн.
              </button>
            ))}
          </div>
        </div>

        {/* Photo Link */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><Link2 className="w-4 h-4" strokeWidth={1.5} /> Ссылка на фото (необязательно)</Label>
          <Input
            value={form.photoLink}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('photoLink', e.target.value)}
            placeholder="https://interactioninstitute.org/wp-content/uploads/2016/01/IISC_EqualityEquity.png..."
            className="h-12 rounded-xl"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4" strokeWidth={1.5} /> Заметки</Label>
          <Textarea
            value={form.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('notes', e.target.value)}
            placeholder="Заметки о съёмке..."
            rows={3}
            className="rounded-xl"
          />
        </div>

        <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">
          Добавить проект
        </Button>
      </form>

      {/* Payment modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">💰 Оплата получена полностью?</DialogTitle>
            <DialogDescription className="text-center">Это запустит отсчёт обработки.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => createProject(true)}
              disabled={saving}
              className="h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base"
            >
              ✅ Да, оплачено
            </Button>
            <Button
              onClick={() => createProject(false)}
              disabled={saving}
              variant="outline"
              className="h-12 rounded-xl text-base"
            >
              ⏳ Ещё нет
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
