'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { ProjectModal } from '@/components/project-modal';
import { getProgressPercent, getProgressColor } from '@/lib/helpers';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, parseISO, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';

export function GanttClient() {
  const { data: projects, refetch } = useFetch<any[]>('/api/projects');
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Use a fixed reference point for SSR; useEffect updates to real 'now'
    return new Date('2026-10-01T00:00:00Z');
  });

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dayWidth = 44;

  const activeProjects = (projects ?? [])
    .filter((p: any) => p?.status !== 'completed')
    .sort((a: any, b: any) => new Date(a?.sessionDate ?? 0).getTime() - new Date(b?.sessionDate ?? 0).getTime());

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const today = new Date();
      const dayOfMonth = today.getDate();
      const scrollPos = (dayOfMonth - 1) * dayWidth - 40;
      scrollRef.current.scrollLeft = Math.max(0, scrollPos);
    }
  }, [currentMonth]);

  return (
    <div className="p-4 lg:p-6 max-w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight">Гантт</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm min-w-[120px] text-center">
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div ref={scrollRef} className="overflow-x-auto scrollbar-none">
          <div style={{ minWidth: days.length * dayWidth + 120 }}>
            {/* Day headers */}
            <div className="flex border-b border-border sticky top-0 bg-card z-10">
              <div className="w-[120px] flex-shrink-0 px-3 py-2 text-xs text-muted-foreground font-medium border-r border-border">Клиент</div>
              {days.map((day, i) => {
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex flex-col items-center justify-center py-2 text-xs border-r border-border ${
                      isToday ? 'bg-primary/10 font-bold text-primary' : isWeekend ? 'bg-muted/50' : ''
                    }`}
                    style={{ width: dayWidth }}
                  >
                    <span className="text-[10px] text-muted-foreground">{format(day, 'EEEEEE', { locale: ru })}</span>
                    <span>{format(day, 'd')}</span>
                  </div>
                );
              })}
            </div>

            {/* Project rows */}
            {activeProjects.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Нет активных проектов
              </div>
            ) : (
              activeProjects.map((project: any) => {
                const sessionDate = parseISO(project?.sessionDate ?? new Date().toISOString());
                const deadlineDate = parseISO(project?.deadlineDate ?? new Date().toISOString());
                const percent = getProgressPercent(project?.sessionDate, project?.deadlineDate);
                const color = getProgressColor(percent);

                // Calculate bar position relative to current month
                const startOffset = Math.max(0, differenceInDays(sessionDate, monthStart));
                const endOffset = Math.min(days.length - 1, differenceInDays(deadlineDate, monthStart));
                const barStart = startOffset;
                const barWidth = Math.max(1, endOffset - startOffset + 1);

                const isVisible = isWithinInterval(monthStart, { start: sessionDate, end: deadlineDate }) ||
                  isWithinInterval(monthEnd, { start: sessionDate, end: deadlineDate }) ||
                  (sessionDate >= monthStart && sessionDate <= monthEnd) ||
                  (deadlineDate >= monthStart && deadlineDate <= monthEnd);

                if (!isVisible) return null;

                return (
                  <div key={project?.id} className="flex border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="w-[120px] flex-shrink-0 px-3 py-3 text-xs font-medium border-r border-border truncate">
                      {project?.clientName ?? ''}
                    </div>
                    <div className="relative flex-1" style={{ height: 44 }}>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="absolute top-1.5 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                        style={{
                          left: barStart * dayWidth,
                          width: barWidth * dayWidth - 4,
                          height: 28,
                          backgroundColor: color,
                        }}
                      >
                        <span className="text-white text-[10px] font-medium px-2 truncate block leading-7">
                          {project?.clientName ?? ''}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onRefresh={refetch}
      />
    </div>
  );
}
