'use client';

import React, { useState } from 'react';
import { useFetch } from '@/lib/use-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Clock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ClientOnly } from '@/components/client-only';

export function NotesClient() {
  const { data: notes, refetch } = useFetch<any[]>('/api/notes');
  const [newNote, setNewNote] = useState('');
  const [showAll, setShowAll] = useState(false);

  const activeNotes = (notes ?? []).filter((n: any) => !n?.isDone);
  const doneNotes = (notes ?? []).filter((n: any) => !!n?.isDone);
  const displayedDone = showAll ? doneNotes : doneNotes.slice(0, 5);

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      setNewNote('');
      refetch();
      toast.success('Заметка добавлена!');
    } catch {
      toast.error('Ошибка');
    }
  };

  const toggleNote = async (id: string, isDone: boolean) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone, doneAt: isDone ? new Date().toISOString() : null }),
      });
      refetch();
    } catch {
      toast.error('Ошибка');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      refetch();
      toast.success('Заметка удалена');
    } catch {
      toast.error('Ошибка');
    }
  };

  const requestNotification = async (noteId: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Уведомления не поддерживаются в этом браузере');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      toast.error('Разрешение на уведомления отклонено');
      return;
    }
    // Simple reminder: ask for a date/time
    const dateStr = prompt('Введите дату и время напоминания (ГГГГ-ММ-ДД ЧЧ:ММ):');
    if (!dateStr) return;
    try {
      const reminderAt = new Date(dateStr.replace(' ', 'T')).toISOString();
      await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderAt }),
      });
      toast.success('Напоминание установлено!');

      // Schedule local notification
      const delay = new Date(reminderAt).getTime() - Date.now();
      if (delay > 0 && delay < 86400000 * 30) {
        setTimeout(() => {
          new Notification('Liubov Bakh Photography', {
            body: (notes ?? []).find((n: any) => n?.id === noteId)?.text ?? 'Reminder!',
            icon: '/favicon.svg',
          });
        }, delay);
      }
      refetch();
    } catch {
      toast.error('Неверный формат даты');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Заметки</h1>
      <p className="text-sm text-muted-foreground mb-6">Ваши задачи и напоминания</p>

      {/* Add note */}
      <div className="flex gap-2 mb-6">
        <Input
          value={newNote}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
          placeholder="Добавить заметку..."
          className="h-12 rounded-xl flex-1"
          onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && addNote()}
        />
        <Button onClick={addNote} className="h-12 rounded-xl px-4">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Active notes */}
      <div className="space-y-2 mb-6">
        {activeNotes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Нет активных заметок. Добавьте выше!</p>
        )}
        {activeNotes.map((note: any) => (
          <div key={note?.id} className="flex items-start gap-3 bg-card rounded-xl p-3 group" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Checkbox
              checked={false}
              onCheckedChange={() => toggleNote(note?.id, true)}
              className="mt-0.5"
            />
            <span className="flex-1 text-sm">{note?.text ?? ''}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => requestNotification(note?.id)} className="p-1 text-muted-foreground hover:text-foreground rounded">
                <Clock className="w-4 h-4" />
              </button>
              <button onClick={() => deleteNote(note?.id)} className="p-1 text-muted-foreground hover:text-destructive rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Done notes */}
      {doneNotes.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Завершённые ({doneNotes.length})</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {displayedDone.map((note: any) => (
              <div key={note?.id} className="flex items-start gap-3 bg-card rounded-xl p-3 opacity-60 group" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Checkbox
                  checked={true}
                  onCheckedChange={() => toggleNote(note?.id, false)}
                  className="mt-0.5"
                />
                <span className="flex-1 text-sm line-through text-muted-foreground">{note?.text ?? ''}</span>
                <button onClick={() => deleteNote(note?.id)} className="p-1 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {doneNotes.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 text-sm text-primary font-medium mt-3 mx-auto hover:underline"
            >
              {showAll ? <><EyeOff className="w-4 h-4" /> Свернуть</> : <><Eye className="w-4 h-4" /> Показать все</>}
            </button>
          )}
        </>
      )}
    </div>
  );
}
