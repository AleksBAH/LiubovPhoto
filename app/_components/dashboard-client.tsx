'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProjectCard } from '@/components/project-card';
import { ProjectModal } from '@/components/project-modal';
import { useFetch } from '@/lib/use-fetch';
import Link from 'next/link';
import { FolderOpen, CalendarRange, CheckSquare, GripVertical, ChevronRight, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

type WidgetId = 'projects' | 'gantt' | 'notes';

export function DashboardClient() {
  const { data: projects, loading: pLoading, refetch: refetchProjects } = useFetch<any[]>('/api/projects');
  const { data: notes, refetch: refetchNotes } = useFetch<any[]>('/api/notes');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(['projects', 'gantt', 'notes']);
  const [dragItem, setDragItem] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/widget-order').
    then((r) => r.json()).
    then((d: any) => {
      if (d?.ordering && Array.isArray(d.ordering)) setWidgetOrder(d.ordering as WidgetId[]);
    }).
    catch(() => {});
  }, []);

  const saveWidgetOrder = useCallback(async (order: WidgetId[]) => {
    setWidgetOrder(order);
    try {
      await fetch('/api/widget-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordering: order })
      });
    } catch {}
  }, []);

  const moveWidget = (from: number, to: number) => {
    const arr = [...widgetOrder];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    saveWidgetOrder(arr);
  };

  const activeProjects = (projects ?? []).filter((p: any) => p?.status !== 'completed');
  const activeNotes = (notes ?? []).filter((n: any) => !n?.isDone);

  const toggleNote = async (id: string, isDone: boolean) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone, doneAt: isDone ? new Date().toISOString() : null })
      });
      refetchNotes();
    } catch {
      toast.error('Не удалось обновить заметку');
    }
  };

  const renderWidget = (wId: WidgetId, idx: number) => {
    const canMoveUp = idx > 0;
    const canMoveDown = idx < widgetOrder.length - 1;

    const header =
    <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
          onPointerDown={() => setDragItem(idx)}>
          
            <GripVertical className="w-4 h-4" />
          </button>
          {wId === 'projects' && <FolderOpen className="w-5 h-5 text-primary" strokeWidth={1.5} />}
          {wId === 'gantt' && <CalendarRange className="w-5 h-5 text-primary" strokeWidth={1.5} />}
          {wId === 'notes' && <CheckSquare className="w-5 h-5 text-primary" strokeWidth={1.5} />}
          <h2 className="font-display font-semibold text-base">
            {wId === 'projects' ? 'Проекты' : wId === 'gantt' ? 'Гантт' : 'Заметки'}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {canMoveUp &&
        <button onClick={() => moveWidget(idx, idx - 1)} className="p-1 text-muted-foreground hover:text-foreground rounded">
              ↑
            </button>
        }
          {canMoveDown &&
        <button onClick={() => moveWidget(idx, idx + 1)} className="p-1 text-muted-foreground hover:text-foreground rounded">
              ↓
            </button>
        }
        </div>
      </div>;


    if (wId === 'projects') {
      return (
        <div key={wId} className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          {header}
          {pLoading ?
          <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div> :
          activeProjects.length === 0 ?
          <p className="text-sm text-muted-foreground text-center py-6">Нет активных проектов</p> :

          <div className="space-y-2">
              {activeProjects.slice(0, 5).map((p: any) =>
            <ProjectCard key={p?.id} project={p} onClick={() => setSelectedProject(p)} compact />
            )}
            </div>
          }
          <Link href="/projects" className="flex items-center justify-center gap-1 text-sm text-primary font-medium mt-3 py-2 hover:underline">
            Все проекты <ChevronRight className="w-4 h-4" />
          </Link>
        </div>);

    }

    if (wId === 'gantt') {
      return (
        <div key={wId} className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          {header}
          <div className="h-24 flex items-center justify-center">
            <Link href="/gantt" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              Открыть диаграмму Гантта <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>);

    }

    if (wId === 'notes') {
      return (
        <div key={wId} className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          {header}
          {activeNotes.length === 0 ?
          <p className="text-sm text-muted-foreground text-center py-6">Нет активных заметок</p> :

          <div className="space-y-2">
              {activeNotes.slice(0, 5).map((n: any) =>
            <div key={n?.id} className="flex items-start gap-3 py-2">
                  <Checkbox
                checked={!!n?.isDone}
                onCheckedChange={(checked: boolean) => toggleNote(n?.id, !!checked)}
                className="mt-0.5" />
              
                  <span className={`text-sm ${n?.isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {n?.text ?? ''}
                  </span>
                </div>
            )}
            </div>
          }
          <Link href="/notes" className="flex items-center justify-center gap-1 text-sm text-primary font-medium mt-3 py-2 hover:underline">
            Все заметки <ChevronRight className="w-4 h-4" />
          </Link>
        </div>);

    }

    return null;
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:max-w-5xl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Проекты в работе</h1>
          <p className="text-sm text-muted-foreground mt-1">Ваша студия с первого взгляда</p>
        </div>
        <Link
          href="/projects/new"
          className="flex-shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
          
          <Plus className="w-4 h-4" /> Новый проект
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs text-muted-foreground">Активные</p>
          <p className="text-2xl font-bold mt-1">{activeProjects.length}</p>
        </div>
        <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs text-muted-foreground">Ждут оплаты</p>
          <p className="text-2xl font-bold mt-1">
            {activeProjects.filter((p: any) => p?.status === 'awaiting_payment').length}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs text-muted-foreground">Срок на неделе</p>
          <p className="text-2xl font-bold mt-1">
            {activeProjects.filter((p: any) => {
              if (!p?.deadlineDate) return false;
              const d = new Date(p.deadlineDate);
              const now = new Date();
              const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
              return diff >= 0 && diff <= 7;
            }).length}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs text-muted-foreground">Заметки</p>
          <p className="text-2xl font-bold mt-1">{activeNotes.length}</p>
        </div>
      </div>

      {/* Widgets */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {widgetOrder.map((wId, idx) => renderWidget(wId, idx))}
      </div>

      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onRefresh={() => {refetchProjects();}} />
      
    </div>);

}