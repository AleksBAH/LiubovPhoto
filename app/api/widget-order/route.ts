export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const wo = await prisma.widgetOrder.findUnique({ where: { id: 'default' } });
    const ordering = wo?.ordering ? JSON.parse(wo.ordering) : ['projects', 'gantt', 'notes'];
    return NextResponse.json({ ordering });
  } catch {
    return NextResponse.json({ ordering: ['projects', 'gantt', 'notes'] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await prisma.widgetOrder.upsert({
      where: { id: 'default' },
      update: { ordering: JSON.stringify(body?.ordering ?? []) },
      create: { id: 'default', ordering: JSON.stringify(body?.ordering ?? []) },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}
