'use client';

import React, { useState } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { ProjectCard } from '@/components/project-card';
import { ProjectModal } from '@/components/project-modal';
import { Plus, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function ProjectsClient() {
  const { data: projects, loading, refetch } = useFetch<any[]>('/api/projects');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const active = (projects ?? []).filter((p: any) => p?.status !== 'completed');
  const completed = (projects ?? []).filter((p: any) => p?.status === 'completed');

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Проекты</h1>
      <p className="text-sm text-muted-foreground mb-6">Управление фотосессиями</p>

      {/* New Project Card */}
      <Link
        href="/projects/new"
        className="flex items-center justify-center gap-2 w-full h-16 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm hover:bg-primary/5 transition-colors mb-4"
      >
        <Plus className="w-5 h-5" /> Новый проект
      </Link>

      {/* Active Projects */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-[72px] bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {active.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Пока нет активных проектов</p>
          )}
          {active.map((p: any) => (
            <ProjectCard key={p?.id} project={p} onClick={() => setSelectedProject(p)} />
          ))}
        </div>
      )}

      {/* Archive divider */}
      {completed.length > 0 && (
        <>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Архив ({completed.length})
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-3">
            {completed.map((p: any) => (
              <ProjectCard key={p?.id} project={p} onClick={() => setSelectedProject(p)} />
            ))}
          </div>
        </>
      )}

      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onRefresh={refetch}
      />
    </div>
  );
}
