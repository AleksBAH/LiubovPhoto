export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: [{ isDone: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const note = await prisma.note.create({ data: body });
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}
