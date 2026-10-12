'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { getProgressPercent, getProgressColor, getDaysRemaining, formatDate, formatCurrency, translateCategory } from '@/lib/helpers';
import { Calendar, Camera, DollarSign, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProjectModalProps {
  project: any;
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ProjectModal({ project, open, onClose, onRefresh }: ProjectModalProps) {
  const router = useRouter();
  const percent = project ? getProgressPercent(project?.sessionDate, project?.deadlineDate) : 0;
  const color = project ? getProgressColor(percent) : '#4CAF82';
  const daysLeft = project ? getDaysRemaining(project?.deadlineDate) : 0;

  const handleComplete = async () => {
    if (!project?.id) return;
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', completedDate: new Date().toISOString() }),
      });
      toast.success('Проект завершён!');
      onClose();
      onRefresh?.();
    } catch {
      toast.error('Не удалось обновить');
    }
  };

  const handleMarkPaid = async () => {
    if (!project?.id) return;
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', paidAt: new Date().toISOString() }),
      });
      toast.success('Оплата подтверждена!');
      onClose();
      onRefresh?.();
    } catch {
      toast.error('Не удалось обновить');
    }
  };

  if (!project) return null;

  return (
    <Drawer open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg font-display">{project?.clientName ?? ''}</DrawerTitle>
          <p className="text-sm text-muted-foreground">{project?.packageName ?? ''} · {translateCategory(project?.category)}</p>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          {/* Progress bar */}
          {project?.status === 'active' && (
            <div className="w-full rounded-full h-3 bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percent}%`, backgroundColor: color }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span>Съёмка: {formatDate(project?.sessionDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span>Дедлайн: {formatDate(project?.deadlineDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span>{(project?.photosCount ?? 0) + (project?.extraPhotos ?? 0)} фото</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span>{formatCurrency((project?.price ?? 0) + (project?.extraPrice ?? 0))}</span>
            </div>
          </div>

          {project?.status === 'active' && (
            <p className="text-center text-sm font-medium" style={{ color }}>
              осталось {daysLeft} дн.
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {project?.status === 'awaiting_payment' && (
              <Button onClick={handleMarkPaid} className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white">
                💰 Отметить оплаченным
              </Button>
            )}
            {project?.status === 'active' && (
              <Button onClick={handleComplete} className="w-full h-12 rounded-xl" variant="default">
                <CheckCircle className="w-4 h-4 mr-2" /> Завершить проект
              </Button>
            )}
            <Button
              onClick={() => { onClose(); router.push(`/projects/${project?.id}`); }}
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Подробнее
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
