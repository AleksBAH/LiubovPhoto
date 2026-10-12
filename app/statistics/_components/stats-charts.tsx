'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { translateCategory } from '@/lib/helpers';

const COLORS = ['#D4A5A5', '#4CAF82', '#F5A623', '#60B5FF', '#FF9149', '#A19AD3', '#80D8C3', '#FF6363'];

export function StatsCharts({ bySource, byCategory }: { bySource: Record<string, any>; byCategory: Record<string, any> }) {
  const sourceData = Object.entries(bySource ?? {}).map(([name, val]: [string, any]) => ({
    name,
    revenue: val?.revenue ?? 0,
    count: val?.count ?? 0,
  }));

  const categoryData = Object.entries(byCategory ?? {}).map(([name, val]: [string, any]) => ({
    name: translateCategory(name),
    revenue: val?.revenue ?? 0,
    count: val?.count ?? 0,
  }));

  if (sourceData.length === 0 && categoryData.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Нет данных за этот период</p>;
  }

  return (
    <div className="space-y-6">
      {/* By Source */}
      {sourceData.length > 0 && (
        <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          <h3 className="font-display text-sm font-semibold mb-4">Доход по источникам</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill="#D4A5A5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* By Category */}
      {categoryData.length > 0 && (
        <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          <h3 className="font-display text-sm font-semibold mb-4">Проекты по категориям</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, count }: any) => `${name ?? ''}: ${count ?? 0}`}
                  labelLine={false}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
