'use client';

import React, { useState, useEffect } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { formatCurrency } from '@/lib/helpers';
import { DollarSign, FolderOpen, Camera, Clock } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import dynamic from 'next/dynamic';

const StatsCharts = dynamic(() => import('./stats-charts').then((m) => m.StatsCharts), {
  ssr: false,
  loading: () => <div className="h-40 bg-muted animate-pulse rounded-xl" />,
});

type Period = 'this_month' | 'last_month' | 'last_3' | 'custom';

export function StatsClient() {
  const [period, setPeriod] = useState<Period>('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // SSR-safe: compute dates only on client
  const [dateRange, setDateRange] = useState({ from: '2026-10-01', to: '2026-10-31' });

  useEffect(() => {
    const now = new Date();
    let f: string, t: string;
    if (period === 'this_month') { f = format(startOfMonth(now), 'yyyy-MM-dd'); t = format(endOfMonth(now), 'yyyy-MM-dd'); }
    else if (period === 'last_month') { const lm = subMonths(now, 1); f = format(startOfMonth(lm), 'yyyy-MM-dd'); t = format(endOfMonth(lm), 'yyyy-MM-dd'); }
    else if (period === 'last_3') { f = format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'); t = format(endOfMonth(now), 'yyyy-MM-dd'); }
    else { f = customFrom || format(startOfMonth(now), 'yyyy-MM-dd'); t = customTo || format(endOfMonth(now), 'yyyy-MM-dd'); }
    setDateRange({ from: f, to: t });
  }, [period, customFrom, customTo]);

  const { from, to } = dateRange;

  const { data } = useFetch<any>(`/api/statistics?from=${from}&to=${to}`);

  const periods: { id: Period; label: string }[] = [
    { id: 'this_month', label: 'Этот месяц' },
    { id: 'last_month', label: 'Прошлый месяц' },
    { id: 'last_3', label: 'Последние 3 месяца' },
    { id: 'custom', label: 'Произвольный' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Статистика</h1>
      <p className="text-sm text-muted-foreground mb-6">Показатели вашей студии</p>

      {/* Period selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex gap-2 mb-4">
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="flex-1 h-10 rounded-xl border border-input px-3 text-sm bg-background" />
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="flex-1 h-10 rounded-xl border border-input px-3 text-sm bg-background" />
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <SummaryCard icon={DollarSign} label="Всего заработано" value={formatCurrency(data?.totalEarned ?? 0)} />
        <SummaryCard icon={FolderOpen} label="Проекты" value={String(data?.totalProjects ?? 0)} />
        <SummaryCard icon={Camera} label="Фото" value={String(data?.totalPhotos ?? 0)} />
        <SummaryCard icon={Clock} label="Ср. дней" value={`${data?.avgProcessingDays ?? 0} дн.`} />
      </div>

      {/* Charts */}
      <StatsCharts bySource={data?.bySource ?? {}} byCategory={data?.byCategory ?? {}} />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
