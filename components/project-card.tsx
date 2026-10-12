'use client';

import React from 'react';
import { getProgressPercent, getProgressColor, getDaysRemaining, translateCategory } from '@/lib/helpers';

interface ProjectCardProps {
  project: any;
  onClick?: () => void;
  compact?: boolean;
}

export function ProjectCard({ project, onClick, compact }: ProjectCardProps) {
  const percent = getProgressPercent(project?.sessionDate, project?.deadlineDate);
  const color = getProgressColor(percent);
  const daysLeft = getDaysRemaining(project?.deadlineDate);
  const isAwaiting = project?.status === 'awaiting_payment';
  const isCompleted = project?.status === 'completed';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] ${
        isCompleted ? 'opacity-60' : ''
      }`}
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: isCompleted
            ? 'hsl(var(--muted))'
            : `linear-gradient(90deg, ${color} ${percent}%, hsl(var(--muted)) ${percent}%)`,
          minHeight: compact ? 56 : 72,
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 relative z-10">
          <div>
            <p className={`font-semibold text-sm ${
              percent > 30 && !isCompleted ? 'text-white' : 'text-foreground'
            }`}>
              {project?.clientName ?? 'Без имени'}
            </p>
            <p className={`text-xs mt-0.5 ${
              percent > 30 && !isCompleted ? 'text-white/80' : 'text-muted-foreground'
            }`}>
              {project?.packageName ?? ''}{project?.category ? ` · ${translateCategory(project.category)}` : ''}
            </p>
          </div>
          <div className="text-right">
            {isAwaiting ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                💰 Ждёт оплаты
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                ✅ Завершён
              </span>
            ) : (
              <span className={`text-sm font-bold ${
                percent > 30 ? 'text-white' : 'text-foreground'
              }`}>
                ост. {daysLeft} дн.
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
