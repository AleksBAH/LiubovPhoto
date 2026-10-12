'use client';

import React, { useState } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { getProgressPercent, getProgressColor, getDaysRemaining, formatDate, formatCurrency, translateCategory } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Camera, DollarSign, Tag, Link2, Bell, FileText, Edit, CheckCircle, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const extraOptions = [
  { members: 1, price: 50, photos: 2 },
  { members: 2, price: 80, photos: 4 },
  { members: 3, price: 110, photos: 6 },
  { members: 4, price: 140, photos: 8 },
];

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const { data: project, refetch } = useFetch<any>(`/api/projects/${projectId}`);
  const router = useRouter();
  const [showExtras, setShowExtras] = useState(false);
  const [extraDaysInput, setExtraDaysInput] = useState(0);

  if (!project) {
    return (
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <div className="h-40 flex items-center justify-center text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const percent = getProgressPercent(project?.sessionDate, project?.deadlineDate);
  const color = getProgressColor(percent);
  const daysLeft = getDaysRemaining(project?.deadlineDate);
  const totalPhotos = (project?.photosCount ?? 0) + (project?.extraPhotos ?? 0);
  const totalPrice = (project?.price ?? 0) + (project?.extraPrice ?? 0);

  const handleComplete = async () => {
    if (!confirm('Отметить проект завершённым?')) return;
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', completedDate: new Date().toISOString() }),
      });
      toast.success('Проект завершён!');
      refetch();
    } catch {
      toast.error('Ошибка');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', paidAt: new Date().toISOString() }),
      });
      toast.success('Оплата подтверждена!');
      refetch();
    } catch {
      toast.error('Ошибка');
    }
  };

  const addExtra = async (opt: typeof extraOptions[0]) => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extraPhotos: (project?.extraPhotos ?? 0) + opt.photos,
          extraPrice: (project?.extraPrice ?? 0) + opt.price,
        }),
      });
      toast.success(`Добавлено членов: ${opt.members}!`);
      refetch();
    } catch {
      toast.error('Ошибка');
    }
  };

  const addExtraDays = async () => {
    if (extraDaysInput <= 0) return;
    try {
      const newDeadline = new Date(project.deadlineDate);
      newDeadline.setDate(newDeadline.getDate() + extraDaysInput);
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extraDays: (project?.extraDays ?? 0) + extraDaysInput,
          deadlineDate: newDeadline.toISOString(),
        }),
      });
      toast.success(`Добавлено дней: ${extraDaysInput}!`);
      setExtraDaysInput(0);
      refetch();
    } catch {
      toast.error('Ошибка');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold tracking-tight">{project?.clientName ?? ''}</h1>
          <p className="text-xs text-muted-foreground">{project?.packageName ?? ''} · {translateCategory(project?.category ?? '')}</p>
        </div>
        <Link href={`/projects/${projectId}/edit`} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <Edit className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Progress bar */}
      {project?.status === 'active' && (
        <div className="mb-6">
          <div className="w-full rounded-full h-4 bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
          </div>
          <p className="text-center text-sm font-semibold mt-2" style={{ color }}>
осталось {daysLeft} дн. · прошло {percent}%
          </p>
        </div>
      )}

      {project?.status === 'awaiting_payment' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-amber-700 font-medium">💰 Ожидает оплаты</p>
          <Button onClick={handleMarkPaid} className="mt-3 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white">
            Отметить оплаченным
          </Button>
        </div>
      )}

      {/* Info grid */}
      <div className="bg-card rounded-2xl p-4 space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow icon={Calendar} label="Съёмка" value={formatDate(project?.sessionDate)} />
          <InfoRow icon={Clock} label="Дедлайн" value={formatDate(project?.deadlineDate)} />
          <InfoRow icon={Camera} label="Фото" value={`${totalPhotos}`} />
          <InfoRow icon={DollarSign} label="Цена" value={formatCurrency(totalPrice)} />
          <InfoRow icon={Tag} label="Источник" value={project?.sourceTag || '—'} />
          <InfoRow icon={Bell} label="Напоминание" value={`за ${project?.reminderDays ?? 3} дн.`} />
        </div>

        {project?.extraPhotos > 0 && (
          <p className="text-xs text-muted-foreground">+{project.extraPhotos} доп. фото, +{formatCurrency(project.extraPrice)} доп.</p>
        )}
        {project?.extraDays > 0 && (
          <p className="text-xs text-muted-foreground">добавлено +{project.extraDays} дн.</p>
        )}

        {project?.photoLink && (
          <a
            href={project.photoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Link2 className="w-4 h-4" /> Смотреть фото
          </a>
        )}

        {project?.notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Заметки</p>
            <p className="text-sm">{project.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        {project?.status === 'active' && (
          <>
            <Button onClick={() => setShowExtras(true)} variant="outline" className="w-full h-12 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Добавить доп.
            </Button>
            <Button onClick={handleComplete} className="w-full h-12 rounded-xl">
              <CheckCircle className="w-4 h-4 mr-2" /> Завершить проект
            </Button>
          </>
        )}
      </div>

      {/* Extras drawer */}
      <Drawer open={showExtras} onOpenChange={setShowExtras}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Добавить доп.</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-4">
            <p className="text-sm font-medium">Доп. члены семьи</p>
            <div className="grid grid-cols-2 gap-2">
              {extraOptions.map((opt) => (
                <button
                  key={opt.members}
                  onClick={() => addExtra(opt)}
                  className="bg-muted rounded-xl p-3 text-left hover:bg-muted/80 transition-colors"
                >
                  <p className="text-sm font-semibold">{opt.members} чел.</p>
                  <p className="text-xs text-muted-foreground">+${opt.price} · +{opt.photos} фото</p>
                </button>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-2">Доп. дни</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={extraDaysInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExtraDaysInput(parseInt(e.target.value) || 0)}
                  min={0}
                  className="flex-1 h-10 rounded-xl border border-input px-3 text-sm bg-background"
                />
                <Button onClick={addExtraDays} className="h-10 rounded-xl">Добавить дни</Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
