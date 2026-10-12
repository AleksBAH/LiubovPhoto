'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  FolderOpen,
  CalendarRange,
  CheckSquare,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/projects', label: 'Проекты', icon: FolderOpen },
  { href: '/gantt', label: 'Гантт', icon: CalendarRange },
  { href: '/notes', label: 'Заметки', icon: CheckSquare },
  { href: '/statistics', label: 'Статистика', icon: BarChart3 },
];

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSettingsPage = pathname?.startsWith('/settings');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border z-40">
        <div className="p-6 border-b border-border">
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">Liubov Bakh</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Фотостудия</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isSettingsPage
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
            Настройки
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-6">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
          <div>
            <h1 className="font-display text-base font-semibold tracking-tight">Liubov Bakh</h1>
            <p className="text-[10px] text-muted-foreground">Фотостудия</p>
          </div>
          <Link href="/settings" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </Link>
        </div>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border z-40 safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors min-w-[56px] ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
