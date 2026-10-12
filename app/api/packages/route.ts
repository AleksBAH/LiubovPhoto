export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pkg = await prisma.package.create({ data: body });
    return NextResponse.json(pkg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}
